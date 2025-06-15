export enum AuthMode {
  Login = 'login',
  Register = 'register',
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  streetName: string;
  houseNumber: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
  billingStreetName?: string;
  billingHouseNumber?: string;
  billingApartment?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  defaultShippingAddress?: boolean;
  defaultBillingAddress?: boolean;
}

export type ValidationResult = {
  success: boolean;
  errors: Record<string, string>;
};
