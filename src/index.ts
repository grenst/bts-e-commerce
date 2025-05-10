import { Buffer } from 'buffer/';
interface WindowWithBuffer extends Window {
  Buffer: typeof Buffer;
}

(window as unknown as WindowWithBuffer).Buffer = Buffer;
import '@styles/global.scss';
import '@styles/tailwind.css';
import './animations/gsap-init'; // Initialize GSAP and plugins
import { gsap, setupBackgroundAnimations } from './animations/gsap-init'; // Import gsap and setup function
import logoImagePath from './assets/images/logo.webp';
import circleBg1Path from './assets/images/circle_bg_1.webp';
import circleBg2Path from './assets/images/circle_bg_2.webp';
import circleBg3Path from './assets/images/circle_bg_3.webp';
import circleBg4Path from './assets/images/circle_bg_4.webp';

import svgSpriteElement from './sources/svg-sprite';
import createFooter from './components/layout/footer/footer';
import { body, createEl } from './utils/elementUtils';
import { useTokenStore } from '../src/store/token-store';
import { useCustomerStore } from '../src/store/customer-store';
import { createRouter, Route } from './router/router';
import createHomePage from './pages/home/home';
import createLoginPage from './pages/auth/auth-page';
import createProfilePage from './pages/profile/profile'; // Placeholder for now
import { AuthService } from '../src/services/auth.service';
// Import for a potential cart page (though not creating it now)
// import createCartPage from './pages/cart/cart';
import {
  createNotificationsContainer,
  createLoadingIndicator,
  addNotification,
} from './store/store';

// --- Animated Background Container ---
const animatedBackgroundContainer = createEl({
  tag: 'div',
  attributes: { id: 'animated-background-container' },
  classes: [
    'fixed',
    'top-0',
    'left-0',
    'w-screen',
    'h-screen',
    'z-[-1]',
    'overflow-hidden',
    'flex',
    'items-center',
    'justify-center',
  ],
  parent: body,
});

// --- Background Circle Bubble Images ---
const bgCircleImagesData = [
  { id: 'bg-circle-4', src: circleBg4Path, alt: 'Background Circle 4' },
  { id: 'bg-circle-3', src: circleBg3Path, alt: 'Background Circle 3' },
  { id: 'bg-circle-2', src: circleBg2Path, alt: 'Background Circle 2' },
  { id: 'bg-circle-1', src: circleBg1Path, alt: 'Background Circle 1' },
];

bgCircleImagesData.forEach(imgData => {
  createEl({
    tag: 'img',
    attributes: {
      id: imgData.id,
      src: imgData.src,
      alt: imgData.alt,
    },
    parent: animatedBackgroundContainer,
  });
});

// --- Losung Text ---
const bgLosung = createEl({
  tag: 'div',
  attributes: { id: 'bg-losung' },
  classes: [
    'px-4',
    'pb-16',
    'bg-transparent',
    'rounded-md',
    'text-center',
    'max-w-md',
    'z-30',
  ],
  parent: animatedBackgroundContainer,
});

// Create and animate lines for bgLosung
const losungTextLines = [
  'Your market',
  'for a world in',
  'freshness crisis.',
];
const animatedLineElements: HTMLElement[] = [];

losungTextLines.forEach((text) => {
  const lineContainer = createEl({
    tag: 'div',
    classes: [
      'overflow-hidden',
      'relative',
      'leading-8',
    ],
    parent: bgLosung,
  });

  const textElement = createEl({
    tag: 'span',
    text,
    classes: [
      'text-black',
      'inline-block',
      'whitespace-nowrap',
    ],
    parent: lineContainer,
  });
  animatedLineElements.push(textElement);
});

if (animatedLineElements.length > 0) {
  gsap.fromTo(
    animatedLineElements,
    { yPercent: 120 },
    {
      yPercent: 0,
      stagger: 0.25,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.3,
    },
  );
}

setupBackgroundAnimations();

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
    'px-4',
    'bg-white/50',
    'w-full',
    'transition-colors',
    'duration-300',
    'z-10',
  ],
  parent: body,
});

const container = createEl({
  tag: 'div',
  classes: ['max-w-4xl', 'py-4', 'mx-auto', 'relative', 'z-[1]', 'mt-[80px]'],
  parent: body,
});

// Logo
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
  attributes: { id: 'main-title' }, // Added ID for GSAP
  text: 'Bubble Tea Shop',
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

// Animate the main title
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
  classes: [
    'flex',
    'items-center',
    'gap-4',
    'relative',
    'flex-shrink-0',
  ],
  parent: header,
});

const contentContainer = createEl({
  tag: 'main',
  classes: ['min-h-[60vh]'],
  parent: container,
});

const router = createRouter(contentContainer);

const routes: Route[] = [
  {
    path: '/',
    component: createHomePage,
  },
  {
    path: '/login',
    component: createLoginPage,
  },
  {
    path: '/cart',
    component: () => {
      // Placeholder for cart page
      const cartPage = createEl({
        tag: 'div',
        text: 'Cart Page - Coming Soon!',
      });
      contentContainer.innerHTML = '';
      contentContainer.append(cartPage);
      return cartPage;
    },
  },
  {
    path: '/profile',
    component: createProfilePage,
  },
];

routes.forEach((route) => router.addRoute(route));

export function updateAuthStatus(): void {
  userNav.innerHTML = '';
  const { accessToken } = useTokenStore.getState();
  const { customer } = useCustomerStore.getState();

  if (accessToken && customer) {
    const userActionsContainer = createEl({
      tag: 'div',
      classes: ['flex', 'items-center', 'gap-4'],
      parent: userNav,
    });

    const dropdownContainer = createEl({
      tag: 'div',
      classes: ['relative', 'group'],
      parent: userActionsContainer,
    });

    createEl({
      tag: 'span',
      text: `Hi, ${customer.firstName || customer.email}!`,
      classes: [
        'text-sm',
        'text-gray-700',
        'cursor-pointer',
        'hover:text-blue-600',
      ],
      parent: dropdownContainer,
    });

    const dropdownMenu = createEl({
      tag: 'div',
      classes: [
        'absolute',
        // 'mt-1',
        'w-32',
        'bg-gray-100',
        'rounded-md',
        'shadow-lg',
        'py-1',
        'z-10',
        'hidden',
        'group-hover:block',
      ],
      parent: dropdownContainer,
    });

    const profileLink = createEl({
      tag: 'a',
      text: 'My profile',
      classes: [
        'block',
        'px-4',
        'py-2',
        'mx-2',
        'mb-1',
        'rounded-md',
        'text-sm',
        'text-gray-700',
        'transition',
        'duration-500',
        'hover:bg-gray-400',
        'cursor-pointer',
      ],
      parent: dropdownMenu,
    });
    profileLink.addEventListener('click', () => router.navigateTo('/profile'));

    const ordersLink = createEl({
      tag: 'a',
      text: 'My orders',
      classes: [
        'block',
        'px-4',
        'py-2',
        'mx-2',
        'mb-1',
        'rounded-md',
        'text-sm',
        'text-gray-700',
        'transition',
        'duration-500',
        'hover:bg-gray-400',
        'hover:bg-gray-400',
        'hover:bg-gray-400',
        'cursor-pointer',
      ],
      parent: dropdownMenu,
    });
    ordersLink.addEventListener('click', () => router.navigateTo('/orders'));

    createEl({
      tag: 'hr',
      classes: ['my-1', 'border-gray-200'],
      parent: dropdownMenu,
    });

    const logoutButton = createEl({
      tag: 'a',
      text: 'Logout',
      classes: [
        'block',
        'px-4',
        'py-2',
        'mx-2',
        'mb-1',
        'rounded-md',
        'text-sm',
        'transition',
        'duration-500',
        'text-gray-700',
        'hover:bg-gray-400',
        'cursor-pointer',
      ],
      parent: dropdownMenu,
    });
    logoutButton.onclick = async () => {
      await AuthService.logout();
      updateAuthStatus();
      router.navigateTo('/');
    };

    const cartLink = createEl({
      tag: 'a',
      text: '🛒 Cart',
      classes: [
        'text-sm',
        'text-blue-500',
        'hover:text-blue-700',
        'cursor-pointer',
      ],
      parent: userActionsContainer,
    });
    cartLink.addEventListener('click', () => router.navigateTo('/cart'));
  } else {
    const loginLink = createEl({
      tag: 'a',
      text: 'Login',
      classes: [
        'text-sm',
        'text-blue-500',
        'hover:text-blue-700',
        'cursor-pointer',
      ],
      parent: userNav,
    });
    loginLink.addEventListener('click', () => {
      router.navigateTo('/login');
    });
  }
}

updateAuthStatus();

svgSpriteElement();

// --- footer
createFooter(body);

createNotificationsContainer(body);
createLoadingIndicator(body);

addNotification('info', 'Welcome to the E-commerce App!');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('bg-transparent');
    header.classList.remove('bg-white/50');
    mainTitle.classList.add('text-xl');
    mainTitle.classList.remove('text-5xl');
    mainTitle.classList.remove('text-center');
    mainTitle.classList.add('text-left');
    // mainTitle.classList.remove('flex-grow'); // Move title towards logo
  } else {
    header.classList.remove('bg-transparent');
    header.classList.add('bg-white/50');
    mainTitle.classList.add('text-center');
    mainTitle.classList.remove('text-left');
    mainTitle.classList.add('text-3xl');
    mainTitle.classList.remove('text-xl');
    // mainTitle.classList.add('flex-grow'); // Restore title to center
  }
});

router.init();

export {};
