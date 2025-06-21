import { createEl as createElement } from '../../utils/element-utilities';
import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';
import {
  createPageContainer,
  createInputField,
  createPasswordField,
} from './auth-form-elements';
import createTitle from '../../components/layout/title/title';

export interface AuthFormState {
  isLoginForm: boolean;
  title: {
    element?: HTMLElement;
    loginText: string;
    registerText: string;
  };
  basicFields: {
    pageContainer?: HTMLElement;
    formContainer?: HTMLElement;
    emailContainer?: HTMLElement;
    emailInput?: HTMLInputElement;
    passwordInput?: HTMLInputElement;
    emailError?: HTMLElement;
    passwordError?: HTMLElement;
    errorContainer?: HTMLElement;
  };
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
    shippingAddress?: HTMLElement;
    billingAddress?: HTMLElement;
    country?: HTMLDivElement;
    billingCountry?: HTMLDivElement;
  };

  errors: {
    firstName?: HTMLElement;
    lastName?: HTMLElement;
    dateOfBirth?: HTMLElement;
    streetName?: HTMLElement;
    houseNumber?: HTMLElement;
    apartment?: HTMLElement;
    city?: HTMLElement;
    postalCode?: HTMLElement;
    country?: HTMLElement;

    // Billing address errors
    billingStreetName?: HTMLElement;
    billingHouseNumber?: HTMLElement;
    billingApartment?: HTMLElement;
    billingCity?: HTMLElement;
    billingPostalCode?: HTMLElement;
    billingCountry?: HTMLElement;
  };
}

export const initialAuthFormState: AuthFormState = {
  isLoginForm: true,
  title: {
    element: undefined,
    loginText: 'Login',
    registerText: 'Register',
  },
  basicFields: {
    pageContainer: undefined,
    formContainer: undefined,
    emailContainer: undefined,
    emailInput: undefined,
    passwordInput: undefined,
    emailError: undefined,
    passwordError: undefined,
    errorContainer: undefined,
  },
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

export const dirty: Record<string, boolean> = {};

export function initializeAuthForm(
  parentContainer: HTMLElement
): AuthFormState {
  const pageContainer = createPageContainer(parentContainer);
  const titleElement = createTitle('Login', pageContainer, [], {
    textSize: 'text-2xl',
    marginBottom: 'mb-6',
    beforeWidth: 'before:w-20',
    isAbsolutePositioned: false,
    zIndex: 'z-30',
  });

  const formContainer = createElement({
    tag: 'form',
    parent: pageContainer,
    classes: ['space-y-4'],
  });

  const {
    fieldContainer: emailContainer,
    input: emailInputElement,
    error: emailError,
  } = createInputField({
    container: formContainer,
    type: 'email',
    id: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
  });

  if (!(emailInputElement instanceof HTMLInputElement)) {
    throw new TypeError('Email input is not an HTMLInputElement');
  }
  const emailInput: HTMLInputElement = emailInputElement;

  const { input: passwordInputElement, error: passwordError } =
    createPasswordField({
      container: formContainer,
      id: 'password',
      placeholder: 'Use A-Z a-z 0-9',
      label: 'Password',
    });

  if (!(passwordInputElement instanceof HTMLInputElement)) {
    throw new TypeError('Password input is not an HTMLInputElement');
  }
  const passwordInput: HTMLInputElement = passwordInputElement;

  const errorContainer = createElement({
    tag: 'div',
    parent: formContainer,
    classes: ['hidden', 'mb-4', 'p-3', 'bg-red-100', 'text-red-700', 'rounded'],
  });

  return {
    ...initialAuthFormState,
    title: {
      ...initialAuthFormState.title,
      element: titleElement,
    },
    basicFields: {
      pageContainer,
      formContainer,
      emailContainer,
      emailInput,
      passwordInput,
      emailError,
      passwordError,
      errorContainer,
    },
    containers: {
      ...initialAuthFormState.containers,
    },
  };
}
