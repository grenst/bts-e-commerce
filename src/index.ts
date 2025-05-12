import { Buffer } from 'buffer/';
interface WindowWithBuffer extends Window {
  Buffer: typeof Buffer;
}

(window as unknown as WindowWithBuffer).Buffer = Buffer;
import '@styles/global.scss';
import '@styles/tailwind.css';
import './animations/gsap-init'; // Initialize GSAP and plugins
import { createAnimatedBackground } from './components/layout/animatedBackground'; // Import createAnimatedBackground
import {
  createHeaderElements,
  updateUserNavOnHeader,
} from './components/layout/header'; // Import header functions

import svgSpriteElement from './sources/svg-sprite';
import createFooter from './components/layout/footer/footer';
import { body, createEl } from './utils/elementUtils';
import { createRouter, Route } from './router/router';
import createHomePage from './pages/home/home';
import createLoginPage from './pages/auth/auth-page';
import createProfilePage from './pages/profile/profile';
import {
  createNotificationsContainer,
  createLoadingIndicator,
  addNotification,
} from './store/store';

createAnimatedBackground();

const contentContainer = createEl({
  tag: 'main',
  classes: ['min-h-[60vh]'],
});

const router = createRouter(contentContainer);
const { header, mainTitle, userNav } = createHeaderElements(router);

createEl({
  tag: 'div',
  classes: ['max-w-4xl', 'py-4', 'mx-auto', 'relative', 'z-[1]', 'mt-[80px]'],
  parent: body,
  children: [contentContainer],
});

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

updateUserNavOnHeader(userNav, router);

export function triggerHeaderUpdate(): void {
  updateUserNavOnHeader(userNav, router);
}

svgSpriteElement();

// --- footer
createFooter(body);

createNotificationsContainer(body);
createLoadingIndicator(body);

addNotification('info', 'Welcome to the E-commerce App!');

window.addEventListener('scroll', () => {
  if (window.scrollY > 618) {
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
