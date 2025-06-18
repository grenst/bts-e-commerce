import './header.scss';
import { gsap } from '../../../animations/gsap-init';
// import logoImagePath from '../../../assets/images/logo.webp';
import {
  body,
  createEl as createElement,
  createSvgUse,
  removeAllChild,
} from '../../../utils/element-utilities';
import { closeOpenModal } from '../../../utils/modal-utils'; // Import shared modal function
import { useTokenStore } from '../../../store/token-store';
import { useCustomerStore } from '../../../store/customer-store';
import { Router } from '../../../router/router';
import { createUserDropdown, createAboutDropdown } from '../user-menu';

interface HeaderElements {
  header: HTMLElement;
  mainTitle: HTMLElement;
  userNav: HTMLElement;
}

export function createHeaderElements(
  router: Router
  // parent: HTMLElement
): HeaderElements {
  const header = createElement({
    tag: 'header',
    classes: [
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'flex',
      'justify-between',
      'items-center',
      'min-h-10',
      'px-10',
      'bg-white/50',
      'w-full',
      'transition-colors',
      'duration-300',
      'z-[101]', // Increased z-index to appear above modals
      'header-color',
      'max-[580px]:px-2',
    ],
    // parent,
    parent: body,
  });

  // Add event listener to handle modal state on header background clicks
  header.addEventListener('click', (event) => {
    // Only close modal if clicking directly on header background
    if (event.target === header) {
      closeOpenModal();
    }
  });

  // const logoImg = createElement({
  //   tag: 'img',
  //   attributes: {
  //     src: logoImagePath,
  //     alt: 'Bubble Tee Shop Logo',
  //   },
  //   classes: ['h-[28px]', 'w-[30px]', 'flex-shrink-0', 'cursor-pointer'],
  //   parent: header,
  // });

  const logoImg = createSvgUse('#logo', 'header-logo');
  header.append(logoImg);

  logoImg.addEventListener('click', () => {
    router.navigateTo('/');
  });

  const mainTitle = createElement({
    tag: 'h1',
    attributes: { id: 'main-title' },
    classes: [
      'text-3xl',
      'font-impact',
      'text-gray-800',
      'flex-grow',
      'text-start',
      'text-justify',
      'pt-3',
      'min-[780px]:w-[320px]',
      'min-[780px]:text-lg',
    ],
    parent: header,
  });

  const textNodeBefore = document.createTextNode('Bubble ');
  const spanElement = createElement({ tag: 'span', text: 'Tea' });
  const textNodeAfter = document.createTextNode(' Store');

  mainTitle.append(textNodeBefore);
  mainTitle.append(spanElement);
  mainTitle.append(textNodeAfter);

  gsap.from(mainTitle, {
    duration: 1,
    opacity: 0,
    x: -30,
    ease: 'power3.out',
    delay: 0.5,
  });

  // Create navigation links
  const navContainer = createElement({
    tag: 'nav',
    classes: ['header-nav', 'flex-grow', 'flex', 'justify-start'],
    parent: header,
  });

  const ul = createElement({
    tag: 'ul',
    classes: ['flex', 'gap-4'],
    parent: navContainer,
  });

  const links = [
    { text: 'Home', href: '/main' },
    { text: 'Catalog', href: '/catalog' },
    { text: 'About Us', href: '/aboutUs' },
    { text: 'Cart', href: '/cart' },
  ];

  links.forEach((link) => {
    const li = createElement({ tag: 'li' });
    const a = createElement({
      tag: 'a',
      text: link.text,
      attributes: { href: link.href },
      classes: ['text-gray-800', 'hover:text-gray-600', 'cursor-pointer'],
    });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigateTo(link.href);
    });
    li.append(a);
    ul.append(li);
  });

  const userNav = createElement({
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

  const userActionsContainer = createElement({
    classes: ['flex', 'items-center', 'gap-4'],
    parent: userNav,
  });

  if (accessToken && customer) {
    const dropdownContainer = createElement({
      classes: ['relative'],
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
  } else {
    // For unauthorized users: show direct login link (without person icon)
    const loginLink = createElement({
      tag: 'a',
      text: 'Login',
      classes: [
        'block',
        // 'px-4',
        'py-2',
        'text-sm',
        'text-gray-700',
        'hover:bg-gray-100',
        'cursor-pointer',
      ],
      parent: userActionsContainer,
    });
    loginLink.addEventListener('click', () => {
      router.navigateTo('/login');
    });
  }

  const cartContainer = createElement({
    classes: ['relative'],
    parent: userActionsContainer,
  });

  const cartLink = createSvgUse('#cart', 'header-link');
  cartContainer.append(cartLink);
  cartLink.addEventListener('click', () => router.navigateTo('/cart'));

  const cartQty = createElement({
    tag: 'p',
    text: '0',
    classes: [
      'in_cart_number',
      'absolute',
      'top-0',
      'right-0',
      'transform',
      'translate-x-1/2',
      '-translate-y-1/2',
      'text-md',
      'text-white',
      'bg-gray-900',
      'rounded-full',
      'min-w-[20px]',
      'text-center',
      'hidden'
    ],
    parent: cartContainer,
  });
  
  // Function to update cart quantity display
  const updateCartQty = (quantity: number) => {
    cartQty.textContent = quantity.toString();
    if (quantity === 0) {
      cartQty.classList.add('hidden');
    } else {
      cartQty.classList.remove('hidden');
    }
  };
  
  // Get initial cart quantity
  import('../../../api/cart/cart-service').then((cartModule) => {
    cartModule.getOrCreateCart().then(cart => {
      const totalQty = cart.lineItems.reduce((sum, item) => sum + item.quantity, 0);
      updateCartQty(totalQty);
    });
  });
  
  // Subscribe to cart updates
  window.addEventListener('cartUpdated', (event: Event) => {
    const customEvent = event as CustomEvent<{totalQty: number}>;
    updateCartQty(customEvent.detail.totalQty);
  });

  const aboutDropdownContainer = createElement({
    classes: ['relative'],
    parent: userActionsContainer,
  });

  const aboutLink = createSvgUse('#burger', 'header-link');
  aboutLink.classList.add('about-icon');
  aboutDropdownContainer.append(aboutLink);

  // Add event listeners to toggle the about icon
  aboutLink.addEventListener('click', () => {
    const useElement = aboutLink.querySelector('use');
    if (useElement) {
      const currentIcon = useElement.getAttribute('xlink:href');
      useElement.setAttribute(
        'xlink:href',
        currentIcon === '#burger' ? '#close-del' : '#burger'
      );
    }
  });

  createAboutDropdown(aboutLink, aboutDropdownContainer, router);
}
