import { createClient, type Middleware } from '@commercetools/sdk-client-v2';
import { createAuthMiddlewareForClientCredentialsFlow } from '@commercetools/sdk-middleware-auth';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import {
  createApiBuilderFromCtpClient,
  ByProjectKeyRequestBuilder,
  CustomerSignInResult,
} from '@commercetools/platform-sdk';
import { setLoading, addNotification } from '../../store/store';
import { fetchCustomerToken } from './token';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | undefined;
  token: string | undefined;
}

const authState: AuthState = {
  isAuthenticated: false,
  user: undefined,
  token: undefined,
};

type AuthEventType = 'login' | 'logout';
type AuthEventListener = (state: AuthState) => void;
const listeners: Record<AuthEventType, AuthEventListener[]> = {
  login: [],
  logout: [],
};

export function subscribeToAuth(
  event: AuthEventType,
  callback: AuthEventListener
): () => void {
  listeners[event].push(callback);
  return () => {
    const index = listeners[event].indexOf(callback);
    if (index !== -1) {
      listeners[event].splice(index, 1);
    }
  };
}

function notifyListeners(event: AuthEventType): void {
  listeners[event].forEach((callback) => callback({ ...authState }));
}

export function getAuthState(): AuthState {
  return { ...authState };
}

export function createCustomerAuthClient() {
  const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
  const clientId = import.meta.env.VITE_CTP_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CTP_CLIENT_SECRET;
  const authUrl = import.meta.env.VITE_CTP_AUTH_URL;
  const apiUrl = import.meta.env.VITE_CTP_API_URL;
  const scopesString = import.meta.env.VITE_CTP_SCOPES;
  
  let scopes: string[] | undefined;
  if (scopesString && projectKey) {
    scopes = scopesString
      .split(' ')
      .map((scope: string) => scope.replace('{projectKey}', projectKey));
  }

  if (
    !projectKey ||
    !clientId ||
    !clientSecret ||
    !authUrl ||
    !apiUrl ||
    !scopes
  ) {
    const missingVars = [
      !projectKey && 'VITE_CTP_PROJECT_KEY',
      !clientId && 'VITE_CTP_CLIENT_ID',
      !clientSecret && 'VITE_CTP_CLIENT_SECRET',
      !authUrl && 'VITE_CTP_AUTH_URL',
      !apiUrl && 'VITE_CTP_API_URL',
      !scopes && 'VITE_CTP_SCOPES',
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Missing required Commercetools environment variables: ${missingVars}. Ensure they are defined in your .env file.`
    );
  }

  const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
    host: authUrl,
    projectKey,
    credentials: {
      clientId,
      clientSecret,
    },
    scopes,
  });

  const httpMiddleware = createHttpMiddleware({
    host: apiUrl,
  });

  const client = createClient({
    middlewares: [authMiddleware as Middleware, httpMiddleware as Middleware],
  });

  return client;
}

export function createCustomerApiRoot(): ByProjectKeyRequestBuilder {
  const client = createCustomerAuthClient();
  const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;

  if (!projectKey) {
    throw new Error(
      'Missing required Commercetools environment variable: VITE_CTP_PROJECT_KEY'
    );
  }

  const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
    projectKey,
  });
  
  return apiRoot;
}

export async function loginUser(
  email: string,
  password: string
): Promise<CustomerSignInResult> {
  setLoading(true);
  
  try {
    const localUser = getLocalUser(email);
    
    if (localUser && localUser.password === password) {
      authState.isAuthenticated = true;
      authState.user = {
        id: crypto.randomUUID(),
        email,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
      };
      
      localStorage.setItem('auth', JSON.stringify(authState));
      
      notifyListeners('login');
      
      addNotification('success', 'Successfully logged in with local account!');
      
      return {
        customer: {
          id: authState.user.id,
          version: 1,
          email,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          createdAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
          isEmailVerified: false,
        },
        cart: undefined,
      } as unknown as CustomerSignInResult;
    }
    
    try {
      const token = await fetchCustomerToken(email, password);
      console.log('Customer Access Token:', token);
      
      const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY!;
      const apiUrl = import.meta.env.VITE_CTP_API_URL!;
      
      const httpMiddleware = createHttpMiddleware({
        host: apiUrl,
        fetch,
      });
      
      const client = createClient({
        middlewares: [
          {
            execute: (request: { headers?: Record<string, string> }, next: (req: any) => void) => {
              if (!request.headers) {
                request.headers = {};
              }
              request.headers['Authorization'] = `Bearer ${token}`;
              next(request);
            }
          } as unknown as Middleware,
          httpMiddleware as Middleware
        ],
      });
      
      const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
        projectKey,
      });
      
      const response = await apiRoot.me().get().execute();
      console.log('Customer:', response.body);
      
      authState.isAuthenticated = true;
      authState.user = {
        id: response.body.id,
        email: response.body.email,
        firstName: response.body.firstName,
        lastName: response.body.lastName,
      };
      authState.token = token;
      
      localStorage.setItem('auth', JSON.stringify(authState));
      
      notifyListeners('login');
      
      addNotification('success', 'Successfully logged in with Commercetools account!');
      
      return {
        customer: response.body,
        cart: undefined,
      } as CustomerSignInResult;
    } catch (ctError) {
      console.error('Commercetools login error:', ctError);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    addNotification('error', 'Login failed. Please check your credentials.');
    throw error;
  } finally {
    setLoading(false);
  }
}

interface LocalUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

function getLocalUsers(): LocalUser[] {
  const storedUsers = localStorage.getItem('localUsers');
  return storedUsers ? JSON.parse(storedUsers) : [];
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem('localUsers', JSON.stringify(users));
}

function userExistsLocally(email: string): boolean {
  const users = getLocalUsers();
  return users.some(user => user.email === email);
}

function addLocalUser(user: LocalUser): void {
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
}

function getLocalUser(email: string): LocalUser | undefined {
  const users = getLocalUsers();
  return users.find(user => user.email === email);
}

export async function registerUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<CustomerSignInResult | undefined> {
  setLoading(true);
  
  try {
    if (userExistsLocally(email)) {
      addNotification('error', 'A user with this email already exists.');
      throw new Error('User already exists');
    }
    
    addLocalUser({
      email,
      password,
      firstName,
      lastName,
    });
    
    addNotification('success', 'Registration successful! This is a simulated registration as we don\'t have the manage_customers scope.');
    
    authState.isAuthenticated = true;
    authState.user = {
      id: crypto.randomUUID(),
      email,
      firstName,
      lastName,
    };
    
    localStorage.setItem('auth', JSON.stringify(authState));
    
    notifyListeners('login');
    
    return {
      customer: {
        id: authState.user.id,
        version: 1,
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        isEmailVerified: false,
      },
      cart: undefined,
    } as unknown as CustomerSignInResult;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error && error.message !== 'User already exists') {
      addNotification('error', 'Registration failed. Please try again.');
    }
    throw error;
  } finally {
    setLoading(false);
  }
}

export function logoutUser(): void {
  setLoading(true);
  
  authState.isAuthenticated = false;
  authState.user = undefined;
  authState.token = undefined;
  
  localStorage.removeItem('auth');
  
  notifyListeners('logout');
  
  addNotification('info', 'You have been logged out.');
  
  setLoading(false);
}

export function initializeAuth(): void {
  const storedAuth = localStorage.getItem('auth');
  
  if (storedAuth) {
    try {
      const parsedAuth = JSON.parse(storedAuth) as AuthState;
      
      authState.isAuthenticated = parsedAuth.isAuthenticated;
      authState.user = parsedAuth.user;
      authState.token = parsedAuth.token;
      
      if (authState.isAuthenticated) {
        notifyListeners('login');
      }
    } catch (error) {
      console.error('Error parsing stored auth:', error);
      localStorage.removeItem('auth');
    }
  }
}
