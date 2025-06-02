import type { AuthFormState } from './auth-form-state';

type FieldConfig = {
  name: string;
  errorKey: keyof AuthFormState['errors'];
  inputKey: keyof AuthFormState['inputs'];
  isContainer?: boolean;
};

export const REGISTRATION_FIELDS: readonly FieldConfig[] = [
  { name: 'firstName', errorKey: 'firstName', inputKey: 'firstName' },
  { name: 'lastName', errorKey: 'lastName', inputKey: 'lastName' },
  { name: 'dateOfBirth', errorKey: 'dateOfBirth', inputKey: 'dateOfBirth' },
  { name: 'streetName', errorKey: 'streetName', inputKey: 'streetName' },
  { name: 'houseNumber', errorKey: 'houseNumber', inputKey: 'houseNumber' },
  { name: 'apartment', errorKey: 'apartment', inputKey: 'apartment' },
  { name: 'city', errorKey: 'city', inputKey: 'city' },
  { name: 'postalCode', errorKey: 'postalCode', inputKey: 'postalCode' },
  {
    name: 'country',
    errorKey: 'country',
    inputKey: 'country',
    isContainer: true,
  },
] as const;

export const BILLING_FIELDS: readonly FieldConfig[] = [
  {
    name: 'billingStreetName',
    errorKey: 'billingStreetName',
    inputKey: 'billingStreetName',
  },
  {
    name: 'billingHouseNumber',
    errorKey: 'billingHouseNumber',
    inputKey: 'billingHouseNumber',
  },
  {
    name: 'billingApartment',
    errorKey: 'billingApartment',
    inputKey: 'billingApartment',
  },
  { name: 'billingCity', errorKey: 'billingCity', inputKey: 'billingCity' },
  {
    name: 'billingPostalCode',
    errorKey: 'billingPostalCode',
    inputKey: 'billingPostalCode',
  },
  {
    name: 'billingCountry',
    errorKey: 'billingCountry',
    inputKey: 'billingCountry',
    isContainer: true,
  },
] as const;

export const BASIC_FIELDS = {
  email: { name: 'email' },
  password: { name: 'password' },
} as const;
