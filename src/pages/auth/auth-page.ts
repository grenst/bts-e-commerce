import { z } from 'zod';
import './auth-page.scss';
import {
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';
import createButton from '../../components/layout/button/button';
import { getRouter } from '../../router/router';
import { uiStore } from '../../store/store';
// import { addNotification } from '../../store/store'; // Changed uiStore to addNotification
import { AuthService } from '../../services/auth.service';
import { useCustomerStore } from '../../store/customer-store';
import { triggerHeaderUpdate } from '../../index';
import createModalContainer from '../../components/layout/modal/modal-container';
import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';
import { COUNTRIES } from '../../data/countries';

// import {
//   createInputField,
//   createPageContainer,
//   createPasswordField,
// } from './auth-form-elements';
// import { AuthFormState, initializeAuthForm, dirty } from './auth-form-state';
import { initializeAuthForm, dirty } from './auth-form-state';

const NAME_CITY_REGEX = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/u;

const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  // Северная Америка
  US: /^\d{5}(?:-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/,

  // Европа (топ-10 e-commerce)
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  CH: /^\d{4}$/,
  AT: /^\d{4}$/,
  AU: /^\d{4}$/,
  RU: /^\d{6}$/,
  UA: /^\d{5}$/,
  PL: /^\d{2}-\d{3}$/,
  BY: /^\d{6}$/,
};

function isPostalCodeValid(code: string, country: string): boolean {
  const cc = country.toUpperCase();
  const pattern = POSTAL_CODE_PATTERNS[cc];

  if (!pattern) {
    // Фолбэк для «экзотических» стран: 3-10 символов, ≤1 пробела
    return /^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)?$/.test(code);
  }

  return pattern.test(code);
}

const emailSchema = z
  .string()
  .min(1, { message: 'Please enter your email' })
  .email({ message: 'Please enter a valid email (e.g., user@example.com)' })
  // запрещаем пробелы в начале/конце
  .refine((v: string) => v === v.trim(), {
    message: 'Email must not start or end with spaces',
  })
  // запрещаем пробелы внутри
  .refine((v: string) => !/\s/.test(v), {
    message: 'Email must not contain spaces',
  });

const passwordSchema = z
  .string()
  .min(8, { message: 'Use at least 8 characters' })
  .regex(/[A-Z]/, {
    message: 'Add at least one uppercase letter (A-Z)',
  })
  .regex(/[a-z]/, {
    message: 'Add at least one lowercase letter (a-z)',
  })
  .regex(/[0-9]/, {
    message: 'Include a number (0-9)',
  })
  // запрещаем пробелы в начале/конце
  .refine((v: string) => v === v.trim(), {
    message: 'Password must not start or end with a space',
  });

const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .regex(NAME_CITY_REGEX, { message: 'Only letters and spaces allowed' })
  .max(50, { message: 'Max 50 characters' });

const dateOfBirthSchema = z
  .string()
  .min(1, { message: 'Date of birth is required' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  .refine(
    (date) => {
      const year = Number.parseInt(date.slice(0, 4), 10);
      const currentYear = new Date().getFullYear();
      return year <= currentYear - 18;
    },
    { message: 'You must be at least 18 years old' }
  )
  .refine(
    (date) => {
      const year = Number.parseInt(date.slice(0, 4), 10);
      return year >= 1900;
    },
    { message: 'Date of birth year seems incorrect' }
  );

const streetNameSchema = z
  .string()
  .min(1, { message: 'Street name is required' })
  .regex(NAME_CITY_REGEX, { message: 'Only letters and single spaces allowed' })
  .max(100, { message: 'Street name must be less than 100 characters' });

const citySchema = z
  .string()
  .min(1, { message: 'City is required' })
  .regex(NAME_CITY_REGEX, { message: 'Only letters and spaces allowed' })
  .max(50, { message: 'Max 50 characters' });

const postalCodeSchema = z
  .string()
  .min(1, { message: 'Postal code is required' })
  // допускаем символы A-Z / 0-9 / «-» и максимум ОДИН пробел
  .regex(/^[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)?$/, {
    message:
      'Use digits, Latin letters and “-”. Only one internal space allowed',
  })
  // без пробелов по краям
  .refine((v) => v.trim() === v, {
    message: 'Postal code must not start or end with a space',
  });

const countrySchema = z
  .string()
  .min(1, { message: 'Country is required' })
  .regex(/^[A-Z]{2}$/, {
    message: 'Country must be a 2-letter ISO code (e.g., US, DE)',
  });

const houseNumberSchema = z
  .string()
  .min(1, { message: 'House number is required' })
  .max(10, { message: 'House number must be ≤ 10 chars' })
  .refine((v) => v.trim() === v, {
    message: 'No leading or trailing spaces',
  });

const apartmentSchema = z
  .string()
  .max(10, { message: 'Apartment must be ≤ 10 chars' })
  .refine((v) => v.trim() === v, {
    message: 'No leading or trailing spaces',
  })
  .optional();

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const FALLBACK_POSTAL_RE = /^(?=.{3,10}$)[A-Za-z0-9-]+(?: [A-Za-z0-9-]+)?$/;

const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    dateOfBirth: dateOfBirthSchema,
    streetName: streetNameSchema,
    houseNumber: houseNumberSchema,
    apartment: apartmentSchema,
    city: citySchema,
    postalCode: postalCodeSchema, // базовая проверка (символы + пробелы)
    country: countrySchema,

    // --- billing (все optional) ---
    billingStreetName: streetNameSchema.optional(),
    billingHouseNumber: houseNumberSchema.optional(),
    billingApartment: apartmentSchema.optional(),
    billingCity: citySchema.optional(),
    billingPostalCode: postalCodeSchema.optional(),
    billingCountry: countrySchema.optional(),
  })
  .superRefine((data, context) => {
    // --- shipping ---
    const shippingPattern =
      POSTAL_CODE_PATTERNS[data.country] ?? FALLBACK_POSTAL_RE;

    if (!shippingPattern.test(data.postalCode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: 'Invalid postal code for selected country',
      });
    }

    // --- billing (если страна указана) ---
    if (data.billingPostalCode) {
      const cc = data.billingCountry || data.country;
      const billingPattern = POSTAL_CODE_PATTERNS[cc] ?? FALLBACK_POSTAL_RE;

      if (!billingPattern.test(data.billingPostalCode)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['billingPostalCode'],
          message: 'Invalid billing postal code for selected country',
        });
      }
    }
  });

type ValidationResult = {
  success: boolean;
  errors: Record<string, string>;
};
interface RegistrationValidationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  streetName: string;
  houseNumber: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  isBillingSameAsShipping?: boolean;
  billingStreetName?: string;
  billingHouseNumber?: string;
  billingApartment?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  defaultShippingAddress?: boolean;
  defaultBillingAddress?: boolean;
}

const inputParameters = [
  'text-3xl',
  'placeholder:text-sm',
  'input-field',
  'w-full',
  'px-3',
  'py-2',
  'border-b-1',
  'border-gray-400',
  'focus:outline-none',
  'focus:ring-none',
  'focus:border-b-10',
];

// --- отслеживаем, какие поля уже тронуты ---
// const dirty: Record<string, boolean> = {};

function touch(field: string): void {
  dirty[field] = true;
}

function markInvalidFieldsDirty(validation: ValidationResult): void {
  for (const field of Object.keys(validation.errors)) {
    dirty[field] = true; // теперь updateFieldErrors будет их подсвечивать
  }
}

function validateLoginForm(email: string, password: string): ValidationResult {
  try {
    loginFormSchema.parse({ email, password });
    return { success: true, errors: {} };
  } catch (error) {
    const formattedErrors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      for (const error_ of error.errors) {
        const field = error_.path[0] as string;
        formattedErrors[field] = error_.message;
      }
    }
    return { success: false, errors: formattedErrors };
  }
}

function validateRegisterForm(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  streetName: string,
  houseNumber: string,
  apartment: string,
  city: string,
  postalCode: string,

  country: string,
  billingAddress?: {
    billingStreetName?: string;
    billingHouseNumber?: string;
    billingApartment?: string;
    billingCity?: string;
    billingPostalCode?: string;
    billingCountry?: string;
  }
): ValidationResult {
  try {
    const dataToValidate: RegistrationValidationData = {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      streetName,
      houseNumber,
      apartment,
      city,
      postalCode,
      country,
    };

    if (billingAddress) {
      if (billingAddress.billingStreetName)
        dataToValidate.billingStreetName = billingAddress.billingStreetName;
      if (billingAddress.billingHouseNumber)
        dataToValidate.billingHouseNumber = billingAddress.billingHouseNumber;
      if (billingAddress.billingApartment)
        dataToValidate.billingApartment = billingAddress.billingApartment;
      if (billingAddress.billingCity)
        dataToValidate.billingCity = billingAddress.billingCity;
      if (billingAddress.billingPostalCode)
        dataToValidate.billingPostalCode = billingAddress.billingPostalCode;
      if (billingAddress.billingCountry)
        dataToValidate.billingCountry = billingAddress.billingCountry;
    }

    registerFormSchema.parse(dataToValidate);
    // const cc = (dataToValidate.country || '').toUpperCase();
    // const pcPattern = POSTAL_CODE_PATTERNS[cc] ?? /^[A-Za-z0-9\s-]{3,10}$/;
    if (dataToValidate.postalCode !== dataToValidate.postalCode.trim()) {
      return {
        success: false,
        errors: {
          postalCode: 'Postal code must not start or end with a space',
        },
      };
    }

    if (
      !isPostalCodeValid(
        dataToValidate.postalCode.trim(),
        dataToValidate.country
      )
    ) {
      return {
        success: false,
        errors: { postalCode: 'Invalid postal code for selected country' },
      };
    }

    if (billingAddress && billingAddress.billingPostalCode) {
      if (
        billingAddress.billingPostalCode !==
        billingAddress.billingPostalCode.trim()
      ) {
        return {
          success: false,
          errors: {
            billingPostalCode: 'Postal code must not start or end with a space',
          },
        };
      }

      if (
        !isPostalCodeValid(
          billingAddress.billingPostalCode.trim(),
          billingAddress.billingCountry ?? dataToValidate.country
        )
      ) {
        return {
          success: false,
          errors: {
            billingPostalCode:
              'Invalid billing postal code for selected country',
          },
        };
      }
    }

    return { success: true, errors: {} };
  } catch (error) {
    const formattedErrors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      for (const error_ of error.errors) {
        const field = error_.path[0] as string;
        formattedErrors[field] = error_.message;
      }
    }
    return { success: false, errors: formattedErrors };
  }
}

export function createLoginPage(container: HTMLElement): void {
  const { customer } = useCustomerStore.getState();
  if (customer) {
    getRouter().navigateTo('/');
    return;
  }

  /******************************************** */
  /******************************************** */
  /******************************************** */

  // Инициализация состояния
  const state = initializeAuthForm(container);

  // Получаем элементы из состояния
  const { title, basicFields } = state;
  // const { title, basicFields, inputs, containers, errors } = state;

  const { element: titleLogin, loginText, registerText } = title;

  const {
    pageContainer,
    formContainer,
    emailContainer,
    emailInput,
    passwordInput,
    emailError,
    passwordError,
    errorContainer,
  } = basicFields;

  const buttonContainer = createElement({
    tag: 'div',
    parent: formContainer,
    classes: ['mt-6'],
  });

  const loginButton = createButton('Login', buttonContainer, [
    'w-full',
    'bg-gray-800',
    'text-white',
    'hover:bg-gray-900',
    'py-2',
    'cursor-pointer',
    'relative',
  ]);

  // TO DO
  // loginButton.disabled = true;

  const svgSpinner = createSvgUse('#spinner', 'spinner');
  svgSpinner.classList.add('animate-spin');
  loginButton.prepend(svgSpinner);

  const registerContainer = createElement({
    tag: 'div',
    parent: pageContainer,
    classes: ['mt-4', 'text-center'],
  });

  createElement({
    tag: 'p',
    text: "Don't have an account? ",
    parent: registerContainer,
    classes: ['text-sm', 'text-gray-600'],
  });

  const registerLink = createElement({
    tag: 'a',
    text: 'Register',
    parent: registerContainer,
    classes: [
      'text-sm',
      'text-gray-900',
      'hover:text-gray-700',
      'cursor-pointer',
    ],
  });

  // let isLoginForm = true;
  // let firstNameInput: HTMLInputElement | undefined;

  let lastNameInput: HTMLInputElement | undefined;
  let dateOfBirthInput: HTMLInputElement | undefined;
  let streetNameInput: HTMLInputElement | undefined;
  let houseNumberInput: HTMLInputElement | undefined;
  let apartmentInput: HTMLInputElement | undefined;
  let cityInput: HTMLInputElement | undefined;
  let postalCodeInput: HTMLInputElement | undefined;
  let countryInput: FilterableDropdown | undefined;
  let billingAddressSameAsShippingCheckbox: HTMLInputElement | undefined;
  let billingAddressSectionContainer: HTMLElement | undefined;
  let billingStreetNameInput: HTMLInputElement | undefined;
  let billingHouseNumberInput: HTMLInputElement | undefined;
  let billingApartmentInput: HTMLInputElement | undefined;
  let billingCityInput: HTMLInputElement | undefined;
  let billingPostalCodeInput: HTMLInputElement | undefined;
  let billingCountryInput: FilterableDropdown | undefined;

  let firstNameError: HTMLElement | undefined;
  let lastNameError: HTMLElement | undefined;
  let dateOfBirthError: HTMLElement | undefined;
  let streetNameError: HTMLElement | undefined;
  let houseNumberError: HTMLElement | undefined;
  let apartmentError: HTMLElement | undefined;
  let cityError: HTMLElement | undefined;
  let postalCodeError: HTMLElement | undefined;
  let countryError: HTMLElement | undefined;
  let countryContainerElement: HTMLDivElement | undefined;
  let shippingAddressSectionContainer: HTMLElement | undefined;

  let billingStreetNameError: HTMLElement | undefined;
  let billingHouseNumberError: HTMLElement | undefined;
  let billingApartmentError: HTMLElement | undefined;
  let billingCityError: HTMLElement | undefined;
  let billingPostalCodeError: HTMLElement | undefined;
  let billingCountryError: HTMLElement | undefined;
  let billingCountryContainerElement: HTMLDivElement | undefined;

  function clearErrorMessagesAndInputs(): void {
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');
    errorContainer.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';

    for (const error of Object.values(state.errors)) {
      error?.classList.add('hidden');
    }

    for (const input of Object.values(state.inputs)) {
      if (!input) continue;
      if (input instanceof HTMLInputElement) {
        input.value = '';
      } else if (input instanceof FilterableDropdown) {
        input.setSelectedValue(undefined);
      }
    }

    for (const key of Object.keys(dirty)) {
      dirty[key] = false;
    }
  }

  function toggleForm(): void {
    const { isLoginForm } = state;
    state.isLoginForm = !isLoginForm;

    const { firstName: firstNameInput } = state.inputs;

    for (const k of Object.keys(dirty)) {
      dirty[k] = false;
    }

    clearErrorMessagesAndInputs();

    titleLogin.textContent = state.isLoginForm ? loginText : registerText;

    loginButton.textContent = state.isLoginForm ? loginText : registerText;
    loginButton.prepend(svgSpinner);

    registerLink.textContent = state.isLoginForm ? registerText : loginText;

    if (state.isLoginForm) {
      if (firstNameInput?.parentElement) {
        firstNameInput?.parentElement?.remove();
        lastNameInput?.parentElement?.remove();
        dateOfBirthInput?.parentElement?.remove();

        shippingAddressSectionContainer?.remove();
        shippingAddressSectionContainer = undefined;
        billingAddressSameAsShippingCheckbox?.parentElement?.remove();
        billingAddressSameAsShippingCheckbox = undefined;
        billingAddressSectionContainer?.remove();
        billingAddressSectionContainer = undefined;

        state.inputs.firstName = undefined;
        lastNameInput = undefined;
        dateOfBirthInput = undefined;
        streetNameInput = undefined;
        houseNumberInput = undefined;
        apartmentInput = undefined;
        cityInput = undefined;
        postalCodeInput = undefined;
        countryInput = undefined;
        countryContainerElement = undefined;
        billingStreetNameInput = undefined;
        billingHouseNumberInput = undefined;
        billingApartmentInput = undefined;
        billingCityInput = undefined;
        billingPostalCodeInput = undefined;
        billingCountryInput = undefined;
        billingCountryContainerElement = undefined;

        firstNameError = undefined;
        lastNameError = undefined;
        dateOfBirthError = undefined;
        streetNameError = undefined;
        houseNumberError = undefined;
        apartmentError = undefined;
        cityError = undefined;
        postalCodeError = undefined;
        countryError = undefined;
        billingStreetNameError = undefined;
        billingHouseNumberError = undefined;
        billingApartmentError = undefined;
        billingCityError = undefined;
        billingPostalCodeError = undefined;
        billingCountryError = undefined;

        titleLogin.classList.add('before:w-20');
        titleLogin.classList.remove('before:w-29');

        titleLogin.classList.add('reset-animation');
        void titleLogin.offsetWidth;
        titleLogin.classList.remove('reset-animation');
      }
    } else {
      if (!firstNameInput) {
        const firstNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        // emailContainer.before(firstNameContainer); // Will be reordered
        titleLogin.classList.add('before:w-29');
        titleLogin.classList.remove('before:w-20', 'login-name::before');
        titleLogin.classList.add('reset-animation');
        void titleLogin.offsetWidth;
        titleLogin.classList.remove('reset-animation');
        createElement({
          tag: 'label',
          text: 'First Name',
          parent: firstNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'firstName' },
        });
        state.inputs.firstName = createElement({
          tag: 'input',
          parent: firstNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'firstName',
            placeholder: 'Enter your first name',
          },
        }) as HTMLInputElement;
        firstNameError = createElement({
          tag: 'p',
          parent: firstNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const lastNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        // emailContainer.before(lastNameContainer); // Will be reordered
        createElement({
          tag: 'label',
          text: 'Last Name',
          parent: lastNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'lastName' },
        });
        lastNameInput = createElement({
          tag: 'input',
          parent: lastNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'lastName',
            placeholder: 'Enter your last name',
          },
        }) as HTMLInputElement;
        lastNameError = createElement({
          tag: 'p',
          parent: lastNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const dateOfBirthContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        // emailContainer.before(dateOfBirthContainer); // Will be reordered

        // firstName, lastName, dateOfBirth, THEN email, password
        emailContainer.before(dateOfBirthContainer);
        dateOfBirthContainer.before(lastNameContainer);
        lastNameContainer.before(firstNameContainer);

        createElement({
          tag: 'label',
          text: 'Date of Birth',
          parent: dateOfBirthContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'dateOfBirth' },
        });
        dateOfBirthInput = createElement({
          tag: 'input',
          parent: dateOfBirthContainer,
          classes: inputParameters,
          attributes: {
            type: 'date',
            id: 'dateOfBirth',
            placeholder: 'YYYY-MM-DD',
          },
        }) as HTMLInputElement;
        dateOfBirthError = createElement({
          tag: 'p',
          parent: dateOfBirthContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // Shipping Address Section
        shippingAddressSectionContainer = createElement({
          tag: 'div',
          classes: ['space-y-4', 'address-section', 'mt-6'],
        });
        buttonContainer.before(shippingAddressSectionContainer);

        createElement({
          tag: 'h2',
          text: 'Address',
          parent: shippingAddressSectionContainer,
          classes: [
            'address-title',
            'font-bold',
            'text-lg',
            'mb-3',
            'text-gray-800',
          ],
        });

        // shippingAddressSubheadingElement was unused, so its creation is removed!!!!
        // createElement({
        //   tag: 'h2',
        //   text: 'Shipping Address',
        //   parent: shippingAddressSectionContainer,
        //   classes: ['text-lg', 'font-semibold', 'text-gray-800', 'mb-3'],
        // });

        const streetNameContainer = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Street Name',
          parent: streetNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'streetName' },
        });
        streetNameInput = createElement({
          tag: 'input',
          parent: streetNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'streetName',
            placeholder: 'Enter street name',
          },
        }) as HTMLInputElement;
        streetNameError = createElement({
          tag: 'p',
          parent: streetNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const houseNumberContainer = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'House Number',
          parent: houseNumberContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'houseNumber' },
        });
        houseNumberInput = createElement({
          tag: 'input',
          parent: houseNumberContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'houseNumber',
            placeholder: 'e.g., 123A',
          },
        }) as HTMLInputElement;
        houseNumberError = createElement({
          tag: 'p',
          parent: houseNumberContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const apartmentContainer = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Apartment (Optional)',
          parent: apartmentContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'apartment' },
        });
        apartmentInput = createElement({
          tag: 'input',
          parent: apartmentContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'apartment',
            placeholder: 'e.g., Apt 4B',
          },
        }) as HTMLInputElement;
        apartmentError = createElement({
          tag: 'p',
          parent: apartmentContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const cityContainer = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'City',
          parent: cityContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'city' },
        });
        cityInput = createElement({
          tag: 'input',
          parent: cityContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'city',
            placeholder: 'Enter your city',
          },
        }) as HTMLInputElement;
        cityError = createElement({
          tag: 'p',
          parent: cityContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const postalCodeContainer = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Postal Code',
          parent: postalCodeContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'postalCode' },
        });
        postalCodeInput = createElement({
          tag: 'input',
          parent: postalCodeContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'postalCode',
            placeholder: 'Enter your postal code',
          },
        }) as HTMLInputElement;
        postalCodeError = createElement({
          tag: 'p',
          parent: postalCodeContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // Country - Corrected Section
        countryContainerElement = createElement({
          tag: 'div',
          parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        }) as HTMLDivElement;
        createElement({
          tag: 'label',
          text: 'Country',
          parent: countryContainerElement,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'country-dropdown' },
        });
        countryInput = new FilterableDropdown(COUNTRIES, (selectedCountry) => {
          if (countryError && selectedCountry) {
            countryError.classList.add('hidden');
            countryError.textContent = '';
          }
        });

        const dropdownElement = countryInput.getElement();
        if (countryContainerElement) {
          countryContainerElement.append(dropdownElement);
        }
        countryError = createElement({
          tag: 'p',
          parent: countryContainerElement,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // "Billing Address is same" Checkbox
        const checkboxContainer = createElement({
          tag: 'div',
          parent: formContainer,
          classes: ['mb-4', 'flex', 'items-center'],
        });
        shippingAddressSectionContainer.after(checkboxContainer);

        billingAddressSameAsShippingCheckbox = createElement({
          tag: 'input',
          parent: checkboxContainer,
          classes: ['mr-2'],
          attributes: {
            type: 'checkbox',
            id: 'billingSameAsShipping',
            checked: 'true',
          },
        }) as HTMLInputElement;

        createElement({
          tag: 'label',
          text: 'Billing Address is same',
          parent: checkboxContainer,
          classes: ['text-sm', 'text-gray-700'],
          attributes: { for: 'billingSameAsShipping' },
        });

        // Billing Address Section
        billingAddressSectionContainer = createElement({
          tag: 'div',
          classes: ['space-y-4', 'address-section', 'mt-6', 'hidden'], // Initially hidden
        });
        buttonContainer.before(billingAddressSectionContainer); // before the register button

        createElement({
          tag: 'h2',
          text: 'Billing address',
          parent: billingAddressSectionContainer,
          classes: [
            'address-title',
            'font-bold',
            'text-lg',
            'mb-3',
            'text-gray-800',
          ],
        });

        const billingStreetNameContainer = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Street Name',
          parent: billingStreetNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingStreetName' },
        });
        billingStreetNameInput = createElement({
          tag: 'input',
          parent: billingStreetNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingStreetName',
            placeholder: 'Enter street name',
          },
        }) as HTMLInputElement;
        billingStreetNameError = createElement({
          tag: 'p',
          parent: billingStreetNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingHouseNumberContainer = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'House Number',
          parent: billingHouseNumberContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingHouseNumber' },
        });
        billingHouseNumberInput = createElement({
          tag: 'input',
          parent: billingHouseNumberContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingHouseNumber',
            placeholder: 'e.g., 123A',
          },
        }) as HTMLInputElement;
        billingHouseNumberError = createElement({
          tag: 'p',
          parent: billingHouseNumberContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingApartmentContainer = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Apartment (Optional)',
          parent: billingApartmentContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingApartment' },
        });
        billingApartmentInput = createElement({
          tag: 'input',
          parent: billingApartmentContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingApartment',
            placeholder: 'e.g., Apt 4B',
          },
        }) as HTMLInputElement;
        billingApartmentError = createElement({
          tag: 'p',
          parent: billingApartmentContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingCityContainer = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'City',
          parent: billingCityContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingCity' },
        });
        billingCityInput = createElement({
          tag: 'input',
          parent: billingCityContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingCity',
            placeholder: 'Enter your city',
          },
        }) as HTMLInputElement;
        billingCityError = createElement({
          tag: 'p',
          parent: billingCityContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingPostalCodeContainer = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Postal Code',
          parent: billingPostalCodeContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingPostalCode' },
        });
        billingPostalCodeInput = createElement({
          tag: 'input',
          parent: billingPostalCodeContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingPostalCode',
            placeholder: 'Enter your postal code',
          },
        }) as HTMLInputElement;
        billingPostalCodeError = createElement({
          tag: 'p',
          parent: billingPostalCodeContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        billingCountryContainerElement = createElement({
          tag: 'div',
          parent: billingAddressSectionContainer,
          classes: ['mb-4'],
        }) as HTMLDivElement;
        createElement({
          tag: 'label',
          text: 'Country',
          parent: billingCountryContainerElement,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingCountry-dropdown' },
        });
        billingCountryInput = new FilterableDropdown(
          COUNTRIES,
          (selectedCountry) => {
            if (billingCountryError && selectedCountry) {
              billingCountryError.classList.add('hidden');
              billingCountryError.textContent = '';
            }
            validateForm();
          }
        );
        const billingDropdownElement = billingCountryInput.getElement();
        if (billingCountryContainerElement) {
          billingCountryContainerElement.append(billingDropdownElement);
        }
        billingCountryError = createElement({
          tag: 'p',
          parent: billingCountryContainerElement,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        billingAddressSameAsShippingCheckbox.addEventListener('change', () => {
          if (billingAddressSectionContainer) {
            billingAddressSectionContainer.classList.toggle(
              'hidden',
              billingAddressSameAsShippingCheckbox?.checked
            );
          }
          validateForm(); // Re-validate when checkbox state changes
        });

        // Добавляем обработчики после создания элементов
        setupValidationHandlers();
      }
      // // TO DO
      // loginButton.disabled = true;
      // validateForm();
    }

    emailInput.value = '';
    passwordInput.value = '';
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (dateOfBirthInput) dateOfBirthInput.value = '';
    if (streetNameInput) streetNameInput.value = '';
    if (houseNumberInput) houseNumberInput.value = '';
    if (apartmentInput) apartmentInput.value = '';
    if (cityInput) cityInput.value = '';
    if (postalCodeInput) postalCodeInput.value = '';
    // if (countryInput) countryInput.value = '';
    if (billingAddressSameAsShippingCheckbox)
      billingAddressSameAsShippingCheckbox.checked = true;
    if (billingAddressSectionContainer)
      billingAddressSectionContainer.classList.add('hidden');
    if (billingStreetNameInput) billingStreetNameInput.value = '';
    if (billingHouseNumberInput) billingHouseNumberInput.value = '';
    if (billingApartmentInput) billingApartmentInput.value = '';
    if (billingCityInput) billingCityInput.value = '';
    if (billingPostalCodeInput) billingPostalCodeInput.value = '';
    if (billingCountryInput) billingCountryInput.setSelectedValue(undefined);

    errorContainer.classList.add('hidden');
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');
    if (firstNameError) firstNameError.classList.add('hidden');
    if (lastNameError) lastNameError.classList.add('hidden');
    if (dateOfBirthError) dateOfBirthError.classList.add('hidden');
    if (streetNameError) streetNameError.classList.add('hidden');
    if (houseNumberError) houseNumberError.classList.add('hidden');
    if (apartmentError) apartmentError.classList.add('hidden');
    if (cityError) cityError.classList.add('hidden');
    if (postalCodeError) postalCodeError.classList.add('hidden');
    if (countryError) countryError.classList.add('hidden');

    if (billingStreetNameError) billingStreetNameError.classList.add('hidden');
    if (billingHouseNumberError)
      billingHouseNumberError.classList.add('hidden');
    if (billingApartmentError) billingApartmentError.classList.add('hidden');
    if (billingCityError) billingCityError.classList.add('hidden');
    if (billingPostalCodeError) billingPostalCodeError.classList.add('hidden');
    if (billingCountryError) billingCountryError.classList.add('hidden');
  }

  // registerLink.addEventListener('click', toggleForm);

  // Функция для настройки обработчиков (теряются про тогле)
  function setupValidationHandlers() {
    const { firstName: firstNameInput } = state.inputs;
    // Удаляем старые обработчики, если они есть
    emailInput.removeEventListener('input', validateForm);
    passwordInput.removeEventListener('input', validateForm);
    if (firstNameInput) {
      firstNameInput.removeEventListener('input', validateForm);
    }
    if (lastNameInput) {
      lastNameInput.removeEventListener('input', validateForm);
    }
    if (dateOfBirthInput) {
      dateOfBirthInput.removeEventListener('input', validateForm);
    }
    if (streetNameInput) {
      streetNameInput.removeEventListener('input', validateForm);
    }
    if (houseNumberInput) {
      houseNumberInput.removeEventListener('input', validateForm);
    }
    if (apartmentInput) {
      apartmentInput.removeEventListener('input', validateForm);
    }
    if (cityInput) {
      cityInput.removeEventListener('input', validateForm);
    }
    if (postalCodeInput) {
      postalCodeInput.removeEventListener('input', validateForm);
    }
    // if (countryInput) {
    //   countryInput.removeEventListener('input', validateForm);
    // }

    if (billingStreetNameInput) {
      billingStreetNameInput.removeEventListener('input', validateForm);
    }
    if (billingHouseNumberInput) {
      billingHouseNumberInput.removeEventListener('input', validateForm);
    }
    if (billingApartmentInput) {
      billingApartmentInput.removeEventListener('input', validateForm);
    }
    if (billingCityInput) {
      billingCityInput.removeEventListener('input', validateForm);
    }
    if (billingPostalCodeInput) {
      billingPostalCodeInput.removeEventListener('input', validateForm);
    }
    // if (billingCountryInput) {
    //   billingCountryInput.removeEventListener('input', validateForm);
    // }

    // Добавляем новые обработчики
    emailInput.addEventListener('input', () => {
      touch('email');
      validateForm();
    });
    passwordInput.addEventListener('input', () => {
      touch('password');
      validateForm();
    });

    if (firstNameInput) {
      firstNameInput.addEventListener('input', () => {
        touch('firstName');
        validateForm();
      });
    }
    if (lastNameInput) {
      lastNameInput.addEventListener('input', () => {
        touch('lastName');
        validateForm();
      });
    }
    if (dateOfBirthInput) {
      dateOfBirthInput.addEventListener('input', () => {
        touch('dateOfBirth');
        validateForm();
      });
    }
    if (streetNameInput) {
      streetNameInput.addEventListener('input', () => {
        touch('streetName');
        validateForm();
      });
    }
    if (houseNumberInput) {
      houseNumberInput.addEventListener('input', () => {
        touch('houseNumber');
        validateForm();
      });
    }
    if (apartmentInput) {
      apartmentInput.addEventListener('input', () => {
        touch('apartment');
        validateForm();
      });
    }
    if (cityInput) {
      cityInput.addEventListener('input', () => {
        touch('city');
        validateForm();
      });
    }
    if (postalCodeInput) {
      postalCodeInput.addEventListener('input', () => {
        touch('postalCode');
        validateForm();
      });
    }
    // if (countryInput) {
    //   countryInput.addEventListener('input', validateForm);
    // }

    if (billingStreetNameInput) {
      billingStreetNameInput.addEventListener('input', () => {
        touch('billingStreetName');
        validateForm();
      });
    }
    if (billingHouseNumberInput) {
      billingHouseNumberInput.addEventListener('input', () => {
        touch('billingHouseNumber');
        validateForm();
      });
    }
    if (billingApartmentInput) {
      billingApartmentInput.addEventListener('input', () => {
        touch('billingApartment');
        validateForm();
      });
    }
    if (billingCityInput) {
      billingCityInput.addEventListener('input', () => {
        touch('billingCity');
        validateForm();
      });
    }
    if (billingPostalCodeInput) {
      billingPostalCodeInput.addEventListener('input', () => {
        touch('billingPostalCode');
        validateForm();
      });
    }
    // if (billingCountryInput) {
    //   billingCountryInput.addEventListener('input', validateForm);
    // }
  }

  function showFieldError(field: HTMLElement, message: string): void {
    field.textContent = message;
    field.classList.remove('hidden');
  }

  function hideFieldError(field: HTMLElement): void {
    field.classList.add('hidden');
  }

  function setInputBorder(
    element: HTMLElement | undefined,
    error: boolean
  ): void {
    if (!element) return;
    if (error) {
      element.classList.add('border-b-red-500');
      element.classList.remove('border-gray-400');
    } else {
      element.classList.remove('border-b-red-500');
      element.classList.add('border-gray-400');
    }
  }

  function showFormError(message: string): void {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }

  function hideFormError(): void {
    errorContainer.textContent = '';
    errorContainer.classList.add('hidden');
  }

  function validateForm() {
    const { isLoginForm } = state;
    const { firstName: firstNameInput } = state.inputs;
    const email = emailInput.value;
    const password = passwordInput.value;

    console.log('начал что-то вводить');

    if (isLoginForm) {
      const validation = validateLoginForm(email, password);
      updateFieldErrors(validation);
    } else {
      const firstName = firstNameInput?.value || '';
      const lastName = lastNameInput?.value || '';
      const dateOfBirth = dateOfBirthInput?.value || '';
      const streetName = streetNameInput?.value || '';
      const houseNumber = houseNumberInput?.value || '';
      const apartment = apartmentInput?.value || '';
      const city = cityInput?.value || '';
      const postalCode = postalCodeInput?.value || '';
      // const country = countryInput?.value || '';
      const country = countryInput?.getSelectedValue() || '';

      let billingStreetName = '';
      let billingHouseNumber = '';
      let billingApartment = '';
      let billingCity = '';
      let billingPostalCode = '';
      let billingCountry = '';

      if (
        billingAddressSameAsShippingCheckbox &&
        !billingAddressSameAsShippingCheckbox.checked
      ) {
        billingStreetName = billingStreetNameInput?.value || '';
        billingHouseNumber = billingHouseNumberInput?.value || '';
        billingApartment = billingApartmentInput?.value || '';
        billingCity = billingCityInput?.value || '';
        billingPostalCode = billingPostalCodeInput?.value || '';
        billingCountry = billingCountryInput?.getSelectedValue() || '';
      }

      let billingDetails;
      if (
        billingAddressSameAsShippingCheckbox &&
        !billingAddressSameAsShippingCheckbox.checked
      ) {
        billingDetails = {
          billingStreetName,
          billingHouseNumber,
          billingApartment,
          billingCity,
          billingPostalCode,
          billingCountry,
        };
      }

      const validation = validateRegisterForm(
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        streetName,
        houseNumber,
        apartment,
        city,
        postalCode,
        country,
        billingDetails
      );
      updateFieldErrors(validation);
    }
  }

  // Функция для обновления ошибок полей
  function updateFieldErrors(validation: ValidationResult): void {
    const { isLoginForm } = state;
    const { firstName: firstNameInput } = state.inputs;
    // Хелпер для единообразия
    const handle = (
      fieldName: string,
      errorElement: HTMLElement,
      inputElement: HTMLElement | undefined
    ) => {
      if (!dirty[fieldName]) return; // поле ещё не трогали – ничего не делаем

      const message = validation.errors[fieldName];
      if (message) {
        showFieldError(errorElement, message);
        setInputBorder(inputElement, true);
      } else {
        hideFieldError(errorElement);
        setInputBorder(inputElement, false);
      }
    };

    handle('email', emailError, emailInput);
    handle('password', passwordError, passwordInput);

    if (!isLoginForm) {
      handle('firstName', firstNameError!, firstNameInput);
      handle('lastName', lastNameError!, lastNameInput);
      handle('dateOfBirth', dateOfBirthError!, dateOfBirthInput);
      handle('streetName', streetNameError!, streetNameInput);
      handle('houseNumber', houseNumberError!, houseNumberInput);
      handle('apartment', apartmentError!, apartmentInput);
      handle('city', cityError!, cityInput);
      handle('postalCode', postalCodeError!, postalCodeInput);
      handle('country', countryError!, countryContainerElement);

      const billingVisible =
        billingAddressSameAsShippingCheckbox &&
        !billingAddressSameAsShippingCheckbox.checked;

      if (billingVisible) {
        handle(
          'billingStreetName',
          billingStreetNameError!,
          billingStreetNameInput
        );
        handle(
          'billingHouseNumber',
          billingHouseNumberError!,
          billingHouseNumberInput
        );
        handle(
          'billingApartment',
          billingApartmentError!,
          billingApartmentInput
        );
        handle('billingCity', billingCityError!, billingCityInput);
        handle(
          'billingPostalCode',
          billingPostalCodeError!,
          billingPostalCodeInput
        );
        handle(
          'billingCountry',
          billingCountryError!,
          billingCountryContainerElement
        );
      }
    }
  }

  loginButton.addEventListener('click', async () => {
    hideFormError();
    const { addNotification } = uiStore.getState();
    // const { setLoading, addNotification } = uiStore.getState();

    const { isLoginForm } = state;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isLoginForm) {
      const validation = validateLoginForm(email, password);

      if (!validation.success) {
        if (validation.errors.email)
          showFieldError(emailError, validation.errors.email);
        else hideFieldError(emailError);
        if (validation.errors.password)
          showFieldError(passwordError, validation.errors.password);
        else hideFieldError(passwordError);
        addNotification(
          'warning',
          'Please fix the form errors before submitting.'
        );
        return;
      }
      hideFieldError(emailError);
      hideFieldError(passwordError);

      // setLoading(true);
      svgSpinner.classList.add('spinner_active');
      const modalContainer = createModalContainer();

      try {
        const success = await AuthService.login(email, password);
        if (success) {
          addNotification('success', 'Successfully logged in!');
          triggerHeaderUpdate();
          getRouter().navigateTo('/');
        } else {
          showFormError('Invalid email or password. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        showFormError('Login failed. Please try again.');
      } finally {
        // setLoading(false);
        svgSpinner.classList.remove('spinner_active');
        modalContainer.remove();
      }
    } else {
      const shippingAddressData = {
        streetName: streetNameInput?.value || '',
        houseNumber: houseNumberInput?.value || '',
        apartment: apartmentInput?.value || '',
        city: cityInput?.value || '',
        postalCode: postalCodeInput?.value || '',
        country: countryInput?.getSelectedValue() || '',
      };

      let billingAddressData: typeof shippingAddressData | undefined;
      let billingDetailsForValidation:
        | {
            billingStreetName?: string;
            billingHouseNumber?: string;
            billingApartment?: string;
            billingCity?: string;
            billingPostalCode?: string;
            billingCountry?: string;
          }
        | undefined;

      const isBillingSame = billingAddressSameAsShippingCheckbox?.checked;

      if (!isBillingSame) {
        billingAddressData = {
          streetName: billingStreetNameInput?.value || '',
          houseNumber: billingHouseNumberInput?.value || '',
          apartment: billingApartmentInput?.value || '',
          city: billingCityInput?.value || '',
          postalCode: billingPostalCodeInput?.value || '',
          country: billingCountryInput?.getSelectedValue() || '',
        };
        billingDetailsForValidation = {
          billingStreetName: billingAddressData.streetName,
          billingHouseNumber: billingAddressData.houseNumber,
          billingApartment: billingAddressData.apartment,
          billingCity: billingAddressData.city,
          billingPostalCode: billingAddressData.postalCode,
          billingCountry: billingAddressData.country,
        };
      }

      const validation = validateRegisterForm(
        emailInput.value,
        passwordInput.value,
        state.inputs.firstName?.value || '',
        // firstNameInput?.value || '',
        lastNameInput?.value || '',
        dateOfBirthInput?.value || '',
        shippingAddressData.streetName,
        shippingAddressData.houseNumber,
        shippingAddressData.apartment,
        shippingAddressData.city,
        shippingAddressData.postalCode,
        shippingAddressData.country,
        billingDetailsForValidation
      );

      updateFieldErrors(validation); // Update errors for all fields first

      if (!validation.success) {
        markInvalidFieldsDirty(validation);
        updateFieldErrors(validation);
        addNotification(
          'warning',
          'Please fix the form errors before submitting.'
        );
        return;
      }

      // Clear all errors if validation passes
      hideFieldError(emailError);
      hideFieldError(passwordError);
      if (firstNameError) hideFieldError(firstNameError);
      if (lastNameError) hideFieldError(lastNameError);
      if (dateOfBirthError) hideFieldError(dateOfBirthError);
      if (streetNameError) hideFieldError(streetNameError);
      if (houseNumberError) hideFieldError(houseNumberError);
      if (apartmentError) hideFieldError(apartmentError);
      if (cityError) hideFieldError(cityError);
      if (postalCodeError) hideFieldError(postalCodeError);
      if (countryError) hideFieldError(countryError);
      if (billingStreetNameError) hideFieldError(billingStreetNameError);
      if (billingHouseNumberError) hideFieldError(billingHouseNumberError);
      if (billingApartmentError) hideFieldError(billingApartmentError);
      if (billingCityError) hideFieldError(billingCityError);
      if (billingPostalCodeError) hideFieldError(billingPostalCodeError);
      if (billingCountryError) hideFieldError(billingCountryError);

      svgSpinner.classList.add('spinner_active');
      const modalContainer = createModalContainer();

      const addresses = [
        {
          streetName: shippingAddressData.streetName,
          streetNumber: shippingAddressData.houseNumber,
          apartment: shippingAddressData.apartment,
          city: shippingAddressData.city,
          postalCode: shippingAddressData.postalCode,
          country: shippingAddressData.country,
        },
      ];

      if (isBillingSame) {
        // If billing is same, duplicate shipping address for billing
        addresses.push({ ...addresses[0] });
      } else if (billingAddressData) {
        // Otherwise, use the separate billing address
        addresses.push({
          streetName: billingAddressData.streetName,
          streetNumber: billingAddressData.houseNumber,
          apartment: billingAddressData.apartment,
          city: billingAddressData.city,
          postalCode: billingAddressData.postalCode,
          country: billingAddressData.country,
        });
      }

      try {
        const success = await AuthService.register(
          emailInput.value,
          passwordInput.value,
          state.inputs.firstName?.value || '',
          // firstNameInput?.value || '',
          lastNameInput?.value || '',
          dateOfBirthInput?.value || '',
          addresses
        );
        if (success) {
          addNotification('success', 'Successfully registered!');
          triggerHeaderUpdate(); // Update header to reflect logged-in state
          getRouter().navigateTo('/main'); // Redirect to main page
        } else {
          showFormError(
            'Registration failed. The email might already be in use or another error occurred.'
          );
        }
      } catch (error) {
        console.error('Registration error:', error);
        showFormError('Registration failed. Please try again.');
      } finally {
        // setLoading(false);
        svgSpinner.classList.remove('spinner_active');
        modalContainer.remove();
      }
    }
  });

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      loginButton.click();
    }
  };

  emailInput.addEventListener('keypress', handleEnterKey);
  passwordInput.addEventListener('keypress', handleEnterKey);

  state.isLoginForm = false;
  toggleForm(); // Initialize as login form
  registerLink.addEventListener('click', toggleForm);
}
