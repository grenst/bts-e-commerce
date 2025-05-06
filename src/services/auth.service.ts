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
} from '../components/auth-services/customer.service';
import { useTokenStore } from '../store/token-store';
import { useCustomerStore } from '../store/customer-store';
import { uiStore as useUIStore } from '../store/store';
import { debug } from '../components/auth-services/logger';

function persistTokens(token: OAuthTokenResponse) {
  const { access_token, refresh_token, expires_in } = token;
  useTokenStore
    .getState()
    .setTokens(access_token, refresh_token ?? null, expires_in);
}

export class AuthService {
  static async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<boolean> {
    try {
      // anonymous token /me/signup
      const anon = await getAnonymousToken();
      await signupCustomer(
        { email, password, firstName, lastName } as CustomerDraft,
        anon.access_token
      );

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
  }

  //  Login
  static async login(email: string, password: string): Promise<boolean> {
    try {
      const token = await getPasswordToken(email, password);
      persistTokens(token);

      const customer = await fetchMyCustomer(token.access_token);
      useCustomerStore.getState().setCustomer(customer);

      useUIStore
        .getState()
        .addNotification('info', `Access‑token:\n${token.access_token}`, 10000);

      return true;
    } catch (error) {
      debug('Login error', error);
      await this.logout();
      useUIStore
        .getState()
        .addNotification('error', 'Login failed. Check credentials.');
      return false;
    }
  }

  //  Logout
  static async logout(): Promise<void> {
    useTokenStore.getState().clearTokens();
    useCustomerStore.getState().clearCustomer();
  }

  //  Refresh
  static async refreshToken(): Promise<string | null> {
    const { refreshToken } = useTokenStore.getState();
    if (!refreshToken) {
      debug('No refreshToken, skip refresh');
      return null;
    }
    try {
      const token = await refreshAccessToken(refreshToken);
      persistTokens(token);
      return token.access_token;
    } catch (error) {
      debug('Refresh error', error);
      await this.logout();
      return null;
    }
  }
}
