import { Product, Category } from '../../types/catalog-types';
import { createProductCardElement } from '../features/product-card';
import { createEl as createElement } from '../../utils/element-utilities';
import { ModalManager } from '../../components/layout/modal/product-modal';

export function createProductListElement(
  products: Product[],
  allCategories: Map<string, Category>
): HTMLElement {
  const container = createElement({
    tag: 'div',
    classes: ['product-list', 'overflow-hidden'],
  });

  // Initialize product modal if not already initialized

  ModalManager.getModal();

  // Handle empty product list
  if (products.length === 0) {
    const emptyMessage = createElement({
      tag: 'p',
      classes: ['text-center', 'py-2', 'text-gray-500'],
      text: 'No products found matching your criteria.',
    });
    container.append(emptyMessage);
    return container;
  }

  // Group products by primary category
  const groupedProducts = new Map<string, Product[]>();
  for (const product of products) {
    const categoryId = product.categories?.[0]?.id || 'uncategorized';
    if (!groupedProducts.has(categoryId)) {
      groupedProducts.set(categoryId, []);
    }
    groupedProducts.get(categoryId)?.push(product);
  }

  // Create IntersectionObserver for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!(entry.target instanceof HTMLElement)) {
            return;
          }
          const placeholder: HTMLElement = entry.target;
          const product = placeholder.dataset.product
            ? JSON.parse(placeholder.dataset.product)
            : undefined;

          if (product) {
            const card = createProductCardElement(product);
            card.classList.add(
              'opacity-0',
              'transition-opacity',
              'duration-500'
            );

            placeholder.replaceWith(card);

            requestAnimationFrame(() => {
              card.classList.remove('opacity-0');
            });
          }
          observer.unobserve(placeholder);
        }
      }
    },
    { rootMargin: '100px' }
  );

  // Render product groups
  for (const [categoryId, categoryProducts] of groupedProducts) {
    const category = allCategories.get(categoryId);
    const categoryName = category
      ? category.name['en-US'] || // дефолтная локаль в проекте
        category.name.en || // вдруг всё-таки есть
        Object.values(category.name)[0] || // любая доступная локализация
        'Unnamed category'
      : 'Uncategorized';

    // Create category header
    const header = createElement({
      tag: 'h2',
      classes: ['text-2xl', 'font-semibold', 'mt-6', 'pb-2'],
      text: categoryName,
    });
    container.append(header);

    // Create product grid
    const grid = createElement({
      tag: 'div',
      classes: [
        'grid',
        'grid-cols-1',
        'min-[440px]:grid-cols-2',
        'min-[610px]:grid-cols-3',
        'min-[830px]:grid-cols-4',
        // 'gap-1',
      ],
    });
    container.append(grid);

    // Add product cards with lazy loading
    for (const product of categoryProducts) {
      const placeholder = createElement({
        tag: 'div',
        classes: ['product-card-placeholder', 'bg-gray-100', 'rounded-lg'],
        styles: { minHeight: '300px' },
        attributes: { 'data-product': JSON.stringify(product) },
      });

      grid.append(placeholder);
      observer.observe(placeholder);
    }
  }

  return container;
}
