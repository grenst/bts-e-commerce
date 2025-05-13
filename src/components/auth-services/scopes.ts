import { environmentVariables } from '../../config/commerce-tools-api';

export const buildScopes = (): string => {
  const { SCOPES, PROJECT_KEY } = environmentVariables;
  return SCOPES.map((s: string) => s.replace('{projectKey}', PROJECT_KEY)).join(
    ' '
  );
};
