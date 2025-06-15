import { createEl as createElement } from '../../utils/element-utilities';
import { getOrCreateCart } from '../../api/cart/cart-service';
import { apiInstance } from '../../api/axios-instances';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';
import { isAxiosError } from 'axios';
import { LineItem, createCartItem } from './cart-item';

/* ────────── TYPES Commercetools ───── TO DO ───── */
interface CtMoney {
  centAmount: number;
}

interface CtImage {
  url: string;
}

interface CtAttribute {
  name: string;
  value: unknown;
}

interface CtVariant {
  id: number;
  images?: CtImage[];
  attributes?: CtAttribute[];
}

interface CtLineItem {
  id: string;
  productId: string;
  name: Record<string, string>;
  variant: CtVariant;
  price: { value: CtMoney };
  quantity: number;
}

interface CtCart {
  id: string;
  version: number;
  lineItems: CtLineItem[];
  totalPrice: CtMoney;
}

/* ────────── helpers ────────── */
function formatPrice(c: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(c / 100);
}

async function getAccessToken(): Promise<string> {
  const { accessToken } = useTokenStore.getState();
  if (accessToken) return accessToken;
  const anon = await getAnonymousToken();
  useTokenStore
    .getState()
    .setTokens(
      anon.access_token,
      anon.refresh_token ?? undefined,
      anon.expires_in
    );
  return anon.access_token;
}

function showToast(m: string, error = false): void {
  console[error ? 'error' : 'log'](m);
}

/* ────────── type-guard for volume ────────── */
interface Labeled {
  label: Record<string, string>;
}
const isLabeled = (v: unknown): v is Labeled =>
  typeof v === 'object' && v !== null && 'label' in v;

/* ────────── CartUI ────────── */
type CartAction =
  | { action: 'changeLineItemQuantity'; lineItemId: string; quantity: number }
  | { action: 'removeLineItem'; lineItemId: string };

export default class CartUI {
  private readonly container: HTMLElement;

  private cart: CtCart | undefined = undefined;

  private itemsWrapper: HTMLElement | undefined = undefined;

  /** query of PATCH-reqsts */
  private updateQueue: Promise<void> = Promise.resolve();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async init(): Promise<void> {
    await this.fetchCart();
    this.render();
  }

  private isCtCart(object: unknown): object is CtCart {
    return (
      !!object &&
      typeof object === 'object' &&
      'lineItems' in object &&
      'totalPrice' in object &&
      'version' in object &&
      Array.isArray(object.lineItems) &&
      typeof object.totalPrice === 'object' &&
      typeof object.version === 'number'
    );
  }

  private async fetchCart(): Promise<void> {
    const c = await getOrCreateCart();
    this.cart = this.isCtCart(c) ? c : undefined;
  }

  private mapLineItem(li: CtLineItem): LineItem {
    const volAttribute = li.variant.attributes?.find(
      (a) => a.name === 'volume'
    );
    let volume = '';
    if (volAttribute && isLabeled(volAttribute.value)) {
      volume =
        volAttribute.value.label['en-US'] ?? volAttribute.value.label.en ?? '';
    }

    return {
      id: li.id,
      productId: li.productId,
      name: li.name['en-US'] ?? li.name.en ?? 'Unnamed',
      variantId: li.variant.id,
      volume,
      price: li.price.value.centAmount,
      quantity: li.quantity,
      imageUrl: li.variant.images?.[0]?.url ?? '',
    };
  }

  private render(): void {
    if (!this.cart) return;
    this.container.innerHTML = '';

    if (this.cart.lineItems.length === 0) return this.renderEmpty();

    this.container.append(
      createElement({ tag: 'h1', classes: ['cart-title'], text: 'Your Cart' })
    );

    this.itemsWrapper = createElement({
      tag: 'div',
      classes: ['cart-items-grid'],
    });
    this.container.append(this.itemsWrapper);

    for (const li of this.cart.lineItems) {
      this.renderItem(li);
    }

    this.renderSummary();
  }

  private renderEmpty(): void {
    const emptyContainer = createElement({
      tag: 'div',
      classes: ['empty-cart'],
    });

    const icon = createElement({
      tag: 'div',
      classes: ['empty-icon'],
      text: '🛒',
    });

    const message = createElement({
      tag: 'h2',
      classes: ['empty-message'],
      text: 'Your cart is empty',
    });

    const subtitle = createElement({
      tag: 'p',
      classes: ['empty-subtitle'],
      text: 'Add some products to get started',
    });

    const button = createElement({
      tag: 'button',
      classes: ['go-shopping'],
      text: 'Start Shopping',
    });

    button.addEventListener('click', () => {
      globalThis.location.hash = '/catalog';
    });

    emptyContainer.append(icon, message, subtitle, button);
    this.container.append(emptyContainer);
  }

  private renderItem(ct: CtLineItem): void {
    if (!this.itemsWrapper) return;
    const item = this.mapLineItem(ct);
    const element = createCartItem(item, {
      onQuantityChange: (q) =>
        this.enqueueUpdate([
          {
            action: 'changeLineItemQuantity',
            lineItemId: item.id,
            quantity: q,
          },
        ]),
      onRemove: () =>
        this.enqueueUpdate([{ action: 'removeLineItem', lineItemId: item.id }]),
    });
    element.dataset.lineItemId = item.id;
    this.itemsWrapper.append(element);
  }

  private renderSummary(): void {
    if (!this.cart) return;

    this.container.querySelector('.cart-summary')?.remove();

    const subtotal = this.cart.lineItems.reduce(
      (s, li) => s + li.price.value.centAmount * li.quantity,
      0
    );
    const tax = this.cart.totalPrice.centAmount - subtotal;

    const summary = createElement({ tag: 'div', classes: ['cart-summary'] });

    // Subtotal row
    const subtotalRow = createElement({
      tag: 'div',
      classes: ['summary-row'],
    });
    subtotalRow.append(
      createElement({ tag: 'span', text: 'Subtotal' }),
      createElement({ tag: 'span', text: formatPrice(subtotal) })
    );

    // Tax row
    const taxRow = createElement({
      tag: 'div',
      classes: ['summary-row'],
    });
    taxRow.append(
      createElement({ tag: 'span', text: 'Tax (19%)' }),
      createElement({ tag: 'span', text: formatPrice(tax) })
    );

    // Total row
    const totalRow = createElement({
      tag: 'div',
      classes: ['summary-row', 'total'],
    });
    totalRow.append(
      createElement({ tag: 'span', text: 'Total' }),
      createElement({
        tag: 'span',
        text: formatPrice(this.cart.totalPrice.centAmount),
      })
    );

    // Checkout button
    const checkoutAttributes: Record<string, string> = {};
    if (this.cart.lineItems.length === 0) {
      checkoutAttributes['disabled'] = 'true';
    }

    const checkout = createElement({
      tag: 'button',
      classes: ['checkout-button'],
      attributes: checkoutAttributes,
      text:
        this.cart.lineItems.length > 0
          ? 'Proceed to Checkout'
          : 'Cart is Empty',
    });

    if (this.cart.lineItems.length > 0) {
      checkout.addEventListener('click', () => {
        // Add loading state
        checkout.textContent = 'Processing...';
        checkout.setAttribute('disabled', 'true');

        // Simulate checkout process
        setTimeout(() => {
          alert('Checkout functionality not implemented yet');
          checkout.textContent = 'Proceed to Checkout';
          checkout.removeAttribute('disabled');
        }, 1000);
      });
    }

    summary.append(subtotalRow, taxRow, totalRow, checkout);
    this.container.append(summary);
  }

  private enqueueUpdate(actions: CartAction[]): void {
    this.updateQueue = this.updateQueue.then(() => this.applyUpdate(actions));
  }

  private async applyUpdate(actions: CartAction[]): Promise<void> {
    if (!this.cart) return;

    const token = await getAccessToken();

    const patch = async (version: number) => {
      // Check cart exists before accessing its id
      if (!this.cart) {
        throw new Error('Cart is undefined during patch operation');
      }
      const { data } = await apiInstance.post<CtCart>(
        `/me/carts/${this.cart.id}`,
        { version, actions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    };

    try {
      this.cart = await patch(this.cart.version);
      this.render();
      showToast('Cart updated');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        try {
          const fresh = await getOrCreateCart();
          if (this.isCtCart(fresh)) {
            this.cart = fresh;
            this.cart = await patch(this.cart.version);
            this.render();
            showToast('Cart updated');
          } else {
            throw new Error('Invalid refreshed cart object');
          }
        } catch (retryError) {
          showToast('Failed to update cart', true);
          console.error(retryError);
        }
      } else {
        showToast('Failed to update cart', true);
        console.error(error);
      }
    }
  }
}
