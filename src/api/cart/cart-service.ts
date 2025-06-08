import { apiInstance } from '../axios-instances';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';
import { isAxiosError } from 'axios';

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

async function getAccessToken(): Promise<string> {
  const { accessToken } = useTokenStore.getState();
  if (accessToken) return accessToken;

  const anon = await getAnonymousToken();
  useTokenStore
    .getState()
    .setTokens(
      anon.access_token,
      anon.refresh_token ?? undefined,
      anon.expires_in
    );
  return anon.access_token;
}

async function withLog<T>(function_: () => Promise<T>): Promise<T> {
  try {
    return await function_();
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('Commercetools error →', error.response?.data);
    }
    throw error;
  }
}

/* ────────── cart creation ────────── */

async function createExternalCart(): Promise<Cart> {
  const { data } = await withLog(() =>
    apiInstance.post<Cart>(
      '/me/carts',
      {
        currency: 'EUR',
        country: 'DE', // критично для выбора цены
        taxMode: 'External',
        shippingAddress: { country: 'DE' },
      },
      {
        headers: {
          Authorization: `Bearer ${useTokenStore.getState().accessToken}`,
        },
      }
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
        headers: {
          Authorization: `Bearer ${useTokenStore.getState().accessToken}`,
        },
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
          {
            headers: {
              Authorization: `Bearer ${useTokenStore.getState().accessToken}`,
            },
          }
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
  const token = await getAccessToken();

  const actions = [
    {
      action: 'addLineItem',
      productId,
      variantId,
      quantity,
      // country указывать здесь не обязательно, т.к. уже есть cart.country = 'DE'
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
      { headers: { Authorization: `Bearer ${token}` } }
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
