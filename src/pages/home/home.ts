import { createEl } from '../../utils/elementUtils';
import { createCommerceTestComponent } from '../../components/test/CommerceTest';

export function createHomePage(container: HTMLElement): void {
  const homeContainer = createEl({
    tag: 'div',
    parent: container,
    classes: ['home-page', 'max-w-4xl', 'mx-auto', 'p-4'],
  });

  // const header = createEl({
  //   tag: 'header',
  //   parent: homeContainer,
  //   classes: ['mb-8', 'flex', 'justify-between', 'items-center'], // Added flex for auth button
  // });

  // const titleContainer = createEl({ tag: 'div', parent: header });

  // createEl({
  //   tag: 'h1',
  //   text: 'E-commerce App',
  //   parent: titleContainer,
  //   classes: [
  //     'font-mono',
  //     'text-3xl',
  //     'font-bold',
  //     'text-blue-600',
  //     'bg-yellow-200',
  //     'p-4',
  //     'mb-4',
  //     'rounded-lg',
  //   ],
  // });

  // createEl({
  //   tag: 'p',
  //   text: 'Welcome to our e-commerce platform powered by Commercetools',
  //   parent: titleContainer,
  //   classes: [
  //     'font-serif',
  //     'text-lg',
  //     'text-center',
  //     'italic',
  //     'text-gray-500',
  //     'bg-gray-100',
  //     'p-2',
  //     'rounded',
  //   ],
  // });

  // const authButtonContainer = createEl({
  //   tag: 'div',
  //   parent: header, // Add auth button to the header
  //   classes: ['flex', 'items-center'],
  // });

  // let authButton: HTMLButtonElement;

  // function updateAuthButton() {
  //   authButtonContainer.innerHTML = ''; // Clear previous button
  //   const { accessToken } = useTokenStore.getState();
  //   const { customer } = useCustomerStore.getState();
  //   const router = getRouter();

  //   if (accessToken && customer) {
  //     createEl({
  //       tag: 'span',
  //       text: `Hello, ${customer.firstName || customer.email}!`,
  //       parent: authButtonContainer,
  //       classes: ['mr-4', 'text-gray-700'],
  //     });
  //     authButton = createButton(
  //       'Logout',
  //       authButtonContainer,
  //       ['bg-red-500', 'text-white', 'hover:bg-red-600', 'px-4', 'py-2', 'text-sm']
  //     );
  //     authButton.onclick = async () => {
  //       await AuthService.logout();
  //       updateAuthButton(); // Re-render button
  //       router.navigateTo('/'); // Or to login page
  //     };
  //   } else {
  //     authButton = createButton(
  //       'Login',
  //       authButtonContainer,
  //       ['bg-blue-500', 'text-white', 'hover:bg-blue-600', 'px-4', 'py-2', 'text-sm']
  //     );
  //     authButton.onclick = () => {
  //       router.navigateTo('/login');
  //     };
  //   }
  // }

  // // Initial button render
  // updateAuthButton();

  // // Subscribe to store changes to update button
  // // Note: Direct subscription might lead to multiple re-renders if not handled carefully.
  // // For more complex scenarios, a dedicated component rendering logic is better.
  // const unsubscribeToken = useTokenStore.subscribe(updateAuthButton);
  // const unsubscribeCustomer = useCustomerStore.subscribe(updateAuthButton);

  // // It's important to unsubscribe when the page/component is destroyed.
  // // This basic example doesn't have a formal component lifecycle for cleanup.
  // // In a real app, manage subscriptions carefully.

  // // Remove the old button container and login button if they exist from previous structure
  // const oldButtonContainer = homeContainer.querySelector('.flex.justify-center.my-6');
  // if (oldButtonContainer) {
  //   oldButtonContainer.remove();
  // }

  createCommerceTestComponent(homeContainer);

  // // Add a cleanup function to be called if the page is re-rendered or navigated away from
  // // This is a simplified cleanup. In a component-based framework, this would be part of the component's lifecycle.
  // const originalRemove = container.remove;
  // container.remove = () => {
  //   unsubscribeToken();
  //   unsubscribeCustomer();
  //   originalRemove.call(container);
  // };
}

export default createHomePage;
