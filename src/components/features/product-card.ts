import { createEl as createElement } from '../../utils/element-utilities';
import { Product } from '../../types/catalog-types';
import { ModalManager } from '../../components/layout/modal/product-modal';
import { isProductInCart, addToCart } from '../../api/cart/cart-service';
import './product-card.scss';
import priceHitImg from '@assets/images/price-hit.webp';

export function createProductCardElement(product: Product): HTMLElement {
  const productModal = ModalManager.getModal();
  let isLoaded = false;

  const card = createElement({
    tag: 'div',
    classes: ['product-card', 'bg-white', 'cursor-pointer', 'flex', 'flex-col', 'relative'],
  });

  // Skeleton placeholder
  const skeleton = createElement({
    tag: 'div',
    classes: ['skeleton', 'absolute', 'inset-0', 'z-10', 'animate-pulse'],
  });

  // Image skeleton
  createElement({
    tag: 'div',
    parent: skeleton,
    classes: ['w-full', 'h-48', 'bg-gray-200'],
  });

  // Content skeleton
  const contentSkeleton = createElement({
    tag: 'div',
    parent: skeleton,
    classes: ['p-2', 'pt-8', 'flex-grow'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-6', 'bg-gray-200', 'mb-2', 'w-3/4'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-4', 'bg-gray-200', 'mb-1', 'w-1/2'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-4', 'bg-gray-200', 'mb-1', 'w-2/3'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-4', 'bg-gray-200', 'mb-3', 'w-1/3'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-6', 'bg-gray-200', 'w-1/2'],
  });
  
  createElement({
    tag: 'div',
    parent: contentSkeleton,
    classes: ['h-8', 'bg-gray-200', 'mt-3'],
  });

  // Content container
  const contentContainer = createElement({
    tag: 'div',
    classes: ['content', 'opacity-0', 'transition-opacity', 'duration-500'],
  });

  card.append(skeleton, contentContainer);

  const price = product.masterVariant.prices?.[0];

  const imageContainer = createElement({
    tag: 'div',
    parent: contentContainer,
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

  const productImage = createElement({
    tag: 'img',
    parent: imageLimiter,
    attributes: {
      src: '',
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
        src: '',
        alt: 'Discount',
        loading: 'lazy',
      },
      classes: ['absolute', 'top-0', 'right-0', 'w-12', 'z-10', 'price_hit'],
    });
  }

  // Content section remains the same but parent is now contentContainer
  const descriptionContainer = createElement({
    tag: 'div',
    parent: contentContainer,
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

  // createElement({
  //   tag: 'div',
  //   parent: descriptionContainer,
  //   classes: ['text-xl', 'mb-2', 'text-gray-800', 'z-10'],
  // });

  createElement({
    tag: 'h3',
    parent: descriptionContainer,
    text: product.name['en-US'] || 'N/A',
    classes: ['text-xl', 'mb-2', 'text-gray-800', 'z-10'],
  });

  if (product.description && product.description['en-US']) {
    createElement({
      tag: 'p',
      parent: descriptionContainer,
      text: product.description['en-US'],
      classes: [
        'text-sm',
        'text-gray-600',
        'mb-3',
        'line-clamp-3',
        'description_on_cards',
        'z-10'
      ],
    });
  }

  const priceContainer = createElement({
    tag: 'div',
    parent: descriptionContainer,
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
    parent: descriptionContainer,
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
      'border',
      'border-gray-400',
      // 'px-4',
      'bg-gray-100',
      'hover:bg-gray-400',
      'transition',
      'duration-200',
      'add-to-cart-btn',
      'hover:animate-wiggle',
      'hover:animate-once',
    ],
  }) as HTMLButtonElement;

  // Function to update cart status
  const updateCartStatus = (event: Event) => {
    const customEvent = event as CustomEvent<{ cart: { lineItems: Array<{ productId: string }> } }>;
    const cart = customEvent.detail?.cart;
    if (!cart) return;
    
    const isInCart = cart.lineItems.some((item: { productId: string }) =>
      item.productId === product.id
    );
    if (isInCart) {
      button.textContent = 'ADD MORE';
      button.classList.remove('bg-gray-100');
      button.classList.add('bg-gray-400');
    } else {
      button.textContent = 'ADD TO CART';
      button.classList.add('bg-gray-100');
      button.classList.remove('bg-gray-400');
    }
  };

  // Initial cart status check
  const initialCartCheck = async () => {
    const { isInCart } = await isProductInCart(product.id);
    if (isInCart) {
      button.textContent = 'ADD MORE';
      button.classList.remove('bg-gray-100');
      button.classList.add('bg-gray-400');
    } else {
      button.textContent = 'ADD TO CART';
      button.classList.add('bg-gray-100');
      button.classList.remove('bg-gray-400');
    }
  };
  initialCartCheck();

  // Listen for cart updates
  document.addEventListener('cartUpdated', updateCartStatus as EventListener);

  button.addEventListener('click', async (event_) => {
    event_.stopPropagation();
    if (button.disabled) return;

    // Open modal if product is already in cart
    const { isInCart } = await isProductInCart(product.id);
    if (isInCart) {
      productModal.showModal(product.id, { x: event_.pageX, y: event_.pageY });
    } else {
      button.disabled = true;
      button.textContent = 'ADD MORE';
      button.classList.remove('bg-gray-100');
      button.classList.add('bg-gray-400');

      try {
        await addToCart(product.id, 1, 1);
      } catch (error) {
        console.error('Failed to add product to cart:', error);
        button.textContent = 'ADD TO CART';
        button.classList.add('bg-gray-100');
        button.classList.remove('bg-gray-400');
      } finally {
        button.disabled = false;
      }
    }
  });

  // Add click event to the card to open modal when clicking anywhere except the add to cart button
  card.addEventListener('click', (event) => {
    // Check if the click was on the button or inside the button
    const buttonElement = event.target instanceof Element &&
                         (event.target.closest('.add-to-cart-btn') ||
                          event.target.classList.contains('add-to-cart-btn'));
    
    if (!buttonElement) {
      productModal.showModal(product.id, { x: event.pageX, y: event.pageY });
    }
  });

  // Clean up event listener when card is removed
  card.addEventListener('remove', () => {
    document.removeEventListener('cartUpdated', updateCartStatus);
  });

  // Intersection Observer for lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoaded) {
        isLoaded = true;
        
        // Load images
        if (product.masterVariant.images?.[1]?.url) {
          productImage.setAttribute('src', product.masterVariant.images[0].url);
        }
        
        if (price && price.discounted) {
          const discountImg = imageContainer.querySelector('.price_hit') as HTMLImageElement;
          if (discountImg) {
            discountImg.setAttribute('src', priceHitImg);
          }
        }
        
        // Show content with fade-in effect
        setTimeout(() => {
          contentContainer.classList.remove('opacity-0');
          skeleton.style.opacity = '0';
          setTimeout(() => {
            skeleton.remove();
          }, 500);
        }, 300);
        
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px 200px 0px'
  });

  observer.observe(card);

  return card;
}
