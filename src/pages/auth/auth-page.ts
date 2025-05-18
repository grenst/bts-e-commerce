import { z } from 'zod';
import './auth-page.scss';
import {
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';
import createButton from '../../components/layout/button/button';
import { getRouter } from '../../router/router';
import { uiStore } from '../../store/store';
import { AuthService } from '../../services/auth.service';
import { useCustomerStore } from '../../store/customer-store';
import { triggerHeaderUpdate } from '../../index';
import createModalContainer from '../../components/layout/modal/modal-container';

const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email format' });

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

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
  .refine((date) => {
    const year = parseInt(date.substring(0, 4), 10);
    const currentYear = new Date().getFullYear();
    return year <= currentYear - 18;
  }, { message: 'You must be at least 18 years old' })
  .refine((date) => {
    const year = parseInt(date.substring(0, 4), 10);
    return year >= 1900;
  }, { message: 'Date of birth year seems incorrect' });

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
  }); // For now, simple non-empty string. TODO: Use a predefined list.

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
  city: citySchema,
  postalCode: postalCodeSchema,
  country: countrySchema,
});

type ValidationResult = {
  success: boolean;
  errors: Record<string, string>;
};

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
  city: string,
  postalCode: string,
  country: string
): ValidationResult {
  try {
    registerFormSchema.parse({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      streetName,
      city,
      postalCode,
      country,
    });
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
    tag: 'div',
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
    ],
    attributes: {
      type: 'password',
      id: 'password',
      placeholder: 'Enter your password',
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
  let cityInput: HTMLInputElement | undefined;
  let postalCodeInput: HTMLInputElement | undefined;
  let countryInput: HTMLInputElement | undefined;

  let firstNameError: HTMLElement | undefined;
  let lastNameError: HTMLElement | undefined;
  let dateOfBirthError: HTMLElement | undefined;
  let streetNameError: HTMLElement | undefined;
  let cityError: HTMLElement | undefined;
  let postalCodeError: HTMLElement | undefined;
  let countryError: HTMLElement | undefined;

  function toggleForm(): void {
    isLoginForm = !isLoginForm;

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
        streetNameInput?.parentElement?.remove();
        cityInput?.parentElement?.remove();
        postalCodeInput?.parentElement?.remove();
        countryInput?.parentElement?.remove();

        // Reset the variables to ensure they are recreated when switching back to register form
        firstNameInput = undefined;
        lastNameInput = undefined;
        dateOfBirthInput = undefined;
        streetNameInput = undefined;
        cityInput = undefined;
        postalCodeInput = undefined;
        countryInput = undefined;

        firstNameError = undefined;
        lastNameError = undefined;
        dateOfBirthError = undefined;
        streetNameError = undefined;
        cityError = undefined;
        postalCodeError = undefined;
        countryError = undefined;

        title.classList.add('before:w-20');
        title.classList.remove('before:w-29');

        title.classList.add('reset-animation'); // Reseting animation
        void title.offsetWidth;
        title.classList.remove('reset-animation');
      }
    } else {
      if (!firstNameInput) {
        const firstNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });

        emailContainer.before(firstNameContainer);

        title.classList.add('before:w-29');
        title.classList.remove('before:w-20', 'login-name::before');

        title.classList.add('reset-animation'); // Reseting animation
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

        emailContainer.before(lastNameContainer);

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

        // Date of Birth
        const dateOfBirthContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        emailContainer.before(dateOfBirthContainer);

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

        // Street Name
        const streetNameContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        emailContainer.before(streetNameContainer);
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
            placeholder: 'Enter your street name',
          },
        }) as HTMLInputElement;
        streetNameError = createElement({
          tag: 'p',
          parent: streetNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // City
        const cityContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        emailContainer.before(cityContainer);
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
          attributes: { type: 'text', id: 'city', placeholder: 'Enter your city' },
        }) as HTMLInputElement;
        cityError = createElement({
          tag: 'p',
          parent: cityContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        // Postal Code
        const postalCodeContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        emailContainer.before(postalCodeContainer);
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

        // Country
        const countryContainer = createElement({
          tag: 'div',
          classes: ['mb-4'],
        });
        emailContainer.before(countryContainer);
        createElement({
          tag: 'label',
          text: 'Country (2-letter ISO)',
          parent: countryContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'country' },
        });
        countryInput = createElement({
          tag: 'input',
          parent: countryContainer,
          classes: inputParameters,
          attributes: {
            type: 'text',
            id: 'country',
            placeholder: 'e.g., US, DE',
            maxLength: '2', // Maxlength for 2-letter code
          },
        }) as HTMLInputElement;
        // Convert to uppercase on input
        countryInput.addEventListener('input', () => {
          countryInput!.value = countryInput!.value.toUpperCase();
        });
        countryError = createElement({
          tag: 'p',
          parent: countryContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });
      }
    }

    emailInput.value = '';
    passwordInput.value = '';
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (dateOfBirthInput) dateOfBirthInput.value = '';
    if (streetNameInput) streetNameInput.value = '';
    if (cityInput) cityInput.value = '';
    if (postalCodeInput) postalCodeInput.value = '';
    if (countryInput) countryInput.value = '';

    errorContainer.classList.add('hidden');
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');
    if (firstNameError) firstNameError.classList.add('hidden');
    if (lastNameError) lastNameError.classList.add('hidden');
    if (dateOfBirthError) dateOfBirthError.classList.add('hidden');
    if (streetNameError) streetNameError.classList.add('hidden');
    if (cityError) cityError.classList.add('hidden');
    if (postalCodeError) postalCodeError.classList.add('hidden');
    if (countryError) countryError.classList.add('hidden');
  }

  registerLink.addEventListener('click', toggleForm);

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
    errorContainer.classList.add('hidden');
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
      const firstName = firstNameInput?.value || '';
      const lastName = lastNameInput?.value || '';
      const dateOfBirth = dateOfBirthInput?.value || '';
      const streetName = streetNameInput?.value || '';
      const city = cityInput?.value || '';
      const postalCode = postalCodeInput?.value || '';
      const country = countryInput?.value.toUpperCase() || ''; // Ensure country code is uppercase

      const validation = validateRegisterForm(
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        streetName,
        city,
        postalCode,
        country
      );

      if (!validation.success) {
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
        if (firstNameError && validation.errors.firstName) {
          showFieldError(firstNameError, validation.errors.firstName);
        } else if (firstNameError) {
          hideFieldError(firstNameError);
        }
        if (lastNameError && validation.errors.lastName) {
          showFieldError(lastNameError, validation.errors.lastName);
        } else if (lastNameError) {
          hideFieldError(lastNameError);
        }
        if (dateOfBirthError && validation.errors.dateOfBirth) {
          showFieldError(dateOfBirthError, validation.errors.dateOfBirth);
        } else if (dateOfBirthError) {
          hideFieldError(dateOfBirthError);
        }
        if (streetNameError && validation.errors.streetName) {
          showFieldError(streetNameError, validation.errors.streetName);
        } else if (streetNameError) {
          hideFieldError(streetNameError);
        }
        if (cityError && validation.errors.city) {
          showFieldError(cityError, validation.errors.city);
        } else if (cityError) {
          hideFieldError(cityError);
        }
        if (postalCodeError && validation.errors.postalCode) {
          showFieldError(postalCodeError, validation.errors.postalCode);
        } else if (postalCodeError) {
          hideFieldError(postalCodeError);
        }
        if (countryError && validation.errors.country) {
          showFieldError(countryError, validation.errors.country);
        } else if (countryError) {
          hideFieldError(countryError);
        }
        addNotification(
          'warning',
          'Please fix the form errors before submitting.'
        );
        return;
      }
      hideFieldError(emailError);
      hideFieldError(passwordError);
      if (firstNameError) hideFieldError(firstNameError);
      if (lastNameError) hideFieldError(lastNameError);
      if (dateOfBirthError) hideFieldError(dateOfBirthError);
      if (streetNameError) hideFieldError(streetNameError);
      if (cityError) hideFieldError(cityError);
      if (postalCodeError) hideFieldError(postalCodeError);
      if (countryError) hideFieldError(countryError);

      // setLoading(true);
      svgSpinner.classList.add('spinner_active');
      const modalContainer = createModalContainer();

      try {
        const success = await AuthService.register(
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          [
            {
              streetName,
              city,
              postalCode,
              country,
            },
          ]
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

  // Функция для обработки нажатия Enter
  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loginButton.click();
    }
  };

  // Oбработчики на оба поля Инпутов
  emailInput.addEventListener('keydown', handleEnterKey);
  passwordInput.addEventListener('keydown', handleEnterKey);
}

export default createLoginPage;
