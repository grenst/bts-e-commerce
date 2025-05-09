import { apiInstance } from '../axios-instances';
import { AxiosError } from 'axios';
import { envVariables } from '../../config/commerce-tools-api';
import { useTokenStore } from '../../store/token-store';

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

async function createAnonymousToken(anonymousId?: string) {
  const clientId = envVariables.CLIENT_ID;
  const clientSecret = envVariables.CLIENT_SECRET;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const response = await apiInstance.post(
      `${envVariables.API_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'create_anonymous_token',
        ...(anonymousId && { anonymous_id: anonymousId }),
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError | Error;
    console.error('Error creating anonymous token:', err.message);
    throw err;
  }
}

export async function fetchBestProducts(anonymousId?: string) {
  const tokenData = await createAnonymousToken(anonymousId);

  try {
    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      `${envVariables.API_URL}/${envVariables.PROJECT_KEY}/product-projections?staged=false&limit=4`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    return response.data.results;
  } catch (e) {
    const error = e as AxiosError | Error;
    console.error('Error fetching best products:', error.message);
    throw error;
  }
}