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

const emailSchema = z
  .string()
  .min(1, { message: 'Please enter your email' })
  .email({ message: 'Please enter a valid email (e.g., user@example.com)' });

// const passwordSchema = z
//   .string()
//   .min(8, { message: 'Password must be at least 8 characters' })
//   .regex(/[A-Z]/, {
//     message: 'Password must contain at least one uppercase letter',
//   })
//   .regex(/[a-z]/, {
//     message: 'Password must contain at least one lowercase letter',
//   })
//   .regex(/[0-9]/, { message: 'Password must contain at least one number' });

const passwordSchema = z
  .string()
  .min(8, { message: 'Use at least 8 characters' }) // Короче и понятнее
  .regex(/[A-Z]/, {
    message: 'Add at least one uppercase letter (A-Z)', // Уточнение в скобках
  })
  .regex(/[a-z]/, {
    message: 'Add at least one lowercase letter (a-z)',
  })
  .regex(/[0-9]/, {
    message: 'Include a number (0-9)',
  });

const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(50, { message: 'Name must be less than 50 characters' });

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
  .max(100, { message: 'Street name must be less than 100 characters' });

const citySchema = z
  .string()
  .min(1, { message: 'City is required' })
  .max(50, { message: 'City must be less than 50 characters' });

const postalCodeSchema = z
  .string()
  .min(1, { message: 'Postal code is required' })
  .regex(/^[a-zA-Z0-9\s-]{3,10}$/, {
    message: 'Invalid postal code format',
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
  .max(10, { message: 'House number must be ≤ 10 chars' });

const apartmentSchema = z
  .string()
  .max(10, { message: 'Apartment must be ≤ 10 chars' })
  .optional();

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: dateOfBirthSchema,
  streetName: streetNameSchema,
  houseNumber: houseNumberSchema,
  apartment: apartmentSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: countrySchema,
  // Optional billing address fields
  billingStreetName: streetNameSchema.optional(),
  billingHouseNumber: houseNumberSchema.optional(),
  billingApartment: apartmentSchema.optional(),
  billingCity: citySchema.optional(),
  billingPostalCode: postalCodeSchema.optional(),
  billingCountry: countrySchema.optional(),
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

  const pageContainer = createElement({
    tag: 'div',
    parent: container,
    classes: [
      'auth-page',
      'max-w-md',
      'mx-auto',
      'mt-20',
      'p-6',
      'bg-white',
      'shadow-md',
      '-z-0',
      'relative',
    ],
  });

  createElement({
    tag: 'h1',
    text: 'Login',
    parent: pageContainer,
    classes: [
      'text-2xl',
      'font-bold',
      'mb-6',
      'z-30',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      'before:w-20',
      'before:bg-yellow-400',
      'before:-z-1',
      'login-name',
    ],
  });

  const formContainer = createElement({
    tag: 'form',
    parent: pageContainer,
    classes: ['space-y-4'],
  });

  const emailContainer = createElement({
    tag: 'div',
    parent: formContainer,
    classes: ['mb-4'],
  });

  createElement({
    tag: 'label',
    text: 'Email',
    parent: emailContainer,
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    attributes: { for: 'email' },
  });

  const emailInput = createElement({
    tag: 'input',
    parent: emailContainer,
    classes: inputParameters,
    attributes: { type: 'email', id: 'email', placeholder: 'Enter your email' },
  }) as HTMLInputElement;

  const emailError = createElement({
    tag: 'p',
    parent: emailContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  // Password field
  const passwordContainer = createElement({
    tag: 'div',
    parent: formContainer,
    classes: ['mb-4'],
  });

  createElement({
    tag: 'label',
    text: 'Password',
    parent: passwordContainer,
    classes: ['block', 'text-sm', 'font-large', 'text-gray-700', 'mb-1'],
    attributes: { for: 'password' },
  });

  const passwordInputContainer = createElement({
    parent: passwordContainer,
    classes: ['relative'],
  });

  const passwordInput = createElement({
    tag: 'input',
    parent: passwordInputContainer,
    classes: [
      'w-full',
      'px-3',
      'py-2',
      'mb-2',
      'border-gray-300',
      'focus:outline-none',
      'focus:pb-2',
      'focus:mb-1',
      'pr-8',
    ],
    attributes: {
      type: 'password',
      id: 'password',
      // placeholder: 'Enter your password',
      // placeholder: 'Enter your password (Use 8+ chars with A-Z, a-z, 0-9)',
      placeholder: 'Use A-Z a-z 0-9',
    },
  }) as HTMLInputElement;

  const eyeButton = createElement({
    tag: 'button',
    parent: passwordInputContainer,
    classes: ['button-eye'],
    attributes: { type: 'button', 'aria-label': 'Toggle password visibility' },
  });

  const eyeInvisible = createSvgUse('#eye-invisible', 'eye');
  const eyeVisible = createSvgUse('#eye-visible', 'eye');

  eyeButton.append(eyeInvisible, eyeVisible);
  eyeInvisible.classList.add('eye_active');

  eyeButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    eyeInvisible.classList.toggle('eye_active');
    eyeVisible.classList.toggle('eye_active');
  });

  const passwordError = createElement({
    tag: 'p',
    parent: passwordContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  const errorContainer = createElement({
    tag: 'div',
    parent: formContainer,
    classes: ['mt-4', 'p-3', 'bg-red-100', 'text-red-700', 'hidden'],
  });

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

  let isLoginForm = true;
  let firstNameInput: HTMLInputElement | undefined;
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

    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (dateOfBirthInput) dateOfBirthInput.value = '';
    if (streetNameInput) streetNameInput.value = '';
    if (houseNumberInput) houseNumberInput.value = '';
    if (apartmentInput) apartmentInput.value = '';
    if (cityInput) cityInput.value = '';
    if (postalCodeInput) postalCodeInput.value = '';
    if (countryInput) countryInput.setSelectedValue(undefined);

    if (billingStreetNameInput) billingStreetNameInput.value = '';
    if (billingHouseNumberInput) billingHouseNumberInput.value = '';
    if (billingApartmentInput) billingApartmentInput.value = '';
    if (billingCityInput) billingCityInput.value = '';
    if (billingPostalCodeInput) billingPostalCodeInput.value = '';
    if (billingCountryInput) billingCountryInput.setSelectedValue(undefined);
  }

  function toggleForm(): void {
    isLoginForm = !isLoginForm;
    clearErrorMessagesAndInputs();

    const title = pageContainer.querySelector('h1') as HTMLElement;
    title.textContent = isLoginForm ? 'Login' : 'Register';

    loginButton.textContent = isLoginForm ? 'Login' : 'Register';
    loginButton.prepend(svgSpinner);

    registerLink.textContent = isLoginForm ? 'Register' : 'Login';

    if (isLoginForm) {
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

        firstNameInput = undefined;
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

        title.classList.add('before:w-20');
        title.classList.remove('before:w-29');

        title.classList.add('reset-animation');
        void title.offsetWidth;
        title.classList.remove('reset-animation');
      }
    } else {
      if (!firstNameInput) {
        const firstNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        // emailContainer.before(firstNameContainer); // Will be reordered
        title.classList.add('before:w-29');
        title.classList.remove('before:w-20', 'login-name::before');
        title.classList.add('reset-animation');
        void title.offsetWidth;
        title.classList.remove('reset-animation');
        createElement({
          tag: 'label',
          text: 'First Name',
          parent: firstNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'firstName' },
        });
        firstNameInput = createElement({
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
    emailInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);

    // if (firstNameInput) {
    //   firstNameInput.addEventListener('input', validateForm);
    // }

    // if (lastNameInput) {
    //   lastNameInput.addEventListener('input', validateForm);
    // }
    if (firstNameInput) {
      firstNameInput.addEventListener('input', validateForm);
    }
    if (lastNameInput) {
      lastNameInput.addEventListener('input', validateForm);
    }
    if (dateOfBirthInput) {
      dateOfBirthInput.addEventListener('input', validateForm);
    }
    if (streetNameInput) {
      streetNameInput.addEventListener('input', validateForm);
    }
    if (houseNumberInput) {
      houseNumberInput.addEventListener('input', validateForm);
    }
    if (apartmentInput) {
      apartmentInput.addEventListener('input', validateForm);
    }
    if (cityInput) {
      cityInput.addEventListener('input', validateForm);
    }
    if (postalCodeInput) {
      postalCodeInput.addEventListener('input', validateForm);
    }
    // if (countryInput) {
    //   countryInput.addEventListener('input', validateForm);
    // }

    if (billingStreetNameInput) {
      billingStreetNameInput.addEventListener('input', validateForm);
    }
    if (billingHouseNumberInput) {
      billingHouseNumberInput.addEventListener('input', validateForm);
    }
    if (billingApartmentInput) {
      billingApartmentInput.addEventListener('input', validateForm);
    }
    if (billingCityInput) {
      billingCityInput.addEventListener('input', validateForm);
    }
    if (billingPostalCodeInput) {
      billingPostalCodeInput.addEventListener('input', validateForm);
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

  function showFormError(message: string): void {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }

  function hideFormError(): void {
    errorContainer.textContent = '';
    errorContainer.classList.add('hidden');
  }

  function validateForm() {
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
  function updateFieldErrors(validation: ValidationResult) {
    if (validation.errors.email) {
      showFieldError(emailError, validation.errors.email);
    } else {
      hideFieldError(emailError);
    }

    if (validation.errors.password) {
      showFieldError(passwordError, validation.errors.password);
    } else {
      hideFieldError(passwordError);
    }

    if (!isLoginForm) {
      if (firstNameError) {
        if (validation.errors.firstName) {
          showFieldError(firstNameError, validation.errors.firstName);
        } else {
          hideFieldError(firstNameError);
        }
      }

      if (lastNameError) {
        if (validation.errors.lastName) {
          showFieldError(lastNameError, validation.errors.lastName);
        } else {
          hideFieldError(lastNameError);
        }
      }

      if (dateOfBirthError) {
        if (validation.errors.dateOfBirth) {
          showFieldError(dateOfBirthError, validation.errors.dateOfBirth);
        } else {
          hideFieldError(dateOfBirthError);
        }
      }

      if (streetNameError) {
        if (validation.errors.streetName) {
          showFieldError(streetNameError, validation.errors.streetName);
        } else {
          hideFieldError(streetNameError);
        }
      }

      if (houseNumberError) {
        if (validation.errors.houseNumber) {
          showFieldError(houseNumberError, validation.errors.houseNumber);
        } else {
          hideFieldError(houseNumberError);
        }
      }

      if (apartmentError) {
        if (validation.errors.apartment) {
          showFieldError(apartmentError, validation.errors.apartment);
        } else {
          hideFieldError(apartmentError);
        }
      }

      if (cityError) {
        if (validation.errors.city) {
          showFieldError(cityError, validation.errors.city);
        } else {
          hideFieldError(cityError);
        }
      }

      if (postalCodeError) {
        if (validation.errors.postalCode) {
          showFieldError(postalCodeError, validation.errors.postalCode);
        } else {
          hideFieldError(postalCodeError);
        }
      }

      if (countryError) {
        if (validation.errors.country) {
          showFieldError(countryError, validation.errors.country);
        } else {
          hideFieldError(countryError);
        }
      }

      // Billing address errors (only if checkbox is unchecked)
      if (
        billingAddressSameAsShippingCheckbox &&
        !billingAddressSameAsShippingCheckbox.checked
      ) {
        if (billingStreetNameError) {
          if (validation.errors.billingStreetName) {
            showFieldError(
              billingStreetNameError,
              validation.errors.billingStreetName
            );
          } else {
            hideFieldError(billingStreetNameError);
          }
        }
        if (billingHouseNumberError) {
          if (validation.errors.billingHouseNumber) {
            showFieldError(
              billingHouseNumberError,
              validation.errors.billingHouseNumber
            );
          } else {
            hideFieldError(billingHouseNumberError);
          }
        }
        if (billingApartmentError) {
          if (validation.errors.billingApartment) {
            showFieldError(
              billingApartmentError,
              validation.errors.billingApartment
            );
          } else {
            hideFieldError(billingApartmentError);
          }
        }
        if (billingCityError) {
          if (validation.errors.billingCity) {
            showFieldError(billingCityError, validation.errors.billingCity);
          } else {
            hideFieldError(billingCityError);
          }
        }
        if (billingPostalCodeError) {
          if (validation.errors.billingPostalCode) {
            showFieldError(
              billingPostalCodeError,
              validation.errors.billingPostalCode
            );
          } else {
            hideFieldError(billingPostalCodeError);
          }
        }
        if (billingCountryError) {
          if (validation.errors.billingCountry) {
            showFieldError(
              billingCountryError,
              validation.errors.billingCountry
            );
          } else {
            hideFieldError(billingCountryError);
          }
        }
      } else {
        // Hide billing errors if checkbox is checked
        if (billingStreetNameError) hideFieldError(billingStreetNameError);
        if (billingHouseNumberError) hideFieldError(billingHouseNumberError);
        if (billingApartmentError) hideFieldError(billingApartmentError);
        if (billingCityError) hideFieldError(billingCityError);
        if (billingPostalCodeError) hideFieldError(billingPostalCodeError);
        if (billingCountryError) hideFieldError(billingCountryError);
      }
    }
    // loginButton.disabled = !validation.success;
  }

  loginButton.addEventListener('click', async () => {
    hideFormError();
    const { addNotification } = uiStore.getState();
    // const { setLoading, addNotification } = uiStore.getState();

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
      // Registration form
      // const firstName = firstNameInput?.value || '';
      // const lastName = lastNameInput?.value || '';
      // const dateOfBirth = dateOfBirthInput?.value || '';
      // const streetName = streetNameInput?.value || '';
      // const houseNumber = houseNumberInput?.value || '';
      // const apartment = apartmentInput?.value || '';
      // const city = cityInput?.value || '';
      // const postalCode = postalCodeInput?.value || '';
      // // const country = countryInput?.value || ''; // Ensure country code is uppercase
      // const country = countryInput?.getSelectedValue() || '';

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
        firstNameInput?.value || '',
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
          firstNameInput?.value || '',
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

  isLoginForm = false;
  toggleForm(); // Initialize as login form
  registerLink.addEventListener('click', toggleForm);
}
