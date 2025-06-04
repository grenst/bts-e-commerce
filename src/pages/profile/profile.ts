import {
  createEl as createElement,
  removeAllChild,
} from '../../utils/element-utilities';
import { useCustomerStore } from '../../store/customer-store';
import { AuthService } from '../../services/auth.service';
import type { Address } from '../../types/commercetools';
import { addNotification } from '../../store/store';
import './profile-page.scss';
import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown'; // Added
import { COUNTRIES } from '../../data/countries';
import { createPasswordField } from '../auth/auth-form-elements';
import { getRouter } from '../../router/router'; // NEW

/* ───────────── Password validation function ───────────── */
function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  // Minimum length 8
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  // At least one digit
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one digit',
    };
  }
  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }
  return { valid: true };
}

function createFormField(
  labelText: string,
  inputType: string,
  inputId: string,
  initialValue: string,
  parent: HTMLElement,
  required = true
): HTMLInputElement {
  const wrapper = createElement({ tag: 'div', classes: ['mb-4'], parent });
  createElement({
    tag: 'label',
    text: labelText,
    attributes: { for: inputId },
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    parent: wrapper,
  });
  const input = createElement({
    tag: 'input',
    attributes: {
      type: inputType,
      id: inputId,
      name: inputId,
      value: initialValue,
      ...(required && { required: 'true' }),
    },
    classes: [
      'text-2xl',
      'input-field',
      'w-full',
      'px-3',
      'py-2',
      'border-b-1',
      'border-gray-400',
      'focus:outline-none',
      'focus:ring-none',
      'focus:border-b-10',
      'bac-col',
    ],
    parent: wrapper,
  }) as HTMLInputElement;
  return input;
}

type AddressContext = 'shipping' | 'billing';

export default async function createProfilePage(
  container: HTMLElement
): Promise<void> {
  container.innerHTML = '';
  await AuthService.loadSession();

  const profileContainer = createElement({
    tag: 'div',
    classes: [
      'profile-page',
      'container',
      'mx-auto',
      'bg-[linear-gradient(to_left,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_75%,rgba(255,255,255,0)_100%)]',
      'max-[500px]:bg-[linear-gradient(to_left,rgba(255,255,255,0.5)_0%,rgba(255,255,255,1)_15%,rgba(255,255,255,1)_85%,rgba(255,255,255,0.5)_100%)]',
      // 'shadow-xl',
      'p-6',
      'relative',
    ],
    parent: container,
  });

  createElement({
    tag: 'h1',
    text: 'My Profile',
    classes: [
      'text-3xl',
      'font-bold',
      'mb-20',
      'z-1',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      'before:w-38',
      'before:bg-yellow-400',
      'before:-z-1',
      'absolute',
      'left-1/2',
      '-translate-x-1/2',
      'login-name',
    ],
    parent: profileContainer,
  });

  const { customer } = useCustomerStore.getState();
  if (!customer) {
    createElement({
      tag: 'p',
      text: 'Please log in to view your profile.',
      classes: ['text-gray-600', 'text-center'],
      parent: profileContainer,
    });
    return;
  }

  /* ───────────── Personal information form (unchanged logic) ───────────── */

  const personalInfoForm = createElement({
    tag: 'form',
    parent: profileContainer,
  });
  createElement({
    tag: 'h2',
    text: 'Edit Personal Information',
    classes: ['text-2xl', 'font-nexa-bold', 'mt-10', 'text-gray-700'],
    parent: personalInfoForm,
  });
  const formGrid = createElement({
    tag: 'div',
    classes: ['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-x-6', 'gap-y-4'],
    parent: personalInfoForm,
  });
  const firstNameInput = createFormField(
    'First Name',
    'text',
    'firstName',
    customer.firstName || '',
    formGrid
  );
  const lastNameInput = createFormField(
    'Last Name',
    'text',
    'lastName',
    customer.lastName || '',
    formGrid
  );
  // Age
  const ageInput = createFormField(
    `Age`,
    'date',
    'ageInput',
    customer.age || '',
    formGrid
  );
  // Age
  const emailInput = createFormField(
    'Email',
    'email',
    'email',
    customer.email,
    formGrid
  );
  emailInput.classList.add('md:col-span-2');

  const savePersonalButton = createElement({
    tag: 'button',
    text: 'Save Personal Info',
    attributes: { type: 'submit' },
    classes: [
      'mt-6',
      'px-6',
      'py-2.5',
      'bg-gray-900',
      'text-white',
      'font-nexa-bold',
      'hover:bg-gray-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-gray-800',
      'focus:ring-offset-2',
      'transition-colors',
      'w-full',
      'md:w-auto',
    ],
    parent: personalInfoForm,
  });

  /* ───────────── Personal information form Password (unchanged logic) ───────────── */

  const personalInfoFormPassword = createElement({
    tag: 'form',
    parent: profileContainer,
  });
  createElement({
    tag: 'h2',
    text: 'Password change field',
    classes: ['text-2xl', 'font-nexa-bold', 'mt-10', 'text-gray-700'],
    parent: personalInfoFormPassword,
  });
  const formGridPassword = createElement({
    tag: 'div',
    classes: ['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-x-6', 'gap-y-4'],
    parent: personalInfoFormPassword,
  });
  const { input: actualPassInput } = createPasswordField({
    container: formGridPassword,
    id: 'actualPass',
    placeholder: 'Current password',
    label: 'Current Password',
  });
  const { input: newPassInput } = createPasswordField({
    container: formGridPassword,
    id: 'newPass',
    placeholder: 'New password',
    label: 'New Password',
  });
  const { input: replayNewPassInput } = createPasswordField({
    container: formGridPassword,
    id: 'replayNewPass',
    placeholder: 'Repeat new password',
    label: 'Repeat New Password',
  });

  const savePersonalButtonPassword = createElement({
    tag: 'button',
    text: 'Save Password',
    attributes: { type: 'submit' },
    classes: [
      'mt-6',
      'px-6',
      'py-2.5',
      'bg-gray-900',
      'text-white',
      'font-nexa-bold',
      'hover:bg-gray-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-gray-800',
      'focus:ring-offset-2',
      'transition-colors',
      'w-full',
      'md:w-auto',
    ],
    parent: personalInfoFormPassword,
  });

  personalInfoForm.addEventListener('submit', async (event_) => {
    event_.preventDefault();
    savePersonalButton.textContent = 'Saving…';
    savePersonalButton.setAttribute('disabled', 'true');
    try {
      const currentCustomer = useCustomerStore.getState().customer;
      if (!currentCustomer) return;
      const actions: { action: string; [key: string]: unknown }[] = [];
      if (firstNameInput.value !== (currentCustomer.firstName || ''))
        actions.push({
          action: 'setFirstName',
          firstName: firstNameInput.value,
        });
      if (lastNameInput.value !== (currentCustomer.lastName || ''))
        actions.push({ action: 'setLastName', lastName: lastNameInput.value });
      // Age
      if (ageInput.value !== currentCustomer.age)
        actions.push({ action: 'changeAge', age: ageInput.value });
      // Age
      if (emailInput.value !== currentCustomer.email)
        actions.push({ action: 'changeEmail', email: emailInput.value });

      if (actions.length > 0) {
        await AuthService.updateCurrentCustomer(
          currentCustomer.version,
          actions
        );
        addNotification('success', 'Profile updated successfully');
      } else {
        addNotification('info', 'No changes detected');
      }
    } catch (error) {
      addNotification(
        'error',
        (error as Error).message || 'Failed to update profile'
      );
    } finally {
      savePersonalButton.textContent = 'Save Personal Info';
      savePersonalButton.removeAttribute('disabled');
    }
  });

  /* ───────────── Password form submission ───────────── */
  personalInfoFormPassword.addEventListener('submit', async (event_) => {
    event_.preventDefault();
    savePersonalButtonPassword.textContent = 'Saving…';
    savePersonalButtonPassword.setAttribute('disabled', 'true');

    const currentCustomer = useCustomerStore.getState().customer;
    if (!currentCustomer) {
      addNotification('error', 'You must be logged in to change your password');
      savePersonalButtonPassword.textContent = 'Save Password';
      savePersonalButtonPassword.removeAttribute('disabled');
      return;
    }

    const currentPassword = actualPassInput.value;
    const newPassword = newPassInput.value;
    const replayPassword = replayNewPassInput.value;

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      addNotification('error', validation.message!);
      savePersonalButtonPassword.textContent = 'Save Password';
      savePersonalButtonPassword.removeAttribute('disabled');
      return;
    }

    // Check password match
    if (newPassword !== replayPassword) {
      addNotification('error', 'New password and confirmation do not match');
      savePersonalButtonPassword.textContent = 'Save Password';
      savePersonalButtonPassword.removeAttribute('disabled');
      return;
    }

    try {
      await AuthService.changePassword(
        currentCustomer.version,
        currentPassword,
        newPassword
      );

      addNotification('success', 'Password updated successfully');

      // Logout and redirect after password change
      await AuthService.logout();
      getRouter().navigateTo('/login'); // Single-page transition
      return;
    } catch (error) {
      if ((error as Error).message.includes('InvalidCredentials')) {
        addNotification('error', 'Current password is incorrect');
      } else {
        addNotification(
          'error',
          (error as Error).message ?? 'Failed to update password'
        );
      }
    } finally {
      savePersonalButtonPassword.textContent = 'Save Password';
      savePersonalButtonPassword.removeAttribute('disabled');
    }
  });

  /* ───────────── Address section ───────────── */

  const addressHeader = createElement({
    tag: 'div',
    classes: ['flex', 'items-center', 'justify-between', 'mt-10', 'mb-1'],
    parent: profileContainer,
  });
  createElement({
    tag: 'h2',
    text: 'Addresses',
    classes: ['text-2xl', 'font-nexa-bold', 'text-gray-700'],
    parent: addressHeader,
  });

  const contextSelector = createElement({
    tag: 'div',
    classes: [
      'radio-inputs',
      'rounded-t-lg',
      'border-t',
      'border-x',
      'border-gray-400',
    ],
    parent: profileContainer,
  });

  const buildRadio = (
    value: AddressContext,
    label: string,
    checked = false
  ): HTMLInputElement => {
    const wrapper = createElement({
      tag: 'label',
      classes: ['radio', 'flex-1', 'text-center'],
      parent: contextSelector,
    });

    const input = createElement({
      tag: 'input',
      attributes: {
        type: 'radio',
        name: 'addressContext',
        value,
        ...(checked && { checked: '' }),
      },
      classes: ['peer', 'hidden'],
      parent: wrapper,
    }) as HTMLInputElement;

    createElement({
      tag: 'span',
      text: label,
      classes: ['name', 'rounded-t-md'], // все стили в SCSS + Tailwind
      parent: wrapper,
    });

    return input;
  };

  const shippingRadio = buildRadio('shipping', 'Shipping', true);
  const billingRadio = buildRadio('billing', 'Billing');

  const addressesContainer = createElement({
    tag: 'div',
    parent: profileContainer,
    classes: ['addresses-container', 'mb-4'],
  });

  let context: AddressContext = 'shipping';

  const renderAddresses = (): void => {
    removeAllChild(addressesContainer);
    const current = useCustomerStore.getState().customer;
    if (!current) return;

    const ids =
      context === 'shipping'
        ? (current.shippingAddressIds ?? [])
        : (current.billingAddressIds ?? []);
    if (ids.length === 0) {
      createElement({
        tag: 'p',
        text: `No ${context} addresses found.`,
        classes: ['text-gray-600', 'font-nexa-light'],
        parent: addressesContainer,
      });
      return;
    }

    for (const address of current.addresses) {
      if (!address.id || !ids.includes(address.id)) continue;

      const card = createElement({
        tag: 'div',
        classes: [
          'address-card',
          'p-4',
          'border',
          'border-gray-400',
          'mb-4',
          'font-nexa-light',
          'relative',
        ],
        parent: addressesContainer,
      });

      // Title row
      const titleRow = createElement({
        tag: 'div',
        classes: ['flex', 'items-center', 'justify-between', 'mb-2'],
        parent: card,
      });
      createElement({
        tag: 'h3',
        text: `${context === 'shipping' ? 'Shipping' : 'Billing'} Address`,
        classes: ['text-lg', 'font-nexa-bold', 'text-gray-700'],
        parent: titleRow,
      });

      // Details
      const details: string[] = [
        `${address.streetName ?? ''} ${address.streetNumber ?? ''}`.trim(),
        `${address.postalCode ?? ''} ${address.city ?? ''}`.trim(),
        address.country ?? '',
      ].filter(Boolean);

      if (address.company) details.push(`Company: ${address.company}`);
      if (address.phone) details.push(`Phone: ${address.phone}`);
      if (address.email) details.push(`Email: ${address.email}`);

      for (const line of details) {
        createElement({
          tag: 'p',
          text: line,
          classes: ['text-sm', 'text-gray-600', 'font-nexa-bold'],
          parent: card,
        });
      }

      // Action buttons
      const actions = createElement({
        tag: 'div',
        classes: ['flex', 'justify-end', 'gap-2', 'mt-2'],
        parent: card,
      });
      const editButton = createElement({
        tag: 'button',
        text: 'edit',
        classes: ['text-xs', 'italic', 'text-blue-600', 'hover:underline'],
        parent: actions,
      }) as HTMLButtonElement;
      const removeButton = createElement({
        tag: 'button',
        text: 'remove',
        classes: ['text-xs', 'italic', 'text-red-600', 'hover:underline'],
        parent: actions,
      }) as HTMLButtonElement;

      editButton.addEventListener('click', () => handleEditAddress(address));
      removeButton.addEventListener('click', () =>
        handleRemoveAddress(address)
      );
    }
  };

  function createAddrField(
    label: string,
    key: keyof Address,
    value: string | undefined,
    form: HTMLElement
  ): HTMLInputElement {
    const row = createElement({ tag: 'div', classes: ['mb-3'], parent: form });
    createElement({
      tag: 'label',
      text: label,
      attributes: { for: key },
      classes: ['block', 'text-sm', 'mb-1', 'font-medium', 'text-gray-700'],
      parent: row,
    });
    return createElement({
      tag: 'input',
      classes: [
        'text-2xl',
        'w-full',
        'px-3',
        'py-2',
        'border-b',
        'border-gray-400',
        'focus:outline-none',
        'focus:border-gray-800',
        'text-base',
      ],
      parent: row,
      attributes: { id: key, name: String(key), value: value ?? '' },
    }) as HTMLInputElement;
  }

  function openEditAddressModal(addr: Address, context_: AddressContext): void {
    const overlay = createElement({
      tag: 'div',
      classes: [
        'fixed',
        'inset-0',
        'bg-black/50',
        'flex',
        'items-center',
        'justify-center',
        'z-50',
      ],
      parent: document.body,
    });

    const card = createElement({
      tag: 'div',
      classes: [
        'bg-white',
        'rounded-lg',
        'shadow-lg',
        'p-6',
        'w-full',
        'max-w-md',
        'relative',
      ],
      parent: overlay,
    });

    const closeButton = createElement({
      tag: 'button',
      text: '✕',
      classes: ['absolute', 'top-2', 'right-3', 'text-xl'],
      parent: card,
    });
    closeButton.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    createElement({
      tag: 'h3',
      text: `Edit ${context_ === 'shipping' ? 'Shipping' : 'Billing'} Address`,
      classes: ['text-2xl', 'font-nexa-bold', 'mb-4', 'text-gray-800'],
      parent: card,
    });

    const form = createElement({ tag: 'form', parent: card });
    const street = createAddrField(
      'Street name',
      'streetName',
      addr.streetName,
      form
    );
    const number = createAddrField(
      'Street №',
      'streetNumber',
      addr.streetNumber,
      form
    );
    const city = createAddrField('City', 'city', addr.city, form);
    const postal = createAddrField(
      'Postal code',
      'postalCode',
      addr.postalCode,
      form
    );

    // Country Dropdown
    createElement({
      tag: 'label',
      text: 'Country',
      attributes: { for: 'country-dropdown-profile' },
      classes: ['block', 'text-sm', 'mb-1', 'font-medium', 'text-gray-700'],
      parent: form,
    });
    const countryDropdown = new FilterableDropdown(COUNTRIES, () => {
      // Optional: handle selection change if needed for immediate validation
    });
    if (addr.country) {
      countryDropdown.setSelectedValue(addr.country);
    }
    const countryDropdownElement = countryDropdown.getElement();

    form.append(countryDropdownElement);

    const customer = useCustomerStore.getState().customer;
    const otherDefaultId =
      context_ === 'shipping'
        ? customer?.defaultBillingAddressId
        : customer?.defaultShippingAddressId;
    const otherDefault = customer?.addresses.find(
      (a) => a.id === otherDefaultId
    );

    if (otherDefault) {
      const copyButton = createElement({
        tag: 'button',
        text: `copy data from default ${
          context_ === 'shipping' ? 'billing' : 'shipping'
        } address`,
        attributes: { type: 'button' },
        classes: [
          'mb-2',
          'text-sm',
          'font-semibold',
          'italic',
          'text-gray-600',
          'hover:underline',
          'self-start',
        ],
        parent: form,
      }) as HTMLButtonElement;

      copyButton.addEventListener('click', () => {
        street.value = otherDefault.streetName ?? '';
        number.value = otherDefault.streetNumber ?? '';
        city.value = otherDefault.city ?? '';
        postal.value = otherDefault.postalCode ?? '';
        countryDropdown.setSelectedValue(otherDefault.country ?? undefined);
      });
    }

    const saveButton = createElement({
      tag: 'button',
      text: 'Save',
      attributes: { type: 'submit' },
      classes: [
        'mt-3',
        'px-5',
        'py-2',
        'bg-gray-900',
        'text-white',
        'rounded',
        'hover:bg-gray-700',
        'w-full',
      ],
      parent: form,
    });

    form.addEventListener('submit', async (event_) => {
      event_.preventDefault();
      saveButton.textContent = 'Saving…';
      saveButton.setAttribute('disabled', 'true');

      const current = useCustomerStore.getState().customer;
      if (!current || !addr.id) return;

      const updated: Address = {
        ...addr,
        streetName: street.value.trim(),
        streetNumber: number.value.trim(),
        city: city.value.trim(),
        postalCode: postal.value.trim(),
        country: countryDropdown.getSelectedValue() || '',
      };

      const actions = [
        {
          action: 'changeAddress',
          addressId: addr.id,
          address: updated,
        },
      ];

      try {
        await AuthService.updateCurrentCustomer(current.version, actions);
        addNotification('success', `${context_} address updated`);
        overlay.remove();
        renderAddresses(); // перечёркиваем кеш и перерисовываем
      } catch (error) {
        addNotification(
          'error',
          (error as Error).message || 'Failed to save address'
        );
        saveButton.textContent = 'Save';
        saveButton.removeAttribute('disabled');
      }
    });
  }

  const handleRemoveAddress = async (address: Address): Promise<void> => {
    const current = useCustomerStore.getState().customer;
    if (!current || !address.id) return;

    const action =
      context === 'shipping'
        ? { action: 'removeShippingAddressId', addressId: address.id }
        : { action: 'removeBillingAddressId', addressId: address.id };

    try {
      await AuthService.updateCurrentCustomer(current.version, [action]);
      addNotification('success', `${context} address removed`);
      renderAddresses();
    } catch (error) {
      addNotification(
        'error',
        (error as Error).message || 'Failed to remove address'
      );
    }
  };

  const handleEditAddress = (address: Address): void => {
    openEditAddressModal(address, context);
  };

  shippingRadio.addEventListener('change', () => {
    context = 'shipping';
    renderAddresses();
  });
  billingRadio.addEventListener('change', () => {
    context = 'billing';
    renderAddresses();
  });

  renderAddresses();
}
