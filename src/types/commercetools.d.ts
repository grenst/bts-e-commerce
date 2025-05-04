// This file provides basic module declarations for Commercetools middleware packages
declare module '@commercetools/sdk-middleware-auth' {
  export function createAuthMiddlewareForClientCredentialsFlow(
    options: unknown // Using unknown is better than any
  ): unknown;
}

declare module '@commercetools/sdk-middleware-http' {
  export function createHttpMiddleware(
    options: unknown // Using unknown is better than any
  ): unknown;
}
