import { apiInstance } from '../../api/axios-instances';
import { debug } from './logger';
import type { Address } from '../../types/commercetools'; // Import Address type

export interface CustomerDraft {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  defaultShippingAddress?: number;
  defaultBillingAddress?: number;
}

export async function signupCustomer(
  draft: CustomerDraft,
  anonymousAccessToken: string
): Promise<void> {
  debug('POST /me/signup', draft.email);

  const payload: CustomerDraft = { ...draft };
  if (payload.addresses && payload.addresses.length > 0) {
    payload.defaultShippingAddress = 0;
    payload.defaultBillingAddress = 0;
  }

console.log('Signing up customer with payload:', JSON.stringify(payload, null, 2));
  try {
    await apiInstance.post('/me/signup', payload, {
      headers: {
        Authorization: `Bearer ${anonymousAccessToken}`,
      },
    });
    debug('Signup succeeded');
  } catch (error: any) {
    console.error('Error during customer signup:', error);
    if (error.response && error.response.data) {
      console.error('CommerceTools API Error Response Body:', JSON.stringify(error.response.data, null, 2));
    }
    // Re-throw the error so it can be handled by the caller if necessary
    throw error;
  }
}

export interface CommercetoolsCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  version: number; // Added version for updates
  addresses: import('../../types/commercetools').Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  shippingAddressIds?: string[];
  billingAddressIds?: string[];
}

export async function fetchMyCustomer(
  accessToken: string
): Promise<CommercetoolsCustomer> {
  debug('GET /me (customer info)');
  const { data } = await apiInstance.get<CommercetoolsCustomer>('/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { expand: 'addresses[*]' }, // Expand all addresses
  });
  debug('Customer fetched', data.email);
  return data;
}
