import {
  signupCustomer,
  fetchMyCustomer,
  CustomerDraft,
} from './customer.service.ts';
import { createAxiosError } from '../../utils/test-utils/axios-error.ts';
import type { Address } from '../../types/commercetools';

const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('../../api/axios-instances', () => ({
  apiInstance: {
    post: mockPost,
    get: mockGet,
  },
}));

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

    mockPost.mockRejectedValue(mockError);

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
    mockGet.mockResolvedValue({ data: mockCustomer });

    const result = await fetchMyCustomer(mockToken);
    expect(result).toEqual(mockCustomer);
    expect(mockGet).toHaveBeenCalledWith(
      '/me',
      expect.objectContaining({
        params: { expand: 'addresses[*]' },
      })
    );
  });
});
