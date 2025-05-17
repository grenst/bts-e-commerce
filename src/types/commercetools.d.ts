// This file provides basic module declarations for Commercetools middleware packages
declare module '@commercetools/sdk-middleware-auth' {
  export function createAuthMiddlewareForClientCredentialsFlow(
    options: unknown
  ): unknown;
}

declare module '@commercetools/sdk-middleware-http' {
  export function createHttpMiddleware(
    options: unknown
  ): unknown;
}

export interface Address {
  id?: string;
  key?: string;
  country: string;
  title?: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  state?: string;
  company?: string;
  department?: string;
  building?: string;
  apartment?: string;
  pOBox?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  fax?: string;
  additionalAddressInfo?: string;
  externalId?: string;
}
