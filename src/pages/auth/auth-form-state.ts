import { createEl as createElement } from '../../utils/element-utilities';
import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';
import {
  createPageContainer,
  createTitleLogin,
  createInputField,
  createPasswordField,
} from './auth-form-elements';

export interface AuthFormState {
  isLoginForm: boolean;
  title: {
    element: HTMLElement;
    loginText: string;
    registerText: string;
  };
  basicFields: {
    pageContainer: HTMLElement;
    formContainer: HTMLElement;
    emailContainer: HTMLElement;
    emailInput: HTMLInputElement;
    passwordInput: HTMLInputElement;
    emailError: HTMLElement;
    passwordError: HTMLElement;
    errorContainer: HTMLElement;
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
  title: {
    element: undefined!, // Будет инициализировано
    loginText: 'Login',
    registerText: 'Register',
  },
  basicFields: {
    pageContainer: undefined!,
    formContainer: undefined!,
    emailContainer: undefined!,
    emailInput: undefined!, // Будет инициализировано при создании формы
    passwordInput: undefined!,
    emailError: undefined!,
    passwordError: undefined!,
    errorContainer: undefined!,
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

// --- отслеживаем, какие поля уже тронуты ---
export const dirty: Record<string, boolean> = {};

export function initializeAuthForm(
  parentContainer: HTMLElement
): AuthFormState {
  const pageContainer = createPageContainer(parentContainer);
  const titleElement = createTitleLogin(pageContainer);

  const formContainer = createElement({
    tag: 'form',
    parent: pageContainer,
    classes: ['space-y-4'],
  });

  // Создаем основные поля (email/password)
  const {
    fieldContainer: emailContainer,
    input: emailInput,
    error: emailError,
  } = createInputField({
    container: formContainer,
    type: 'email',
    id: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
  });

  const { input: passwordInput, error: passwordError } = createPasswordField({
    container: formContainer,
    id: 'password',
    placeholder: 'Use A-Z a-z 0-9',
  });

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
      emailInput: emailInput,
      passwordInput: passwordInput,
      emailError,
      passwordError,
      errorContainer,
    },
    containers: {
      ...initialAuthFormState.containers,
    },
  };
}
