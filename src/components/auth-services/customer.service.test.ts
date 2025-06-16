import { apiInstance } from '../../api/axios-instances';
import {
  signupCustomer,
  fetchMyCustomer,
  CustomerDraft,
} from './customer.service.ts';
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
  it('should duplicate a single address for shipping and billing', async () => {
    const singleAddressDraft: CustomerDraft = {
      email: 'single@example.com',
      password: 'password123',
      addresses: [mockAddress],
    };

    (apiInstance.post as jest.Mock).mockResolvedValue({ data: {} });

    await signupCustomer(singleAddressDraft, mockToken);

    expect(apiInstance.post).toHaveBeenCalledWith(
      '/me/signup',
      expect.objectContaining({
        addresses: [
          { ...mockAddress, key: 'default-shipping' },
          { ...mockAddress, key: 'default-billing' },
        ],
        defaultShippingAddress: 0,
        defaultBillingAddress: 1,
      }),
      expect.any(Object)
    );
  });

  it('should not modify addresses if multiple are provided', async () => {
    const multipleAddresses: Address[] = [
      { streetName: 'Street 1', country: 'US', city: 'City 1' },
      { streetName: 'Street 2', country: 'US', city: 'City 2' },
    ];
    const multipleAddressDraft: CustomerDraft = {
      email: 'multiple@example.com',
      password: 'password123',
      addresses: multipleAddresses,
    };

    (apiInstance.post as jest.Mock).mockResolvedValue({ data: {} });

    await signupCustomer(multipleAddressDraft, mockToken);

    expect(apiInstance.post).toHaveBeenCalledWith(
      '/me/signup',
      expect.objectContaining({
        addresses: multipleAddresses,
        defaultShippingAddress: 0,
        defaultBillingAddress: 1,
      }),
      expect.any(Object)
    );
  });

  it('should handle no addresses provided', async () => {
    const noAddressDraft: CustomerDraft = {
      email: 'noaddress@example.com',
      password: 'password123',
      addresses: [],
    };

    (apiInstance.post as jest.Mock).mockResolvedValue({ data: {} });

    await signupCustomer(noAddressDraft, mockToken);

    expect(apiInstance.post).toHaveBeenCalledWith(
      '/me/signup',
      expect.objectContaining({
        addresses: [],
        defaultShippingAddress: 0,
        defaultBillingAddress: 1,
      }),
      expect.any(Object)
    );
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
