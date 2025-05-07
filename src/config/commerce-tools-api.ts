export const envVariables = {
  PROJECT_KEY: import.meta.env.VITE_CTP_PROJECT_KEY,
  CLIENT_ID: import.meta.env.VITE_CTP_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_CTP_CLIENT_SECRET,
  AUTH_URL: import.meta.env.VITE_CTP_AUTH_URL,
  API_URL: import.meta.env.VITE_CTP_API_URL,
  SCOPES: import.meta.env.VITE_CTP_SCOPES?.split(' ') || [],
};
