import { AuthService } from '../../services/auth.service';
import { uiStore } from '../../store/store';
import { validateLogin, validateRegister } from './validation';
import { createInitialState, toggleForm } from './auth-state';
import { renderAuthPage } from './auth-ui';
import { getRouter } from '../../router/router';
import { useCustomerStore } from '../../store/customer-store';
import { triggerHeaderUpdate } from '../../index';
import { RegisterFormData } from '../../types/auth';
import { AuthState } from './auth-state';

function showLoading(v: boolean): void {
  uiStore.setState({ isLoading: v });
}

// Changed variable name from 'msg' to 'message' to prevent abbreviations
// Improves code readability and maintainability (unicorn/prevent-abbreviations)
function notify(message: string, error = false): void {
  uiStore.getState().addNotification(error ? 'error' : 'success', message);
}

async function doLogin(email: string, password: string): Promise<void> {
  showLoading(true);
  try {
    const r = validateLogin({ email, password });
    if (!r.success) {
      notify(Object.values(r.errors)[0] ?? 'Invalid login', true);
      return;
    }
    await AuthService.login(email, password);
    triggerHeaderUpdate();
    getRouter().navigateTo('/');
    notify('Login successful');
  } catch {
    notify('Login failed', true);
  } finally {
    showLoading(false);
  }
}

async function doRegister(f: RegisterFormData): Promise<void> {
  showLoading(true);
  try {
    const r = validateRegister(f);
    if (!r.success) {
      notify(Object.values(r.errors)[0] ?? 'Invalid data', true);
      return;
    }
    await AuthService.register(
      f.email,
      f.password,
      f.firstName,
      f.lastName,
      f.dateOfBirth,
      [
        {
          streetName: f.streetName,
          streetNumber: f.houseNumber,
          apartment: f.apartment,
          city: f.city,
          postalCode: f.postalCode,
          country: f.country,
        },
      ]
    );
    triggerHeaderUpdate();
    getRouter().navigateTo('/');
    notify('Registration successful');
  } catch {
    notify('Registration failed', true);
  } finally {
    showLoading(false);
  }
}

// Moved to outer scope to fix function scoping
// Improves code organization and avoids unnecessary redefinitions (unicorn/consistent-function-scoping)
function onLogin(event: Event): void {
  // Renamed 'e' to 'event' for clarity (unicorn/prevent-abbreviations)
  if (!(event instanceof CustomEvent)) return;

  // Replaced type assertion with type-safe property access
  // Prevents unsafe type casting and improves type safety (@typescript-eslint/consistent-type-assertions)
  const detail = event.detail;
  if (typeof detail !== 'object' || detail === null) return;

  const email = detail['email'];
  const password = detail['password'];

  if (typeof email === 'string' && typeof password === 'string') {
    doLogin(email, password);
  }
}

// Moved to outer scope to fix function scoping
// Improves code organization and avoids unnecessary redefinitions (unicorn/consistent-function-scoping)
function onRegister(event: Event): void {
  // Renamed 'e' to 'event' for clarity (unicorn/prevent-abbreviations)
  if (!(event instanceof CustomEvent)) return;

  // Replaced type assertion with safe object spreading
  // Prevents unsafe type casting and improves type safety (@typescript-eslint/consistent-type-assertions)
  const detail = event.detail;
  if (typeof detail !== 'object' || detail === null) return;

  const formData: RegisterFormData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    streetName: '',
    houseNumber: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: '',
    defaultShippingAddress: true,
    defaultBillingAddress: true,
    ...detail,
  };

  doRegister(formData);
}

let previousCleanup: (() => void) | undefined;

export function initAuthPage(container: HTMLElement): void {
  const { customer } = useCustomerStore.getState();
  if (customer) {
    getRouter().navigateTo('/');
    return;
  }

  previousCleanup?.();

  const state: AuthState = createInitialState();
  let { teardown } = renderAuthPage(state, container);

  const onToggle = (): void => {
    toggleForm(state);
    teardown();
    ({ teardown } = renderAuthPage(state, container));
  };

  container.addEventListener('login', onLogin);
  container.addEventListener('register', onRegister);
  container.addEventListener('toggle', onToggle);

  const cleanup = (): void => {
    container.removeEventListener('login', onLogin);
    container.removeEventListener('register', onRegister);
    container.removeEventListener('toggle', onToggle);
    teardown();
  };

  previousCleanup = cleanup;
}
