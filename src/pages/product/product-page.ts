// src/components/product-modal/product-modal.ts
import { createEl as h } from '../../utils/element-utilities';
import { getProductById, Product } from '../../api/products/product-service';
import './product-page.scss';

export interface ProductModal {
  modalElement: HTMLElement;
  showModal: (productId: string) => Promise<void>;
  hideModal: () => void;
}

export function createProductModal(): ProductModal {
  /* ─────────────── overlay + card ─────────────── */
  const overlay = h({
    tag: 'div',
    classes: ['product-modal-overlay', 'backdrop-blur-sm', 'bg-black/10'],
  });
  const card = h({
    tag: 'div',
    parent: overlay,
    classes: ['product-modal-content'],
  });

  h({ tag: 'div', parent: card, classes: ['product-modal-bg'] });

  const buttonClose = h({
    tag: 'button',
    parent: card,
    text: '[x]',
    classes: ['product-modal-close'],
  });

  const details = h({
    tag: 'div',
    parent: card,
    classes: ['product-modal-details'],
  });

  overlay.addEventListener('click', (event_) => {
    if (event_.target === overlay) hideModal();
  });
  buttonClose.addEventListener('click', hideModal);

  /* ─────────────── API ─────────────── */
  async function showModal(id: string): Promise<void> {
    details.innerHTML = '';

    let product: Product | undefined;
    try {
      product = await getProductById(id);
    } catch {
      /* swallow */
    }

    if (!product) {
      h({ tag: 'p', parent: details, text: 'Product not found.' });
      overlay.style.display = 'flex';
      return;
    }

    /* ===== 1.  HERO ===== */

    const hero = h({ tag: 'section', parent: details, classes: ['hero'] });
    const heroLeft = h({
      tag: 'div',
      parent: hero,
      classes: ['hero-left', 'w-180'],
    });
    const heroRight = h({
      tag: 'aside',
      parent: hero,
      classes: ['hero-right'],
    });

    /* 1.1. Contur */
    const buildHeadline = (extra: string[]): HTMLElement => {
      const hh = h({
        tag: 'h1',
        parent: heroLeft,
        classes: [
          ...extra,
          'absolute',
          'top-0',
          'left-1/2',
          '-translate-x-1/2',
          'flex',
          'flex-col',
          'leading-none',
          'uppercase',
          'font-extrabold',
          'tracking-tight',
          'pointer-events-none',
          'select-none',
        ],
      });
      const name =
        product?.name.en?.toUpperCase() ??
        Object.values(product?.name ?? {})[0]?.toUpperCase() ??
        '';

      for (const word of name.split(/\s+/)) {
        h({ tag: 'span', parent: hh, text: word });
      }
      return hh;
    };

    /* back text layer */
    buildHeadline(['headline-bg', 'z-15', 'text-black']);

    /* 1.2. IMG  */
    h({
      tag: 'img',
      parent: heroLeft,
      classes: ['hero-img', 'z-10'],
      attributes: {
        src:
          product.masterVariant.images?.[0]?.url ??
          '../../assets/images/placeholder.webp',
        alt: product.name.en ?? 'product photo',
      },
    });

    buildHeadline(['headline-fx', 'z-200']);

    /* 1.3. Description (vertical) */
    h({
      tag: 'p',
      parent: heroRight,
      text:
        product.description?.en ??
        Object.values(product.description ?? {})[0] ??
        '',
    });
    h({
      tag: 'div',
      parent: heroRight,
      classes: ['padder', 'w-20'],
    });

    /* ===== 2.  Ingredients ===== */
    h({
      tag: 'h2',
      parent: details,
      text: 'ingredients:',
      classes: ['ingredients-label'],
    });

    /* ===== 3.  Order ===== */
    const order = h({
      tag: 'div',
      parent: details,
      classes: [
        'order',
        'flex',
        'flex-col',
        'justify-between',
        'justify-items-stretch',
        'items-stretch',
        'gap-1',
        'p-1',
        'sm:flex-row',
      ],
    });
    const quantity = h({
      tag: 'div',
      parent: order,
      classes: [
        'border',
        'border-gray-500',
        'order-quantity',
        'flex',
        'items-stretch',
        'justify-between',
        'h-[28px]',
      ],
    });
    const submitOrder = h({
      tag: 'div',
      parent: order,
      classes: [
        'order-submit',
        'flex',
        'bg-black',
        'justify-between',
        'h-[28px]',
        'px-2',
      ],
    });
    let qty = 1;
    const unitPrice =
      (product.masterVariant.prices?.[0]?.value.centAmount ?? 0) / 100;

    const button = (label: string) =>
      h({
        tag: 'button',
        parent: quantity,
        text: label,
        classes: ['order-btn', 'm-[1px]'],
      }) as HTMLButtonElement;

    const minus = button('−');
    const qtyElement = h({
      tag: 'span',
      parent: quantity,
      text: String(qty),
      classes: ['order-qty'],
    });
    const plus = button('+');

    // TODO next logic
    const cart = h({
      tag: 'button',
      parent: submitOrder,
      text: 'ADD TO CART',
      classes: ['order-cart', 'w-60'],
    });
    const price = h({
      tag: 'span',
      parent: submitOrder,
      classes: ['order-price', 'w-30'],
    });

    const update = () => {
      qtyElement.textContent = String(qty);
      price.textContent = `${(unitPrice * qty).toFixed(2)} Eur`;
      minus.disabled = qty <= 1;
    };
    plus.addEventListener('click', () => {
      qty += 1;
      update();
    });
    minus.addEventListener('click', () => {
      if (qty > 1) {
        qty -= 1;
        update();
      }
    });
    update();

    overlay.style.display = 'flex';
  }

  function hideModal(): void {
    overlay.style.display = 'none';
  }

  return { modalElement: overlay, showModal, hideModal };
}
