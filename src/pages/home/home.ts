import { createEl as createElement } from '../../utils/element-utilities';
import {
  getAllPublishedProducts,
  getAllCategories,
} from '../../api/products/product-service';
import { Product, Category } from '../../types/catalog-types';
import { createProductCardElement } from '../../components/features/product-card';
import { gsap, ScrollTrigger } from '../../animations/gsap-init';
import { createProductModal, ProductModal } from '../product/product-page';

// Interfaces for Actuality List
interface ActualityCategory {
  id: string;
  name: string;
  products: Product[];
}

interface ActualityCache {
  dateUTC: string;
  categories: ActualityCategory[];
}

const ACTUALITY_STORAGE_KEY = 'actualityProductList';

// Helper function to get today's UTC date string
function getTodaysUTCDateString(): string {
  const today = new Date();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let index = newArray.length - 1; index > 0; index -= 1) {
    const index_ = Math.floor(Math.random() * (index + 1));
    [newArray[index], newArray[index_]] = [newArray[index_], newArray[index]];
  }
  return newArray;
}

// Helper function to generate the actuality list
async function generateActualityList(
  allProducts: Product[],
  allCategories: Category[]
): Promise<ActualityCategory[]> {
  const productsByCategory: Record<string, Product[]> = {};
  const categoryNameMap: Record<string, string> = {};

  for (const cat of allCategories) {
    categoryNameMap[cat.id] =
      cat.name.en ||
      cat.name[Object.keys(cat.name)[0]] ||
      `Category ${cat.id.slice(0, 4)}`;
  }

  for (const product of allProducts) {
    if (product.categories && product.categories.length > 0) {
      const categoryId = product.categories[0].id;
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = [];
      }
      productsByCategory[categoryId].push(product);
    }
  }

  const actualityCategories: ActualityCategory[] = [];
  for (const categoryId in productsByCategory) {
    if (
      Object.prototype.hasOwnProperty.call(productsByCategory, categoryId) &&
      productsByCategory[categoryId].length > 0
    ) {
      const shuffledProducts = shuffleArray(productsByCategory[categoryId]);
      actualityCategories.push({
        id: categoryId,
        name:
          categoryNameMap[categoryId] ||
          `Category ${categoryId.slice(0, 8)}...`, // Use fetched name
        products: shuffledProducts.slice(0, 2) as Product[],
      });
    }
  }
  return shuffleArray(actualityCategories);
}

// Helper function to get actuality data from localStorage or generate new
async function getActualityData(
  allProducts: Product[],
  allCategories: Category[]
): Promise<ActualityCategory[]> {
  const todayUTCString = getTodaysUTCDateString();
  const cachedDataRaw = localStorage.getItem(ACTUALITY_STORAGE_KEY);

  if (cachedDataRaw) {
    try {
      const cachedData: ActualityCache = JSON.parse(cachedDataRaw);
      if (cachedData.dateUTC === todayUTCString && cachedData.categories) {
        console.log('Using cached actuality data for today.');
        return cachedData.categories;
      }
    } catch (error) {
      console.error('Error parsing cached actuality data:', error);
      localStorage.removeItem(ACTUALITY_STORAGE_KEY); // Clear corrupted data
    }
  }

  console.log('Generating new actuality data for today.');
  const newActualityCategories = await generateActualityList(
    allProducts,
    allCategories
  ); // Pass categories
  const newCache: ActualityCache = {
    dateUTC: todayUTCString,
    categories: newActualityCategories,
  };
  localStorage.setItem(ACTUALITY_STORAGE_KEY, JSON.stringify(newCache));
  return newActualityCategories;
}

export async function createHomePage(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const productModal: ProductModal = createProductModal();
  container.append(productModal.modalElement);

  const homeContainer = createElement({
    tag: 'div',
    parent: container,
    classes: ['home-page-redesigned', 'w-full'],
  });

  // Hero Section
  const heroSection = createElement({
    tag: 'section',
    attributes: { id: 'hero-section' },
    classes: [
      'h-[calc(100dvh-140px)]', // Adjusted height if actuality section is above
      // 'bg-transparent',
      // 'bg-cover',
      // 'bg-center',
      'flex',
      'items-center',
      'justify-center',
      'text-center',
      'relative',
      'overflow-hidden',
      // 'z-100',
    ],
    parent: homeContainer,
  });

  // Create container for animated background
  const heroContainer = createElement({
    tag: 'div',
    classes: [
      'absolute',
      'inset-0',
      'overflow-hidden',
      'flex',
      'justify-center',
      'items-center',
      'flex-col',
    ],
    parent: heroSection,
  });

  // --- ANIMATED BACKGROUND ---
  const bgLosung = createElement({
    tag: 'div',
    attributes: { id: 'bg-losung' },
    classes: [
      'font-nexa-bold',
      'px-4',
      'pb-16',
      'bg-transparent',
      // 'rounded-md',
      'text-center',
      'max-w-md',
      'z-30',
    ],
    parent: heroContainer,
  });

  // Create and animate lines for bgLosung
  const losungTextLines = [
    'Life is water.',
    "So let's make",
    'this life happy!',
  ];
  const animatedLineElements: HTMLElement[] = [];

  for (const text of losungTextLines) {
    const lineContainer = createElement({
      tag: 'div',
      classes: ['overflow-hidden', 'relative', 'leading-8'],
      parent: bgLosung,
    });

    const textElement = createElement({
      tag: 'span',
      text,
      classes: ['inline-block', 'whitespace-nowrap'],
      // classes: ['text-white', 'inline-block', 'whitespace-nowrap'],
      parent: lineContainer,
      attributes: {
        'data-text': text,
      },
    });
    animatedLineElements.push(textElement);
  }

  if (animatedLineElements.length > 0) {
    gsap.fromTo(
      animatedLineElements,
      { yPercent: 120 },
      {
        yPercent: 0,
        stagger: 0.25,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      }
    );
  }

  createElement({
    tag: 'a', // ← был button
    attributes: { id: 'hero-button', href: '/catalog' },
    text: 'Our drinks',
    classes: [
      'hero_btn',
      'inline-block',
      'text-xl',
      'font-nexa-bold',
      'text-white',
      // 'bg-black/70',
      'bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_25%,rgba(0,0,0,1)_45%,rgba(1,0,150,1)_100%)]',
      'px-4',
      'py-2',
      'mt-[10dvh]',
      'rounded-full',
      'font-nexa-bold',
      'opacity-80',
      'transition',
      'duration-350',
      'ease-in-out',
      'hover:opacity-100',
      'hover:scale-[1.07]',
    ],
    parent: heroContainer,
  });

  // gsap.from(heroTitle, {
  //   duration: 1.2,
  //   opacity: 0,
  //   scale: 0.5,
  //   ease: 'back.out(1.7)',
  //   delay: 0.3,
  // });

  // Fetch all products and categories once for the page
  let allProducts: Product[] = [];
  let allCategories: Category[] = [];
  try {
    [allProducts, allCategories] = await Promise.all([
      getAllPublishedProducts(),
      getAllCategories(),
    ]);
  } catch (error) {
    console.error(
      'Failed to load initial products or categories for home page:',
      error
    );
  }

  // --- ACTUALITY SECTION ---
  const actualitySection = createElement({
    tag: 'section',
    attributes: { id: 'actuality-section' },
    classes: ['py-8', 'backdrop-blur-sm', 'bg-black/10', 'relative'],
    parent: homeContainer,
  });

  const actualityWrapper = createElement({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4'],
    parent: actualitySection,
  });

  createElement({
    tag: 'h2',
    text: 'Fresh Picks For You',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-6',
      'text-gray-800',
    ],
    parent: actualityWrapper,
  });

  // --- Actuality Category Header (Title + Nav Buttons) ---
  const actualityCategoryHeader = createElement({
    tag: 'div',
    classes: [
      'actuality-category-header',
      'flex',
      'justify-between',
      'items-center',
      'mb-4',
    ],
    parent: actualityWrapper,
  });

  const actualityCategoryTitle = createElement({
    tag: 'h3',
    text: 'Loading category...',
    classes: ['text-xl', 'font-nexa-light', 'text-gray-700'],
    parent: actualityCategoryHeader,
  });

  const actualityProductsContainer = createElement({
    tag: 'div',
    attributes: { id: 'actuality-products-display' },
    classes: [
      'grid',
      'grid-cols-1',
      'sm:grid-cols-[1fr_auto_1fr]',
      'gap-x',
      'gap-y-1',
      'items-stretch',
      'justify-center',
    ],
    parent: actualityWrapper,
  });

  const actualityNavContainer = createElement({
    tag: 'div',
    classes: ['space-x-2'],
    parent: actualityCategoryHeader,
  });

  const previousCategoryButton = createElement({
    tag: 'button',
    text: '<-',
    classes: [
      'px-3',
      'py-1',
      'bg-gray-700',
      'text-white',
      'rounded',
      'hover:bg-gray-600',
      'disabled:opacity-50',
    ],
    parent: actualityNavContainer,
  }) as HTMLButtonElement;

  const nextCategoryButton = createElement({
    tag: 'button',
    text: '->',
    classes: [
      'px-3',
      'py-1',
      'bg-gray-700',
      'text-white',
      'rounded',
      'hover:bg-gray-600',
      'disabled:opacity-50',
    ],
    parent: actualityNavContainer,
  }) as HTMLButtonElement;

  let actualityCategories: ActualityCategory[] = [];
  let currentActualityCategoryIndex = 0;

  function displayActualityProducts() {
    actualityProductsContainer.innerHTML = '';
    if (
      !actualityCategories ||
      actualityCategories.length === 0 ||
      !actualityCategories[currentActualityCategoryIndex]
    ) {
      actualityCategoryTitle.textContent = 'No special picks available today.';
      createElement({
        tag: 'p',
        text: 'Please check back later!',
        classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
        parent: actualityProductsContainer,
      });
      previousCategoryButton.disabled = true;
      nextCategoryButton.disabled = true;
      return;
    }

    const currentCategory = actualityCategories[currentActualityCategoryIndex];
    actualityCategoryTitle.textContent = `-->${currentCategory.name}`;

    if (currentCategory.products.length === 0) {
      createElement({
        tag: 'p',
        text: `No specific items from ${currentCategory.name} today.`,
        classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
        parent: actualityProductsContainer,
      });
    } else {
      for (const [index, product] of currentCategory.products.entries()) {
        const card = createProductCardElement(product as Product);
        actualityProductsContainer.append(card);

        if (index === 0 && currentCategory.products.length > 1) {
          const divider = createElement({
            tag: 'div',
            classes: [
              'w-px',
              'bg-gray-600',
              'hidden',
              'sm:block',
              'self-stretch',
            ],
          });
          actualityProductsContainer.append(divider);
        }
      }
    }

    const disableButtons =
      !actualityCategories || actualityCategories.length <= 1;
    previousCategoryButton.disabled = disableButtons;
    nextCategoryButton.disabled = disableButtons;
  }

  previousCategoryButton.addEventListener('click', () => {
    if (actualityCategories && actualityCategories.length > 0) {
      currentActualityCategoryIndex =
        (currentActualityCategoryIndex - 1 + actualityCategories.length) %
        actualityCategories.length;
      displayActualityProducts();
    }
  });

  nextCategoryButton.addEventListener('click', () => {
    if (actualityCategories && actualityCategories.length > 0) {
      currentActualityCategoryIndex =
        (currentActualityCategoryIndex + 1) % actualityCategories.length;
      displayActualityProducts();
    }
  });

  // Initialize Actuality Section
  if (allProducts.length > 0 && allCategories.length > 0) {
    getActualityData(allProducts, allCategories)
      .then((data) => {
        actualityCategories = data;
        if (actualityCategories.length > 0) {
          currentActualityCategoryIndex = 0;
        }
        displayActualityProducts();
      })
      .catch((error) => {
        console.error('Error initializing actuality section:', error);
        actualityCategoryTitle.textContent = 'Could not load special picks.';
        previousCategoryButton.disabled = true;
        nextCategoryButton.disabled = true;
      });
  } else {
    actualityCategoryTitle.textContent =
      'No products or categories available to pick from.';
    previousCategoryButton.disabled = true;
    nextCategoryButton.disabled = true;
  }

  /* ---------- ACTUAL PRODUCTS (Original list of all products) ---------- */
  const actualSection = createElement({
    tag: 'section',
    attributes: { id: 'actual-products' },
    classes: ['py-8', 'backdrop-blur-sm', 'bg-white/30'],
    parent: homeContainer,
  });

  const actualWrapper = createElement({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4'],
    parent: actualSection,
  });

  createElement({
    tag: 'h2',
    text: 'All Our Products',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-12',
      'text-gray-800',
    ],
    parent: actualWrapper,
  });

  const actualGrid = createElement({
    tag: 'div',
    classes: [
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'gap-8',
    ],
    parent: actualWrapper,
  });

  if (
    allProducts.length === 0 &&
    !document.querySelector('#actual-products .text-red-500')
  ) {
    if (!actualGrid.querySelector('p')) {
      createElement({
        tag: 'p',
        text: 'No products found.',
        classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
        parent: actualGrid,
      });
    }
  } else if (allProducts.length > 0) {
    for (const [index, product] of allProducts.entries()) {
      const card = createProductCardElement(product);
      actualGrid.append(card);

      gsap.from(card, {
        duration: 0.5,
        opacity: 0,
        y: 50,
        scale: 0.95,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        delay: index * 0.05,
      });
    }
    ScrollTrigger.refresh();
  } else if (!actualGrid.querySelector('p')) {
    createElement({
      tag: 'p',
      text: 'Loading products or no products available.',
      classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
      parent: actualGrid,
    });
  }

  // Featured Products/Categories Section
  const featuredSection = createElement({
    tag: 'section',
    attributes: { id: 'featured-products-section' },
    classes: [
      'mt-16',
      'py-12',
      'backdrop-blur-sm',
      'bg-white/30',
      'overflow-hidden',
    ],
    parent: homeContainer,
  });
  const featuredWrapper = createElement({
    tag: 'div',
    classes: ['relative', 'overflow-hidden', 'w-full'],
    parent: featuredSection,
  });
  createElement({
    tag: 'h2',
    text: 'Our Special Blends',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-4',
      'text-gray-800',
    ],
    parent: featuredWrapper,
  });

  const horizontalTrack = createElement({
    tag: 'div',
    attributes: { id: 'horizontal-track' },
    classes: ['flex', 'w-max', 'gap-0', 'transform-gpu'],
    parent: featuredWrapper,
  });

  const featuredImages = [
    './src/assets/images/21-bumble.webp',
    './src/assets/images/urZC1GHMf9ve.webp',
    './src/assets/images/21-bumble.webp',
  ];

  for (const [index, imgPath] of featuredImages.entries()) {
    const panel = createElement({
      tag: 'div',
      classes: [
        'w-[100vw]',
        'h-[50vh]',
        'flex-shrink-0',
        'flex',
        'items-center',
        'justify-center',
      ],
      parent: horizontalTrack,
    });
    createElement({
      tag: 'img',
      attributes: { src: imgPath, alt: `Featured Blend ${index + 1}` },
      classes: [
        'max-h-full',
        'max-w-full',
        'object-contain',
        'rounded-lg',
        'shadow-md',
      ],
      parent: panel,
    });
  }

  const scrollDistance = () =>
    horizontalTrack.scrollWidth - featuredWrapper.clientWidth;

  if (featuredImages.length > 0) {
    gsap.to(horizontalTrack, {
      x: () => -scrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: featuredSection,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${scrollDistance()}`,
        invalidateOnRefresh: true,
      },
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());

  const productListingSection = createElement({
    tag: 'section',
    attributes: { id: 'product-listing-section' },
    classes: ['py-16', 'backdrop-blur-sm', 'bg-white/30'],
    parent: homeContainer,
  });
  const productListingWrapper = createElement({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4'],
    parent: productListingSection,
  });
  createElement({
    tag: 'h2',
    text: 'Explore Our Drinks',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-12',
      'text-gray-800',
    ],
    parent: productListingWrapper,
  });

  const productsGrid = createElement({
    tag: 'div',
    attributes: { id: 'products-grid' },
    classes: [
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'gap-8',
    ],
    parent: productListingWrapper,
  });

  if (allProducts.length > 0) {
    const displayedProducts = allProducts.slice(0, 4);
    for (const [index, product] of displayedProducts.entries()) {
      const productCard = createProductCardElement(product);
      productsGrid.append(productCard);
      gsap.from(productCard, {
        duration: 0.5,
        opacity: 0,
        y: 50,
        scale: 0.95,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: productCard,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        delay: index * 0.1,
      });
    }
    if (displayedProducts.length > 0) ScrollTrigger.refresh();
  } else if (!productsGrid.querySelector('p')) {
    createElement({
      tag: 'p',
      text: 'No drinks to display in this section.',
      classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
      parent: productsGrid,
    });
  }
}

export default createHomePage;
