import './error-page.scss';
import {
  createEl as createElement,
  removeAllChild,
} from '../../utils/element-utilities';
import createButton from '../../components/layout/button/button';
import { getRouter } from '../../router/router';

export default function createErrorPage(container: HTMLElement): void {
  removeAllChild(container);

  const contentContainer = createElement({
    tag: 'div',
    classes: [
      'container',
      'mx-auto',
      'bg-white',
      'rounded-lg',
      'shadow-xl',
      'p-6',
      'relative',
      'flex',
      'error-page',
    ],
    parent: container,
  });

  createElement({
    tag: 'h1',
    text: 'Error\u00A0Page',
    // text: 'Error Page',
    classes: [
      'text-3xl',
      'font-bold',
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
      'top-6',
      'left-1/2',
      '-translate-x-1/2',
      'login-name',
    ],
    parent: contentContainer,
  });

  createElement({
    tag: 'p',
    text: `404. This address doesn't exist. Please check the URL or return to the homepage.`,
    classes: ['text-gray-600', 'mb-8', 'text-center', 'font-bold', 'text-2xl'],
    parent: contentContainer,
  });

  const goToMainButton = createButton('Go to main page', contentContainer, [
    'w-full',
    'bg-gray-800',
    'text-white',
    'hover:bg-gray-900',
    'py-2',
    'cursor-pointer',
    'relative',
  ]);

  goToMainButton.addEventListener('click', () =>
    getRouter().navigateTo('/main')
  );
}
