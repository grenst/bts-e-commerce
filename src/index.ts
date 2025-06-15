import { Buffer } from 'buffer/';

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

// The Buffer polyfill doesn't implement all Node.js Buffer methods
// but we only need basic functionality in the browser
// @ts-ignore: Buffer polyfill doesn't implement full Node.js API
window.Buffer = Buffer;
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
import createAboutPage from './pages/about/about-page';
import {
  createNotificationsContainer,
  createLoadingIndicator,
  addNotification,
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
    preserveState: false, // можно и не ставить
  },
  {
    path: '/about',
    component: createAboutPage,
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

export function triggerHeaderUpdate(): void {
  updateUserNavOnHeader(userNav, router);
}

// --- footer
// createFooter(wrapper);
createFooter(body);

createNotificationsContainer(body);
createLoadingIndicator(body);

addNotification('info', 'Welcome to the E-commerce App!');

window.addEventListener('scroll', () => {
  if (window.scrollY > 118) {
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
