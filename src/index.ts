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
import { useTokenStore } from '../src/store/token-store';
import { useCustomerStore } from '../src/store/customer-store';
import { createRouter, Route } from './router/router';
import createHomePage from './pages/home/home';
import createLoginPage from './pages/auth/auth-page';
import { AuthService } from '../src/services/auth.service';
// Import for a potential cart page (though not creating it now)
// import createCartPage from './pages/cart/cart';
import { createNotificationsContainer, createLoadingIndicator, addNotification } from './store/store';

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

const userNav = createEl({
  tag: 'div',
  attributes: { id: 'user_nav' }, // Corrected: Use attributes property
  classes: ['flex', 'items-center', 'gap-4', 'relative'], // Added relative for dropdown positioning
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
    component: () => { // Placeholder for cart page
      const cartPage = createEl({ tag: 'div', text: 'Cart Page - Coming Soon!' });
      contentContainer.innerHTML = '';
      contentContainer.append(cartPage);
      return cartPage;
    },
  },
];

routes.forEach((route) => router.addRoute(route));

function updateAuthStatus(): void {
  userNav.innerHTML = ''; // Clear previous content
  const { accessToken } = useTokenStore.getState();
  const { customer } = useCustomerStore.getState();
  // const authState = getAuthState();

  if (accessToken && customer) {
    const userActionsContainer = createEl({
      tag: 'div',
      classes: ['flex', 'items-center', 'gap-4'],
      parent: userNav,
    });

    // User Greeting and Dropdown
    const dropdownContainer = createEl({
      tag: 'div',
      classes: ['relative', 'group'], // 'group' for group-hover
      parent: userActionsContainer,
    });

    createEl({
      tag: 'span',
      text: `Hi, ${customer.firstName || customer.email}!`,
      classes: ['text-sm', 'text-gray-700', 'cursor-pointer', 'hover:text-blue-600'],
      parent: dropdownContainer,
    });

    const dropdownMenu = createEl({
      tag: 'div',
      classes: [
        'absolute',
        'left-0',
        // 'mt-1',
        'w-28',
        'bg-white',
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
      classes: ['block', 'px-4', 'py-2', 'text-sm', 'text-gray-700', 'hover:bg-gray-100', 'cursor-pointer'],
      parent: dropdownMenu,
    });
    profileLink.addEventListener('click', () => router.navigateTo('/profile'));

    const ordersLink = createEl({
      tag: 'a',
      text: 'My orders',
      classes: ['block', 'px-4', 'py-2', 'text-sm', 'text-gray-700', 'hover:bg-gray-100', 'cursor-pointer'],
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
      classes: ['block', 'px-4', 'py-2', 'text-sm', 'text-gray-700', 'hover:bg-gray-100', 'cursor-pointer'],
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
      classes: ['text-sm', 'text-blue-500', 'hover:text-blue-700', 'cursor-pointer'],
      parent: userActionsContainer,
    });
    cartLink.addEventListener('click', () => router.navigateTo('/cart'));
  } else {
    const loginLink = createEl({
      tag: 'a',
      text: 'Login',
      classes: ['text-sm', 'text-blue-500', 'hover:text-blue-700', 'cursor-pointer'],
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

router.init();

export {};
