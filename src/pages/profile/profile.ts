import { createEl } from '../../utils/elementUtils';
import { useCustomerStore } from '../../store/customer-store';
import { AuthService } from '../../services/auth.service';
import { addNotification } from '../../store/store';

// Helper function to create form fields
function createFormField(
  labelText: string,
  inputType: string,
  inputId: string,
  initialValue: string,
  parent: HTMLElement,
  required = true
): HTMLInputElement {
  const wrapper = createEl({ tag: 'div', classes: ['mb-4'], parent });
  createEl({
    tag: 'label',
    text: labelText,
    attributes: { for: inputId },
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    parent: wrapper,
  });
  const input = createEl({
    tag: 'input',
    attributes: {
      type: inputType,
      id: inputId,
      name: inputId,
      value: initialValue,
      ...(required && { required: 'true' }),
    },
    classes: [
      'mt-1',
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'shadow-sm',
      'focus:outline-none',
      'focus:ring-indigo-500',
      'focus:border-indigo-500',
      'sm:text-sm',
    ],
    parent: wrapper,
  }) as HTMLInputElement;
  return input;
}

export default function createProfilePage(container: HTMLElement): void {
  container.innerHTML = '';

  const profileContainer = createEl({
    tag: 'div',
    classes: [
      'profile-page',
      'container',
      'mx-auto',
      'p-6',
      'bg-white',
      'rounded-lg',
      'shadow-xl',
    ],
    parent: container,
  });

  createEl({
    tag: 'h1',
    text: 'My Profile',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'mb-8',
      'text-gray-800',
      'text-center',
    ],
    parent: profileContainer,
  });

  const { customer } = useCustomerStore.getState();

  if (!customer) {
    createEl({
      tag: 'p',
      text: 'Please log in to view your profile.',
      classes: ['text-gray-600', 'text-center'],
      parent: profileContainer,
    });
    return;
  }

  // Personal Information Form
  const personalInfoForm = createEl({
    tag: 'form',
    attributes: { id: 'personal-info-form' },
    parent: profileContainer,
  });

  createEl({
    tag: 'h2',
    text: 'Edit Personal Information',
    classes: ['text-2xl', 'font-nexa-bold', 'mb-6', 'text-gray-700'],
    parent: personalInfoForm,
  });

  const formGrid = createEl({
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

  const savePersonalInfoButton = createEl({
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

  // Placeholder for address sections
  createEl({
    tag: 'h2',
    text: 'Addresses',
    classes: ['text-2xl', 'font-nexa-bold', 'mt-10', 'mb-6', 'text-gray-700'], // Increased margin top
    parent: profileContainer,
  });
  createEl({
    tag: 'p',
    text: 'Address editing functionality coming soon.',
    classes: ['text-gray-600', 'mb-4'],
    parent: profileContainer,
  });

  // TODO:
  // 1. Implement address management (display, add, edit, remove for shipping & billing).
  // 2. Connect to CustomerService to update details via Commercetools API (partially done for personal info).
  // 3. Add proper form validation (client-side and server-side ideally).
}
