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

function showLoading(show: boolean): void {
  uiStore.setState({ isLoading: show });
}

function showNotification(message: string, isError = false): void {
  uiStore.getState().addNotification(isError ? 'error' : 'success', message);
}

async function handleLogin(email: string, password: string): Promise<void> {
  showLoading(true);
  try {
    const validation = validateLogin({ email, password });
    if (!validation.success) {
      const errorMessage =
        Object.values(validation.errors)[0] || 'Invalid login credentials';
      showNotification(errorMessage, true);
      return;
    }

    await AuthService.login(email, password);
    triggerHeaderUpdate();
    getRouter().navigateTo('/');
    showNotification('Login successful');
  } catch (error) {
    showNotification(
      error instanceof Error ? error.message : 'Login failed',
      true
    );
  } finally {
    showLoading(false);
  }
}

async function handleRegister(formData: RegisterFormData): Promise<void> {
  showLoading(true);
  try {
    const validation = validateRegister(formData);
    if (!validation.success) {
      const errorMessage =
        Object.values(validation.errors)[0] || 'Invalid registration data';
      showNotification(errorMessage, true);
      return;
    }

    await AuthService.register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
      formData.dateOfBirth,
      [
        {
          streetName: formData.streetName,
          streetNumber: formData.houseNumber,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      ]
    );
    triggerHeaderUpdate();
    getRouter().navigateTo('/');
    showNotification('Registration successful');
  } catch (error) {
    showNotification(
      error instanceof Error ? error.message : 'Registration failed',
      true
    );
  } finally {
    showLoading(false);
  }
}

export function initAuthPage(container: HTMLElement): void {
  const { customer } = useCustomerStore.getState();
  if (customer) {
    getRouter().navigateTo('/');
    return;
  }

  const state: AuthState = createInitialState();
  let { teardown } = renderAuthPage(state, container);

  container.addEventListener('login', (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const { detail } = event;
    if (
      detail &&
      typeof detail === 'object' &&
      'email' in detail &&
      'password' in detail
    ) {
      const email = typeof detail.email === 'string' ? detail.email : '';
      const password =
        typeof detail.password === 'string' ? detail.password : '';
      handleLogin(email, password);
    }
  });

  container.addEventListener('register', (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const { detail } = event;
    if (detail && typeof detail === 'object') {
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
        ...detail,
      };
      handleRegister(formData);
    }
  });

  container.addEventListener('toggle', () => {
    toggleForm(state);
    teardown();
    ({ teardown } = renderAuthPage(state, container));
  });
}
