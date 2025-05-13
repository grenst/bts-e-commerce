import axios from 'axios';
import { environmentVariables } from '../../config/commerce-tools-api';
import { useTokenStore } from '../../store/token-store';
import { AuthService } from '../../services/auth.service';

export const authInstance = axios.create({
  baseURL: environmentVariables.AUTH_URL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  auth: {
    username: environmentVariables.CLIENT_ID,
    password: environmentVariables.CLIENT_SECRET,
  },
});

export const apiInstance = axios.create({
  baseURL: `${environmentVariables.API_URL}/${environmentVariables.PROJECT_KEY}`,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to apiInstance
apiInstance.interceptors.request.use(
  (config) => {
    const { accessToken, expiresAt } = useTokenStore.getState();
    if (accessToken && expiresAt && Date.now() < expiresAt) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh token...');
        const newAccessToken = await AuthService.refreshToken();

        if (newAccessToken) {
          console.log('Token refreshed successfully.');
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] =
              `Bearer ${newAccessToken}`;
          } else {
            originalRequest.headers = {
              Authorization: `Bearer ${newAccessToken}`,
            };
          }
          return apiInstance(originalRequest);
        } else {
          console.log(
            'Failed to refresh token, newAccessToken is null. Logging out.'
          );
          throw error;
        }
      } catch (refreshError) {
        console.error(
          'Caught error during token refresh attempt or subsequent request retry:',
          refreshError
        );
        throw refreshError;
      }
    }
    throw error;
  }
);
