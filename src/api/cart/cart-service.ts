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

interface Cart {
  id: string;
  version: number;
  taxMode: TaxMode;
  country?: string;
  shippingAddress?: Address;
  lineItems: Array<{ id: string; productId: string }>;
}

let activeCart: Cart | undefined;

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
      }
      // Header with Authorization removed
    )
  );
  return data;
}

/* ────────── public api ────────── */

export async function getOrCreateCart(): Promise<Cart> {
  if (activeCart) return activeCart;

  try {
    const { data } = await withLog(
      () => apiInstance.get<Cart>('/me/active-cart') // Authorization header removed
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
          }
          // Header with Authorization removed
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
      { version: c.version, actions }
      // Header with Authorization removed
    );
    return data;
  };

  try {
    activeCart = await postUpdate(cart);
    return activeCart;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const fresh = await getOrCreateCart(); // обновляем версию
      activeCart = await postUpdate(fresh);
      return activeCart;
    }
    throw error;
  }
}
