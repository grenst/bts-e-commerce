import { createProductModal } from './product-page';
import { getProductById } from '../../api/products/product-service';
import { Product } from '../../types/catalog-types';
import { createEl as h } from '../../utils/element-utilities';

jest.mock('../../api/products/product-service');
jest.mock('../../utils/element-utilities', () => ({
  createEl: jest.fn((options) => {
    const mockElement = document.createElement(options.tag);
    if (options.classes) {
      mockElement.classList.add(...options.classes);
    }
    if (options.text) {
      mockElement.textContent = options.text;
    }
    if (options.attributes) {
      for (const key in options.attributes) {
        mockElement.setAttribute(key, options.attributes[key]);
      }
    }
    if (options.parent) {
      options.parent.append(mockElement);
    }
    return mockElement;
  }),
}));

const mockProduct: Product = {
  id: 'product-123',
  name: { en: 'Test Product' },
  slug: 'test-product',
  description: { en: 'This is a test product description.' },
  masterVariant: {
    sku: 'SKU-123',
    prices: [{ value: { centAmount: 1000, currencyCode: 'EUR' } }],
    images: [{ url: 'http://example.com/image.jpg' }],
  },
  categories: [],
};

describe('Product Page Modal', () => {
  let modal: ReturnType<typeof createProductModal>;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  let classListAddSpy: jest.SpyInstance;
  let classListRemoveSpy: jest.SpyInstance;
  let setPropertySpy: jest.SpyInstance;
  let removePropertySpy: jest.SpyInstance;
  let pushStateSpy: jest.SpyInstance;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'innerWidth', {
      writable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      value: 1000,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getProductById as jest.Mock).mockResolvedValue(mockProduct);

    addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(
      HTMLElement.prototype,
      'removeEventListener'
    );
    classListAddSpy = jest.spyOn(DOMTokenList.prototype, 'add');
    classListRemoveSpy = jest.spyOn(DOMTokenList.prototype, 'remove');
    setPropertySpy = jest.spyOn(CSSStyleDeclaration.prototype, 'setProperty');
    removePropertySpy = jest.spyOn(
      CSSStyleDeclaration.prototype,
      'removeProperty'
    );
    pushStateSpy = jest.spyOn(globalThis.history, 'pushState');
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      bottom: 100,
      right: 100,
      toJSON: () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 100,
        bottom: 100,
        left: 0,
      }),
    });
    jest
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockReturnValue(100);
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    modal = createProductModal();
    document.body.append(modal.modalElement);
  });

  afterEach(() => {
    modal.modalElement.remove();
    jest.restoreAllMocks();
  });

  it('should create modal elements and attach event listeners', () => {
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'div',
        classes: expect.arrayContaining(['product-modal-overlay']),
      })
    );
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'div',
        classes: expect.arrayContaining(['product-modal-content']),
      })
    );
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'button',
        classes: expect.arrayContaining(['quit-modal-helper']),
      })
    );
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'button',
        classes: expect.arrayContaining(['product-modal-close']),
      })
    );
    expect(h).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'div',
        classes: expect.arrayContaining(['product-modal-details']),
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'transitionend',
      expect.any(Function)
    );
  });

  describe('showModal', () => {
    it('should fetch product by ID and render details', async () => {
      await modal.showModal(mockProduct.id);

      expect(getProductById).toHaveBeenCalledWith(mockProduct.id);
      expect(pushStateSpy).toHaveBeenCalledWith(
        { productId: mockProduct.id, productSlug: mockProduct.slug },
        mockProduct.name.en,
        `/product/${mockProduct.slug}`
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'section',
          classes: expect.arrayContaining(['hero']),
        })
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'img',
          attributes: {
            src: 'http://example.com/image.jpg?format=webp',
            alt: 'Test Product',
            loading: 'lazy',
          },
        })
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'p',
          text: 'This is a test product description.',
        })
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'h2', text: 'ingredients:' })
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: 'div',
          classes: expect.arrayContaining(['order']),
        })
      );
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'button', text: 'ADD TO CART' })
      );
      expect(modal.modalElement.style.display).toBe('flex');
      expect(classListAddSpy).toHaveBeenCalledWith('lock');
      expect(setPropertySpy).toHaveBeenCalledWith('--scrollbar-width', '24px');
      expect(classListAddSpy).toHaveBeenCalledWith('open');
    });

    it('should display "Product not found" if product is undefined', async () => {
      (getProductById as jest.Mock).mockResolvedValue(undefined);
      await modal.showModal('non-existent-id');

      expect(getProductById).toHaveBeenCalledWith('non-existent-id');
      expect(h).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'p', text: 'Product not found.' })
      );
      expect(modal.modalElement.style.display).toBe('flex');
      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it('should handle quantity increment and decrement', async () => {
      await modal.showModal(mockProduct.id);

      const plusButton = modal.modalElement.querySelector(
        '.order-btn:nth-of-type(2)'
      );
      const minusButton = modal.modalElement.querySelector(
        '.order-btn:nth-of-type(1)'
      );
      const qtyElement = modal.modalElement.querySelector('.order-qty');
      const priceElement = modal.modalElement.querySelector('.order-price');

      if (!plusButton || !minusButton || !qtyElement || !priceElement) {
        throw new Error('Buttons or quantity/price elements not found');
      }

      // Initial state
      expect(qtyElement.textContent).toBe('1');
      expect(priceElement.textContent).toBe('10.00 Eur');
      expect(minusButton.hasAttribute('disabled')).toBe(true);

      // Increment quantity
      plusButton.dispatchEvent(new MouseEvent('click'));
      expect(qtyElement.textContent).toBe('2');
      expect(priceElement.textContent).toBe('20.00 Eur');
      expect(minusButton.hasAttribute('disabled')).toBe(false);

      // Increment quantity again
      plusButton.dispatchEvent(new MouseEvent('click'));
      expect(qtyElement.textContent).toBe('3');
      expect(priceElement.textContent).toBe('30.00 Eur');

      // Decrement quantity
      minusButton.dispatchEvent(new MouseEvent('click'));
      expect(qtyElement.textContent).toBe('2');
      expect(priceElement.textContent).toBe('20.00 Eur');

      // Decrement quantity to 1
      minusButton.dispatchEvent(new MouseEvent('click'));
      expect(qtyElement.textContent).toBe('1');
      expect(priceElement.textContent).toBe('10.00 Eur');
      expect(minusButton.hasAttribute('disabled')).toBe(true);

      // Try to decrement below 1 (should not change)
      minusButton.dispatchEvent(new MouseEvent('click'));
      expect(qtyElement.textContent).toBe('1');
      expect(priceElement.textContent).toBe('10.00 Eur');
    });
  });

  describe('hideModal', () => {
    it('should hide the modal and release body lock', async () => {
      await modal.showModal(mockProduct.id);
      modal.hideModal();

      expect(classListRemoveSpy).toHaveBeenCalledWith('open');
      expect(classListRemoveSpy).toHaveBeenCalledWith('lock');
      expect(removePropertySpy).toHaveBeenCalledWith('--scrollbar-width');

      // Simulate transition end
      const overlay = modal.modalElement;
      const transitionEndEvent = new Event('transitionend');
      overlay.dispatchEvent(transitionEndEvent);

      expect(overlay.style.display).toBe('none');
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      );
    });
  });
});
