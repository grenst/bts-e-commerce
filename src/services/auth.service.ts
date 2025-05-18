import {
  getAnonymousToken,
  getPasswordToken,
  refreshAccessToken,
  OAuthTokenResponse,
} from '../components/auth-services/token.service';
import {
  signupCustomer,
  fetchMyCustomer,
  CustomerDraft,
  CommercetoolsCustomer,
} from '../components/auth-services/customer.service';
import type { Address } from '../types/commercetools'; // Added import for Address
import { apiInstance } from '../api/axios-instances';
import { useTokenStore } from '../store/token-store';
import { useCustomerStore } from '../store/customer-store';
import { uiStore as useUIStore } from '../store/store';
import { debug } from '../components/auth-services/logger';

function persistTokens(token: OAuthTokenResponse) {
  const { access_token, refresh_token, expires_in } = token;
  useTokenStore
    .getState()
    .setTokens(access_token, refresh_token ?? undefined, expires_in);
}

export const AuthService = {
  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string,
    addresses?: Address[] // Ensured Address type is used
  ): Promise<boolean> {
    try {
      // anonymous token /me/signup
      const anon = await getAnonymousToken();
      const customerDraft: CustomerDraft = {
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        addresses,
      };
      await signupCustomer(customerDraft, anon.access_token);

      // login (password‑grant)
      return await this.login(email, password);
    } catch (error) {
      debug('Registration error', error);
      // UX‑msg
      useUIStore
        .getState()
        .addNotification(
          'error',
          `Registration failed: ${(error as Error).message}`
        );
      return false;
    }
  },

  //  Login
  async login(email: string, password: string): Promise<boolean> {
    try {
      const token = await getPasswordToken(email, password);
      persistTokens(token);

      const customer = await fetchMyCustomer(token.access_token);
      useCustomerStore.getState().setCustomer(customer);

      useUIStore
        .getState()
        .addNotification(
          'info',
          `Access‑token:\n${token.access_token}`,
          10_000
        );

      return true;
    } catch (error) {
      debug('Login error', error);
      await this.logout();
      useUIStore
        .getState()
        .addNotification('error', 'Login failed. Check credentials.');
      return false;
    }
  },

  //  Logout
  async logout(): Promise<void> {
    useTokenStore.getState().clearTokens();
    useCustomerStore.getState().clearCustomer();
  },

  //  Refresh
  async refreshToken(): Promise<string | undefined> {
    const { refreshToken } = useTokenStore.getState();
    if (!refreshToken) {
      debug('No refreshToken, skip refresh');
      return undefined;
    }
    try {
      const token = await refreshAccessToken(refreshToken);
      persistTokens(token);
      return token.access_token;
    } catch (error) {
      debug('Refresh error', error);
      await this.logout();
      return undefined;
    }
  },

  async updateCurrentCustomer(
    version: number,
    actions: { action: string; [key: string]: unknown }[]
  ): Promise<CommercetoolsCustomer> {
    const { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      throw new Error('No access token available for updating customer.');
    }

    debug('POST /me (update customer)', { version, actions });
    try {
      const { data } = await apiInstance.post<CommercetoolsCustomer>(
        '/me',
        { version, actions },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      debug('Customer update successful', data.email);
      // Update customer in store after successful API call
      useCustomerStore.getState().setCustomer(data);
      return data;
    } catch (error) {
      debug('Customer update error', error);
      useUIStore
        .getState()
        .addNotification(
          'error',
          `Customer update failed: ${(error as Error).message}`
        );
      throw error;
    }
  },
};
