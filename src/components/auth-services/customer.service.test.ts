import { signupCustomer, fetchMyCustomer } from './customer.service';
import { apiInstance } from '../../api/axios-instances';

jest.mock('../../api/axios-instances');
jest.mock('./logger', () => ({
  debug: jest.fn(),
}));

const mockApiInstance = apiInstance as jest.Mocked<typeof apiInstance>;

describe('customer.service', () => {
  beforeEach(() => {
    mockApiInstance.post.mockClear();
    mockApiInstance.get.mockClear();
  });

  describe('signupCustomer', () => {
    it('should successfully sign up a customer with no addresses', async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });

      const draft = {
        email: 'test@example.com',
        password: 'password123',
      };
      const anonymousAccessToken = 'anon-token';

      await signupCustomer(draft, anonymousAccessToken);

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        '/me/signup',
        {
          ...draft,
          addresses: [],
          defaultShippingAddress: 0,
          defaultBillingAddress: 1,
        },
        {
          headers: { Authorization: `Bearer ${anonymousAccessToken}` },
        }
      );
    });

    it('should successfully sign up a customer with one address, creating default shipping and billing', async () => {
      mockApiInstance.post.mockResolvedValueOnce({ data: {} });

      const draft = {
        email: 'test@example.com',
        password: 'password123',
        addresses: [
          {
            streetName: '123 Main St',
            city: 'Anytown',
            postalCode: '12345',
            country: 'US',
          },
        ],
      };
      const anonymousAccessToken = 'anon-token';

      await signupCustomer(draft, anonymousAccessToken);

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        '/me/signup',
        {
          ...draft,
          addresses: [
            {
              streetName: '123 Main St',
              city: 'Anytown',
              postalCode: '12345',
              country: 'US',
              key: 'default-shipping',
            },
            {
              streetName: '123 Main St',
              city: 'Anytown',
              postalCode: '12345',
              country: 'US',
              key: 'default-billing',
            },
          ],
          defaultShippingAddress: 0,
          defaultBillingAddress: 1,
        },
        {
          headers: { Authorization: `Bearer ${anonymousAccessToken}` },
        }
      );
    });

    it('should throw an error if signup fails', async () => {
      const error = new Error('Signup failed');
      mockApiInstance.post.mockRejectedValueOnce(error);

      const draft = {
        email: 'test@example.com',
        password: 'password123',
      };
      const anonymousAccessToken = 'anon-token';

      await expect(signupCustomer(draft, anonymousAccessToken)).rejects.toThrow(
        error
      );
    });
  });

  describe('fetchMyCustomer', () => {
    it('should successfully fetch customer data', async () => {
      const mockCustomer = {
        id: 'customer-id',
        email: 'test@example.com',
        version: 1,
        addresses: [],
      };
      mockApiInstance.get.mockResolvedValueOnce({ data: mockCustomer });

      const accessToken = 'user-token';
      const customer = await fetchMyCustomer(accessToken);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { expand: 'addresses[*]' },
      });
      expect(customer).toEqual(mockCustomer);
    });

    it('should throw an error if fetching customer data fails', async () => {
      const error = new Error('Fetch failed');
      mockApiInstance.get.mockRejectedValueOnce(error);

      const accessToken = 'user-token';

      await expect(fetchMyCustomer(accessToken)).rejects.toThrow(error);
    });
  });
});
