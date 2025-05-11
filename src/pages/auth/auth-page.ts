import { z } from 'zod';
import { createEl } from '../../utils/elementUtils';
import createButton from '../../components/ui/button/button';
import { getRouter } from '../../router/router';
import { uiStore } from '../../store/store';
import { AuthService } from '../../services/auth.service';
import { useCustomerStore } from '../../store/customer-store';
import { triggerHeaderUpdate } from '../../index';

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

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
});

type ValidationResult = {
  success: boolean;
  errors: Record<string, string>;
};

function validateLoginForm(email: string, password: string): ValidationResult {
  try {
    loginFormSchema.parse({ email, password });
    return { success: true, errors: {} };
  } catch (error) {
    const formattedErrors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        formattedErrors[field] = err.message;
      });
    }
    return { success: false, errors: formattedErrors };
  }
}

function validateRegisterForm(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): ValidationResult {
  try {
    registerFormSchema.parse({ email, password, firstName, lastName });
    return { success: true, errors: {} };
  } catch (error) {
    const formattedErrors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        formattedErrors[field] = err.message;
      });
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

  const pageContainer = createEl({
    tag: 'div',
    parent: container,
    classes: [
      'auth-page',
      'max-w-md',
      'mx-auto',
      'p-6',
      'bg-white',
      'rounded-lg',
      'shadow-md',
    ],
  });

  createEl({
    tag: 'h1',
    text: 'Login',
    parent: pageContainer,
    classes: ['text-2xl', 'font-bold', 'mb-6', 'text-center', 'text-gray-800'],
  });

  const formContainer = createEl({
    tag: 'div',
    parent: pageContainer,
    classes: ['space-y-4'],
  });

  const emailContainer = createEl({
    tag: 'div',
    parent: formContainer,
    classes: ['mb-4'],
  });

  createEl({
    tag: 'label',
    text: 'Email',
    parent: emailContainer,
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    attributes: { for: 'email' },
  });

  const emailInput = createEl({
    tag: 'input',
    parent: emailContainer,
    classes: [
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'focus:outline-none',
      'focus:ring-blue-500',
      'focus:border-blue-500',
    ],
    attributes: { type: 'email', id: 'email', placeholder: 'Enter your email' },
  }) as HTMLInputElement;

  const emailError = createEl({
    tag: 'p',
    parent: emailContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  // Password field
  const passwordContainer = createEl({
    tag: 'div',
    parent: formContainer,
    classes: ['mb-4'],
  });

  createEl({
    tag: 'label',
    text: 'Password',
    parent: passwordContainer,
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    attributes: { for: 'password' },
  });

  const passwordInput = createEl({
    tag: 'input',
    parent: passwordContainer,
    classes: [
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'focus:outline-none',
      'focus:ring-blue-500',
      'focus:border-blue-500',
    ],
    attributes: {
      type: 'password',
      id: 'password',
      placeholder: 'Enter your password',
    },
  }) as HTMLInputElement;

  const passwordError = createEl({
    tag: 'p',
    parent: passwordContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  const errorContainer = createEl({
    tag: 'div',
    parent: formContainer,
    classes: ['mt-4', 'p-3', 'bg-red-100', 'text-red-700', 'rounded', 'hidden'],
  });

  const buttonContainer = createEl({
    tag: 'div',
    parent: formContainer,
    classes: ['mt-6'],
  });

  const loginButton = createButton('Login', buttonContainer, [
    'w-full',
    'bg-blue-500',
    'text-white',
    'hover:bg-blue-600',
    'py-2',
  ]);

  const registerContainer = createEl({
    tag: 'div',
    parent: pageContainer,
    classes: ['mt-4', 'text-center'],
  });

  createEl({
    tag: 'p',
    text: "Don't have an account? ",
    parent: registerContainer,
    classes: ['text-sm', 'text-gray-600'],
  });

  const registerLink = createEl({
    tag: 'a',
    text: 'Register',
    parent: registerContainer,
    classes: [
      'text-sm',
      'text-blue-500',
      'hover:text-blue-700',
      'cursor-pointer',
    ],
  });

  let isLoginForm = true;
  let firstNameInput: HTMLInputElement | undefined;
  let lastNameInput: HTMLInputElement | undefined;
  let firstNameError: HTMLElement | undefined;
  let lastNameError: HTMLElement | undefined;

  function toggleForm(): void {
    isLoginForm = !isLoginForm;

    const title = pageContainer.querySelector('h1') as HTMLElement;
    title.textContent = isLoginForm ? 'Login' : 'Register';

    loginButton.textContent = isLoginForm ? 'Login' : 'Register';

    registerLink.textContent = isLoginForm ? 'Register' : 'Login';

    if (isLoginForm) {
      if (firstNameInput?.parentElement) {
        firstNameInput.parentElement.remove();
        lastNameInput?.parentElement?.remove();
      }
    } else {
      if (!firstNameInput) {
        const firstNameContainer = createEl({
          tag: 'div',
          classes: ['mb-4'],
        });

        formContainer.insertBefore(firstNameContainer, emailContainer);

        createEl({
          tag: 'label',
          text: 'First Name',
          parent: firstNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'firstName' },
        });

        firstNameInput = createEl({
          tag: 'input',
          parent: firstNameContainer,
          classes: [
            'w-full',
            'px-3',
            'py-2',
            'border',
            'border-gray-300',
            'rounded-md',
            'focus:outline-none',
            'focus:ring-blue-500',
            'focus:border-blue-500',
          ],
          attributes: {
            type: 'text',
            id: 'firstName',
            placeholder: 'Enter your first name',
          },
        }) as HTMLInputElement;

        firstNameError = createEl({
          tag: 'p',
          parent: firstNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });

        const lastNameContainer = createEl({
          tag: 'div',
          classes: ['mb-4'],
        });

        formContainer.insertBefore(lastNameContainer, emailContainer);

        createEl({
          tag: 'label',
          text: 'Last Name',
          parent: lastNameContainer,
          classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
          attributes: { for: 'lastName' },
        });

        lastNameInput = createEl({
          tag: 'input',
          parent: lastNameContainer,
          classes: [
            'w-full',
            'px-3',
            'py-2',
            'border',
            'border-gray-300',
            'rounded-md',
            'focus:outline-none',
            'focus:ring-blue-500',
            'focus:border-blue-500',
          ],
          attributes: {
            type: 'text',
            id: 'lastName',
            placeholder: 'Enter your last name',
          },
        }) as HTMLInputElement;

        lastNameError = createEl({
          tag: 'p',
          parent: lastNameContainer,
          classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
        });
      }
    }

    emailInput.value = '';
    passwordInput.value = '';
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';

    errorContainer.classList.add('hidden');
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');
    if (firstNameError) firstNameError.classList.add('hidden');
    if (lastNameError) lastNameError.classList.add('hidden');
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
    const { setLoading, addNotification } = uiStore.getState();

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

      setLoading(true);
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
        setLoading(false);
      }
    } else {
      // Registration form
      const firstName = firstNameInput?.value || '';
      const lastName = lastNameInput?.value || '';

      const validation = validateRegisterForm(
        email,
        password,
        firstName,
        lastName
      );

      if (!validation.success) {
        if (validation.errors.email)
          showFieldError(emailError, validation.errors.email);
        else hideFieldError(emailError);
        if (validation.errors.password)
          showFieldError(passwordError, validation.errors.password);
        else hideFieldError(passwordError);
        if (firstNameError) {
          if (validation.errors.firstName)
            showFieldError(firstNameError, validation.errors.firstName);
          else hideFieldError(firstNameError);
        }
        if (lastNameError) {
          if (validation.errors.lastName)
            showFieldError(lastNameError, validation.errors.lastName);
          else hideFieldError(lastNameError);
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

      setLoading(true);
      try {
        const success = await AuthService.register(
          email,
          password,
          firstName,
          lastName
        );
        if (success) {
          addNotification('success', 'Registration successful! Please log in.');
          toggleForm(); // Switch to login form
          emailInput.value = email;
          passwordInput.value = '';
        } else {
          showFormError(
            'Registration failed. This email may already be in use or another error occurred.'
          );
        }
      } catch (error) {
        console.error('Registration error:', error);
        showFormError('Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });
}

export default createLoginPage;
