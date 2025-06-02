import { FilterableDropdown } from '../../components/filterable-dropdown/filterable-dropdown';

// Вспомогательные функции для безопасного получения значений
export const getInputValue = (input?: HTMLInputElement): string =>
  input?.value || '';

export const getDropdownValue = (dropdown?: FilterableDropdown): string =>
  dropdown?.getSelectedValue() || '';

export function showFieldError(field: HTMLElement, message: string): void {
  field.textContent = message;
  field.classList.remove('hidden');
}

export function hideFieldError(field: HTMLElement): void {
  field.classList.add('hidden');
}

export function setInputBorder(
  element: HTMLElement | undefined,
  error: boolean
): void {
  if (!element) return;
  if (error) {
    element.classList.add('border-b-red-500');
    element.classList.remove('border-gray-400');
  } else {
    element.classList.remove('border-b-red-500');
    element.classList.add('border-gray-400');
  }
}
