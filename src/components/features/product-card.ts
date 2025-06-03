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
    classes: ['w-full', 'h-48', 'bg-white', 'overflow-hidden'],
  });

  createElement({
    tag: 'img',
    parent: imageContainer,
    attributes: {
      src: product.masterVariant.images?.[0]?.url ?? '',
      alt: product.name['en-US'] || 'Product Image',
    },
    classes: ['object-cover', 'object-top', 'h-[140%]'],
  });

  const contentContainer = createElement({
    tag: 'div',
    parent: card,
    classes: ['p-5', 'flex', 'flex-col', 'flex-grow'],
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
    classes: ['mt-auto', 'pt-3', 'relative', '-z-0'],
  });

  createElement({
    tag: 'p',
    parent: priceContainer,
    text: product.masterVariant.prices?.[0]
      ? `${(product.masterVariant.prices[0].value.centAmount / 100).toFixed(2)} ${product.masterVariant.prices[0].value.currencyCode}`
      : 'Price not available',
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

  card.addEventListener('click', (event_: MouseEvent) => {
    productModal.showModal(product.id, { x: event_.pageX, y: event_.pageY });
  });

  return card;
}
