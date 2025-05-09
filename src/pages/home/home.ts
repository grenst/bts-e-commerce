import { createEl } from '../../utils/elementUtils';
import { getAllPublishedProducts } from '../../api/products/productService';
import { createProductCardElement } from '../../components/features/product-card'; // Will be used for product listing
import { gsap, ScrollTrigger } from '../../animations/gsap-init'; // Import GSAP and ScrollTrigger
import { fetchBestProducts } from '../../api/products/productServiceTest';

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
      'h-[70vh]',
      "bg-[url('@assets/images/poring-milk-into-boba-tea.jpg')]", // Added background image
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

  const heroTitle = createEl({ // Temporary section
    tag: 'h2',
    attributes: { id: 'hero-title' }, // Added ID for GSAP
    text: 'Welcome to the Refreshed Bubble Tea Experience!',
    classes: [
      'text-4xl',
      'font-nexa-bold',
      'text-white',
      'bg-black/50', // Added a semi-transparent overlay for readability
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
    delay: 0.3, // Delay slightly after main title animation
  });
  // TODO: Consider adding parallax to the background image itself if desired

  // Featured Products/Categories Section (Placeholder)
  const featuredSection = createEl({
    tag: 'section',
    attributes: { id: 'featured-products-section' },
    classes: ['py-16', 'bg-white', 'overflow-hidden'], // Added overflow-hidden for pinning
    parent: homeContainer,
  });
  const featuredWrapper = createEl({
    tag: 'div',
    classes: ['container', 'mx-auto', 'px-4', 'relative'], // Added relative for positioning track
    parent: featuredSection,
  });
  createEl({
    tag: 'h2',
    text: 'Our Special Blends',
    classes: [
      'text-3xl',
      'font-nexa-bold',
      'text-center',
      'mb-12',
      'text-gray-800',
    ],
    parent: featuredWrapper,
  });

  // Horizontal scrolling track
  const horizontalTrack = createEl({
    tag: 'div',
    attributes: { id: 'horizontal-track' },
    classes: ['flex', 'w-max'], // w-max to allow content to exceed parent width, flex for items
    parent: featuredWrapper,
  });

  const featuredImages = [
    './src/assets/images/21-bumble.jpg',
    './src/assets/images/75849566_m_normal_none.jpg',
  ];

  featuredImages.forEach((imgPath, index) => {
    const panel = createEl({
      tag: 'div',
      classes: [
        'w-screen', // Each panel takes full screen width initially
        'h-[50vh]', // Example height for panels
        'flex-shrink-0', // Prevent panels from shrinking
        'flex',
        'items-center',
        'justify-center',
        'p-1',
        'box-border',
      ],
      parent: horizontalTrack,
    });
    const img = createEl({
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

  gsap.to(horizontalTrack, {
    xPercent: -100 * (featuredImages.length - 1), // Scroll by (number of panels - 1) * 100%
    ease: 'none', // Linear scroll
    scrollTrigger: {
      trigger: featuredSection, // The section itself
      pin: true, // Pin the section while scrolling horizontally
      scrub: 1, // Smooth scrubbing, 1 second delay
      // markers: true, // For debugging
      start: 'top top', // When the top of the trigger hits the top of the viewport
      end: () =>
        `+=${horizontalTrack.offsetWidth - featuredWrapper.offsetWidth}`, // End after scrolling the entire track width minus one screen width
      invalidateOnRefresh: true, // Recalculate on resize
    },
  });

  // Create section the best products
  const productBestChoice: HTMLElement = createEl({
    tag: 'section',
    attributes: { id: 'product-best-choice' },
    classes: ['py-16'],
    parent: homeContainer,
  });

  const productBestChoiceItem: HTMLElement = createEl({
    tag: 'div',
    attributes: { id: 'productBestChoiceItem' },
    classes: ['py-16'],
    parent: productBestChoice,
  });
  displayBestProduct(productBestChoiceItem);

  // Product Listing Section
  const productListingSection = createEl({
    tag: 'section',
    attributes: { id: 'product-listing-section' },
    classes: ['py-16', 'bg-gray-50'], // Example styling, using a light surface color
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
            // markers: true, // Uncomment for debugging ScrollTrigger
            toggleActions: 'play none none none', // Play animation once when it enters viewport
          },
          delay: index * 0.1, // Stagger the animation slightly for each card
        });
      });
      // Refresh ScrollTrigger after all cards are added to ensure correct calculations
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
  async function displayBestProduct(containerElement: HTMLElement) {
    const loadingMessage = createEl({
      tag: 'p',
      text: 'Loading your delightful drinks...',
      classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
      parent: containerElement,
    });

    try {
      const bestProducts = await fetchBestProducts();
      loadingMessage.remove();

      if (bestProducts.length === 0) {
        createEl({
          tag: 'p',
          text: 'No drinks available at the moment. Please check back soon!',
          classes: ['text-center', 'text-gray-500', 'my-4', 'col-span-full'],
          parent: productsGrid,
        });
      } else {
        bestProducts.forEach((product, index) => {
          const productCard = createProductCardElement(product);
          containerElement.appendChild(productCard);

          // GSAP animation for card entrance
          gsap.from(productCard, {
            duration: 0.5,
            opacity: 0,
            y: 50,
            scale: 0.95,
            ease: 'power1.out',
            delay: index * 0.1, // Stagger the animation slightly for each card
          });
        });
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
}

export default createHomePage;
