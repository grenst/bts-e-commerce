export const environmentVariables = {
  PROJECT_KEY: process.env.VITE_CTP_PROJECT_KEY,
  CLIENT_ID: process.env.VITE_CTP_CLIENT_ID,
  CLIENT_SECRET: process.env.VITE_CTP_CLIENT_SECRET,
  AUTH_URL: process.env.VITE_CTP_AUTH_URL,
  API_URL: process.env.VITE_CTP_API_URL,
  SCOPES: process.env.VITE_CTP_SCOPES?.split(' ') || [],
};

// export const environmentVariables = {
//   PROJECT_KEY: import.meta.env.VITE_CTP_PROJECT_KEY,
//   CLIENT_ID: import.meta.env.VITE_CTP_CLIENT_ID,
//   CLIENT_SECRET: import.meta.env.VITE_CTP_CLIENT_SECRET,
//   AUTH_URL: import.meta.env.VITE_CTP_AUTH_URL,
//   API_URL: import.meta.env.VITE_CTP_API_URL,
//   SCOPES: import.meta.env.VITE_CTP_SCOPES?.split(' ') || [],
// };

/**************************************************** */

// Для Vite и браузерной среды
// const getEnvironment = (key: string): string => {
//   return import.meta.env?.[key] || process.env?.[key] || '';
// };

// export const environmentVariables = {
//   PROJECT_KEY: getEnvironment('VITE_CTP_PROJECT_KEY'),
//   CLIENT_ID: getEnvironment('VITE_CTP_CLIENT_ID'),
//   CLIENT_SECRET: getEnvironment('VITE_CTP_CLIENT_SECRET'),
//   AUTH_URL: getEnvironment('VITE_CTP_AUTH_URL'),
//   API_URL: getEnvironment('VITE_CTP_API_URL'),
//   SCOPES: getEnvironment('VITE_CTP_SCOPES?').split(' ') || [],
// };

/**************************************************** */

// export const environmentVariables = {
//   PROJECT_KEY:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_PROJECT_KEY
//       : process.env.VITE_CTP_PROJECT_KEY,
//   CLIENT_ID:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_CLIENT_ID
//       : process.env.VITE_CTP_CLIENT_ID,
//   CLIENT_SECRET:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_CLIENT_SECRET
//       : process.env.VITE_CTP_CLIENT_SECRET,
//   AUTH_URL:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_AUTH_URL
//       : process.env.VITE_CTP_AUTH_URL,
//   API_URL:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_API_URL
//       : process.env.VITE_CTP_API_URL,
//   SCOPES:
//     typeof process === 'undefined'
//       ? import.meta.env.VITE_CTP_SCOPES?.split(' ') || []
//       : process.env.VITE_CTP_SCOPES?.split(' ') || [],
// };

/**************************************************** */

// const isBrowser = globalThis.window !== undefined;

// export const environmentVariables = {
//   PROJECT_KEY: isBrowser
//     ? import.meta.env.VITE_CTP_PROJECT_KEY
//     : process.env.VITE_CTP_PROJECT_KEY,
//   CLIENT_ID: isBrowser
//     ? import.meta.env.VITE_CTP_CLIENT_ID
//     : process.env.VITE_CTP_CLIENT_ID,
//   CLIENT_SECRET: isBrowser
//     ? import.meta.env.VITE_CTP_CLIENT_SECRET
//     : process.env.VITE_CTP_CLIENT_SECRET,
//   AUTH_URL: isBrowser
//     ? import.meta.env.VITE_CTP_AUTH_URL
//     : process.env.VITE_CTP_AUTH_URL,
//   API_URL: isBrowser
//     ? import.meta.env.VITE_CTP_API_URL
//     : process.env.VITE_CTP_API_URL,
//   SCOPES: isBrowser
//     ? import.meta.env.VITE_CTP_SCOPES?.split(' ') || []
//     : process.env.VITE_CTP_SCOPES?.split(' ') || [],
// };
