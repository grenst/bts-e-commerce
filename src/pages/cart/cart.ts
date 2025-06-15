import './cart.scss';
import CartUI from './cart-ui';

export function createCartPage(container: HTMLElement): void {
  container.innerHTML = '';
  new CartUI(container).init().catch(() => {
    container.textContent = 'Failed to load cart.';
  });
}
