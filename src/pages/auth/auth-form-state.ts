import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';

export interface AuthFormState {
  isLoginForm: boolean;
  inputs: {
    firstName: HTMLInputElement | undefined;
    lastName: HTMLInputElement | undefined;
    dateOfBirth: HTMLInputElement | undefined;
    streetName: HTMLInputElement | undefined;
    houseNumber: HTMLInputElement | undefined;
    apartment: HTMLInputElement | undefined;
    city: HTMLInputElement | undefined;
    postalCode: HTMLInputElement | undefined;
    country: FilterableDropdown | undefined;

    // Billing address fields
    billingStreetName: HTMLInputElement | undefined;
    billingHouseNumber: HTMLInputElement | undefined;
    billingApartment: HTMLInputElement | undefined;
    billingCity: HTMLInputElement | undefined;
    billingPostalCode: HTMLInputElement | undefined;
    billingCountry: FilterableDropdown | undefined;
    billingAddressSameAsShipping: HTMLInputElement | undefined;
  };

  containers: {
    shippingAddress: HTMLElement | undefined;
    billingAddress: HTMLElement | undefined;
    country: HTMLDivElement | undefined;
    billingCountry: HTMLDivElement | undefined;
  };

  errors: {
    firstName: HTMLElement | undefined;
    lastName: HTMLElement | undefined;
    dateOfBirth: HTMLElement | undefined;
    streetName: HTMLElement | undefined;
    houseNumber: HTMLElement | undefined;
    apartment: HTMLElement | undefined;
    city: HTMLElement | undefined;
    postalCode: HTMLElement | undefined;
    country: HTMLElement | undefined;

    // Billing address errors
    billingStreetName: HTMLElement | undefined;
    billingHouseNumber: HTMLElement | undefined;
    billingApartment: HTMLElement | undefined;
    billingCity: HTMLElement | undefined;
    billingPostalCode: HTMLElement | undefined;
    billingCountry: HTMLElement | undefined;
  };
}

export const initialAuthFormState: AuthFormState = {
  isLoginForm: true,
  inputs: {
    firstName: undefined,
    lastName: undefined,
    dateOfBirth: undefined,
    streetName: undefined,
    houseNumber: undefined,
    apartment: undefined,
    city: undefined,
    postalCode: undefined,
    country: undefined,
    billingStreetName: undefined,
    billingHouseNumber: undefined,
    billingApartment: undefined,
    billingCity: undefined,
    billingPostalCode: undefined,
    billingCountry: undefined,
    billingAddressSameAsShipping: undefined,
  },
  containers: {
    shippingAddress: undefined,
    billingAddress: undefined,
    country: undefined,
    billingCountry: undefined,
  },
  errors: {
    firstName: undefined,
    lastName: undefined,
    dateOfBirth: undefined,
    streetName: undefined,
    houseNumber: undefined,
    apartment: undefined,
    city: undefined,
    postalCode: undefined,
    country: undefined,
    billingStreetName: undefined,
    billingHouseNumber: undefined,
    billingApartment: undefined,
    billingCity: undefined,
    billingPostalCode: undefined,
    billingCountry: undefined,
  },
};
