import { Buffer } from 'buffer/';
import { DropdownManager } from './components/layout/dropdown-manager';

declare global {
  interface GlobalThis {
    Buffer: typeof Buffer;
  }
}

// The Buffer polyfill doesn't implement all Node.js Buffer methods
// but we only need basic functionality in the browser
// @ts-expect-error: Buffer polyfill doesn't implement full Node.js API
globalThis.Buffer = Buffer;
import '@styles/global.scss';
import '@styles/tailwind.css';
import './animations/gsap-init';
import { createAnimatedBackground } from './components/layout/animated-background';
import {
  createHeaderElements,
  updateUserNavOnHeader,
} from './components/layout/header/header';
import svgSpriteElement from './sources/svg-sprite';
import createFooter from './components/layout/footer/footer';
import { body, createEl as createElement } from './utils/element-utilities';
import { createRouter, Route } from './router/router';
import createHomePage from './pages/home/home';
import createAuthPage from './pages/auth/auth-page';
import createProfilePage from './pages/profile/profile';
import createAboutInfoPage from './pages/about-the-product/about-page';
import createAboutUsPage from './pages/about-us/about-us';
import {
  createNotificationsContainer,
  createLoadingIndicator,
} from './store/store';
import createErrorPage from './pages/error/error-page';
import { createCatalogPage } from './pages/catalog/catalog';

// --- sprite
svgSpriteElement();

createAnimatedBackground();

// const wrapper = createElement({
//   tag: 'div',
//   parent: body,
//   classes: ['wrapper'],
// });

const contentContainer = createElement({
  tag: 'main',
  classes: ['min-h-[60vh]'],
});

const router = createRouter(contentContainer);
const { header, mainTitle, userNav } = createHeaderElements(router);

createElement({
  tag: 'div',
  classes: ['mx-auto', 'relative', 'z-[1]', 'mt-[50px]'],
  // parent: wrapper,
  parent: body,
  children: [contentContainer],
});

const routes: Route[] = [
  {
    // path: '/',
    path: '/main',
    // (container, router) => createHomePage(container, router),
    component: createHomePage,
    preserveState: true,
  },
  {
    path: '/login',
    component: createAuthPage,
    preserveState: true, // можно и не ставить
  },
  {
    path: '/aboutInfo',
    component: createAboutInfoPage,
    preserveState: false,
  },
  {
    path: '/aboutUs',
    component: createAboutUsPage,
    preserveState: false,
  },
  {
    path: '/cart',
    component: (container) => {
      // Placeholder for cart page
      createElement({
        tag: 'div',
        text: 'Cart Page - Coming Soon!',
        parent: container,
      });
    },
    preserveState: true,
  },
  {
    path: '/profile',
    component: createProfilePage,
    preserveState: true,
  },
  {
    path: '*',
    component: createErrorPage,
    preserveState: false, // можно и не ставить будет работать
  },
  {
    path: '/catalog',
    component: createCatalogPage,
    preserveState: true,
  },
];

for (const route of routes) router.addRoute(route);

updateUserNavOnHeader(userNav, router);

// Close any open dropdown when clicking anywhere inside #user_nav
document.querySelector('#user_nav')?.addEventListener('click', () => {
  DropdownManager.closeCurrent();
});

export function triggerHeaderUpdate(): void {
  updateUserNavOnHeader(userNav, router);
}

// --- footer
// createFooter(wrapper);
createFooter(body);

createNotificationsContainer(body);
createLoadingIndicator(body);

// addNotification('info', 'Welcome to the E-commerce App!');

globalThis.addEventListener('scroll', () => {
  if (globalThis.scrollY > 118) {
    header.classList.add('bg-white/50');
    header.classList.remove('bg-transparent');
    mainTitle.classList.add('text-xl');
    mainTitle.classList.remove('text-5xl');
  } else {
    header.classList.add('bg-transparent');
    header.classList.remove('bg-white/50');
    mainTitle.classList.add('text-3xl');
    mainTitle.classList.remove('text-xl');
  }
});

router.init();

export {};
