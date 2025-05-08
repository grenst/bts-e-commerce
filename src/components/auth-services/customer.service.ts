import { apiInstance } from '../../api/axios-instances';
import { debug } from './logger';

export interface CustomerDraft {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export async function signupCustomer(
  draft: CustomerDraft,
  anonymousAccessToken: string
): Promise<void> {
  debug('POST /me/signup', draft.email);
  await apiInstance.post('/me/signup', draft, {
    headers: {
      Authorization: `Bearer ${anonymousAccessToken}`,
    },
  });
  debug('Signup succeeded');
}

export interface CommercetoolsCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  version: number; // Added version for updates
}

export async function fetchMyCustomer(
  accessToken: string
): Promise<CommercetoolsCustomer> {
  debug('GET /me (customer info)');
  const { data } = await apiInstance.get<CommercetoolsCustomer>('/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  debug('Customer fetched', data.email);
  return data;
}
