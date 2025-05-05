import { createEl } from '../../utils/elementUtils';
import createButton from '../../components/ui/button/button';
import { createCommerceTestComponent } from '../../components/test/CommerceTest';
import { getRouter } from '../../router/router';

export function createHomePage(container: HTMLElement): void {
  const homeContainer = createEl({
    tag: 'div',
    parent: container,
    classes: ['home-page', 'max-w-4xl', 'mx-auto', 'p-4'],
  });

  const header = createEl({
    tag: 'header',
    parent: homeContainer,
    classes: ['mb-8'],
  });

  createEl({
    tag: 'h1',
    text: 'E-commerce App',
    parent: header,
    classes: [
      'font-mono',
      'text-3xl',
      'font-bold',
      'text-blue-600',
      'bg-yellow-200',
      'p-4',
      'mb-4',
      'rounded-lg',
    ],
  });

  createEl({
    tag: 'p',
    text: 'Welcome to our e-commerce platform powered by Commercetools',
    parent: header,
    classes: [
      'font-serif',
      'text-lg',
      'text-center',
      'italic',
      'text-gray-500',
      'bg-gray-100',
      'p-2',
      'rounded',
    ],
  });

  const buttonContainer = createEl({
    tag: 'div',
    parent: homeContainer,
    classes: ['flex', 'justify-center', 'my-6'],
  });

  const loginButton = createButton(
    'Login',
    buttonContainer,
    ['bg-blue-500', 'text-white', 'hover:bg-blue-600', 'px-6', 'py-2']
  );

  loginButton.addEventListener('click', () => {
    getRouter().navigateTo('/login');
  });

  createCommerceTestComponent(homeContainer);
}

export default createHomePage;
