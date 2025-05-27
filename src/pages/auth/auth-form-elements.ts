import {
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';

import createButton from '../../components/layout/button/button';

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

export function createTitleLogin(parent: HTMLElement) {
  return createElement({
    tag: 'h1',
    text: 'Login',
    parent,
    classes: [
      'text-2xl',
      'font-bold',
      'mb-6',
      'z-30',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      'before:w-20',
      'before:bg-yellow-400',
      'before:-z-1',
      'login-name',
    ],
  });
}

// function createTitle(
//   text: string,
//   parent: HTMLElement,
//   addClasses: string[] = []
//   // tag = 'h1'
// ): HTMLHeadElement {
//   return createElement({
//     tag: 'h1',
//     text,
//     parent,
//     classes: [
//       'text-3xl',
//       'font-bold',
//       'z-1',
//       'text-center',
//       'text-gray-800',
//       "before:content-['']",
//       'before:absolute',
//       'before:h-6',
//       // 'before:w-full',
//       'before:w-[calc(100%+0.8rem)]',
//       'before:bg-yellow-400',
//       'before:-z-1',
//       'absolute',
//       'top-11',
//       // 'top-6',
//       'left-1/2',
//       '-translate-x-1/2',
//       'login-name',
//       ...addClasses,
//     ],
//   }) as HTMLHeadElement;
// }

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

/**************************************************** */

export function createPasswordField({
  container,
  id,
  placeholder,
}: {
  container: HTMLElement;
  id: string;
  placeholder: string;
}) {
  const fieldContainer = createElement({
    tag: 'div',
    parent: container,
    classes: ['mb-4'],
  });

  createElement({
    tag: 'label',
    text: 'Password',
    parent: fieldContainer,
    classes: ['block', 'text-sm', 'font-large', 'text-gray-700', 'mb-1'],
    attributes: { for: id },
  });

  const inputContainer = createElement({
    parent: fieldContainer,
    classes: ['relative'],
  });

  const input = createElement({
    tag: 'input',
    parent: inputContainer,
    classes: [
      'w-full',
      'px-3',
      'py-2',
      'border-b-1',
      'border-gray-400',
      'mb-2',
      // 'border-gray-300',
      'focus:outline-none',
      'focus:pb-2',
      'focus:mb-1',
      'pr-8',
    ],
    attributes: {
      type: 'password',
      id,
      placeholder,
    },
  }) as HTMLInputElement;

  createEyeToggleButton(inputContainer, input);
  // const eyeButton = createEyeToggleButton(inputContainer, input);
  const error = createElement({
    tag: 'p',
    parent: fieldContainer,
    classes: ['mt-1', 'text-sm', 'text-red-600', 'hidden'],
  });

  return { input, error };
}

function createEyeToggleButton(
  container: HTMLElement,
  input: HTMLInputElement
) {
  const button = createElement({
    tag: 'button',
    parent: container,
    classes: ['button-eye'],
    attributes: { type: 'button', 'aria-label': 'Toggle password visibility' },
  });

  const eyeInvisible = createSvgUse('#eye-invisible', 'eye');
  const eyeVisible = createSvgUse('#eye-visible', 'eye');

  button.append(eyeInvisible, eyeVisible);
  eyeInvisible.classList.add('eye_active');

  button.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    eyeInvisible.classList.toggle('eye_active');
    eyeVisible.classList.toggle('eye_active');
  });

  return button;
}

/******************************************* */

export function createLoginButton(container: HTMLElement) {
  const loginButton = createButton('Login', container, [
    'w-full',
    'bg-gray-800',
    'text-white',
    'hover:bg-gray-900',
    'py-2',
    'cursor-pointer',
    'relative',
  ]);

  const svgSpinner = createSvgUse('#spinner', 'spinner');
  svgSpinner.classList.add('animate-spin');
  loginButton.prepend(svgSpinner);

  return { loginButton, svgSpinner };
}

/****************************************** */

export function createRegisterLink(parent: HTMLElement) {
  const container = createElement({
    tag: 'div',
    parent,
    classes: ['mt-4', 'text-center'],
  });

  createElement({
    tag: 'p',
    text: "Don't have an account? ",
    parent: container,
    classes: ['text-sm', 'text-gray-600'],
  });

  return createElement({
    tag: 'a',
    text: 'Register',
    parent: container,
    classes: [
      'text-sm',
      'text-gray-900',
      'hover:text-gray-700',
      'cursor-pointer',
    ],
  });
}
