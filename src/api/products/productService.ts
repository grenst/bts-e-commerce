import { apiInstance } from '../axios-instances';
import { AxiosError } from 'axios';
import { useTokenStore } from '../../store/token-store';
import { envVariables } from '../../config/commerce-tools-api';

interface Product {
  id: string;
  name: { [key: string]: string };
  description?: { [key: string]: string };
  masterVariant: {
    images?: { url: string }[];
    prices?: { value: { centAmount: number; currencyCode: string } }[];
  };
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
    const { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      console.warn('Access token not found');
      const refreshedState = useTokenStore.getState();
      if (!refreshedState.accessToken) {
        throw new Error(
          'Authentication token is not available or scope is insufficient'
        );
      }
    }

    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      `${envVariables.API_URL}/${envVariables.PROJECT_KEY}/product-projections?staged=false`, // Fetch only published products
      {
        headers: {
          Authorization: `Bearer ${accessToken || useTokenStore.getState().accessToken}`, // Use potentially refreshed token
        },
      }
    );
    return response.data.results;
  } catch (e) {
    const error = e as AxiosError | Error;
    console.error('Error fetching published products:', error.message);
    if ('isAxiosError' in error && error.isAxiosError && error.response) {
      if (error.response.status === 403) {
        console.error(
          "Forbidden: Check if the token has the 'view_published_products' scope."
        );
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
    throw error;
  }
}

export interface DrinkProduct {
  id: string;
  name: string;
  description: string;
  price?: number; // centAmounts
  currency?: string;
  imageUrl?: string;
}

export async function getDrinkProducts(): Promise<DrinkProduct[]> {
  try {
    const products = await getAllPublishedProducts();
    return products.map((product): DrinkProduct => {
      const name = product.name.en || Object.values(product.name)[0] || 'N/A';
      const description =
        product.description?.en ||
        Object.values(product.description || {})[0] ||
        'No description available.';
      const priceInfo = product.masterVariant.prices?.[0]?.value;
      const imageUrl = product.masterVariant.images?.[0]?.url;

      return {
        id: product.id,
        name,
        description,
        price: priceInfo?.centAmount,
        currency: priceInfo?.currencyCode,
        imageUrl,
      };
    });
  } catch (e) {
    const error = e as AxiosError | Error;
    console.error('Error processing products into DrinkProduct format:', error.message);
    // Re-throw the error so the caller can handle it if needed
    throw error;
  }
}
