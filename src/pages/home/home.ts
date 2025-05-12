import { createEl } from '../../utils/elementUtils';
import { getAllPublishedProducts } from '../../api/products/productService';
import { createProductCardElement } from '../../components/features/product-card'; // Will be used for product listing
import { gsap, ScrollTrigger } from '../../animations/gsap-init'; // Import GSAP and ScrollTrigger

export async function createHomePage(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const homeContainer = createEl({
    tag: 'div',
    parent: container,
    classes: ['home-page-redesigned', 'w-full'],
  });

  // Hero Section
  const heroSection = createEl({
    tag: 'section',
    attributes: { id: 'hero-section' },
    classes: [
      'h-[calc(100dvh-140px)]',
      'bg-transparent',
      // "bg-[url('@assets/images/poring-milk-into-boba-tea.jpg')]",
      'bg-cover',
      'bg-center',
      'flex',
      'items-center',
      'justify-center',
      'text-center',
      'relative',
      'overflow-hidden',
    ],
    parent: homeContainer,
  });

  const heroTitle = createEl({
    // Temporary section
    tag: 'h2',
    attributes: { id: 'hero-title' }, // Added ID for GSAP
    text: '',
    classes: [
      'text-4xl',
      'font-nexa-bold',
      'text-white',
      'bg-black/50',
      'p-4',
      'rounded-md',
    ],
    parent: heroSection,
  });

  // GSAP animation for hero title
  gsap.from(heroTitle, {
    duration: 1.2,
    opacity: 0,
    scale: 0.5,
    ease: 'back.out(1.7)',
    delay: 0.3,
  });

  /* ---------- ACTUAL PRODUCTS ---------- */
  const actualSection = createEl({
    tag: 'section',
    attributes: { id: 'actual-products' },
    classes: ['py-8', 'backdrop-blur-sm', 'bg-white/30'],
    parent: homeContainer,
  });

  const actualWrapper = createEl({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4'],
    parent: actualSection,
  });

  createEl({
    tag: 'h2',
    text: 'Actual Products',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-12',
      'text-gray-800',
    ],
    parent: actualWrapper,
  });

  const actualGrid = createEl({
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

  const actualLoading = createEl({
    tag: 'p',
    text: 'Loading products...',
    classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
    parent: actualGrid,
  });

  try {
    const products = await getAllPublishedProducts();
    actualLoading.remove();

    if (products.length === 0) {
      createEl({
        tag: 'p',
        text: 'No products found.',
        classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
        parent: actualGrid,
      });
    } else {
      products.forEach((product, index) => {
        const card = createProductCardElement(product);
        actualGrid.appendChild(card);

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
      });
      ScrollTrigger.refresh();
    }
  } catch (e) {
    actualLoading.remove();
    createEl({
      tag: 'p',
      text: 'Failed to load products. Please try again later.',
      classes: [
        'text-center',
        'text-red-500',
        'pt-16',
        'my-20',
        'col-span-full',
      ],
      parent: actualGrid,
    });
    console.log(e);
  }

  // Featured Products/Categories Section (Placeholder)
  const featuredSection = createEl({
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
  const featuredWrapper = createEl({
    tag: 'div',
    classes: ['relative', 'overflow-hidden', 'w-full'],
    parent: featuredSection,
  });
  createEl({
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

  // Horizontal scrolling track
  const horizontalTrack = createEl({
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

  featuredImages.forEach((imgPath, index) => {
    const panel = createEl({
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
    createEl({
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
  });

  // const panels = Array.from(horizontalTrack.children) as HTMLElement[];

  const scrollDistance = () =>
    horizontalTrack.scrollWidth - featuredWrapper.clientWidth;

  gsap.to(horizontalTrack, {
    x: () => -scrollDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: featuredSection,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => '+=' + scrollDistance(),
      invalidateOnRefresh: true,
    },
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());

  // Product Listing Section
  const productListingSection = createEl({
    tag: 'section',
    attributes: { id: 'product-listing-section' },
    classes: ['py-16', 'backdrop-blur-sm', 'bg-white/30'],
    parent: homeContainer,
  });
  const productListingWrapper = createEl({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4'],
    parent: productListingSection,
  });
  createEl({
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

  const productsGrid = createEl({
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

  // Fetch and display products (similar to CommerceTestComponent logic)
  const loadingMessage = createEl({
    tag: 'p',
    text: 'Loading your delightful drinks...',
    classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
    parent: productsGrid,
  });

  try {
    const products = await getAllPublishedProducts();
    loadingMessage.remove();

    if (products.length === 0) {
      createEl({
        tag: 'p',
        text: 'No drinks available at the moment. Please check back soon!',
        classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
        parent: productsGrid,
      });
    } else {
      products.forEach((product, index) => {
        const productCard = createProductCardElement(product);
        productsGrid.appendChild(productCard);

        // GSAP animation for card entrance
        gsap.from(productCard, {
          duration: 0.5,
          opacity: 0,
          y: 50,
          scale: 0.95,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: productCard,
            start: 'top 90%', // Trigger when 90% of the card is visible
            toggleActions: 'play none none none', // Play animation once when it enters viewport
          },
          delay: index * 0.1, // Stagger the animation slightly for each card
        });
      });
      ScrollTrigger.refresh();
    }
  } catch (error) {
    loadingMessage.remove();
    console.error('Failed to load products for home page:', error);
    createEl({
      tag: 'p',
      text: 'Oops! We couldn’t fetch the drinks. Please try refreshing.',
      classes: ['text-center', 'text-red-500', 'my-4', 'col-span-full'],
      parent: productsGrid,
    });
  }
}

export default createHomePage;
