import { createEl as createElement } from '../../utils/element-utilities';
import { Product } from '../../types/catalog-types';
import {
  createProductModal,
  ProductModal,
} from '../../components/layout/modal/product-modal';
import './product-card.scss';

let productModal: ProductModal;

export function createProductCardElement(product: Product): HTMLElement {
  if (!productModal) {
    productModal = createProductModal();
    document.body.append(productModal.modalElement);
  }

  // Get price information early to use in multiple places
  const price = product.masterVariant.prices?.[0];

  const card = createElement({
    tag: 'div',
    classes: [
      'product-card',
      'bg-white',
      'cursor-pointer',
      'overflow-hidden',
      'border',
      'flex',
      'flex-col',
    ],
  });

  const imageContainer = createElement({
    tag: 'div',
    parent: card,
    classes: ['w-full', 'h-48', 'bg-white', 'relative'],
    // classes: ['w-full', 'h-48', 'bg-white', 'overflow-hidden', 'relative'],
  });

  createElement({
    tag: 'img',
    parent: imageContainer,
    attributes: {
      src: product.masterVariant.images?.[0]?.url ?? '',
      alt: product.name['en-US'] || 'Product Image',
    },
    classes: ['object-cover', 'object-top', 'h-[140%]', 'product_preview'],
  });

  // Add discount badge if product has discount
  if (price && price.discounted) {
    createElement({
      tag: 'img',
      parent: imageContainer,
      attributes: {
        src: 'src/assets/images/price-hit.webp',
        alt: 'Discount',
      },
      classes: ['absolute', 'top-0', 'right-0', 'w-12', 'z-10', 'price_hit'],
    });
  }

  const contentContainer = createElement({
    tag: 'div',
    parent: card,
    classes: [
      'p-5',
      'pt-8',
      'flex',
      'flex-col',
      'flex-grow',
      'bg-gradient-to-b',
      'from-white/0',
      'from-10%',
      'via-white/100',
      'via-35%',
      'to-white/100',
      'to-90%',
      'z-1',
    ],
    // classes: ['p-5', 'flex', 'flex-col', 'flex-grow', 'bg-gray-200', 'bg-opacity-50'],
  });

  createElement({
    tag: 'h3',
    parent: contentContainer,
    text: product.name['en-US'] || 'N/A',
    classes: ['text-xl', 'font-nexa-bold', 'mb-2', 'text-gray-800', 'truncate'],
  });

  if (product.description && product.description['en-US']) {
    createElement({
      tag: 'p',
      parent: contentContainer,
      text: product.description['en-US'],
      classes: ['text-sm', 'text-gray-600', 'mb-3', 'line-clamp-3'],
    });
  }

  const priceContainer = createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['mt-auto', 'pt-3', 'relative', 'z-10'],
  });

  if (price && price.discounted) {
    // Create container for both prices
    const priceElement = createElement({
      tag: 'p',
      parent: priceContainer,
      classes: [
        'pricee',
        'h-6',
        'border',
        'border-gray-300',
        'bg-gray-50',
        'px-3',
        'flex',
        'items-center',
        'justify-between',
      ],
    });

    // Original price with line-through
    createElement({
      tag: 'span',
      parent: priceElement,
      text: `${(price.value.centAmount / 100).toFixed(2)} ${price.value.currencyCode}`,
      classes: ['line-through', 'text-sm', 'pr-2', 'old_price'],
    });

    // Discounted price
    createElement({
      tag: 'span',
      parent: priceElement,
      text: `${(price.discounted.value.centAmount / 100).toFixed(2)} ${price.discounted.value.currencyCode}`,
      classes: ['text-xl', 'discount_price'],
    });
  } else if (price) {
    // Display regular price without discount
    createElement({
      tag: 'p',
      parent: priceContainer,
      text: `${(price.value.centAmount / 100).toFixed(2)} ${price.value.currencyCode}`,
      classes: [
        'text-xl',
        'pricee',
        'h-6',
        'border',
        'border-gray-300',
        'bg-gray-50',
        'text-gray-900',
        'px-3',
      ],
    });
  } else {
    // Handle missing price
    createElement({
      tag: 'p',
      parent: priceContainer,
      text: 'Price not available',
      classes: [
        'text-xl',
        'pricee',
        'h-6',
        'border',
        'border-gray-300',
        'bg-gray-50',
        'text-gray-900',
        'px-3',
      ],
    });
  }

  card.addEventListener('click', (event_: MouseEvent) => {
    productModal.showModal(product.id, { x: event_.pageX, y: event_.pageY });
  });

  return card;
}
