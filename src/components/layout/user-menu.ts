import { gsap } from '../../animations/gsap-init';
import menuArrowImagePath from '../../assets/images/menu-arrow.svg';
import { createEl as createElement } from '../../utils/element-utilities';
import { Router } from '../../router/router';
import { AuthService } from '../../services/auth.service';
import { Customer } from '../../store/customer-store';

interface UserMenuElements {
  dropdownMenu: HTMLElement;
  profileLink: HTMLElement;
  ordersLink: HTMLElement;
  logoutButton: HTMLElement;
}

export function createUserDropdown(
  userIcon: SVGElement,
  // userIcon: HTMLElement,
  dropdownContainer: HTMLElement,
  router: Router,
  customer: Customer,
  userNavForLogout: HTMLElement,
  updateUserNavOnHeaderCallback: (userNav: HTMLElement, router: Router) => void
): UserMenuElements {
  const dropdownMenu = createElement({
    tag: 'div',
    classes: [
      'absolute',
      'w-60',
      'bg-white',
      'shadow-lg',
      'py-1',
      'z-10',
      'hidden', // Initially hidden
      'overflow-hidden',
      '-translate-x-19',
      'my_cocpit',
    ],
    parent: dropdownContainer,
  });

  const greetingContainer = createElement({
    tag: 'p',
    classes: [
      'block',
      'px-4',
      'pt-10',
      'mx-2',
      'mb-1',
      'text-2xl',
      '-translate-x-2',
      'text-gray-700',
    ],
    parent: dropdownMenu,
  });

  createElement({
    tag: 'span',
    text: 'Hi, ',
    classes: ['font-nexa-light'], // Nexa Light
    parent: greetingContainer,
  });

  createElement({
    tag: 'span',
    text: `${customer.firstName || customer.email}`,
    classes: ['name-usr-bold'], // Nexa Bold
    parent: greetingContainer,
  });

  createElement({
    tag: 'span',
    text: '!',
    classes: ['font-nexa-light'], // Nexa Light
    parent: greetingContainer,
  });

  createElement({
    tag: 'hr',
    classes: ['my-1', 'border-gray-400'],
    parent: dropdownMenu,
  });

  const createAnimatedMenuItem = (
    text: string,
    onClick: () => void
  ): { wrapper: HTMLElement; link: HTMLElement } => {
    const itemWrapper = createElement({
      tag: 'div',
      classes: [
        'relative',
        'group',
        'overflow-hidden',
        'mx-2',
        'mb-1',
        'cursor-pointer',
      ],
      parent: dropdownMenu,
    });
    itemWrapper.addEventListener('click', onClick);

    const contentContainer = createElement({
      tag: 'div',
      classes: [
        'relative',
        'flex',
        'items-center',
        '-translate-x-8',
        'transition-transform',
        'duration-300',
        'ease-in-out',
        'group-hover:translate-x-0',
      ],
      parent: itemWrapper,
    });

    createElement({
      tag: 'img',
      attributes: { src: menuArrowImagePath, alt: 'arrow' },
      classes: ['w-8', 'h-8', '-translate-y-1', 'mr-2', 'flex-shrink-0'],
      parent: contentContainer,
    });

    const itemLink = createElement({
      tag: 'a',
      text,
      classes: [
        'block',
        'py-1',
        'pr-4',
        'text-2xl',
        'text-gray-700',
        'opacity-0', // Initial state for GSAP animation (fade in)
      ],
      parent: contentContainer,
    });
    return { wrapper: itemWrapper, link: itemLink }; // link is still used for GSAP animation target
  };

  const homeMenuItem = createAnimatedMenuItem('Home page', () => {
    router.navigateTo('/main');
    hideMenuAndRemoveListener();
  });
  const catalogMenuItem = createAnimatedMenuItem('Catalog', () => {
    router.navigateTo('/catalog');
    hideMenuAndRemoveListener();
  });
  const aboutMenuItem = createAnimatedMenuItem('About us', () => {
    router.navigateTo('/aboutUs');
    hideMenuAndRemoveListener();
    location.reload();
  });

  createElement({
    tag: 'hr',
    classes: ['my-1', 'border-gray-400'],
    parent: dropdownMenu,
  });

  const profileMenuItem = createAnimatedMenuItem('My profile', () => {
    router.navigateTo('/profile');
    hideMenuAndRemoveListener();
  });
  const ordersMenuItem = createAnimatedMenuItem('My orders', () => {
    router.navigateTo('/orders');
    hideMenuAndRemoveListener();
  });

  const profileLink = profileMenuItem.link;
  const ordersLink = ordersMenuItem.link;

  createElement({
    tag: 'hr',
    classes: ['my-1', 'border-gray-400'],
    parent: dropdownMenu,
  });

  const logoutButtonWrapper = createElement({
    tag: 'div',
    classes: [
      'relative',
      'group',
      'overflow-hidden',
      'mx-2',
      'mb-1',
      'cursor-pointer',
    ],
    parent: dropdownMenu,
  });
  logoutButtonWrapper.addEventListener('click', async () => {
    await AuthService.logout();
    updateUserNavOnHeaderCallback(userNavForLogout, router);
    router.navigateTo('/');
    hideMenuAndRemoveListener();
  });

  const logoutContentContainer = createElement({
    tag: 'div',
    classes: [
      'relative',
      'flex',
      'items-center',
      '-translate-x-8',
      'transition-transform',
      'duration-300',
      'ease-in-out',
      'group-hover:translate-x-0', // Slide in on hover
    ],
    parent: logoutButtonWrapper,
  });

  createElement({
    tag: 'img',
    attributes: { src: menuArrowImagePath, alt: 'arrow' },
    classes: ['w-8', 'h-8', '-translate-y-0', 'mr-2', 'flex-shrink-0'],
    parent: logoutContentContainer,
  });

  const logoutButton = createElement({
    tag: 'a',
    text: 'Logout',
    classes: [
      'block',
      'pt-2',
      'pr-4',
      'text-2xl',
      'text-gray-700',
      'opacity-0', // Initial state for GSAP animation
    ],
    parent: logoutContentContainer,
  });

  const animateDropdownItems = () => {
    const itemsToAnimate = [
      homeMenuItem.link,
      catalogMenuItem.link,
      aboutMenuItem.link,
      profileLink,
      ordersLink,
      logoutButton,
    ];
    gsap.fromTo(
      itemsToAnimate,
      { opacity: 0, x: '-100%' },
      { opacity: 1, x: '0%', duration: 0.3, stagger: 0.1, ease: 'power2.out' }
    );
  };

  let handleOutsideClick: (event: MouseEvent) => void;

  const hideMenuAndRemoveListener = () => {
    if (!dropdownMenu.classList.contains('hidden')) {
      dropdownMenu.classList.add('hidden');
    }
    if (handleOutsideClick) {
      document.removeEventListener('click', handleOutsideClick);
    }
  };

  userIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    const isHidden = dropdownMenu.classList.contains('hidden');

    if (isHidden) {
      dropdownMenu.classList.remove('hidden');
      animateDropdownItems();

      handleOutsideClick = (event_: MouseEvent) => {
        if (
          !dropdownContainer.contains(event_.target as Node) &&
          !dropdownMenu.classList.contains('hidden')
        ) {
          dropdownMenu.classList.add('hidden');
          document.removeEventListener('click', handleOutsideClick);
        }
      };
      setTimeout(
        () => document.addEventListener('click', handleOutsideClick),
        0
      );
    } else {
      dropdownMenu.classList.add('hidden');
      if (handleOutsideClick) {
        document.removeEventListener('click', handleOutsideClick);
      }
    }
  });

  return { dropdownMenu, profileLink, ordersLink, logoutButton };
}
