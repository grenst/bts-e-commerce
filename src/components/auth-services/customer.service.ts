import { apiInstance } from '../../api/axios-instances';
import { AxiosError } from 'axios';
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

  let addresses: Address[] = draft.addresses ?? [];

  if (addresses.length === 1) {
    const base = addresses[0];
    addresses = [
      { ...base, key: 'default-shipping' }, // index 0
      { ...base, key: 'default-billing' }, // index 1
    ];
  }

  const payload: CustomerDraft = {
    ...draft,
    addresses,
    defaultShippingAddress: 0,
    defaultBillingAddress: 1,
  };

  console.log(
    'Signing up customer with payload:',
    JSON.stringify(payload, undefined, 2)
  );
  try {
    await apiInstance.post('/me/signup', payload, {
      headers: { Authorization: `Bearer ${anonymousAccessToken}` },
    });

    debug('Signup succeeded');
  } catch (error: unknown) {
    console.error('Error during customer signup:', error);
    if (error instanceof AxiosError && error.response && error.response.data) {
      console.error(
        'CommerceTools API Error Response Body:',
        JSON.stringify(error.response.data, undefined, 2)
      );
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
