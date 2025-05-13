import { authInstance } from '../../api/axios-instances';
import { envVariables as environmentVariables } from '../../config/commerce-tools-api';
import { buildScopes } from './scopes';
import { debug } from './logger';

const { PROJECT_KEY } = environmentVariables;

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
}

export async function getAnonymousToken(): Promise<OAuthTokenResponse> {
  debug('Requesting anonymous token…');
  const parameters = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: buildScopes(),
  });
  const { data } = await authInstance.post<OAuthTokenResponse>(
    `/oauth/${PROJECT_KEY}/anonymous/token`,
    parameters
  );
  debug('Anonymous token received', data);
  return data;
}

export async function getPasswordToken(
  email: string,
  password: string
): Promise<OAuthTokenResponse> {
  debug('Requesting password token for', email);
  const parameters = new URLSearchParams({
    grant_type: 'password',
    username: email,
    password,
    scope: buildScopes(),
  });
  const { data } = await authInstance.post<OAuthTokenResponse>(
    `/oauth/${PROJECT_KEY}/customers/token`,
    parameters
  );
  debug('Password token received');
  return data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<OAuthTokenResponse> {
  debug('Refreshing access token…');
  const parameters = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const { data } = await authInstance.post<OAuthTokenResponse>(
    '/oauth/token',
    parameters
  );
  debug('Access token refreshed');
  return data;
}
