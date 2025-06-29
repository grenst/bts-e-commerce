import { apiInstance } from '../axios-instances';
import { isAxiosError } from 'axios';

type TaxMode = 'Platform' | 'External' | 'ExternalAmount' | 'Disabled';

interface Address {
  country: string;
}

export interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  variant: { id: number };
}

export interface Cart {
  id: string;
  version: number;
  taxMode: TaxMode;
  country?: string;
  shippingAddress?: Address;
  lineItems: LineItem[];
}

let activeCart: Cart | undefined;

export function setActiveCart(cart: Cart | undefined): void {
  activeCart = cart;
}

function dispatchCartUpdated(): void {
  if (globalThis.window === undefined) return;
  const totalQty =
    activeCart?.lineItems.reduce((sum, index) => sum + index.quantity, 0) ?? 0;
  globalThis.window.dispatchEvent(
    new CustomEvent('cartUpdated', {
      detail: { totalQty, cart: activeCart },
    })
  );
}

const logger = {
  log: (...arguments_: unknown[]) =>
    import.meta.env.MODE !== 'production' && console.log(...arguments_),
  error: (...arguments_: unknown[]) =>
    import.meta.env.MODE !== 'production' && console.error(...arguments_),
};

async function withLog<T>(function_: () => Promise<T>): Promise<T> {
  try {
    return await function_();
  } catch (error) {
    if (isAxiosError(error))
      logger.error('Commercetools error →', error.response?.data, error);
    throw error;
  }
}

async function createExternalCart(): Promise<Cart> {
  const { data } = await withLog(() =>
    apiInstance.post<Cart>(
      '/me/carts',
      {
        currency: 'EUR',
        country: 'DE',
        taxMode: 'External',
        shippingAddress: { country: 'DE' },
      },
      { params: { expand: 'discountCodes[*].discountCode' } }
    )
  );
  return data;
}

export async function getOrCreateCart(): Promise<Cart> {
  if (activeCart) return activeCart;

  try {
    const { data } = await withLog(() =>
      apiInstance.get<Cart>('/me/active-cart', {
        params: { expand: 'discountCodes[*].discountCode' },
      })
    );

    if (
      data.taxMode === 'External' &&
      data.shippingAddress?.country === 'DE' &&
      data.country === 'DE'
    ) {
      activeCart = data;
      return data;
    }

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
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  }

  activeCart = await createExternalCart();
  return activeCart;
}

export async function addToCart(
  productId: string,
  variantId: number,
  quantity: number
): Promise<Cart> {
  const cart = await getOrCreateCart();
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
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const fresh = await getOrCreateCart();
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
  const lineItem = cart.lineItems.find((index) =>
    typeof variantId === 'number'
      ? index.productId === productId && index.variant?.id === variantId
      : index.productId === productId
  );
  return { isInCart: !!lineItem, lineItemId: lineItem?.id };
}

export async function removeLineItem(lineItemId: string): Promise<void> {
  const cart = await getOrCreateCart();
  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    {
      version: cart.version,
      actions: [{ action: 'removeLineItem', lineItemId }],
    },
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
  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    {
      version: cart.version,
      actions: [{ action: 'changeLineItemQuantity', lineItemId, quantity }],
    },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );
  activeCart = data;
  dispatchCartUpdated();
}

export async function applyDiscount(code: string): Promise<Cart> {
  const cart = await getOrCreateCart();
  const { data } = await apiInstance.post<Cart>(
    `/me/carts/${cart.id}`,
    { version: cart.version, actions: [{ action: 'addDiscountCode', code }] },
    { params: { expand: 'discountCodes[*].discountCode' } }
  );
  activeCart = data;
  return data;
}
