import {
  createEl as createElement,
  body,
} from '../../../utils/element-utilities';
import {
  getProductById,
  getAllCategories,
  getProductsByCategory,
} from '../../../api/products/product-service';
import { Product } from '../../../types/catalog-types';
import './product-modal.scss';
import leftSvg from '@assets/images/left.svg';
import rightSvg from '@assets/images/right.svg';

const categoryCache = new Map<string, Product[]>();

type Point = { x: number; y: number };

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function applyBodyLock(): void {
  const width = getScrollbarWidth();
  body.style.setProperty('--scrollbar-width', `${width}px`);
  body.classList.add('lock');
}

function releaseBodyLock(): void {
  body.classList.remove('lock');
  body.style.removeProperty('--scrollbar-width');
}

export interface ProductModal {
  modalElement: HTMLElement;
  showModal: (productId: string, origin?: Point) => Promise<void>;
  hideModal: () => void;
}

export function createProductModal(): ProductModal {
  // Remove existing modals to prevent duplicates
  const existingModals = document.querySelectorAll('.product-modal-overlay');
  for (const modal of existingModals) {
    modal.remove();
  }

  const overlay = createElement({
    tag: 'div',
    classes: ['product-modal-overlay'],
  });
  overlay.style.display = 'none';

  const card = createElement({
    tag: 'div',
    parent: overlay,
    classes: ['product-modal-content'],
  });

  const quitModalHelp = createElement({
    tag: 'button',
    parent: card,
    classes: ['quit-modal-helper'],
  });

  createElement({
    tag: 'div',
    parent: card,
    classes: [
      'product-modal-bg',
      'absolute',
      'h-full',
      'w-full',
      // 'bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,1)_75%,rgba(255,255,255,1)_100%)]',
      '-z-1',
    ],
  });

  const buttonClose = createElement({
    tag: 'button',
    parent: card,
    text: '[x]',
    classes: ['product-modal-close'],
  });

  const categoryNameElement = createElement({
    tag: 'div',
    parent: card,
    classes: [
      'product-modal-category',
      'absolute',
      'top-0',
      'left-0',
      'ml-4',
      'text-lg',
      'font-bold',
      'text-black',
      'cursor-pointer',
    ],
    text: '',
  });

  const categoryProductsContainer = createElement({
    tag: 'div',
    parent: quitModalHelp,
    classes: [
      'category-products',
      'mt-4',
      'flex',
      'flex-wrap',
      'gap-2',
      'justify-end',
    ],
  });

  let isCategoryModalOpen = false;
  let shownCategoryId: string | undefined = undefined;

  categoryNameElement.addEventListener('click', (event) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
    isCategoryModalOpen = !isCategoryModalOpen;
    categoryProductsContainer.classList.toggle('show', isCategoryModalOpen);
    const current = categoryNameElement.textContent ?? '';
    categoryNameElement.textContent = isCategoryModalOpen
      ? current.replace('+', '-')
      : current.replace('-', '+');
  });

  const details = createElement({
    tag: 'div',
    parent: card,
    classes: ['product-modal-details'],
  });

  function lockCardHeight(): void {
    const { height } = card.getBoundingClientRect();
    card.style.setProperty('--locked-height', `${height}px`);
    card.classList.add('height-locked');
  }

  function unlockCardHeight(): void {
    card.classList.remove('height-locked');
    card.style.removeProperty('--locked-height');
  }

  let loader: HTMLElement | undefined;

  function showLoader(): void {
    lockCardHeight();
    details.innerHTML = '';
    details.classList.add('loading');

    loader = createElement({ tag: 'span', parent: details, classes: ['dots'] });
  }

  function hideLoader(): void {
    if (loader) {
      details.classList.remove('loading');
      loader.remove();
      loader = undefined;
      unlockCardHeight();
    }
  }

  let originalURL: string | undefined = undefined;
  let basePath: string | undefined = undefined;
  let popStateHandler: ((event: PopStateEvent) => void) | undefined = undefined;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      if (originalURL)
        globalThis.history.replaceState(undefined, '', originalURL);
      hideModal();
    }
  });

  quitModalHelp.addEventListener('click', (event) => {
    if (event.target === quitModalHelp) {
      if (originalURL)
        globalThis.history.replaceState(undefined, '', originalURL);
      hideModal();
    }
  });

  buttonClose.addEventListener('click', () => {
    if (originalURL)
      globalThis.history.replaceState(undefined, '', originalURL);
    hideModal();
  });

  async function showModal(productId: string, origin?: Point): Promise<void> {
    const firstOpen = overlay.style.display !== 'flex';

    if (firstOpen) {
      originalURL = globalThis.location.href;
      basePath = globalThis.location.pathname.replace(/\/$/, '');
    }

    const currentOrigin = origin ?? {
      x: globalThis.innerWidth / 2,
      y: globalThis.innerHeight / 2,
    };

    // Show background immediately
    overlay.style.display = 'flex';
    // Add open class to trigger background fade-in
    overlay.classList.add('open');

    // Set transform origin to click position
    card.style.setProperty('--ox', `${currentOrigin.x}px`);
    card.style.setProperty('--oy', `${currentOrigin.y}px`);
    // Add open class to trigger modal animation
    card.classList.add('open');

    const wasCategoryOpen = isCategoryModalOpen;

    showLoader();

    categoryProductsContainer.classList.toggle('show', wasCategoryOpen);

    const product = await getProductById(productId).catch(() => {});
    if (!product) {
      createElement({ tag: 'p', parent: details, text: 'Product not found.' });
      overlay.style.display = 'flex';
      return;
    }

    const targetPath = `${basePath}/${product.id}`;
    const state = {
      productId: product.id,
      productSlug: product.slug,
      isModalOpen: true,
    };

    if (firstOpen) {
      globalThis.history.pushState(state, product.name.en, targetPath);
      popStateHandler = (event) => {
        if (event.state?.isModalOpen) {
          showModal(event.state.productId);
        } else {
          if (originalURL)
            globalThis.history.replaceState(undefined, '', originalURL);
          hideModal();
        }
      };
      globalThis.addEventListener('popstate', popStateHandler);
    } else {
      globalThis.history.replaceState(state, product.name.en, targetPath);
    }

    if (product.categories?.length) {
      const categories = await getAllCategories().catch(() => []);
      const category = categories.find(
        (c) => c.id === product.categories[0].id
      );
      if (category) {
        const categoryName =
          category.name.en ??
          Object.values(category.name)[0] ??
          'Uncategorized';
        const sign = wasCategoryOpen ? '-' : '+';
        categoryNameElement.textContent = `[ ${categoryName} ${sign} ]`;

        if (category.id !== shownCategoryId) {
          // новая категория для текущего сеанса → сбрасываем контейнер
          categoryProductsContainer.innerHTML = '';
          shownCategoryId = category.id;
        }

        let categoryProducts: Product[];
        if (categoryCache.has(category.id)) {
          categoryProducts = categoryCache.get(category.id)!;
        } else {
          categoryProducts = await getProductsByCategory(category.id).catch(
            () => []
          );
          categoryCache.set(category.id, categoryProducts);
        }

        if (categoryProductsContainer.childElementCount === 0) {
          for (const p of categoryProducts) {
            const imgElement = createElement({
              tag: 'img',
              parent: categoryProductsContainer,
              classes: [
                'category-product-img',
                'w-1/5',
                'cursor-pointer',
                'bg-gradient-to-b',
                'from-white/0',
                'from-35%',
                'via-white/100',
                'via-65%',
                'to-white/100',
                'to-90%',
              ],
              attributes: {
                src: p.masterVariant.images?.[0]?.url ?? '',
                alt: p.name.en ?? 'product image',
                loading: 'lazy',
              },
            });
            imgElement.addEventListener('click', (event_) =>
              showModal(p.id, {
                x: (event_ as MouseEvent).clientX,
                y: (event_ as MouseEvent).clientY,
              })
            );
          }
        }
      }
    }

    hideLoader();

    const hero = createElement({
      tag: 'section',
      parent: details,
      classes: ['hero'],
    });
    const heroLeft = createElement({
      tag: 'div',
      parent: hero,
      classes: ['hero-left', 'w-180'],
    });
    const heroRight = createElement({
      tag: 'aside',
      parent: hero,
      classes: ['hero-right'],
    });

    const buildHeadline = (extra: string[]): HTMLElement => {
      const hh = createElement({
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
        product.name.en?.toUpperCase() ??
        (product.name ? Object.values(product.name)[0]?.toUpperCase() : '') ??
        '';
      name.split(/\s+/);
      for (const w of name.split(/\s+/)) {
        createElement({ tag: 'span', parent: hh, text: w });
      }
      return hh;
    };

    buildHeadline(['headline-bg', 'z-15', 'text-black']);

    // Create hero-slider container
    const heroSlider = createElement({
      tag: 'div',
      parent: heroLeft,
      classes: ['hero-slider', 'w-full', 'h-full', 'relative'],
    });

    // Add all product images except index 0
    const images = product.masterVariant.images?.slice(1) || [];
    let currentSlideIndex = 0;
    const slideElements: HTMLElement[] = [];

    for (const [index, img] of images.entries()) {
      const slide = createElement({
        tag: 'div',
        parent: heroSlider,
        classes: ['slide', 'absolute', 'inset-0', 'w-full', 'h-full'],
      });
      if (index !== 0) slide.style.display = 'none';

      const imgUrl = img.url
        ? `${img.url}?format=webp`
        : '../../assets/images/placeholder.webp';
      createElement({
        tag: 'img',
        parent: slide,
        classes: ['w-full', 'h-full', 'object-contain'],
        attributes: {
          src: imgUrl,
          alt: product.name.en ?? 'product photo',
          loading: 'lazy',
        },
      });
      slideElements.push(slide);
    }

    // Create navigation buttons
    const createNavButton = (icon: string, direction: 'left' | 'right') => {
      const button = createElement({
        tag: 'button',
        parent: heroSlider,
        classes: [
          'slider-nav',
          `nav-${direction}`,
          'absolute',
          'top-1/2',
          direction === 'left' ? 'left-4' : 'right-4',
          'z-20',
          'opacity-0',
          'transition-opacity',
          'duration-300',
        ],
        attributes: {
          'aria-label': `${direction} navigation`,
        },
      });

      createElement({
        tag: 'img',
        parent: button,
        attributes: {
          src: icon,
          alt: `${direction} arrow`,
        },
      });

      return button;
    };

    const leftButton = createNavButton(leftSvg, 'left');
    const rightButton = createNavButton(rightSvg, 'right');

    // Show buttons on hover
    heroSlider.addEventListener('mouseenter', () => {
      leftButton.style.opacity = '1';
      rightButton.style.opacity = '1';
    });

    heroSlider.addEventListener('mouseleave', () => {
      leftButton.style.opacity = '0';
      rightButton.style.opacity = '0';
    });

    // Navigation functions
    const showSlide = (index: number) => {
      for (const [index_, slide] of slideElements.entries()) {
        slide.style.display = index_ === index ? 'block' : 'none';
      }
      currentSlideIndex = index;
    };

    leftButton.addEventListener('click', () => {
      let newIndex = currentSlideIndex - 1;
      if (newIndex < 0) newIndex = slideElements.length - 1;
      showSlide(newIndex);
    });

    rightButton.addEventListener('click', () => {
      let newIndex = currentSlideIndex + 1;
      if (newIndex >= slideElements.length) newIndex = 0;
      showSlide(newIndex);
    });

    // Initialize first slide
    if (slideElements.length > 0) {
      showSlide(0);
    }

    buildHeadline(['headline-fx', 'z-200']);

    createElement({
      tag: 'p',
      parent: heroRight,
      text:
        product.description?.en ??
        Object.values(product.description ?? {})[0] ??
        '',
      classes: ['text-wrap', 'h-[40dvh]'],
    });

    createElement({
      tag: 'div',
      parent: heroRight,
      classes: ['padder', 'w-20'],
    });

    createElement({
      tag: 'h2',
      parent: details,
      text: 'ingredients:',
      classes: ['ingredients-label'],
    });

    const order = createElement({
      tag: 'div',
      parent: details,
      classes: [
        'order',
        'flex',
        'flex-col',
        'justify-between',
        'items-stretch',
        'gap-1',
        'p-1',
        'sm:flex-row',
      ],
    });

    const quantity = createElement({
      tag: 'div',
      parent: order,
      classes: [
        'order-quantity',
        'flex',
        'items-stretch',
        'justify-between',
        'h-[28px]',
      ],
    });

    const submitOrder = createElement({
      tag: 'div',
      parent: order,
      classes: [
        'order-submit',
        'flex',
        'bg-black',
        'justify-between',
        'h-[28px]',
        'px-2',
        'pointer',
      ],
    });

    let qty = 1;
    // const unitPrice =
    //   (product.masterVariant.prices?.[0]?.value.centAmount ?? 0) / 100;
    const first = product.masterVariant.prices?.[0];
    const centAmount =
      first?.discounted?.value.centAmount ?? first?.value.centAmount ?? 0;
    const unitPrice = centAmount / 100;

    const nooom =
      product.name.en?.toUpperCase() ??
      (product.name ? Object.values(product.name)[0]?.toUpperCase() : '') ??
      '';

    const pricelog = product.masterVariant.prices?.[0];

    if (pricelog) {
      if (pricelog.discounted) {
        console.log(
          `${nooom} ==> Зі знижкою: ${pricelog.discounted.value.centAmount}, Звичайна ціна: ${pricelog.value.centAmount}`
        );
      } else {
        console.log(`${nooom} ==> Без знижки: ${pricelog.value.centAmount}`);
      }
    }

    const createQtyButton = (label: string) =>
      createElement({
        tag: 'button',
        parent: quantity,
        text: label,
        classes: ['order-btn', 'm-[1px]'],
      }) as HTMLButtonElement;

    const minus = createQtyButton('−');
    const qtyElement = createElement({
      tag: 'span',
      parent: quantity,
      text: String(qty),
      classes: ['order-qty'],
    });
    const plus = createQtyButton('+');

    createElement({
      tag: 'button',
      parent: submitOrder,
      text: 'ADD TO CART',
      classes: ['order-cart', 'w-60'],
    });

    const price = createElement({
      tag: 'span',
      parent: submitOrder,
      classes: ['order-price', 'w-40'],
    });

    const updatePrice = () => {
      qtyElement.textContent = String(qty);
      price.textContent = `${(unitPrice * qty).toFixed(2)} Eur`;
      minus.disabled = qty <= 1;
    };

    plus.addEventListener('click', () => {
      qty += 1;
      updatePrice();
    });

    minus.addEventListener('click', () => {
      if (qty > 1) {
        qty -= 1;
        updatePrice();
      }
    });

    updatePrice();

    overlay.style.display = 'flex';
    applyBodyLock();

    const rect = card.getBoundingClientRect();
    card.style.setProperty('--ox', `${currentOrigin.x - rect.left}px`);
    card.style.setProperty('--oy', `${currentOrigin.y - rect.top}px`);

    card.classList.remove('open');
    overlay.classList.remove('open');
    void card.offsetWidth;
    requestAnimationFrame(() => {
      card.classList.add('open');
      overlay.classList.add('open');
    });
    body.classList.add('lock');
  }

  function hideModal(): void {
    if (popStateHandler) {
      globalThis.removeEventListener('popstate', popStateHandler);
      popStateHandler = undefined;
    }

    categoryProductsContainer.innerHTML = '';
    shownCategoryId = undefined;

    isCategoryModalOpen = false;
    categoryProductsContainer.classList.remove('show');
    categoryNameElement.textContent = (
      categoryNameElement.textContent ?? ''
    ).replace('-', '+');
    card.classList.remove('open');
    overlay.classList.remove('open');

    const onEnd = () => {
      overlay.style.display = 'none';
      overlay.removeEventListener('transitionend', onEnd);
      body.classList.remove('lock');
      originalURL = undefined;
      basePath = undefined;
    };
    overlay.addEventListener('transitionend', onEnd);
    releaseBodyLock();
  }

  return { modalElement: overlay, showModal, hideModal };
}
