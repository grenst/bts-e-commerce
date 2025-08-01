import axios from 'axios';
import { environmentVariables } from '../../config/commerce-tools-api';
import { useTokenStore } from '../../store/token-store';
import { AuthService } from '../../services/auth.service';

const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  log: (...arguments_: unknown[]): void => {
    if (!isProduction) console.log(...arguments_);
  },
  error: (...arguments_: unknown[]): void => {
    if (!isProduction) console.error(...arguments_);
  },
};

export const authInstance = axios.create({
  baseURL: environmentVariables.AUTH_URL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  auth: {
    username: environmentVariables.CLIENT_ID ?? '',
    password: environmentVariables.CLIENT_SECRET ?? '',
  },
});

export const apiInstance = axios.create({
  baseURL: `${environmentVariables.API_URL}/${environmentVariables.PROJECT_KEY}`,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to apiInstance
apiInstance.interceptors.request.use(
  async (config) => {
    // Made async
    const { accessToken, expiresAt } = useTokenStore.getState();

    // Check if current token is valid
    if (accessToken && expiresAt && Date.now() < expiresAt) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      // No valid token, try to get/ensure an anonymous token
      try {
        logger.log(
          'No valid token, attempting to fetch/ensure anonymous token...'
        );
        const newAnonymousToken = await AuthService.getAnonymousToken();
        if (newAnonymousToken) {
          config.headers.Authorization = `Bearer ${newAnonymousToken}`;
          logger.log('Anonymous token set in headers.');
        } else {
          logger.error('Failed to obtain an anonymous token for the request.');
          // Potentially throw an error here if a token is strictly required
          // For now, letting it proceed, which might result in a 401/403 if the endpoint is protected
        }
      } catch (tokenError) {
        logger.error(
          'Error fetching/ensuring anonymous token for request interceptor:',
          tokenError
        );
        // Decide if we should let the request proceed without auth or reject it.
        // Throwing an error here would prevent the request from being made.
        // return Promise.reject(new Error('Failed to secure token for API request.'));
      }
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor setup error:', error);
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error and error.response exist before accessing status
    if (
      error &&
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const { isAnonymous } = useTokenStore.getState();

      if (isAnonymous) {
        // For anonymous sessions, get a new anonymous token
        try {
          logger.log(
            'Anonymous session expired, getting new anonymous token...'
          );
          const newToken = await AuthService.getAnonymousToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiInstance(originalRequest);
          } else {
            logger.error('Failed to get new anonymous token');
            throw error;
          }
        } catch (anonError) {
          logger.error('Error getting new anonymous token:', anonError);
          throw error;
        }
      } else {
        // For authenticated sessions, attempt to refresh token
        try {
          logger.log('Attempting to refresh token...');
          const newAccessToken = await AuthService.refreshToken();

          if (newAccessToken) {
            logger.log('Token refreshed successfully.');
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiInstance(originalRequest);
          } else {
            logger.log(
              'Failed to refresh token, newAccessToken is null. Logging out.'
            );
            await AuthService.logout();
            throw error;
          }
        } catch (refreshError) {
          logger.error(
            'Caught error during token refresh attempt:',
            refreshError
          );
          throw refreshError;
        }
      }
    }
    throw error;
  }
);
