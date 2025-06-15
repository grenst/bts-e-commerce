import { RegisterFormData } from '../../types/auth';

export interface AuthState {
  isLoginForm: boolean;
  formValues: RegisterFormData;
}

export const dirty: Record<string, boolean> = {};

export function createInitialState(): AuthState {
  return {
    isLoginForm: true,
    formValues: {
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
    },
  };
}

export function toggleForm(state: AuthState): void {
  state.isLoginForm = !state.isLoginForm;
  state.formValues = createInitialState().formValues;
  for (const key of Object.keys(dirty)) {
    dirty[key] = false;
  }
}

export function touch(field: string): void {
  dirty[field] = true;
}
