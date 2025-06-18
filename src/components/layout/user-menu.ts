import { gsap } from '../../animations/gsap-init';
import menuArrowImagePath from '../../assets/images/menu-arrow.svg';
import burgerImagePath from '../../assets/images/burger.svg';
import closeDelImagePath from '../../assets/images/close-del.svg';
import { createEl as createElement } from '../../utils/element-utilities';
import { Router } from '../../router/router';
import { AuthService } from '../../services/auth.service';
import { Customer } from '../../store/customer-store';
import { DropdownManager } from '../../components/layout/dropdown-manager';

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
    const itemsToAnimate = [profileLink, ordersLink, logoutButton];
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
      DropdownManager.closeCurrent();
      dropdownMenu.classList.remove('hidden');

      DropdownManager.register(dropdownMenu, hideMenuAndRemoveListener);

      animateDropdownItems();

      handleOutsideClick = (event_: MouseEvent) => {
        if (!dropdownMenu.classList.contains('hidden')) {
          const target = event_.target as Node;
          const isClickOnToggle = userIcon.contains(target);
          const isClickInDropdown = dropdownContainer.contains(target);
          const isClickInUserNav = document
            .getElementById('user_nav')
            ?.contains(target);

          if (
            // Close if clicked outside dropdown container OR
            !isClickInDropdown ||
            // Clicked in user_nav but not on the toggle button
            (isClickInUserNav && !isClickOnToggle)
          ) {
            dropdownMenu.classList.add('hidden');
            document.removeEventListener('click', handleOutsideClick);
          }
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

export function createAboutDropdown(
  aboutIcon: SVGElement,
  dropdownContainer: HTMLElement,
  router: Router
): void {
  aboutIcon.setAttribute('src', burgerImagePath);

  const dropdownMenu = createElement({
    tag: 'div',
    classes: [
      'absolute',
      'w-60',
      'bg-white',
      'shadow-lg',
      'pt-2',
      'z-10',
      'hidden',
      'overflow-hidden',
      '-translate-x-42',
      'about_dropdown',
    ],
    parent: dropdownContainer,
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
        // 'mb-1',
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
        'opacity-0',
      ],
      parent: contentContainer,
    });
    return { wrapper: itemWrapper, link: itemLink };
  };

  createAnimatedMenuItem('Home page', () => {
    router.navigateTo('/');
    hideMenu();
  });

  createAnimatedMenuItem('Catalog', () => {
    router.navigateTo('/catalog');
    hideMenu();
  });

  createAnimatedMenuItem('About shop', () => {
    router.navigateTo('/aboutInfo');
    hideMenu();
  });

  createAnimatedMenuItem('About us', () => {
    router.navigateTo('/aboutUs');
    hideMenu();
  });

  let handleOutsideClick: (event: MouseEvent) => void;

  const hideMenu = () => {
    aboutIcon.setAttribute('src', burgerImagePath);
    if (!dropdownMenu.classList.contains('hidden')) {
      dropdownMenu.classList.add('hidden');
    }
    if (handleOutsideClick) {
      document.removeEventListener('click', handleOutsideClick);
    }
  };

  aboutIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    const isHidden = dropdownMenu.classList.contains('hidden');

    if (isHidden) {
      DropdownManager.closeCurrent();
      dropdownMenu.classList.remove('hidden');
      aboutIcon.setAttribute('src', closeDelImagePath);

      DropdownManager.register(dropdownMenu, hideMenu);

      animateDropdownItems(dropdownMenu);

      handleOutsideClick = (event_: MouseEvent) => {
        if (!dropdownMenu.classList.contains('hidden')) {
          const target = event_.target as Node;
          const isClickOnToggle = aboutIcon.contains(target);
          const isClickInDropdown = dropdownContainer.contains(target);
          const isClickInUserNav = document
            .getElementById('user_nav')
            ?.contains(target);

          if (
            // Close if clicked outside dropdown container OR
            !isClickInDropdown ||
            // Clicked in user_nav but not on the toggle button
            (isClickInUserNav && !isClickOnToggle)
          ) {
            dropdownMenu.classList.add('hidden');
            document.removeEventListener('click', handleOutsideClick);
          }
        }
      };
      setTimeout(
        () => document.addEventListener('click', handleOutsideClick),
        0
      );
    } else {
      hideMenu();
    }
  });

  const animateDropdownItems = (menu: HTMLElement) => {
    const items = menu.querySelectorAll('a');
    gsap.fromTo(
      items,
      { opacity: 0, x: '-100%' },
      { opacity: 1, x: '0%', duration: 0.3, stagger: 0.1, ease: 'power2.out' }
    );
  };
}
