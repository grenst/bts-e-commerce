import './error-page.scss';
import {
  createEl as createElement,
  removeAllChild,
} from '../../utils/element-utilities';
import createTitle from '../../components/layout/title/title';
// import createButton from '../../components/layout/button/button';
import { getRouter } from '../../router/router';

export default function createErrorPage(container: HTMLElement): void {
  removeAllChild(container);

  const contentContainer = createElement({
    tag: 'div',
    classes: [
      // 'container',
      // 'w-full',
      // 'mx-auto',
      'max-[550px]:bg-[linear-gradient(to_left,rgba(255,255,255,0.7)_0%,rgba(255,255,255,1)_15%,rgba(255,255,255,1)_85%,rgba(255,255,255,0.7)_100%)]',
      'bg-[linear-gradient(to_left,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_75%,rgba(255,255,255,0)_100%)]',
      // 'rounded-lg',
      // 'shadow-xl',
      // 'p-6',
      'relative',
      'flex',
      'error-page',
      // 'h-[calc(100dvh-250px)]',
      // 'max-[567px]:h-[calc(100dvh-347px)]',
    ],
    parent: container,
  });

  createTitle('Error\u00A0Page', contentContainer);

  const errorText = createElement({
    tag: 'div',
    classes: [
      'flex',
      'flex-col',
      'justify-around',
      'items-center',
      'error_text_404',
      'text-gray-600',
      'mb-8',
      'px-4',
      'text-center',
      'font-bold',
      'text-2xl',
    ],
    parent: contentContainer,
  });

  createElement({
    tag: 'p',
    text: `404. This address doesn't exist.`,
    // classes: ['max-[500px]:font-thin'],
    parent: errorText,
  });

  createElement({
    tag: 'p',
    text: `Please check the URL or return to the homepage.`,
    // classes: ['max-[500px]:font-thin', 'max-[450px]:text-left'],
    parent: errorText,
  });

  createElement({
    tag: 'div',
    classes: ['img404'],
    parent: contentContainer,
  });

  const goToMainButtonRelative = createElement({
    parent: contentContainer,
    text: 'Go to main page',
    classes: [
      'border',
      'p-2',
      'rounded-sm',
      'w-80%',
      'flex-none',
      'bg-gray-800',
      'text-white',
      'py-2',
      'mt-6',
      'mx-10',
      'relative',
      'text-center',
      'max-[450px]:text-left',
      'px-4',
      'button-fon',
    ],
  });

  const goToMainButton = createElement({
    tag: 'button',
    parent: goToMainButtonRelative,
    classes: ['button-cover'],
    attributes: { type: 'button' },
  });

  goToMainButton.addEventListener('click', () =>
    getRouter().navigateTo('/main')
  );
}
