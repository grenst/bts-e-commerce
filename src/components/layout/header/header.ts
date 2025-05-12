import './header.scss';
import { gsap } from '../../../animations/gsap-init';
import logoImagePath from '../../../assets/images/logo.webp';
import {
  body,
  createEl,
  createSvgUse,
  removeAllChild,
} from '../../../utils/elementUtils';
import { useTokenStore } from '../../../store/token-store';
import { useCustomerStore } from '../../../store/customer-store';
import { Router } from '../../../router/router';
import { createUserDropdown } from '../user-menu';

interface HeaderElements {
  header: HTMLElement;
  mainTitle: HTMLElement;
  userNav: HTMLElement;
}

export function createHeaderElements(router: Router): HeaderElements {
  const header = createEl({
    tag: 'header',
    classes: [
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'flex',
      'justify-between',
      'items-center',
      'h-10',
      'px-10',
      'bg-white/50',
      'w-full',
      'transition-colors',
      'duration-300',
      'z-10',
    ],
    parent: body,
  });

  const logoImg = createEl({
    tag: 'img',
    attributes: {
      src: logoImagePath,
      alt: 'Bubble Tee Shop Logo',
    },
    classes: ['h-[28px]', 'w-[30px]', 'flex-shrink-0', 'cursor-pointer'],
    parent: header,
  });

  logoImg.addEventListener('click', () => {
    router.navigateTo('/');
  });

  const mainTitle = createEl({
    tag: 'h1',
    attributes: { id: 'main-title' },
    text: 'Bubble Tea Store',
    classes: [
      'text-3xl',
      'font-impact',
      'text-gray-800',
      'flex-grow',
      'text-start',
      'text-justify',
      'pt-3',
    ],
    parent: header,
  });

  gsap.from(mainTitle, {
    duration: 1,
    opacity: 0,
    x: -30,
    ease: 'power3.out',
    delay: 0.5,
  });

  const userNav = createEl({
    tag: 'div',
    attributes: { id: 'user_nav' },
    classes: ['flex', 'items-center', 'gap-4', 'relative', 'flex-shrink-0'],
    parent: header,
  });

  return { header, mainTitle, userNav };
}

export function updateUserNavOnHeader(
  userNav: HTMLElement,
  router: Router
): void {
  removeAllChild(userNav);

  const { accessToken } = useTokenStore.getState();
  const { customer } = useCustomerStore.getState();

  if (accessToken && customer) {
    const userActionsContainer = createEl({
      // tag: 'div',
      classes: ['flex', 'items-center', 'gap-4'],
      parent: userNav,
    });

    const dropdownContainer = createEl({
      // tag: 'div',
      classes: ['relative'], // Removed 'group'
      parent: userActionsContainer,
    });

    const userLink = createSvgUse('#person', 'header-link');
    dropdownContainer.append(userLink);

    // Create and manage the dropdown menu using the new module
    createUserDropdown(
      userLink,
      dropdownContainer,
      router,
      customer,
      userNav,
      updateUserNavOnHeader
    );

    const cartLink = createSvgUse('#cart', 'header-link');
    const aboutLink = createSvgUse('#about', 'header-link');

    userActionsContainer.append(cartLink);
    userActionsContainer.append(aboutLink);

    aboutLink.classList.add('about-icon');

    cartLink.addEventListener('click', () => router.navigateTo('/cart'));
  } else {
    const loginLink = createEl({
      tag: 'a',
      text: 'Login',
      classes: [
        'text-md',
        'text-gray-900',
        'hover:text-gray-700',
        'cursor-pointer',
      ],
      parent: userNav,
    });
    loginLink.addEventListener('click', () => {
      router.navigateTo('/login');
    });
  }
}
