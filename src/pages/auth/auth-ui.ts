import { AuthState } from './auth-state';
import {
  createPageContainer,
  createInputField,
  createPasswordField,
  createLoginButton,
  createRegisterLink,
} from './auth-form-elements';
import { createEl as createElement } from '../../utils/element-utilities';
import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';
import { COUNTRIES } from '../../data/countries';
import {
  showFieldError,
  hideFieldError,
  setInputBorder,
} from './field-utilities';
import { validateLogin, validateRegister } from './validation';
import { RegisterFormData } from '../../types/auth';

export function renderAuthPage(
  state: AuthState,
  container: HTMLElement
): { teardown: () => void } {
  const pageContainer = createPageContainer(container);
  const eventListeners: {
    element: HTMLElement;
    type: string;
    listener: EventListener;
  }[] = [];

  if (state.isLoginForm) {
    const emailField = createInputField({
      container: pageContainer,
      type: 'email',
      id: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
    });

    const passwordField = createPasswordField({
      container: pageContainer,
      id: 'password',
      placeholder: 'Enter your password',
      label: 'Password',
    });

    const { loginButton } = createLoginButton(pageContainer);
    const registerLink = createRegisterLink(pageContainer);

    const validateLoginField = () => {
      const { errors } = validateLogin({
        email: emailField.input.value,
        password: passwordField.input.value,
      });

      // email validation
      if (errors.email) {
        showFieldError(emailField.error, errors.email);
        setInputBorder(emailField.input, true);
      } else {
        hideFieldError(emailField.error);
        setInputBorder(emailField.input, false);
      }

      // password validation
      if (errors.password) {
        showFieldError(passwordField.error, errors.password);
        setInputBorder(passwordField.input, true);
      } else {
        hideFieldError(passwordField.error);
        setInputBorder(passwordField.input, false);
      }
    };

    emailField.input.addEventListener('blur', validateLoginField);
    passwordField.input.addEventListener('blur', validateLoginField);

    const loginHandler = () => {
      const loginEvent = new CustomEvent('login', {
        detail: {
          email: emailField.input.value,
          password: passwordField.input.value,
        },
        bubbles: true,
      });
      pageContainer.dispatchEvent(loginEvent);
    };

    const registerHandler = () => {
      const toggleEvent = new CustomEvent('toggle', { bubbles: true });
      pageContainer.dispatchEvent(toggleEvent);
    };

    eventListeners.push(
      { element: loginButton, type: 'click', listener: loginHandler },
      { element: registerLink, type: 'click', listener: registerHandler }
    );
  } else {
    const firstNameField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
    });

    const lastNameField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
    });

    const emailField = createInputField({
      container: pageContainer,
      type: 'email',
      id: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
    });

    const passwordField = createPasswordField({
      container: pageContainer,
      id: 'password',
      placeholder: 'Enter your password',
      label: 'Password',
    });

    const dobField = createInputField({
      container: pageContainer,
      type: 'date',
      id: 'dateOfBirth',
      label: 'Date of Birth',
      placeholder: 'YYYY-MM-DD',
    });

    const streetField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'streetName',
      label: 'Street',
      placeholder: 'Enter street name',
    });

    const houseField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'houseNumber',
      label: 'House Number',
      placeholder: 'Enter house number',
    });

    const apartmentField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'apartment',
      label: 'Apartment (optional)',
      placeholder: 'Enter apartment number',
    });

    const cityField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'city',
      label: 'City',
      placeholder: 'Enter city',
    });

    const postalField = createInputField({
      container: pageContainer,
      type: 'text',
      id: 'postalCode',
      label: 'Postal Code',
      placeholder: 'Enter postal code',
    });

    const countryContainer = createElement({
      tag: 'div',
      parent: pageContainer,
      classes: ['mb-4'],
    });

    createElement({
      tag: 'label',
      text: 'Country',
      parent: countryContainer,
      classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
      attributes: { for: 'country' },
    });

    const dropdownContainer = createElement({
      tag: 'div',
      parent: countryContainer,
      classes: ['relative'],
    });

    let selectedCountryCode: string | undefined = 'US';
    let dropdown: FilterableDropdown | undefined = undefined;
    let registerButton: HTMLButtonElement | undefined = undefined;

    // Define updateRegisterButton first to avoid hoisting issues
    const updateRegisterButton = () => {
      if (registerButton) {
        registerButton.disabled = selectedCountryCode === undefined;
      }
      if (dropdown) {
        if (selectedCountryCode === undefined) {
          dropdown.getElement().classList.add('border-red-500');
        } else {
          dropdown.getElement().classList.remove('border-red-500');
        }
      }
    };

    dropdown = new FilterableDropdown(COUNTRIES, (item) => {
      selectedCountryCode = item?.code;
      updateRegisterButton();
    });

    // Set initial country selection
    dropdown.setSelectedValue('DE');
    dropdownContainer.append(dropdown.getElement());

    registerButton = createElement<HTMLButtonElement>({
      tag: 'button',
      text: 'Register',
      parent: pageContainer,
      classes: [
        'w-full',
        'bg-gray-800',
        'text-white',
        'hover:bg-gray-900',
        'py-2',
        'px-4',
        'rounded',
        'mt-4',
        'cursor-pointer',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
      ],
    });

    const backToLogin = createElement({
      tag: 'a',
      text: 'Back to Login',
      parent: pageContainer,
      classes: [
        'block',
        'text-center',
        'mt-4',
        'text-sm',
        'text-gray-600',
        'hover:text-gray-800',
        'cursor-pointer',
      ],
    });

    const registerMap = {
      firstName: firstNameField,
      lastName: lastNameField,
      email: emailField,
      password: passwordField,
      dateOfBirth: dobField,
      streetName: streetField,
      houseNumber: houseField,
      apartment: apartmentField,
      city: cityField,
      postalCode: postalField,
    };

    const validateRegisterFields = () => {
      const currentValues: RegisterFormData = {
        firstName: firstNameField.input.value,
        lastName: lastNameField.input.value,
        email: emailField.input.value,
        password: passwordField.input.value,
        dateOfBirth: dobField.input.value,
        streetName: streetField.input.value,
        houseNumber: houseField.input.value,
        apartment: apartmentField.input.value,
        city: cityField.input.value,
        postalCode: postalField.input.value,
        country: selectedCountryCode ?? '',
      };

      const { errors } = validateRegister(currentValues);

      for (const [key, field] of Object.entries(registerMap)) {
        const message = errors[key];
        if (message) {
          showFieldError(field.error, message);
          setInputBorder(field.input, true);
        } else {
          hideFieldError(field.error);
          setInputBorder(field.input, false);
        }
      }

      // dropdown (country)
      if (errors.country) {
        dropdown?.getElement().classList.add('border-red-500');
      } else {
        dropdown?.getElement().classList.remove('border-red-500');
      }
    };

    for (const { input } of Object.values(registerMap)) {
      input.addEventListener('blur', validateRegisterFields);
    }
    dropdown.getElement().addEventListener('blur', validateRegisterFields);

    const registerHandler = () => {
      // Touch all fields to show validation errors
      const inputs = [
        firstNameField.input,
        lastNameField.input,
        emailField.input,
        passwordField.input,
        dobField.input,
        streetField.input,
        houseField.input,
        apartmentField.input,
        cityField.input,
        postalField.input,
      ];

      for (const input of inputs) {
        input.dispatchEvent(new Event('blur'));
      }

      if (selectedCountryCode === undefined) {
        // Highlight country dropdown if not selected
        dropdown?.getElement().classList.add('border-red-500');
        return;
      } else {
        dropdown?.getElement().classList.remove('border-red-500');
      }

      const registerEvent = new CustomEvent('register', {
        detail: {
          firstName: firstNameField.input.value,
          lastName: lastNameField.input.value,
          email: emailField.input.value,
          password: passwordField.input.value,
          dateOfBirth: dobField.input.value,
          streetName: streetField.input.value,
          houseNumber: houseField.input.value,
          apartment: apartmentField.input.value,
          city: cityField.input.value,
          postalCode: postalField.input.value,
          country: selectedCountryCode,
        },
        bubbles: true,
      });
      pageContainer.dispatchEvent(registerEvent);
    };

    const backHandler = () => {
      const toggleEvent = new CustomEvent('toggle', { bubbles: true });
      pageContainer.dispatchEvent(toggleEvent);
    };

    // Add border class to dropdown container for validation
    dropdown.getElement().classList.add('border', 'border-gray-300', 'rounded');

    eventListeners.push(
      { element: registerButton, type: 'click', listener: registerHandler },
      { element: backToLogin, type: 'click', listener: backHandler }
    );

    // Initial button state update
    updateRegisterButton();
  }

  for (const { element, type, listener } of eventListeners) {
    element.addEventListener(type, listener);
  }

  return {
    teardown: () => {
      for (const { element, type, listener } of eventListeners) {
        element.removeEventListener(type, listener);
      }
      if (container.contains(pageContainer)) {
        pageContainer.remove();
      }
    },
  };
}
