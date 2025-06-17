import { createEl as createElement } from '../../utils/element-utilities';
import { Product } from '../../types/catalog-types';
import { ModalManager } from '../../components/layout/modal/product-modal';
import { isProductInCart } from '../../api/cart/cart-service';
import './product-card.scss';
import priceHitImg from '@assets/images/price-hit.webp';

export function createProductCardElement(product: Product): HTMLElement {
  const productModal = ModalManager.getModal();

  const price = product.masterVariant.prices?.[0];

  const card = createElement({
    tag: 'div',
    classes: ['product-card', 'bg-white', 'cursor-pointer', 'flex', 'flex-col'],
  });

  const imageContainer = createElement({
    tag: 'div',
    parent: card,
    classes: ['w-full', 'h-48', 'bg-white', 'relative'],
  });

  createElement({
    tag: 'div',
    parent: imageContainer,
    classes: ['w-full', 'img_bgrnd', 'back_frame'],
  });

  const imageLimiter = createElement({
    tag: 'div',
    parent: imageContainer,
    classes: [
      'w-full',
      'absolute',
      'h-[140%]',
      'overflow-hidden',
      'image_limiter',
    ],
  });

  createElement({
    tag: 'img',
    parent: imageLimiter,
    attributes: {
      src: product.masterVariant.images?.[1]?.url ?? '',
      alt: product.name['en-US'] || 'Product Image',
      loading: 'lazy',
    },
    classes: ['object-cover', 'object-top', 'h-[140%]', 'product_preview'],
  });

  if (price && price.discounted) {
    createElement({
      tag: 'img',
      parent: imageContainer,
      attributes: {
        src: priceHitImg,
        alt: 'Discount',
        loading: 'lazy',
      },
      classes: ['absolute', 'top-0', 'right-0', 'w-12', 'z-10', 'price_hit'],
    });
  }

  const contentContainer = createElement({
    tag: 'div',
    parent: card,
    classes: [
      'p-2',
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
      'z-10',
      'card_description',
    ],
  });

  createElement({
    tag: 'h3',
    parent: contentContainer,
    text: product.name['en-US'] || 'N/A',
    classes: ['text-xl', 'mb-2', 'text-gray-800'],
  });

  if (product.description && product.description['en-US']) {
    createElement({
      tag: 'p',
      parent: contentContainer,
      text: product.description['en-US'],
      classes: [
        'text-sm',
        'text-gray-600',
        'mb-3',
        'line-clamp-3',
        'description_on_cards',
      ],
    });
  }

  const priceContainer = createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['mt-auto', 'pt-3', 'relative', 'z-10'],
  });

  if (price && price.discounted) {
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

    // createElement({
    //   tag: 'span',
    //   parent: priceElement,
    //   text: 'ADD',
    //   classes: ['price-status'],
    // });

    createElement({
      tag: 'span',
      parent: priceElement,
      text: `${(price.value.centAmount / 100).toFixed(2)} ${price.value.currencyCode}`,
      classes: ['line-through', 'text-sm', 'pr-2', 'old_price'],
    });

    createElement({
      tag: 'span',
      parent: priceElement,
      text: `${(price.discounted.value.centAmount / 100).toFixed(2)} ${price.discounted.value.currencyCode}`,
      classes: ['text-xl', 'discount_price'],
    });
  } else if (price) {
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

  // Create button container
  const buttonContainer = createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['px-2', 'mt-auto', 'z-1'],
  });

  const button = createElement({
    tag: 'button',
    parent: buttonContainer,
    text: 'ADD TO CART',
    classes: [
      'text-black',
      'w-full',
      'pt-1',
      'rounded-b-lg',
      // 'px-4',
      'bg-gray-100',
      'hover:bg-gray-400',
      'transition',
      'duration-200',
      'add-to-cart-btn',
    ],
  }) as HTMLButtonElement;

  // Check if product is in cart and update button
  isProductInCart(product.id).then(({ isInCart }) => {
    if (isInCart) {
      // const priceStatus = document.querySelector('.price-status');
      // if (priceStatus) {
      //   priceStatus.textContent = "IT’S IN CART";
      // }
      button.textContent = 'ALREADY IN CART';
      button.classList.remove('bg-gray-100');
      button.classList.add('bg-gray-400');
    }
  });

  button.addEventListener('click', (event_) => {
    event_.stopPropagation();
    if (!button.disabled) {
      productModal.showModal(product.id, { x: event_.pageX, y: event_.pageY });
    }
  });

  card.addEventListener('click', (event_: MouseEvent) => {
    productModal.showModal(product.id, { x: event_.pageX, y: event_.pageY });
  });

  return card;
}
