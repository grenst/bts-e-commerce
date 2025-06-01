import { apiInstance } from '../axios-instances';
import { AxiosError } from 'axios';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';

import { Product, Category } from '../../types/catalog-types';

export type { Product, Category };

// Alias the existing getAllPublishedProducts as getAllProducts
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

export async function getAllPublishedProducts(): Promise<Product[]> {
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

    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      '/product-projections',
      {
        params: { staged: 'false' },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.results;
  } catch (error_) {
    const error = error_ as AxiosError | Error;
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

    return response.data;
  } catch (error_) {
    const error = error_ as AxiosError | Error;
    console.error(
      `Error fetching product with ID ${productId}:`,
      error.message
    );
    if ('isAxiosError' in error && (error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.warn(`Product with ID ${productId} not found.`);
        return undefined; // for not found
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
  try {
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
  } catch (error_) {
    const error = error_ as AxiosError | Error;
    console.error(
      'Error transforming products to DrinkProduct format:',
      error.message
    );
    throw error;
  }
}
