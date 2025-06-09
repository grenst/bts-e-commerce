import { apiInstance } from '../../api/axios-instances';
import {
  signupCustomer,
  fetchMyCustomer,
  CustomerDraft,
} from './customer.service.ts';
// import { AxiosError } from 'axios';
import { createAxiosError } from '../../utils/test-utils/axios-error.ts';
import type { Address } from '../../types/commercetools';

jest.mock('../../api/axios-instances');

describe('signupCustomer', () => {
  const mockAddress: Address = {
    streetName: 'Main St',
    country: 'US',
    city: 'New York',
  };

  const mockDraft: CustomerDraft = {
    email: 'test@example.com',
    password: 'password123',
    addresses: [mockAddress],
  };

  const mockToken = 'mock-token';

  it('should handle API error', async () => {
    const mockError = createAxiosError({ message: 'Error details' }, 400);

    (apiInstance.post as jest.Mock).mockRejectedValue(mockError);

    await expect(signupCustomer(mockDraft, mockToken)).rejects.toThrow();
  });
});

describe('fetchMyCustomer', () => {
  const mockToken = 'mock-token';
  const mockCustomer = {
    id: '123',
    email: 'test@example.com',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch customer data', async () => {
    (apiInstance.get as jest.Mock).mockResolvedValue({ data: mockCustomer });

    const result = await fetchMyCustomer(mockToken);
    expect(result).toEqual(mockCustomer);
    expect(apiInstance.get).toHaveBeenCalledWith(
      '/me',
      expect.objectContaining({
        params: { expand: 'addresses[*]' },
      })
    );
  });
});
