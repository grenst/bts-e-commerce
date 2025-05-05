import { Buffer } from 'buffer/';
interface WindowWithBuffer extends Window {
  Buffer: typeof Buffer;
}

(window as unknown as WindowWithBuffer).Buffer = Buffer;
import '@styles/global.scss';
import '@styles/tailwind.css';

import svgSpriteElement from './sources/svg-sprite';
import createFooter from './components/layout/footer/footer';
import { body, createEl } from './utils/elementUtils';
import { createRouter, Route } from './router/router';
import createHomePage from './pages/home/home';
import createLoginPage from './pages/auth/auth-page';
import { initializeAuth, getAuthState, subscribeToAuth, logoutUser } from './api/auth/auth';
import { createNotificationsContainer, createLoadingIndicator, addNotification } from './store/store';

initializeAuth();

const container = createEl({
  tag: 'div',
  classes: ['max-w-4xl', 'mx-auto', 'p-4'],
  parent: body,
});

const header = createEl({
  tag: 'header',
  classes: ['flex', 'justify-between', 'items-center', 'p-4', 'bg-gray-100', 'mb-4', 'rounded'],
  parent: container,
});

createEl({
  tag: 'h1',
  text: 'E-commerce App',
  classes: ['text-xl', 'font-bold', 'text-blue-600'],
  parent: header,
});

const authStatusContainer = createEl({
  tag: 'div',
  classes: ['flex', 'items-center', 'gap-4'],
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
];

routes.forEach((route) => router.addRoute(route));

function updateAuthStatus(): void {
  authStatusContainer.innerHTML = '';
  
  const authState = getAuthState();
  
  if (authState.isAuthenticated && authState.user) {
    // User info
    const userInfo = createEl({
      tag: 'span',
      text: `Hello, ${authState.user.firstName || authState.user.email}`,
      classes: ['text-sm', 'text-gray-600'],
      parent: authStatusContainer,
    });
    
    // Logout button
    const logoutButton = createEl({
      tag: 'button',
      text: 'Logout',
      classes: ['text-sm', 'text-blue-500', 'hover:text-blue-700'],
      parent: authStatusContainer,
    });
    
    logoutButton.addEventListener('click', () => {
      logoutUser();
      router.navigateTo('/');
    });
  } else {
    // Login link
    const loginLink = createEl({
      tag: 'a',
      text: 'Login',
      classes: ['text-sm', 'text-blue-500', 'hover:text-blue-700', 'cursor-pointer'],
      parent: authStatusContainer,
    });
    
    loginLink.addEventListener('click', () => {
      router.navigateTo('/login');
    });
  }
}

subscribeToAuth('login', updateAuthStatus);
subscribeToAuth('logout', updateAuthStatus);

updateAuthStatus();

svgSpriteElement();

// --- footer
createFooter(body);

createNotificationsContainer(body);
createLoadingIndicator(body);

addNotification('info', 'Welcome to the E-commerce App!');

router.init();

export {};
