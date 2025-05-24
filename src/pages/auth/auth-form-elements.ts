import { createEl as createElement } from '../../utils/element-utilities';

export function createPageContainer(parent: HTMLElement) {
  return createElement({
    tag: 'div',
    parent,
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
}

export function createInputField({
  container,
  type,
  id,
  label,
  placeholder,
}: {
  container: HTMLElement;
  type: string;
  id: string;
  label: string;
  placeholder: string;
}) {
  const fieldContainer = createElement({
    tag: 'div',
    parent: container,
    classes: ['mb-4'],
  });

  createElement({
    tag: 'label',
    text: label,
    parent: fieldContainer,
    classes: ['block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1'],
    attributes: { for: id },
  });

  const input = createElement({
    tag: 'input',
    parent: fieldContainer,
    classes: [
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
    ],
    attributes: { type, id, placeholder },
  }) as HTMLInputElement;

  const error = createElement({
    tag: 'p',
    parent: fieldContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  return { fieldContainer, input, error };
}
