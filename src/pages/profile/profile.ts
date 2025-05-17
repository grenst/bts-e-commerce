import { createEl as createElement } from '../../utils/element-utilities';
import { useCustomerStore } from '../../store/customer-store';
import { AuthService } from '../../services/auth.service';
import type { Address } from '../../types/commercetools';
import { addNotification } from '../../store/store';
import './profile-page.scss';

// Helper function to create form fields
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

export default function createProfilePage(container: HTMLElement): void {
  container.innerHTML = '';

  const profileContainer = createElement({
    tag: 'div',
    classes: [
      'profile-page',
      'container',
      'mx-auto',
      'bg-white',
      'rounded-lg',
      'shadow-xl',
      'mt-20',
      'p-6',
      'bg-white',
      'shadow-md',
      '-z-0',
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
      'mb-6',
      'z-30',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      'before:w-38',
      'before:bg-yellow-400',
      'before:-z-1',
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

  // Personal Information Form
  const personalInfoForm = createElement({
    tag: 'form',
    attributes: { id: 'personal-info-form' },
    parent: profileContainer,
  });

  createElement({
    tag: 'h2',
    text: 'Edit Personal Information',
    classes: ['text-2xl', 'font-nexa-bold', 'mb-6', 'text-gray-700'],
    parent: personalInfoForm,
  });

  const formGrid = createElement({
    tag: 'div',
    classes: ['grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-x-6', 'gap-y-4'], // Adjusted gap
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
  const emailInput = createFormField(
    'Email',
    'email',
    'email',
    customer.email,
    formGrid
  );
  emailInput.classList.add('md:col-span-2');

  const savePersonalInfoButton = createElement({
    tag: 'button',
    text: 'Save Personal Info',
    attributes: { type: 'submit' },
    classes: [
      'mt-6',
      'px-6',
      'py-2.5',
      'bg-gray-700',
      'text-white',
      'font-nexa-bold',
      'rounded-md',
      'hover:bg-gray-900',
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

  personalInfoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    savePersonalInfoButton.textContent = 'Saving...';
    savePersonalInfoButton.setAttribute('disabled', 'true');

    try {
      const currentCustomer = useCustomerStore.getState().customer;
      if (!currentCustomer) {
        addNotification(
          'error',
          'Customer data not found. Please log in again.'
        );
        return;
      }

      const actions = [];
      if (firstNameInput.value !== (currentCustomer.firstName || '')) {
        actions.push({
          action: 'setFirstName',
          firstName: firstNameInput.value,
        });
      }
      if (lastNameInput.value !== (currentCustomer.lastName || '')) {
        actions.push({ action: 'setLastName', lastName: lastNameInput.value });
      }
      if (emailInput.value !== currentCustomer.email) {
        actions.push({ action: 'changeEmail', email: emailInput.value });
      }

      if (actions.length > 0) {
        await AuthService.updateCurrentCustomer(
          currentCustomer.version,
          actions
        );
        addNotification(
          'success',
          'Personal information updated successfully!'
        );
      } else {
        addNotification('info', 'No changes detected in personal information.');
      }
    } catch (error) {
      console.error('Failed to update personal information:', error);
      addNotification(
        'error',
        'Failed to update personal information. Please try again.'
      );
    } finally {
      savePersonalInfoButton.textContent = 'Save Personal Info';
      savePersonalInfoButton.removeAttribute('disabled');
    }
  });

  // Address sections
  createElement({
    tag: 'h2',
    text: 'Addresses',
    classes: ['text-2xl', 'font-nexa-bold', 'mt-10', 'mb-6', 'text-gray-700'], // Increased margin top
    parent: profileContainer,
  });

  const addressesContainer = createElement({
    tag: 'div',
    classes: ['addresses-container', 'mb-4'],
    parent: profileContainer,
  });

  if (customer.addresses && customer.addresses.length > 0) {
    let addressIndex = 0;
    for (const address of customer.addresses) {
      const addressCard = createElement({
        tag: 'div',
        classes: [
          'address-card',
          'p-4',
          'border',
          'border-gray-200',
          'rounded-md',
          'mb-4',
          'font-nexa-light',
        ],
        parent: addressesContainer,
      });

      createElement({
        tag: 'h3',
        text: `Address ${addressIndex + 1}`,
        classes: ['text-lg', 'font-nexa-bold', 'mb-2', 'text-gray-700'],
        parent: addressCard,
      });

      const addressDetails = [
        `Country: ${address.country || 'N/A'}`,
        `City: ${address.city || 'N/A'}`,
        `Street: ${address.streetName || 'N/A'} ${address.streetNumber || ''}`,
        `Postal Code: ${address.postalCode || 'N/A'}`,
      ];

      if (address.firstName || address.lastName) {
        addressDetails.unshift(
          `Name: ${address.firstName || ''} ${address.lastName || ''}`.trim()
        );
      }
      if (address.company) {
        addressDetails.push(`Company: ${address.company}`);
      }
      if (address.phone) {
        addressDetails.push(`Phone: ${address.phone}`);
      }
      if (address.email) {
        addressDetails.push(`Email: ${address.email}`);
      }

      for (const detail of addressDetails) {
        createElement({
          tag: 'p',
          text: detail,
          classes: ['text-sm', 'text-gray-600'],
          parent: addressCard,
        });
      }

      // Add indicators for default addresses
      if (address.id === customer.defaultShippingAddressId) {
        createElement({
          tag: 'span',
          text: 'Default Shipping',
          classes: [
            'text-xs',
            'font-semibold',
            'bg-blue-100',
            'text-blue-800',
            'px-2',
            'py-1',
            'rounded-full',
            'ml-2',
          ],
          parent: addressCard.querySelector('h3') as HTMLElement,
        });
      }
      if (address.id === customer.defaultBillingAddressId) {
        createElement({
          tag: 'span',
          text: 'Default Billing',
          classes: [
            'text-xs',
            'font-semibold',
            'bg-green-100',
            'text-green-800',
            'px-2',
            'py-1',
            'rounded-full',
            'ml-2',
          ],
          parent: addressCard.querySelector('h3') as HTMLElement,
        });
      }
      addressIndex += 1;
    }
  } else {
    createElement({
      tag: 'p',
      text: 'No addresses found.',
      classes: ['text-gray-600', 'font-nexa-light'],
      parent: addressesContainer,
    });
  }

  createElement({
    tag: 'p',
    text: 'Address editing functionality coming soon.',
    classes: ['text-gray-600', 'mb-4', 'mt-4', 'font-nexa-light'],
    parent: profileContainer,
  });

  // TODO:
  // 1. Implement address management (add, edit, remove for shipping & billing).
  // 2. Connect to CustomerService to update details via Commercetools API (partially done for personal info).
  // 3. Add proper form validation (client-side and server-side ideally).
}
