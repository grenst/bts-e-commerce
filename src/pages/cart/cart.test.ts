import { createCartPage } from './cart';
import CartUI from './cart-ui';
import { getOrCreateCart } from '../../api/cart/cart-service';
import { createEl } from '../../utils/element-utilities';
import { createCartItem } from './cart-item';
import { validatePromo } from './promo-validation';
import { addNotification } from '../../store/store';
import { apiInstance } from '../../api/axios-instances';
import { useTokenStore } from '../../store/token-store';
import { getAnonymousToken } from '../../components/auth-services/token.service';

jest.mock('./cart-ui');
jest.mock('../../api/cart/cart-service', () => ({
  getOrCreateCart: jest.fn(),
  addToCart: jest.fn(),
  applyDiscount: jest.fn(),
}));
jest.mock('../../utils/element-utilities', () => ({
  createEl: jest.fn(),
}));
jest.mock('./cart-item');
jest.mock('./promo-validation');
jest.mock('../../store/store');
jest.mock('../../api/axios-instances', () => ({
  apiInstance: {
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
    post: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock('../../store/token-store');
jest.mock('../../components/auth-services/token.service');
jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    // Add other methods like put, delete if they are used
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn((payload: unknown) => {
      return (
        typeof payload === 'object' && payload !== null && 'response' in payload
      );
    }),
    ...mockAxiosInstance,
  };
});

const mockCart = {
  id: 'cart-id',
  version: 1,
  lineItems: [],
  totalPrice: { centAmount: 0 },
  discountCodes: [],
};

const mockPopulatedCart = {
  id: 'cart-id-populated',
  version: 1,
  lineItems: [
    {
      id: 'line-item-1',
      productId: 'product-1',
      name: { 'en-US': 'Product 1' },
      variant: { id: 1, images: [{ url: 'image1.jpg' }], attributes: [] },
      price: { value: { centAmount: 1000 } },
      quantity: 1,
    },
  ],
  totalPrice: { centAmount: 1000 },
  discountCodes: [],
};

describe('createCartPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    (CartUI as jest.Mock).mockClear();
    (getOrCreateCart as jest.Mock).mockClear();
    (createEl as jest.Mock).mockClear();
    (createCartItem as jest.Mock).mockClear();
    (validatePromo as jest.Mock).mockClear();
    (addNotification as jest.Mock).mockClear();
    (apiInstance.post as jest.Mock).mockClear();
    (useTokenStore.getState as jest.Mock).mockClear();
    (getAnonymousToken as jest.Mock).mockClear();

    (CartUI as jest.Mock).mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      render: jest.fn(),
    }));
    (getOrCreateCart as jest.Mock).mockResolvedValue(mockCart);
    (createEl as jest.Mock).mockImplementation((options) => {
      const el = document.createElement(options.tag);
      if (options.text) el.textContent = options.text;
      if (options.classes) el.classList.add(...options.classes);
      if (options.attributes) {
        for (const key in options.attributes) {
          el.setAttribute(key, options.attributes[key]);
        }
      }
      return el;
    });
    (createCartItem as jest.Mock).mockImplementation(() =>
      document.createElement('div')
    );
    (validatePromo as jest.Mock).mockReturnValue({ success: true });
    (addNotification as jest.Mock).mockImplementation(() => {});
    (apiInstance.post as jest.Mock).mockResolvedValue({ data: mockCart });
    (useTokenStore.getState as jest.Mock).mockReturnValue({
      accessToken: 'mock-token',
      setTokens: jest.fn(),
    });
    (getAnonymousToken as jest.Mock).mockResolvedValue({
      access_token: 'anon-token',
      refresh_token: undefined,
      expires_in: 3600,
    });
  });

  test('should clear container and initialize CartUI', async () => {
    await createCartPage(container);
    expect(container.innerHTML).toBe('');
    expect(CartUI).toHaveBeenCalledTimes(1);
    expect(CartUI).toHaveBeenCalledWith(container);
    const cartUIInstance = (CartUI as jest.Mock).mock.results[0].value;
    expect(cartUIInstance.init).toHaveBeenCalledTimes(1);
  });

  test('should display error message if CartUI init fails', async () => {
    const cartUIInstance = {
      init: jest.fn().mockRejectedValue(new Error('Failed')),
    };
    (CartUI as jest.Mock).mockReturnValue(cartUIInstance);

    await createCartPage(container);
    expect(container.textContent).toBe('Failed to load cart.');
  });
});

describe('CartUI', () => {
  let container: HTMLElement;
  let cartUI: CartUI;

  beforeEach(() => {
    container = document.createElement('div');
    jest.clearAllMocks();

    (getOrCreateCart as jest.Mock).mockResolvedValue(mockCart);
    (createEl as jest.Mock).mockImplementation((options) => {
      const el = document.createElement(options.tag);
      if (options.text) el.textContent = options.text;
      if (options.classes) el.classList.add(...options.classes);
      if (options.attributes) {
        for (const key in options.attributes) {
          el.setAttribute(key, options.attributes[key]);
        }
      }
      return el;
    });
    (createCartItem as jest.Mock).mockImplementation(() =>
      document.createElement('div')
    );
    (validatePromo as jest.Mock).mockReturnValue({ success: true });
    (addNotification as jest.Mock).mockImplementation(() => {});
    (apiInstance.post as jest.Mock).mockResolvedValue({ data: mockCart });
    (useTokenStore.getState as jest.Mock).mockReturnValue({
      accessToken: 'mock-token',
      setTokens: jest.fn(),
    });
    (getAnonymousToken as jest.Mock).mockResolvedValue({
      access_token: 'anon-token',
      refresh_token: undefined,
      expires_in: 3600,
    });

    cartUI = new (jest.requireActual('./cart-ui').default)(container);
  });

  describe('init', () => {
    test('should fetch cart and render UI', async () => {
      const fetchCartSpy = jest.spyOn(cartUI, 'fetchCart' as never);
      const renderSpy = jest.spyOn(cartUI, 'render' as never);

      await cartUI.init();
      expect(fetchCartSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      fetchCartSpy.mockRestore();
      renderSpy.mockRestore();
    });
  });

  describe('renderEmpty', () => {
    test('should render empty cart message and button', () => {
      const renderEmptySpy = jest.spyOn(cartUI, 'renderEmpty' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: { ...mockCart, lineItems: [] },
      });
      (cartUI as any)['renderEmpty']();
      expect(container.querySelector('.empty-cart')).not.toBeNull();
      expect(container.textContent).toContain('Your cart is empty');
      expect(container.querySelector('.go-shopping')).not.toBeNull();
      renderEmptySpy.mockRestore();
    });

    test('should navigate to catalog on button click', () => {
      const renderEmptySpy = jest.spyOn(cartUI, 'renderEmpty' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: { ...mockCart, lineItems: [] },
      });
      (cartUI as any)['renderEmpty']();
      const button = container.querySelector(
        '.go-shopping'
      ) as HTMLButtonElement;
      const originalHash = globalThis.location.hash;
      globalThis.location.hash = '';
      button.click();
      expect(globalThis.location.hash).toBe('#/catalog');
      globalThis.location.hash = originalHash;
      renderEmptySpy.mockRestore();
    });
  });

  describe('render', () => {
    test('should render empty cart if no line items', () => {
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: { ...mockCart, lineItems: [] },
      });
      (cartUI as any)['render']();
      expect(container.querySelector('.empty-cart')).not.toBeNull();
      expect(container.textContent).toContain('Your cart is empty');
      renderSpy.mockRestore();
    });

    test('should render populated cart with items and summary', () => {
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      (cartUI as any)['render']();
      expect(container.querySelector('.cart-title')).not.toBeNull();
      expect(container.querySelector('.cart-items-grid')).not.toBeNull();
      expect(createCartItem).toHaveBeenCalledTimes(
        mockPopulatedCart.lineItems.length
      );
      expect(container.querySelector('.cart-summary')).not.toBeNull();
      renderSpy.mockRestore();
    });
  });

  describe('quantity modification', () => {
    test('should update quantity and re-render cart', async () => {
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      (apiInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          ...mockPopulatedCart,
          lineItems: [{ ...mockPopulatedCart.lineItems[0], quantity: 2 }],
          totalPrice: { centAmount: 2000 },
        },
      });

      (cartUI as any)['render']();
      const onQuantityChange = (createCartItem as jest.Mock).mock.calls[0][1]
        .onQuantityChange;

      await onQuantityChange(2);

      expect(enqueueUpdateSpy).toHaveBeenCalledTimes(1);
      expect(apiInstance.post).toHaveBeenCalledWith(
        '/me/carts/cart-id-populated',
        {
          version: 1,
          actions: [
            {
              action: 'changeLineItemQuantity',
              lineItemId: 'line-item-1',
              quantity: 2,
            },
          ],
        },
        expect.any(Object)
      );
      expect((cartUI as any).cart.lineItems[0].quantity).toBe(2);
      expect((cartUI as any).cart.totalPrice.centAmount).toBe(2000);
      renderSpy.mockRestore();
      enqueueUpdateSpy.mockRestore();
    });
  });

  describe('item removal', () => {
    test('should remove item and re-render cart', async () => {
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      (apiInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          ...mockPopulatedCart,
          lineItems: [],
          totalPrice: { centAmount: 0 },
        },
      });

      (cartUI as any)['render']();
      const onRemove = (createCartItem as jest.Mock).mock.calls[0][1].onRemove;

      await onRemove();

      expect(enqueueUpdateSpy).toHaveBeenCalledTimes(1);
      expect(apiInstance.post).toHaveBeenCalledWith(
        '/me/carts/cart-id-populated',
        {
          version: 1,
          actions: [
            {
              action: 'removeLineItem',
              lineItemId: 'line-item-1',
            },
          ],
        },
        expect.any(Object)
      );
      expect((cartUI as any).cart.lineItems.length).toBe(0);
      expect((cartUI as any).cart.totalPrice.centAmount).toBe(0);
      expect(container.querySelector('.empty-cart')).not.toBeNull();
      renderSpy.mockRestore();
      enqueueUpdateSpy.mockRestore();
    });
  });

  describe('promo code application and validation', () => {
    let promoInput: HTMLInputElement;
    let promoButton: HTMLButtonElement;
    let promoMessage: HTMLElement;
    let createPromoSectionSpy: jest.SpyInstance;

    beforeEach(() => {
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      (cartUI as any)['render']();
      createPromoSectionSpy = jest.spyOn(cartUI, 'createPromoSection' as never);
      const promoSection = (cartUI as any).container.querySelector(
        '.promo-container'
      );
      promoInput = promoSection.querySelector(
        '#promo-code-input'
      ) as HTMLInputElement;
      promoButton = promoSection.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      promoMessage = promoSection.querySelector(
        '.promo-message'
      ) as HTMLElement;
      renderSpy.mockRestore();
    });

    afterEach(() => {
      createPromoSectionSpy.mockRestore();
    });

    test('should apply promo code on valid input', async () => {
      promoInput.value = 'VALIDPROMO';
      (apiInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          ...mockPopulatedCart,
          discountCodes: [
            {
              discountCode: {
                code: 'VALIDPROMO',
                obj: { id: 'promo-id', code: 'VALIDPROMO' },
              },
              state: 'Applied',
            },
          ],
          totalPrice: { centAmount: 900 },
        },
      });

      const promoForm = container.querySelector('.promo-form');
      await promoForm?.dispatchEvent(new Event('submit'));

      expect(validatePromo).toHaveBeenCalledWith({ code: 'VALIDPROMO' });
      expect(apiInstance.post).toHaveBeenCalledWith(
        '/me/carts/cart-id-populated',
        {
          version: 1,
          actions: [{ action: 'addDiscountCode', code: 'VALIDPROMO' }],
        },
        expect.any(Object)
      );
      expect(addNotification).toHaveBeenCalledWith(
        'success',
        'Promo code applied'
      );
      expect(promoButton.textContent).toBe('Cancel');
      expect(promoInput.disabled).toBe(true);
      expect(promoInput.placeholder).toBe('VALIDPROMO');
    });

    test('should show error on invalid promo code input', async () => {
      (validatePromo as jest.Mock).mockReturnValueOnce({
        success: false,
        errors: { code: 'Invalid format' },
      });
      promoInput.value = 'INVALID';

      const promoForm = container.querySelector('.promo-form');
      await promoForm?.dispatchEvent(new Event('submit'));

      expect(validatePromo).toHaveBeenCalledWith({ code: 'INVALID' });
      expect(apiInstance.post).not.toHaveBeenCalled();
      expect(addNotification).toHaveBeenCalledWith(
        'error',
        'Invalid promo code'
      );
      expect(promoMessage.textContent).toBe('Invalid format');
      expect(promoMessage.style.color).toBe('red');
    });

    test('should show error if promo code not found', async () => {
      promoInput.value = 'NOTFOUND';
      (apiInstance.post as jest.Mock).mockRejectedValueOnce(
        new Error('Not found')
      );

      const promoForm = container.querySelector('.promo-form');
      await promoForm?.dispatchEvent(new Event('submit'));

      expect(validatePromo).toHaveBeenCalledWith({ code: 'NOTFOUND' });
      expect(apiInstance.post).toHaveBeenCalled();
      expect(addNotification).toHaveBeenCalledWith(
        'error',
        'Promo code not found'
      );
      expect(promoMessage.textContent).toBe('Promo code not found');
      expect(promoMessage.style.color).toBe('red');
    });

    test('should remove applied promo code', async () => {
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: {
          ...mockPopulatedCart,
          discountCodes: [
            {
              discountCode: {
                code: 'VALIDPROMO',
                obj: { id: 'promo-id', code: 'VALIDPROMO' },
              },
              state: 'Applied',
            },
          ],
          totalPrice: { centAmount: 900 },
        },
      });
      const updateDiscountStateFromCartSpy = jest.spyOn(
        cartUI,
        'updateDiscountStateFromCart' as never
      );
      (cartUI as any)['updateDiscountStateFromCart']();
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      (cartUI as any)['render']();

      const promoSection = (cartUI as any).container.querySelector(
        '.promo-container'
      );
      promoInput = promoSection.querySelector(
        '#promo-code-input'
      ) as HTMLInputElement;
      promoButton = promoSection.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      promoMessage = promoSection.querySelector(
        '.promo-message'
      ) as HTMLElement;

      (apiInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          ...mockPopulatedCart,
          discountCodes: [],
          totalPrice: { centAmount: 1000 },
        },
      });

      const promoForm = container.querySelector('.promo-form');
      await promoForm?.dispatchEvent(new Event('submit'));

      expect(apiInstance.post).toHaveBeenCalledWith(
        '/me/carts/cart-id-populated',
        {
          version: 1,
          actions: [
            {
              action: 'removeDiscountCode',
              discountCode: { id: 'promo-id', typeId: 'discount-code' },
            },
          ],
        },
        expect.any(Object)
      );
      expect(addNotification).toHaveBeenCalledWith(
        'warning',
        'Promo code removed'
      );
      expect(promoButton.textContent).toBe('Apply');
      expect(promoInput.disabled).toBe(false);
      expect(promoInput.placeholder).toBe('Promo code');
      updateDiscountStateFromCartSpy.mockRestore();
      renderSpy.mockRestore();
    });
  });

  describe('cart clearing (implicit via item removal)', () => {
    test('should render empty cart after all items are removed', async () => {
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      (apiInstance.post as jest.Mock).mockResolvedValueOnce({
        data: {
          ...mockPopulatedCart,
          lineItems: [],
          totalPrice: { centAmount: 0 },
        },
      });

      (cartUI as any)['render']();
      const onRemove = (createCartItem as jest.Mock).mock.calls[0][1].onRemove;
      await onRemove();

      expect((cartUI as any).cart.lineItems.length).toBe(0);
      expect(container.querySelector('.empty-cart')).not.toBeNull();
      expect(container.textContent).toContain('Your cart is empty');
      renderSpy.mockRestore();
      enqueueUpdateSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('should handle 409 conflict by refetching cart and retrying update', async () => {
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      const fetchCartSpy = jest.spyOn(cartUI, 'fetchCart' as never);
      const renderSpy = jest.spyOn(cartUI, 'render' as never);
      const updateDiscountStateFromCartSpy = jest.spyOn(
        cartUI,
        'updateDiscountStateFromCart' as never
      );

      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      const conflictError = new Error('Conflict');
      (conflictError as any).response = { status: 409 };

      (apiInstance.post as jest.Mock)
        .mockRejectedValueOnce(conflictError)
        .mockResolvedValueOnce({
          data: {
            ...mockPopulatedCart,
            version: 2,
            lineItems: [{ ...mockPopulatedCart.lineItems[0], quantity: 2 }],
            totalPrice: { centAmount: 2000 },
          },
        });
      (getOrCreateCart as jest.Mock)
        .mockResolvedValueOnce({ ...mockPopulatedCart, version: 2 })
        .mockResolvedValueOnce({ ...mockPopulatedCart, version: 2 });

      await (cartUI as any)['enqueueUpdate']([
        {
          action: 'changeLineItemQuantity',
          lineItemId: 'line-item-1',
          quantity: 2,
        },
      ]);

      expect(apiInstance.post).toHaveBeenCalledTimes(2);
      expect(getOrCreateCart).toHaveBeenCalledTimes(2);
      expect((cartUI as any).cart.version).toBe(2);
      expect((cartUI as any).cart.lineItems[0].quantity).toBe(2);
      expect(fetchCartSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(updateDiscountStateFromCartSpy).toHaveBeenCalledTimes(2);

      enqueueUpdateSpy.mockRestore();
      fetchCartSpy.mockRestore();
      renderSpy.mockRestore();
      updateDiscountStateFromCartSpy.mockRestore();
    });

    test('should throw error if update fails after retry', async () => {
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      const conflictError = new Error('Conflict');
      (conflictError as any).response = { status: 409 };

      (apiInstance.post as jest.Mock)
        .mockRejectedValueOnce(conflictError)
        .mockRejectedValueOnce(new Error('Final failure'));
      (getOrCreateCart as jest.Mock).mockResolvedValueOnce({
        ...mockPopulatedCart,
        version: 2,
      });

      await expect(
        (cartUI as any)['enqueueUpdate']([
          {
            action: 'changeLineItemQuantity',
            lineItemId: 'line-item-1',
            quantity: 2,
          },
        ])
      ).rejects.toThrow('Final failure');
      enqueueUpdateSpy.mockRestore();
    });

    test('should throw error if update fails for non-409 error', async () => {
      const enqueueUpdateSpy = jest.spyOn(cartUI, 'enqueueUpdate' as never);
      Object.defineProperty(cartUI, 'cart', {
        writable: true,
        value: mockPopulatedCart,
      });
      const otherError = new Error('Network error');
      (otherError as any).response = { status: 500 };

      (apiInstance.post as jest.Mock).mockRejectedValueOnce(otherError);

      await expect(
        (cartUI as any)['enqueueUpdate']([
          {
            action: 'changeLineItemQuantity',
            lineItemId: 'line-item-1',
            quantity: 2,
          },
        ])
      ).rejects.toThrow('Network error');
      enqueueUpdateSpy.mockRestore();
    });
  });
});
