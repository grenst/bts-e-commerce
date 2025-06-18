import { apiInstance } from '../axios-instances';
// import { useTokenStore } from '../../store/token-store'; // No longer needed here for getAccessToken
// import { getAnonymousToken } from '../../components/auth-services/token.service'; // No longer needed here
import { isAxiosError } from 'axios';

// Conditional logger for this file
const logger = {
  log: (...arguments_: unknown[]) => {
    if (import.meta.env.MODE !== 'production') console.log(...arguments_);
  },
  error: (...arguments_: unknown[]) => {
    if (import.meta.env.MODE !== 'production') console.error(...arguments_);
  },
};

type TaxMode = 'Platform' | 'External' | 'ExternalAmount' | 'Disabled';

interface Address {
  country: string;
}

interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  variant: { id: number };
}

interface Cart {
  id: string;
  version: number;
  taxMode: TaxMode;
  country?: string;
  shippingAddress?: Address;
  lineItems: LineItem[];
}

let activeCart: Cart | undefined;

function dispatchCartUpdated() {
  if (typeof window !== 'undefined') {
    const totalQty = activeCart?.lineItems.reduce((sum, item) => sum + item.quantity, 0) || 0;
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { totalQty } }));
  }
}

/* ────────── helpers ────────── */

// getAccessToken function removed

async function withLog<T>(function_: () => Promise<T>): Promise<T> {
  try {
    return await function_();
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      logger.error('Commercetools error →', error.response?.data, error); // Use logger
    }
    throw error;
  }
}

/* ────────── cart creation ────────── */

async function createExternalCart(): Promise<Cart> {
  const { data } = await withLog(() =>
    apiInstance.post<Cart>( // Authorization header removed, apiInstance handles it
      '/me/carts',
      {
        currency: 'EUR',
        country: 'DE', // критично для выбора цены
        taxMode: 'External',
        shippingAddress: { country: 'DE' },
      },
      { params: { expand: 'discountCodes[*].discountCode' } }
    )
  );
  return data;
}

/* ────────── public api ────────── */

export async function getOrCreateCart(): Promise<Cart> {
  if (activeCart) return activeCart;

  try {
    const { data } = await withLog(() =>
      apiInstance.get<Cart>('/me/active-cart', {
        params: { expand: 'discountCodes[*].discountCode' },
      })
    );

    /* 1a. корзина уже External и страна = DE */
    if (
      data.taxMode === 'External' &&
      data.shippingAddress?.country === 'DE' &&
      data.country === 'DE'
    ) {
      activeCart = data;
      return data;
    }

    /* 1b. корзина пустая → правим режим и страну */
    if (data.lineItems.length === 0) {
      const { data: patched } = await withLog(() =>
        apiInstance.post<Cart>(
          `/me/carts/${data.id}`,
          {
            version: data.version,
            actions: [
              { action: 'changeTaxMode', taxMode: 'External' },
              { action: 'setCountry', country: 'DE' },
              { action: 'setShippingAddress', address: { country: 'DE' } },
            ],
          },
          { params: { expand: 'discountCodes[*].discountCode' } }
        )
      );
      activeCart = patched;
      return patched;
    }

    /* 1c. корзина с товарами → создаём новую */
  } catch (error: unknown) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  }

  /* 2. корзины нет — создаём новую External */
  const fresh = await createExternalCart();
  activeCart = fresh;
  return fresh;
}

/** Добавление позиции с externalTaxRate и retry по версии */
export async function addToCart(
  productId: string,
  variantId: number,
  quantity: number
): Promise<Cart> {
  const cart = await getOrCreateCart();
  // const token = await getAccessToken(); // Removed, apiInstance handles token

  const actions = [
    {
      action: 'addLineItem',
      productId,
      variantId,
      quantity,
      externalTaxRate: {
        name: 'DE-19 %',
        country: 'DE',
        amount: 0.19,
        includedInPrice: true,
      },
    },
  ];

  const postUpdate = async (c: Cart): Promise<Cart> => {
    const { data } = await apiInstance.post<Cart>(
      `/me/carts/${c.id}`,
      { version: c.version, actions },
      { params: { expand: 'discountCodes[*].discountCode' } }
    );
    return data;
  };

  try {
    activeCart = await postUpdate(cart);
    dispatchCartUpdated();
    return activeCart;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const fresh = await getOrCreateCart(); // обновляем версию
      activeCart = await postUpdate(fresh);
      dispatchCartUpdated();
      return activeCart;
    }
    throw error;
  }
}

export async function clearCart(): Promise<Cart> {
  const cart = await getOrCreateCart();
  const actions = cart.lineItems.map((li) => ({
    action: 'removeLineItem',
    lineItemId: li.id,
  }));

  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    { version: cart.version, actions },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );
  activeCart = data;
  dispatchCartUpdated();
  return data;
}

export async function isProductInCart(
  productId: string,
  variantId?: number
): Promise<{ isInCart: boolean; lineItemId?: string }> {
  const cart = await getOrCreateCart();

  const lineItem = cart.lineItems.find((item) => {
    if (typeof variantId === 'number') {
      return item.productId === productId && item.variant?.id === variantId;
    }
    return item.productId === productId;
  });

  return {
    isInCart: !!lineItem,
    lineItemId: lineItem?.id,
  };
}

export async function removeLineItem(lineItemId: string): Promise<void> {
  const cart = await getOrCreateCart();
  const actions = [{ action: 'removeLineItem', lineItemId }];
  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    { version: cart.version, actions },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );
  activeCart = data;
  dispatchCartUpdated();
}

export async function changeLineItemQuantity(
  lineItemId: string,
  quantity: number
): Promise<void> {
  const cart = await getOrCreateCart();

  const actions = [
    {
      action: 'changeLineItemQuantity',
      lineItemId,
      quantity,
    },
  ];

  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    { version: cart.version, actions },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );

  activeCart = data;
  dispatchCartUpdated();
}

export async function applyDiscount(code: string): Promise<Cart> {
  const cart = await getOrCreateCart();
  const actions = [{ action: 'addDiscountCode', code }];
  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    { version: cart.version, actions },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );
  activeCart = data;
  return data;
}
