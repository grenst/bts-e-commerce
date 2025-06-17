import { AuthService } from './auth.service';
import {
  getAnonymousToken,
  getPasswordToken,
  refreshAccessToken,
} from '../components/auth-services/token.service';
import {
  signupCustomer,
  fetchMyCustomer,
} from '../components/auth-services/customer.service';
import { apiInstance } from '../api/axios-instances';
import { useTokenStore } from '../store/token-store';
import { useCustomerStore } from '../store/customer-store';
import { uiStore as useUIStore } from '../store/store';

jest.mock('../components/auth-services/token.service');
jest.mock('../components/auth-services/customer.service');
jest.mock('../api/axios-instances');
jest.mock('../store/token-store', () => ({
  useTokenStore: {
    getState: jest.fn(),
  },
}));
jest.mock('../store/customer-store', () => ({
  useCustomerStore: {
    getState: jest.fn(),
  },
}));
jest.mock('../store/store', () => ({
  uiStore: {
    getState: jest.fn(),
  },
}));
jest.mock('../components/auth-services/logger', () => ({
  debug: jest.fn(),
}));

const mockGetAnonymousToken = getAnonymousToken as jest.Mock;
const mockGetPasswordToken = getPasswordToken as jest.Mock;
const mockRefreshAccessToken = refreshAccessToken as jest.Mock;
const mockSignupCustomer = signupCustomer as jest.Mock;
const mockFetchMyCustomer = fetchMyCustomer as jest.Mock;
const mockApiInstancePost = apiInstance.post as jest.Mock;

describe('AuthService', () => {
  let tokenStoreState: {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    setTokens: jest.Mock;
    clearTokens: jest.Mock;
  };
  let customerStoreState: {
    customer: object | undefined;
    setCustomer: jest.Mock;
    clearCustomer: jest.Mock;
  };
  let uiStoreState: { addNotification: jest.Mock };

  beforeEach(() => {
    tokenStoreState = {
      accessToken: undefined,
      refreshToken: undefined,
      setTokens: jest.fn(),
      clearTokens: jest.fn(),
    };
    customerStoreState = {
      customer: undefined,
      setCustomer: jest.fn(),
      clearCustomer: jest.fn(),
    };
    uiStoreState = {
      addNotification: jest.fn(),
    };

    (useTokenStore.getState as unknown as jest.Mock).mockReturnValue(
      tokenStoreState
    );
    (useCustomerStore.getState as unknown as jest.Mock).mockReturnValue(
      customerStoreState
    );
    (useUIStore.getState as unknown as jest.Mock).mockReturnValue(uiStoreState);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register and log in a customer', async () => {
      mockGetAnonymousToken.mockResolvedValueOnce({
        access_token: 'anon-token',
      });
      mockSignupCustomer.mockResolvedValueOnce(undefined);
      mockGetPasswordToken.mockResolvedValueOnce({
        access_token: 'user-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      });
      mockFetchMyCustomer.mockResolvedValueOnce({
        id: 'customer-id',
        email: 'test@example.com',
      });

      const result = await AuthService.register(
        'test@example.com',
        'password123'
      );

      expect(result).toBe(true);
      expect(mockGetAnonymousToken).toHaveBeenCalledTimes(1);
      expect(mockSignupCustomer).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'password123',
          firstName: undefined,
          lastName: undefined,
          dateOfBirth: undefined,
          addresses: undefined,
        },
        'anon-token'
      );
      expect(mockGetPasswordToken).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(tokenStoreState.setTokens).toHaveBeenCalledWith(
        'user-token',
        'refresh-token',
        3600
      );
      expect(mockFetchMyCustomer).toHaveBeenCalledWith('user-token');
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith({
        id: 'customer-id',
        email: 'test@example.com',
      });
      expect(uiStoreState.addNotification).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Access-token:'),
        10000
      );
    });

    it('should handle registration failure and return false', async () => {
      const error = new Error('Registration failed');
      mockGetAnonymousToken.mockRejectedValueOnce(error);

      const result = await AuthService.register(
        'test@example.com',
        'password123'
      );

      expect(result).toBe(false);
      expect(uiStoreState.addNotification).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Registration failed: Registration failed')
      );
      expect(tokenStoreState.clearTokens).not.toHaveBeenCalled();
      expect(customerStoreState.clearCustomer).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully log in a customer', async () => {
      mockGetPasswordToken.mockResolvedValueOnce({
        access_token: 'user-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      });
      mockFetchMyCustomer.mockResolvedValueOnce({
        id: 'customer-id',
        email: 'test@example.com',
      });

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result).toBe(true);
      expect(mockGetPasswordToken).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(tokenStoreState.setTokens).toHaveBeenCalledWith(
        'user-token',
        'refresh-token',
        3600
      );
      expect(mockFetchMyCustomer).toHaveBeenCalledWith('user-token');
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith({
        id: 'customer-id',
        email: 'test@example.com',
      });
      expect(uiStoreState.addNotification).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Access-token:'),
        10000
      );
    });

    it('should handle login failure, log out, and return false', async () => {
      const error = new Error('Login failed');
      mockGetPasswordToken.mockRejectedValueOnce(error);

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result).toBe(false);
      expect(tokenStoreState.clearTokens).toHaveBeenCalledTimes(1);
      expect(customerStoreState.clearCustomer).toHaveBeenCalledTimes(1);
      expect(uiStoreState.addNotification).toHaveBeenCalledWith(
        'error',
        'Login failed. Check credentials.'
      );
    });
  });

  describe('logout', () => {
    it('should clear tokens and customer data', async () => {
      await AuthService.logout();

      expect(tokenStoreState.clearTokens).toHaveBeenCalledTimes(1);
      expect(customerStoreState.clearCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token if refresh token exists', async () => {
      tokenStoreState.refreshToken = 'existing-refresh-token';
      mockRefreshAccessToken.mockResolvedValueOnce({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      });

      const result = await AuthService.refreshToken();

      expect(result).toBe('new-access-token');
      expect(mockRefreshAccessToken).toHaveBeenCalledWith(
        'existing-refresh-token'
      );
      expect(tokenStoreState.setTokens).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token',
        3600
      );
    });

    it('should return undefined if no refresh token exists', async () => {
      tokenStoreState.refreshToken = undefined;

      const result = await AuthService.refreshToken();

      expect(result).toBeUndefined();
      expect(mockRefreshAccessToken).not.toHaveBeenCalled();
    });

    it('should handle refresh token failure, log out, and return undefined', async () => {
      tokenStoreState.refreshToken = 'existing-refresh-token';
      const error = new Error('Refresh failed');
      mockRefreshAccessToken.mockRejectedValueOnce(error);

      const result = await AuthService.refreshToken();

      expect(result).toBeUndefined();
      expect(tokenStoreState.clearTokens).toHaveBeenCalledTimes(1);
      expect(customerStoreState.clearCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAnonymousToken', () => {
    it('should successfully get and persist anonymous token', async () => {
      mockGetAnonymousToken.mockResolvedValueOnce({
        access_token: 'anon-token',
        expires_in: 3600,
      });

      const result = await AuthService.getAnonymousToken();

      expect(result).toBe('anon-token');
      expect(mockGetAnonymousToken).toHaveBeenCalledTimes(1);
      expect(tokenStoreState.setTokens).toHaveBeenCalledWith(
        'anon-token',
        undefined,
        3600
      );
    });

    it('should return undefined if getting anonymous token fails', async () => {
      const error = new Error('Anon token failed');
      mockGetAnonymousToken.mockRejectedValueOnce(error);

      const result = await AuthService.getAnonymousToken();

      expect(result).toBeUndefined();
    });
  });

  describe('loadSession', () => {
    it('should load customer session if access token exists and customer is not in store', async () => {
      tokenStoreState.accessToken = 'existing-access-token';
      customerStoreState.customer = undefined;
      mockFetchMyCustomer.mockResolvedValueOnce({
        id: 'customer-id',
        email: 'test@example.com',
      });

      await AuthService.loadSession();

      expect(mockFetchMyCustomer).toHaveBeenCalledWith('existing-access-token');
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith({
        id: 'customer-id',
        email: 'test@example.com',
      });
    });

    it('should not load session if customer is already in store', async () => {
      customerStoreState.customer = {
        id: 'customer-id',
        email: 'test@example.com',
      };
      tokenStoreState.accessToken = 'existing-access-token';

      await AuthService.loadSession();

      expect(mockFetchMyCustomer).not.toHaveBeenCalled();
    });

    it('should not load session if no access token exists', async () => {
      tokenStoreState.accessToken = undefined;
      customerStoreState.customer = undefined;

      await AuthService.loadSession();

      expect(mockFetchMyCustomer).not.toHaveBeenCalled();
    });

    it('should handle load session failure and log out', async () => {
      tokenStoreState.accessToken = 'existing-access-token';
      customerStoreState.customer = undefined;
      const error = new Error('Fetch customer failed');
      mockFetchMyCustomer.mockRejectedValueOnce(error);

      await AuthService.loadSession();

      expect(tokenStoreState.clearTokens).toHaveBeenCalledTimes(1);
      expect(customerStoreState.clearCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCurrentCustomer', () => {
    const mockActions = [{ action: 'changeEmail', email: 'new@example.com' }];
    const mockCustomer = {
      id: 'customer-id',
      email: 'new@example.com',
      version: 2,
    };

    it('should successfully update customer details', async () => {
      tokenStoreState.accessToken = 'user-token';
      mockApiInstancePost.mockResolvedValueOnce({ data: mockCustomer });

      await AuthService.updateCurrentCustomer(1, mockActions);

      expect(mockApiInstancePost).toHaveBeenCalledWith(
        '/me',
        { version: 1, actions: mockActions },
        { headers: { Authorization: 'Bearer user-token' } }
      );
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle 409 conflict by retrying with fresh version', async () => {
      tokenStoreState.accessToken = 'user-token';
      const conflictError = {
        response: {
          status: 409,
          data: {
            errors: [{ currentVersion: 2 }],
          },
        },
      };
      mockApiInstancePost
        .mockRejectedValueOnce(conflictError)
        .mockResolvedValueOnce({ data: mockCustomer });

      await AuthService.updateCurrentCustomer(1, mockActions);

      expect(mockApiInstancePost).toHaveBeenCalledTimes(2);
      expect(mockApiInstancePost).toHaveBeenNthCalledWith(
        1,
        '/me',
        { version: 1, actions: mockActions },
        { headers: { Authorization: 'Bearer user-token' } }
      );
      expect(mockApiInstancePost).toHaveBeenNthCalledWith(
        2,
        '/me',
        { version: 2, actions: mockActions },
        { headers: { Authorization: 'Bearer user-token' } }
      );
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw error if update fails and not a 409 conflict', async () => {
      tokenStoreState.accessToken = 'user-token';
      const error = new Error('Update failed');
      mockApiInstancePost.mockRejectedValueOnce(error);

      await expect(
        AuthService.updateCurrentCustomer(1, mockActions)
      ).rejects.toThrow(error);
    });
  });

  describe('changePassword', () => {
    const mockCustomer = {
      id: 'customer-id',
      email: 'test@example.com',
      version: 2,
    };

    it('should successfully change customer password', async () => {
      tokenStoreState.accessToken = 'user-token';
      mockApiInstancePost.mockResolvedValueOnce({ data: mockCustomer });

      const result = await AuthService.changePassword(
        1,
        'old-password',
        'new-password'
      );

      expect(mockApiInstancePost).toHaveBeenCalledWith(
        '/me/password',
        {
          version: 1,
          currentPassword: 'old-password',
          newPassword: 'new-password',
        },
        { headers: { Authorization: 'Bearer user-token' } }
      );
      expect(customerStoreState.setCustomer).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw error if no access token is available', async () => {
      tokenStoreState.accessToken = undefined;

      await expect(
        AuthService.changePassword(1, 'old-password', 'new-password')
      ).rejects.toThrow('No access token available for changing password.');
    });

    it('should throw error if changing password fails', async () => {
      tokenStoreState.accessToken = 'user-token';
      const error = new Error('Change password failed');
      mockApiInstancePost.mockRejectedValueOnce(error);

      await expect(
        AuthService.changePassword(1, 'old-password', 'new-password')
      ).rejects.toThrow(error);
    });
  });
});
