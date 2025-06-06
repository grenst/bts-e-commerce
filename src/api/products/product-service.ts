import { apiInstance } from '../axios-instances';
import { AxiosError } from 'axios';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';
import { Product, Category } from '../../types/catalog-types';

export const getAllProducts = getAllPublishedProducts;

interface CategoryPagedQueryResponse {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: Category[];
}

interface ProductProjectionPagedQueryResponse {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: Product[];
}

export async function getAllPublishedProducts(
  filter?: string | string[],
  sort?: string | string[],
  text?: string
): Promise<Product[]> {
  try {
    let { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      const anon = await getAnonymousToken();
      useTokenStore
        .getState()
        .setTokens(
          anon.access_token,
          anon.refresh_token ?? undefined,
          anon.expires_in
        );
      accessToken = anon.access_token;
    }

    const parameters: Record<string, string | string[]> = {
      staged: 'false',
      limit: '200',
    };

    if (filter) {
      parameters['filter.query'] = filter;
    }

    if (sort) {
      parameters.sort = sort;

      const needsPriceCurrency = (Array.isArray(sort) ? sort : [sort]).some(
        (s) => s.startsWith('price ')
      );
      if (needsPriceCurrency) {
        parameters.priceCurrency = 'EUR';
      }

      const nameSort = (Array.isArray(sort) ? sort : [sort]).find((s) =>
        /^name\.([a-z]{2}(?:-[A-Z]{2})?)\s/.test(s)
      );
      if (nameSort) {
        const locale = nameSort.split('.')[1].split(' ')[0];
        parameters.localeProjection = locale;
      }
    }

    if (text) {
      parameters['text.en'] = text;
    }

    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      '/product-projections/search',
      {
        params: parameters,
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.results;
  } catch (error_) {
    const error = error_ as AxiosError | Error;
    if ('isAxiosError' in error && (error as AxiosError).response?.data) {
      console.dir((error as AxiosError).response!.data, { depth: undefined });
    }
    console.error('Error fetching published products:', error.message);
    if ('isAxiosError' in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 403) {
        console.error(
          "Forbidden: token lacks the 'view_published_products' scope."
        );
      }
    }
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    let { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      const anon = await getAnonymousToken();
      useTokenStore
        .getState()
        .setTokens(
          anon.access_token,
          anon.refresh_token ?? undefined,
          anon.expires_in
        );
      accessToken = anon.access_token;
    }

    const response = await apiInstance.get<CategoryPagedQueryResponse>(
      '/categories',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.results;
  } catch (error_) {
    const error = error_ as AxiosError | Error;
    console.error('Error fetching categories:', error.message);
    if ('isAxiosError' in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 403) {
        console.error("Forbidden: token lacks the 'view_categories' scope.");
      }
    }
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<Product | undefined> {
  try {
    let { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      const anon = await getAnonymousToken();
      useTokenStore
        .getState()
        .setTokens(
          anon.access_token,
          anon.refresh_token ?? undefined,
          anon.expires_in
        );
      accessToken = anon.access_token;
    }

    const response = await apiInstance.get<Product>(
      `/product-projections/${productId}`,
      {
        params: { staged: 'false' },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const product = response.data;
    if (product.masterVariant.sku) {
      product.slug = product.masterVariant.sku
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-');
    }
    return product;
  } catch (error_) {
    const error = error_ as AxiosError | Error;
    console.error(
      `Error fetching product with ID ${productId}:`,
      error.message
    );
    if ('isAxiosError' in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return undefined;
      }
      if (axiosError.response?.status === 403) {
        console.error(
          "Forbidden: token lacks the 'view_published_products' scope."
        );
      }
    }
    throw error;
  }
}

export interface DrinkProduct {
  id: string;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

export async function getDrinkProducts(): Promise<DrinkProduct[]> {
  const products = await getAllPublishedProducts();
  return products.map(
    (product): DrinkProduct => ({
      id: product.id,
      name: product.name.en || Object.values(product.name)[0] || 'N/A',
      description:
        product.description?.en ||
        Object.values(product.description ?? {})[0] ||
        'No description available.',
      price: product.masterVariant.prices?.[0]?.value.centAmount,
      currency: product.masterVariant.prices?.[0]?.value.currencyCode,
      imageUrl: product.masterVariant.images?.[0]?.url,
    })
  );
}

export async function getProductsByCategory(
  categoryIds: string | string[]
): Promise<Product[]> {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  // categories.id:"id1"  OR  categories.id:"id1","id2",…
  const filters = ids.map((id) => `categories.id:"${id}"`);

  // getAllPublishedProducts already accepts string | string[],
  // so we can forward the array to create multiple filter.query params
  return getAllPublishedProducts(filters);
}
