import { envVariables } from '../../config/commerce-tools-api';

export const buildScopes = (): string => {
  const { SCOPES, PROJECT_KEY } = envVariables;
  return SCOPES.map((s) => s.replace('{projectKey}', PROJECT_KEY)).join(' ');
};