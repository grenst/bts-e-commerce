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
import { isAxiosError } from 'axios';
import { useTokenStore } from '../store/token-store';
import { useCustomerStore } from '../store/customer-store';
import { uiStore as useUIStore } from '../store/store';
import { debug } from '../components/auth-services/logger';

function persistTokens(
  token: OAuthTokenResponse,
  isAnonymous: boolean = false
) {
  const { access_token, refresh_token, expires_in } = token;
  useTokenStore
    .getState()
    .setTokens(
      access_token,
      refresh_token ?? undefined,
      expires_in,
      isAnonymous
    );
}

type CustomerAction = { action: string; [k: string]: unknown };

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
          `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      return false;
    }
  },

  //  Login
  async login(email: string, password: string): Promise<boolean> {
    try {
      const token = await getPasswordToken(email, password);
      persistTokens(token, false); // authenticated token

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
    const { refreshToken, isAnonymous } = useTokenStore.getState();
    if (!refreshToken) {
      debug('No refreshToken, skip refresh');
      return undefined;
    }
    try {
      const token = await refreshAccessToken(refreshToken);
      persistTokens(token, isAnonymous); // preserve anonymous status
      return token.access_token;
    } catch (error) {
      debug('Refresh error', error);
      await this.logout();
      return undefined;
    }
  },

  async getAnonymousToken(): Promise<string | undefined> {
    try {
      const token = await getAnonymousToken();
      persistTokens(token, true); // anonymous token
      return token.access_token;
    } catch (error) {
      debug('Get anonymous token error', error);
      return undefined;
    }
  },

  async loadSession(): Promise<void> {
    const { customer } = useCustomerStore.getState();
    if (customer) return;

    const { accessToken, isAnonymous } = useTokenStore.getState();
    if (!accessToken) return;

    // Skip fetching customer data for anonymous sessions
    if (isAnonymous) return;

    try {
      const me = await fetchMyCustomer(accessToken);
      useCustomerStore.getState().setCustomer(me);
    } catch (error) {
      debug('loadSession error', error);
      await this.logout();
    }
  },

  async updateCurrentCustomer(
    version: number,
    actions: readonly CustomerAction[]
  ): Promise<void> {
    const token = useTokenStore.getState().accessToken;

    const send = async (v: number) =>
      apiInstance.post(
        '/me',
        { version: v, actions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

    try {
      const { data } = await send(version);
      useCustomerStore.getState().setCustomer(data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const errorData = error.response.data;
        const fresh: number | undefined =
          errorData?.errors?.[0]?.currentVersion;

        if (typeof fresh === 'number') {
          const { data } = await send(fresh);
          useCustomerStore.getState().setCustomer(data);
          return;
        }
      }
      throw error;
    }
  },

  async changePassword(
    version: number,
    currentPassword: string,
    newPassword: string
  ): Promise<CommercetoolsCustomer> {
    const { accessToken } = useTokenStore.getState();
    if (!accessToken) {
      throw new Error('No access token available for changing password.');
    }

    try {
      const { data } = await apiInstance.post<CommercetoolsCustomer>(
        '/me/password',
        { version, currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      useCustomerStore.getState().setCustomer(data);
      return data;
    } catch (error) {
      debug('Change-password error', error);
      throw error;
    }
  },
};
