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
import {
  getInputValue,
  getDropdownValue,
  showFieldError,
  hideFieldError,
  setInputBorder,
} from './auth-form-utilites';
import {
  REGISTRATION_FIELDS,
  BILLING_FIELDS,
  BASIC_FIELDS,
} from './auth-form-config';

// import {
//   createInputField,
//   createPageContainer,
//   createPasswordField,
// } from './auth-form-elements';
import { AuthFormState, initializeAuthForm, dirty } from './auth-form-state';
// import { initializeAuthForm, dirty } from './auth-form-state';

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
  .min(3, { message: 'Name is required' })
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
        if (error_.path.length > 0 && typeof error_.path[0] === 'string') {
          const field = error_.path[0];
          formattedErrors[field] = error_.message;
        }
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
        if (error_.path.length > 0 && typeof error_.path[0] === 'string') {
          const field = error_.path[0];
          formattedErrors[field] = error_.message;
        }
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

  // Инициализация состояния
  const state = initializeAuthForm(container);
  for (const key of Object.keys(state.inputs)) {
    if (!dirty[key]) dirty[key] = false;
  }

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

  function clearErrorMessagesAndInputs(): void {
    emailError?.classList.add('hidden');
    passwordError?.classList.add('hidden');
    errorContainer?.classList.add('hidden');
    emailInput && (emailInput.value = '');
    passwordInput && (passwordInput.value = '');

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

    const {
      firstName: firstNameInput,
      lastName: lastNameInput,
      dateOfBirth: dateOfBirthInput,
      streetName: streetNameInput,
      houseNumber: houseNumberInput,
      apartment: apartmentInput,
      city: cityInput,
      postalCode: postalCodeInput,
      // country: countryInput,
      billingStreetName: billingStreetNameInput,
      billingHouseNumber: billingHouseNumberInput,
      billingApartment: billingApartmentInput,
      billingCity: billingCityInput,
      billingPostalCode: billingPostalCodeInput,
      billingCountry: billingCountryInput,
      billingAddressSameAsShipping: billingAddressSameAsShippingCheckbox,
    } = state.inputs;

    const {
      shippingAddress: shippingAddressSectionContainer,
      billingAddress: billingAddressSectionContainer,
      // country: countryContainerElement,
      // billingCountry: billingCountryContainerElement,
    } = state.containers;

    const {
      firstName: firstNameError,
      lastName: lastNameError,
      dateOfBirth: dateOfBirthError,
      streetName: streetNameError,
      houseNumber: houseNumberError,
      apartment: apartmentError,
      city: cityError,
      postalCode: postalCodeError,
      country: countryError,
      billingStreetName: billingStreetNameError,
      billingHouseNumber: billingHouseNumberError,
      billingApartment: billingApartmentError,
      billingCity: billingCityError,
      billingPostalCode: billingPostalCodeError,
      billingCountry: billingCountryError,
    } = state.errors;

    // for (const k of Object.keys(dirty)) {
    //   dirty[k] = false;
    // }

    clearErrorMessagesAndInputs();

    titleLogin &&
      (titleLogin.textContent = state.isLoginForm ? loginText : registerText);

    loginButton.textContent = state.isLoginForm ? loginText : registerText;
    loginButton.prepend(svgSpinner);

    registerLink.textContent = state.isLoginForm ? registerText : loginText;

    if (state.isLoginForm) {
      if (firstNameInput?.parentElement) {
        firstNameInput?.parentElement?.remove();
        lastNameInput?.parentElement?.remove();
        dateOfBirthInput?.parentElement?.remove();

        shippingAddressSectionContainer?.remove();
        state.containers.shippingAddress = undefined;

        billingAddressSameAsShippingCheckbox?.parentElement?.remove();
        state.inputs.billingAddressSameAsShipping = undefined;

        billingAddressSectionContainer?.remove();
        state.containers.billingAddress = undefined;

        state.inputs.firstName = undefined;
        state.inputs.lastName = undefined;
        state.inputs.dateOfBirth = undefined;
        state.inputs.streetName = undefined;
        state.inputs.houseNumber = undefined;
        state.inputs.apartment = undefined;
        state.inputs.city = undefined;
        state.inputs.postalCode = undefined;
        state.inputs.country = undefined;

        state.inputs.billingStreetName = undefined;
        state.inputs.billingHouseNumber = undefined;
        state.inputs.billingApartment = undefined;
        state.inputs.billingCity = undefined;
        state.inputs.billingPostalCode = undefined;
        state.inputs.billingCountry = undefined;

        state.containers.country = undefined;
        state.containers.billingCountry = undefined;

        state.errors.firstName = undefined;
        state.errors.lastName = undefined;
        state.errors.dateOfBirth = undefined;
        state.errors.streetName = undefined;
        state.errors.houseNumber = undefined;
        state.errors.apartment = undefined;
        state.errors.city = undefined;
        state.errors.postalCode = undefined;
        state.errors.country = undefined;
        state.errors.billingStreetName = undefined;
        state.errors.billingHouseNumber = undefined;
        state.errors.billingApartment = undefined;
        state.errors.billingCity = undefined;
        state.errors.billingPostalCode = undefined;
        state.errors.billingCountry = undefined;

        titleLogin?.classList.add('before:w-20');
        titleLogin?.classList.remove('before:w-29');

        titleLogin?.classList.add('reset-animation');
        void titleLogin?.offsetWidth;
        titleLogin?.classList.remove('reset-animation');
      }
    } else {
      if (!firstNameInput) {
        const firstNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        // emailContainer.before(firstNameContainer); // Will be reordered
        titleLogin?.classList.add('before:w-29');
        titleLogin?.classList.remove('before:w-20', 'login-name::before');
        titleLogin?.classList.add('reset-animation');
        void titleLogin?.offsetWidth;
        titleLogin?.classList.remove('reset-animation');
        createElement({
          tag: 'label',
          text: 'First Name',
          parent: firstNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'firstName' },
        });
        const firstNameElement = createElement({
          tag: 'input',
          parent: firstNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'firstName',
            placeholder: 'Enter your first name',
          },
        });
        if (firstNameElement instanceof HTMLInputElement) {
          state.inputs.firstName = firstNameElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.firstName = createElement({
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
        const lastNameElement = createElement({
          tag: 'input',
          parent: lastNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'lastName',
            placeholder: 'Enter your last name',
          },
        });
        if (lastNameElement instanceof HTMLInputElement) {
          state.inputs.lastName = lastNameElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.lastName = createElement({
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
        emailContainer?.before(dateOfBirthContainer);
        dateOfBirthContainer.before(lastNameContainer);
        lastNameContainer.before(firstNameContainer);

        createElement({
          tag: 'label',
          text: 'Date of Birth',
          parent: dateOfBirthContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'dateOfBirth' },
        });
        const dateOfBirthElement = createElement({
          tag: 'input',
          parent: dateOfBirthContainer,
          classes: inputParameters,
          attributes: {
            type: 'date',
            id: 'dateOfBirth',
            placeholder: 'YYYY-MM-DD',
          },
        });
        if (dateOfBirthElement instanceof HTMLInputElement) {
          state.inputs.dateOfBirth = dateOfBirthElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.dateOfBirth = createElement({
          tag: 'p',
          parent: dateOfBirthContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // Shipping Address Section
        state.containers.shippingAddress = createElement({
          tag: 'div',
          classes: ['space-y-4', 'address-section', 'mt-6'],
        });
        buttonContainer.before(state.containers.shippingAddress);

        createElement({
          tag: 'h2',
          text: 'Address',
          parent: state.containers.shippingAddress,
          // parent: shippingAddressSectionContainer,
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
          parent: state.containers.shippingAddress,
          // parent: shippingAddressSectionContainer,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Street Name',
          parent: streetNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'streetName' },
        });
        const streetNameElement = createElement({
          tag: 'input',
          parent: streetNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'streetName',
            placeholder: 'Enter street name',
          },
        });
        if (streetNameElement instanceof HTMLInputElement) {
          state.inputs.streetName = streetNameElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.streetName = createElement({
          tag: 'p',
          parent: streetNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const houseNumberContainer = createElement({
          tag: 'div',
          parent: state.containers.shippingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'House Number',
          parent: houseNumberContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'houseNumber' },
        });
        const houseNumberElement = createElement({
          tag: 'input',
          parent: houseNumberContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'houseNumber',
            placeholder: 'e.g., 123A',
          },
        });
        if (houseNumberElement instanceof HTMLInputElement) {
          state.inputs.houseNumber = houseNumberElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.houseNumber = createElement({
          tag: 'p',
          parent: houseNumberContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const apartmentContainer = createElement({
          tag: 'div',
          parent: state.containers.shippingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Apartment (Optional)',
          parent: apartmentContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'apartment' },
        });
        const apartmentElement = createElement({
          tag: 'input',
          parent: apartmentContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'apartment',
            placeholder: 'e.g., Apt 4B',
          },
        });
        if (apartmentElement instanceof HTMLInputElement) {
          state.inputs.apartment = apartmentElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.apartment = createElement({
          tag: 'p',
          parent: apartmentContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const cityContainer = createElement({
          tag: 'div',
          parent: state.containers.shippingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'City',
          parent: cityContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'city' },
        });
        const cityElement = createElement({
          tag: 'input',
          parent: cityContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'city',
            placeholder: 'Enter your city',
          },
        });
        if (cityElement instanceof HTMLInputElement) {
          state.inputs.city = cityElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.city = createElement({
          tag: 'p',
          parent: cityContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const postalCodeContainer = createElement({
          tag: 'div',
          parent: state.containers.shippingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Postal Code',
          parent: postalCodeContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'postalCode' },
        });
        const postalCodeElement = createElement({
          tag: 'input',
          parent: postalCodeContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'postalCode',
            placeholder: 'Enter your postal code',
          },
        });
        if (postalCodeElement instanceof HTMLInputElement) {
          state.inputs.postalCode = postalCodeElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.postalCode = createElement({
          tag: 'p',
          parent: postalCodeContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // Country - Corrected Section
        const countryContainer = createElement({
          tag: 'div',
          parent: state.containers.shippingAddress,
          classes: ['mb-4'],
        });
        if (countryContainer instanceof HTMLDivElement) {
          state.containers.country = countryContainer;
        }
        createElement({
          tag: 'label',
          text: 'Country',
          parent: state.containers.country,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'country-dropdown' },
        });
        state.inputs.country = new FilterableDropdown(
          COUNTRIES,
          (selectedCountry) => {
            if (countryError && selectedCountry) {
              countryError.classList.add('hidden');
              countryError.textContent = '';
            }
          }
        );

        const dropdownElement = state.inputs.country.getElement();
        if (state.containers.country) {
          state.containers.country.append(dropdownElement);
        }
        state.errors.country = createElement({
          tag: 'p',
          parent: state.containers.country,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // "Billing Address is same" Checkbox
        const checkboxContainer = createElement({
          tag: 'div',
          parent: formContainer,
          classes: ['mb-4', 'flex', 'items-center'],
        });
        state.containers.shippingAddress.after(checkboxContainer);

        const billingCheckbox = createElement({
          tag: 'input',
          parent: checkboxContainer,
          classes: ['mr-2'],
          attributes: {
            type: 'checkbox',
            id: 'billingSameAsShipping',
            checked: 'true',
          },
        });
        if (billingCheckbox instanceof HTMLInputElement) {
          state.inputs.billingAddressSameAsShipping = billingCheckbox;
        }

        createElement({
          tag: 'label',
          text: 'Billing Address is same',
          parent: checkboxContainer,
          classes: ['text-sm', 'text-gray-700'],
          attributes: { for: 'billingSameAsShipping' },
        });

        // Billing Address Section
        state.containers.billingAddress = createElement({
          tag: 'div',
          classes: ['space-y-4', 'address-section', 'mt-6', 'hidden'], // Initially hidden
        });
        buttonContainer.before(state.containers.billingAddress); // before the register button
        // buttonContainer.before(billingAddressSectionContainer); // before the register button

        createElement({
          tag: 'h2',
          text: 'Billing address',
          parent: state.containers.billingAddress,
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
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Street Name',
          parent: billingStreetNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingStreetName' },
        });
        const billingStreetNameElement = createElement({
          tag: 'input',
          parent: billingStreetNameContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingStreetName',
            placeholder: 'Enter street name',
          },
        });
        if (billingStreetNameElement instanceof HTMLInputElement) {
          state.inputs.billingStreetName = billingStreetNameElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.billingStreetName = createElement({
          tag: 'p',
          parent: billingStreetNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingHouseNumberContainer = createElement({
          tag: 'div',
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'House Number',
          parent: billingHouseNumberContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingHouseNumber' },
        });
        const billingHouseNumberElement = createElement({
          tag: 'input',
          parent: billingHouseNumberContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingHouseNumber',
            placeholder: 'e.g., 123A',
          },
        });
        if (billingHouseNumberElement instanceof HTMLInputElement) {
          state.inputs.billingHouseNumber = billingHouseNumberElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.billingHouseNumber = createElement({
          tag: 'p',
          parent: billingHouseNumberContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingApartmentContainer = createElement({
          tag: 'div',
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Apartment (Optional)',
          parent: billingApartmentContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingApartment' },
        });
        const billingApartmentElement = createElement({
          tag: 'input',
          parent: billingApartmentContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingApartment',
            placeholder: 'e.g., Apt 4B',
          },
        });
        if (billingApartmentElement instanceof HTMLInputElement) {
          state.inputs.billingApartment = billingApartmentElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.billingApartment = createElement({
          tag: 'p',
          parent: billingApartmentContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingCityContainer = createElement({
          tag: 'div',
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'City',
          parent: billingCityContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingCity' },
        });
        const billingCityElement = createElement({
          tag: 'input',
          parent: billingCityContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingCity',
            placeholder: 'Enter your city',
          },
        });
        if (billingCityElement instanceof HTMLInputElement) {
          state.inputs.billingCity = billingCityElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.billingCity = createElement({
          tag: 'p',
          parent: billingCityContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingPostalCodeContainer = createElement({
          tag: 'div',
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        createElement({
          tag: 'label',
          text: 'Postal Code',
          parent: billingPostalCodeContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingPostalCode' },
        });
        const billingPostalCodeElement = createElement({
          tag: 'input',
          parent: billingPostalCodeContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'billingPostalCode',
            placeholder: 'Enter your postal code',
          },
        });
        if (billingPostalCodeElement instanceof HTMLInputElement) {
          state.inputs.billingPostalCode = billingPostalCodeElement;
        } else {
          console.error('Created element is not an HTMLInputElement');
        }
        state.errors.billingPostalCode = createElement({
          tag: 'p',
          parent: billingPostalCodeContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const billingCountryContainer = createElement({
          tag: 'div',
          parent: state.containers.billingAddress,
          classes: ['mb-4'],
        });
        if (billingCountryContainer instanceof HTMLDivElement) {
          state.containers.billingCountry = billingCountryContainer;
        }
        createElement({
          tag: 'label',
          text: 'Country',
          parent: state.containers.billingCountry,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'billingCountry-dropdown' },
        });
        state.inputs.billingCountry = new FilterableDropdown(
          COUNTRIES,
          (selectedCountry) => {
            if (billingCountryError && selectedCountry) {
              billingCountryError.classList.add('hidden');
              billingCountryError.textContent = '';
            }
            validateForm();
          }
        );
        const billingDropdownElement = state.inputs.billingCountry.getElement();
        if (state.containers.billingCountry) {
          state.containers.billingCountry.append(billingDropdownElement);
        }
        // if (billingCountryContainerElement) {
        //   billingCountryContainerElement.append(billingDropdownElement);
        // }
        state.errors.billingCountry = createElement({
          tag: 'p',
          parent: state.containers.billingCountry,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        if (state.inputs.billingAddressSameAsShipping) {
          state.inputs.billingAddressSameAsShipping.addEventListener(
            'change',
            () => {
              if (state.containers.billingAddress) {
                state.containers.billingAddress.classList.toggle(
                  'hidden',
                  state.inputs.billingAddressSameAsShipping?.checked
                );
              }
              validateForm(); // Re-validate when checkbox state changes
            }
          );
        }

        // Добавляем обработчики после создания элементов
        setupValidationHandlers();
      }
      // // TO DO
      // loginButton.disabled = true;
      // validateForm();
    }

    emailInput && (emailInput.value = '');
    passwordInput && (passwordInput.value = '');
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

    errorContainer?.classList.add('hidden');
    emailError?.classList.add('hidden');
    passwordError?.classList.add('hidden');
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

  /****************************************************************** */
  // Функция для настройки обработчиков (теряются про тогле)
  // вспомогательная функция (попросил линтер)
  const setupInputHandler = (
    input: HTMLInputElement,
    fieldName: string,
    eventType: string = 'input'
  ) => {
    input.removeEventListener(eventType, validateForm);
    input.addEventListener(eventType, () => {
      if (fieldName) touch(fieldName);
      validateForm();
    });
  };

  function setupValidationHandlers() {
    const { emailInput, passwordInput } = state.basicFields;

    // Обработка основных полей
    emailInput && setupInputHandler(emailInput, 'email');
    passwordInput && setupInputHandler(passwordInput, 'password');

    // Обработка обычных инпутов
    for (const [fieldName, input] of Object.entries(state.inputs)) {
      if (!input) continue;

      // Пропускаем специальные поля
      if (
        fieldName === 'country' ||
        fieldName === 'billingCountry' ||
        fieldName === 'billingAddressSameAsShipping'
      ) {
        continue;
      }

      if (input instanceof HTMLInputElement) {
        setupInputHandler(input, fieldName);
      }
    }

    // Обработка чекбокса
    if (state.inputs.billingAddressSameAsShipping) {
      setupInputHandler(
        state.inputs.billingAddressSameAsShipping,
        '', // Не помечаем как dirty
        'change'
      );
    }
  }

  /****************************************************************** */

  function showFormError(message: string): void {
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  function hideFormError(): void {
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.classList.add('hidden');
    }
  }

  /************************************************** */

  function validateForm(): ValidationResult {
    const { isLoginForm, basicFields, inputs } = state;
    const { emailInput, passwordInput } = basicFields;

    console.log('Запустилась validateForm');

    if (isLoginForm) {
      const validation = validateLoginForm(
        emailInput?.value ?? '',
        passwordInput?.value ?? ''
      );
      updateFieldErrors(state, validation);
      return validation;
    }

    // Для формы регистрации
    const billingDetails = inputs.billingAddressSameAsShipping?.checked
      ? undefined
      : {
          billingStreetName: getInputValue(inputs.billingStreetName),
          billingHouseNumber: getInputValue(inputs.billingHouseNumber),
          billingApartment: getInputValue(inputs.billingApartment),
          billingCity: getInputValue(inputs.billingCity),
          billingPostalCode: getInputValue(inputs.billingPostalCode),
          billingCountry: getDropdownValue(inputs.billingCountry),
        };

    const validation = validateRegisterForm(
      emailInput?.value ?? '',
      passwordInput?.value ?? '',
      getInputValue(inputs.firstName),
      getInputValue(inputs.lastName),
      getInputValue(inputs.dateOfBirth),
      getInputValue(inputs.streetName),
      getInputValue(inputs.houseNumber),
      getInputValue(inputs.apartment),
      getInputValue(inputs.city),
      getInputValue(inputs.postalCode),
      getDropdownValue(inputs.country),
      billingDetails
    );

    updateFieldErrors(state, validation);
    return validation;
  }

  function updateFieldErrors(
    state: AuthFormState,
    validation: ValidationResult
  ): void {
    const { isLoginForm, basicFields, inputs, errors, containers } = state;

    console.log('Validation errors:', validation.errors);
    console.log('Dirty fields:', dirty);
    // Хелпер для обработки ошибок
    const handleFieldError = (
      fieldName: string,
      errorElement: HTMLElement | undefined,
      inputElement: HTMLElement | undefined
    ) => {
      if (!errorElement || !inputElement) return;
      // if (!dirty[fieldName] || !errorElement || !inputElement) return;

      const message = validation.errors[fieldName];
      if (message) {
        showFieldError(errorElement, message);
        setInputBorder(inputElement, true);
      } else {
        hideFieldError(errorElement);
        setInputBorder(inputElement, false);
      }
    };

    // Обрабатываем основные поля
    handleFieldError(
      BASIC_FIELDS.email.name,
      basicFields.emailError,
      basicFields.emailInput
    );
    handleFieldError(
      BASIC_FIELDS.password.name,
      basicFields.passwordError,
      basicFields.passwordInput
    );

    if (isLoginForm) return;

    // Обрабатываем поля регистрации
    for (const field of REGISTRATION_FIELDS) {
      let fieldElement: HTMLElement | undefined;
      if (field.isContainer) {
        if (Object.keys(containers).includes(field.inputKey)) {
          const containerKey = field.inputKey;
          if (containerKey in containers) {
            fieldElement = containers[containerKey as keyof typeof containers];
          }
        }
      } else {
        const input = inputs[field.inputKey];
        if (input instanceof HTMLElement) {
          fieldElement = input;
        } else if (input instanceof FilterableDropdown) {
          fieldElement = input.getElement();
        }
      }

      if (fieldElement) {
        handleFieldError(field.name, errors[field.errorKey], fieldElement);
      }
    }

    // Обрабатываем billing поля
    if (
      inputs.billingAddressSameAsShipping &&
      !inputs.billingAddressSameAsShipping.checked
    ) {
      for (const field of BILLING_FIELDS) {
        let fieldElement: HTMLElement | undefined;
        if (field.isContainer) {
          if (field.inputKey in containers) {
            fieldElement =
              containers[field.inputKey as keyof typeof containers];
          }
        } else {
          const input = inputs[field.inputKey];
          if (input instanceof HTMLElement) {
            fieldElement = input;
          } else if (input instanceof FilterableDropdown) {
            fieldElement = input.getElement();
          }
        }

        if (fieldElement) {
          handleFieldError(field.name, errors[field.errorKey], fieldElement);
        }
      }
    }
  }

  /******************************************************************** */

  loginButton.addEventListener('click', async () => {
    hideFormError();
    const { addNotification } = uiStore.getState();
    // const { setLoading, addNotification } = uiStore.getState();

    const { isLoginForm } = state;
    const {
      streetName: streetNameInput,
      houseNumber: houseNumberInput,
      apartment: apartmentInput,
      city: cityInput,
      postalCode: postalCodeInput,
      country: countryInput,
      billingStreetName: billingStreetNameInput,
      billingHouseNumber: billingHouseNumberInput,
      billingApartment: billingApartmentInput,
      billingCity: billingCityInput,
      billingPostalCode: billingPostalCodeInput,
      billingCountry: billingCountryInput,
      billingAddressSameAsShipping: billingAddressSameAsShippingCheckbox,
    } = state.inputs;

    const email = emailInput?.value ?? '';
    const password = passwordInput?.value ?? '';

    if (isLoginForm) {
      const validation = validateLoginForm(email, password);

      if (!validation.success) {
        if (validation.errors.email)
          emailError && showFieldError(emailError, validation.errors.email);
        else emailError && hideFieldError(emailError);
        if (validation.errors.password)
          passwordError &&
            showFieldError(passwordError, validation.errors.password);
        else passwordError && hideFieldError(passwordError);
        addNotification(
          'warning',
          'Please fix the form errors before submitting.'
        );
        return;
      }
      emailError && hideFieldError(emailError);
      passwordError && hideFieldError(passwordError);

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
        emailInput?.value ?? '',
        passwordInput?.value ?? '',
        state.inputs.firstName?.value || '',
        // firstNameInput?.value || '',
        state.inputs.lastName?.value || '',
        state.inputs.dateOfBirth?.value || '',
        shippingAddressData.streetName,
        shippingAddressData.houseNumber,
        shippingAddressData.apartment,
        shippingAddressData.city,
        shippingAddressData.postalCode,
        shippingAddressData.country,
        billingDetailsForValidation
      );

      updateFieldErrors(state, validation); // Update errors for all fields first

      if (!validation.success) {
        markInvalidFieldsDirty(validation);
        updateFieldErrors(state, validation);
        addNotification(
          'warning',
          'Please fix the form errors before submitting.'
        );
        return;
      }

      const {
        firstName: firstNameError,
        lastName: lastNameError,
        dateOfBirth: dateOfBirthError,
        streetName: streetNameError,
        houseNumber: houseNumberError,
        apartment: apartmentError,
        city: cityError,
        postalCode: postalCodeError,
        country: countryError,
        billingStreetName: billingStreetNameError,
        billingHouseNumber: billingHouseNumberError,
        billingApartment: billingApartmentError,
        billingCity: billingCityError,
        billingPostalCode: billingPostalCodeError,
        billingCountry: billingCountryError,
      } = state.errors;

      // Clear all errors if validation passes
      emailError && hideFieldError(emailError);
      passwordError && hideFieldError(passwordError);
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
          emailInput?.value ?? '',
          passwordInput?.value ?? '',
          state.inputs.firstName?.value || '',
          // firstNameInput?.value || '',
          state.inputs.lastName?.value || '',
          state.inputs.dateOfBirth?.value || '',
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

  emailInput?.addEventListener('keypress', handleEnterKey);
  passwordInput?.addEventListener('keypress', handleEnterKey);

  state.isLoginForm = false;
  toggleForm(); // Initialize as login form
  registerLink.addEventListener('click', toggleForm);
}
