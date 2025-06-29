import { apiInstance } from '../../api/axios-instances';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';
import { isAxiosError } from 'axios';
import { LineItem, createCartItem } from './cart-item';
import { validatePromo } from './promo-validation';
import { addNotification } from '../../store/store';
import { createEl as createElement } from '../../utils/element-utilities';
import { getOrCreateCart, setActiveCart } from '../../api/cart/cart-service';
import { Cart, LineItem as CtLineItemBase } from '../../api/cart/cart-service';

interface DiscountCodeReference {
  id: string;
  typeId: string;
}

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

interface CtDiscountCode {
  id: string;
  code: string;
}

interface CtDiscountCodeInfo {
  discountCode: {
    code: string;
    obj?: CtDiscountCode;
  };
  state: string;
}

interface CtCart {
  id: string;
  version: number;
  lineItems: CtLineItem[];
  totalPrice: CtMoney;
  discountCodes?: CtDiscountCodeInfo[];
}

interface CtLineItem extends CtLineItemBase {
  price: { value: CtMoney };
  quantity: number;
}

interface CtCart extends Cart {
  totalPrice: CtMoney;
  discountCodes?: CtDiscountCodeInfo[];
  lineItems: CtLineItem[];
}

const formatPrice = (c: number): string =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
    c / 100
  );

interface Labeled {
  label: Record<string, string>;
}

const isLabeled = (v: unknown): v is Labeled =>
  typeof v === 'object' && v !== null && 'label' in v;

type CartAction =
  | { action: 'changeLineItemQuantity'; lineItemId: string; quantity: number }
  | { action: 'removeLineItem'; lineItemId: string }
  | { action: 'addDiscountCode'; code: string }
  | { action: 'removeDiscountCode'; discountCode: DiscountCodeReference };

export default class CartUI {
  private readonly container: HTMLElement;

  private cart: CtCart | undefined;

  private discountCode: { id: string; code: string } | undefined = undefined;

  private itemsWrapper: HTMLElement | undefined;

  private updateQueue: Promise<void> = Promise.resolve();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async init(): Promise<void> {
    await this.fetchCart();
    this.render();
  }

  private isCtCart(o: unknown): o is CtCart {
    return (
      !!o &&
      typeof o === 'object' &&
      'lineItems' in o &&
      'totalPrice' in o &&
      'version' in o
    );
  }

  private async fetchCart(): Promise<void> {
    const c = await getOrCreateCart();
    if (this.isCtCart(c)) {
      this.cart = c;
      setActiveCart(c);
      this.updateDiscountStateFromCart();
    }
  }

  private emitCartUpdated(): void {
    const totalQty =
      this.cart?.lineItems.reduce((s, li) => s + li.quantity, 0) ?? 0;
    globalThis.dispatchEvent(
      new CustomEvent('cartUpdated', { detail: { totalQty, cart: this.cart } })
    );
  }

  private updateDiscountStateFromCart(): void {
    if (this.cart?.discountCodes?.length) {
      const info = this.cart.discountCodes[0];
      this.discountCode = {
        id: info.discountCode.obj?.id ?? '',
        code: info.discountCode.obj?.code ?? info.discountCode.code,
      };
    } else {
      this.discountCode = undefined;
    }
  }

  private mapLineItem(
    li: CtLineItem,
    discountAmount: number,
    subtotal: number
  ): LineItem {
    const volAttribute = li.variant.attributes?.find(
      (a) => a.name === 'volume'
    );
    let volume = '';
    if (volAttribute && isLabeled(volAttribute.value)) {
      volume =
        volAttribute.value.label['en-US'] ?? volAttribute.value.label.en ?? '';
    }

    // Calculate discounted price if discount exists
    let discountedPrice: number | undefined;
    if (this.discountCode && discountAmount > 0 && subtotal > 0) {
      const itemSubtotal = li.price.value.centAmount * li.quantity;
      const discountRatio = itemSubtotal / subtotal;
      const itemDiscount = discountAmount * discountRatio;
      discountedPrice = Math.round(
        li.price.value.centAmount - itemDiscount / li.quantity
      );
    } else {
      discountedPrice = undefined;
    }

    return {
      id: li.id,
      productId: li.productId,
      name: li.name['en-US'] ?? li.name.en ?? 'Unnamed',
      variantId: li.variant.id,
      volume,
      price: li.price.value.centAmount,
      discountedPrice,
      quantity: li.quantity,
      imageUrl: li.variant.images?.[0]?.url ?? '',
    };
  }

  private render(): void {
    if (!this.cart) return;
    this.container.innerHTML = '';

    if (this.cart.lineItems.length === 0) {
      this.renderEmpty();
      return;
    }

    this.container.append(
      createElement({
        tag: 'h1',
        classes: [
          'cart-title',
          'text-3xl',
          'font-bold',
          'mb-6',
          'z-30',
          'text-center',
          'text-gray-800',
          "before:content-['']",
          'before:absolute',
          'before:h-7',
          'before:w-36',
          'before:bg-yellow-400',
          'before:-z-1',
          'login-name',
        ],
        text: 'Your Cart',
      })
    );

    // Add clear cart button
    const clearButton = createElement({
      tag: 'button',
      classes: ['clear-cart-button'],
      text: 'Clear your cart',
    });
    clearButton.addEventListener('click', () =>
      this.showClearCartConfirmation()
    );
    this.container.append(clearButton);

    this.itemsWrapper = createElement({
      tag: 'div',
      classes: ['cart-items-grid'],
    });
    this.container.append(this.itemsWrapper);

    // Calculate discount amount for cart
    const subtotal = this.cart.lineItems.reduce(
      (s, li) => s + li.price.value.centAmount * li.quantity,
      0
    );
    const discountAmount = Math.max(
      0,
      subtotal - this.cart.totalPrice.centAmount
    );

    for (const li of this.cart.lineItems)
      this.renderItem(li, discountAmount, subtotal);
    this.renderSummary();
  }

  private async showClearCartConfirmation(): Promise<void> {
    if (!this.cart || this.cart.lineItems.length === 0) return;

    try {
      const module = await import(
        '../../components/layout/modal/confirmation-modal'
      );
      const createConfirmationModal = module.default;
      const modal = createConfirmationModal(
        'Are you sure you want to clear your entire cart?',
        'Clear',
        'Cancel'
      );

      modal.onConfirm(() => {
        if (!this.cart) {
          return;
        }
        const actions: CartAction[] = this.cart.lineItems.map((li) => ({
          action: 'removeLineItem' as const,
          lineItemId: li.id,
        }));
        this.enqueueUpdate(actions);
      });

      modal.onCancel(() => {
        modal.close();
      });
    } catch (error) {
      console.error('Failed to load confirmation modal:', error);
      addNotification('error', 'Failed to load confirmation dialog', 5000);
    }
  }

  private renderEmpty(): void {
    const wrap = createElement({ tag: 'div', classes: ['empty-cart'] });
    wrap.append(
      createElement({ tag: 'div', classes: ['empty-icon'], text: '🛒' }),
      createElement({
        tag: 'h2',
        classes: ['empty-message'],
        text: 'Your cart is empty',
      }),
      createElement({
        tag: 'p',
        classes: ['empty-subtitle'],
        text: 'Add some products to get started',
      }),
      (() => {
        const button = createElement({
          tag: 'button',
          classes: ['go-shopping'],
          text: 'Start Shopping',
        });
        button.addEventListener(
          'click',
          () => (globalThis.location.pathname = '/catalog')
        );
        return button;
      })()
    );
    this.container.append(wrap);
  }

  private renderItem(
    ct: CtLineItem,
    discountAmount: number,
    subtotal: number
  ): void {
    if (!this.itemsWrapper) return;
    const item = this.mapLineItem(ct, discountAmount, subtotal);
    const element = createCartItem(item, {
      onQuantityChange: (q) =>
        this.enqueueUpdate([
          {
            action: 'changeLineItemQuantity',
            lineItemId: item.id,
            quantity: q,
          },
        ]),
      onRemove: () => this.showItemRemoveConfirmation(item),
    });
    element.dataset.lineItemId = item.id;
    this.itemsWrapper.append(element);
  }

  private showItemRemoveConfirmation(item: LineItem): void {
    (async () => {
      try {
        const { default: createConfirmationModal } = await import(
          '../../components/layout/modal/confirmation-modal'
        );
        const modal = createConfirmationModal(
          `Are you sure you want to remove ${item.name} from your cart?`,
          'Remove',
          'Cancel'
        );

        modal.onConfirm(() => {
          this.enqueueUpdate([
            { action: 'removeLineItem', lineItemId: item.id },
          ]);
        });

        modal.onCancel(() => {
          modal.close();
        });
      } catch (error) {
        console.error('Failed to load confirmation modal:', error);
        addNotification('error', 'Failed to load confirmation dialog', 5000);
      }
    })();
  }

  private renderSummary(): void {
    if (!this.cart) return;
    this.container.querySelector('.cart-summary')?.remove();

    const subtotal = this.cart.lineItems.reduce(
      (s, li) => s + li.price.value.centAmount * li.quantity,
      0
    );
    const discountAmount = Math.max(
      0,
      subtotal - this.cart.totalPrice.centAmount
    );
    const taxRate = 0.19; // 19% tax rate
    const tax = Math.round(subtotal * taxRate);

    const summary = createElement({ tag: 'div', classes: ['cart-summary'] });

    const row = (
      label: string,
      value: string,
      extra: string[] = []
    ): HTMLElement => {
      const r = createElement({
        tag: 'div',
        classes: ['summary-row', ...extra],
      });
      r.append(
        createElement({ tag: 'span', text: label }),
        createElement({ tag: 'span', text: value })
      );
      return r;
    };

    summary.append(
      row('Subtotal', formatPrice(subtotal)),
      row('Tax (19%)', formatPrice(tax))
    );
    summary.append(this.createPromoSection(discountAmount));
    summary.append(
      row('Total', formatPrice(subtotal - discountAmount + tax), ['total'])
    );

    const checkoutAttributes: Record<string, string> = {};
    if (this.cart.lineItems.length === 0) checkoutAttributes.disabled = 'true';
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
        checkout.textContent = 'Processing...';
        checkout.setAttribute('disabled', 'true');
        setTimeout(async () => {
          const { isAnonymous } = useTokenStore.getState();

          if (isAnonymous) {
            // Redirect to login with return path to checkout
            sessionStorage.setItem('returnPath', '/checkout');
            globalThis.location.href = '/login';
          } else {
            // For authenticated users, proceed to checkout
            globalThis.location.href = '/checkout';
          }
        }, 1000);
      });
    }

    summary.append(checkout);
    this.container.append(summary);
  }

  private createPromoSection(discountAmount: number): HTMLElement {
    const container = createElement({
      tag: 'div',
      classes: ['promo-container'],
    });
    const form = createElement({ tag: 'form', classes: ['promo-form'] });

    const row = createElement({ tag: 'div', classes: ['promo-input-row'] });
    const groupPromocode = createElement({
      tag: 'div',
      classes: ['promo-input'],
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'promoCode';
    input.id = 'promo-code-input';

    const button = createElement({
      tag: 'button',
      attributes: { type: 'submit' },
      text: this.discountCode ? 'Cancel' : 'Apply',
    });
    const discountDisplay = createElement({
      tag: 'div',
      classes: ['discount-display'],
    });

    if (this.discountCode) {
      input.placeholder = this.discountCode.code;
      input.disabled = true;
      button.classList.add('cancel');
      discountDisplay.textContent =
        '-' + formatPrice(Math.max(0, discountAmount));
    } else {
      input.placeholder = 'Promo code';
      discountDisplay.textContent = formatPrice(0);
    }
    discountDisplay.style.display = 'block';

    groupPromocode.append(input, button, discountDisplay);
    row.append(groupPromocode);

    const message = createElement({ tag: 'div', classes: ['promo-message'] });

    form.append(row, message);
    container.append(form);

    form.addEventListener('submit', async (event_) => {
      event_.preventDefault();
      if (!this.cart) return;

      if (button.textContent === 'Apply') {
        const code = input.value.trim();
        const validation = validatePromo({ code });
        if (!validation.success) {
          message.textContent = validation.errors.code ?? 'Invalid promo code';
          message.style.color = 'red';
          addNotification('error', 'Invalid promo code');
          return;
        }

        button.setAttribute('disabled', 'true');
        try {
          await this.enqueueUpdate([{ action: 'addDiscountCode', code }]);
          addNotification('success', 'Promo code applied');
        } catch {
          message.textContent = 'Promo code not found';
          message.style.color = 'red';
          addNotification('error', 'Promo code not found');
        } finally {
          button.removeAttribute('disabled');
        }
      } else {
        if (!this.discountCode) return;
        button.setAttribute('disabled', 'true');
        try {
          await this.enqueueUpdate([
            {
              action: 'removeDiscountCode',
              discountCode: {
                id: this.discountCode.id,
                typeId: 'discount-code',
              },
            },
          ]);
          addNotification('warning', 'Promo code removed');
        } catch {
          message.textContent = 'Failed to remove promo code';
          message.style.color = 'red';
          addNotification('error', 'Failed to remove promo code');
        } finally {
          button.removeAttribute('disabled');
        }
      }
    });

    return container;
  }

  private enqueueUpdate(actions: CartAction[]): Promise<void> {
    const newUpdatePromise = this.updateQueue.then(() =>
      this.applyUpdate(actions)
    );
    this.updateQueue = newUpdatePromise;
    return newUpdatePromise;
  }

  private async applyUpdate(actions: CartAction[]): Promise<void> {
    if (!this.cart) return;
    const cartId = this.cart.id;
    const token = await this.getAccessToken();

    const patch = async (version: number): Promise<CtCart> => {
      const { data } = await apiInstance.post<CtCart>(
        `/me/carts/${cartId}`,
        { version, actions },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { expand: 'discountCodes[*].discountCode' },
        }
      );
      return data;
    };

    try {
      this.cart = await patch(this.cart.version);
      setActiveCart(this.cart);
      this.updateDiscountStateFromCart();
      this.render();
      this.emitCartUpdated();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const fresh = await getOrCreateCart();
        if (this.isCtCart(fresh)) {
          this.cart = await patch(fresh.version);
          setActiveCart(this.cart);
          this.updateDiscountStateFromCart();
          this.render();
          this.emitCartUpdated();
          return;
        }
      }
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    const { accessToken } = useTokenStore.getState();
    if (accessToken) return accessToken;
    const anon = await getAnonymousToken();
    useTokenStore
      .getState()
      .setTokens(
        anon.access_token,
        anon.refresh_token ?? undefined,
        anon.expires_in,
        true
      );
    return anon.access_token;
  }
}
