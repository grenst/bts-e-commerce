import { Product, Category } from '../../types/catalog-types';
import { createProductCardElement } from '../features/product-card';
import { createEl } from '../../utils/element-utilities';

export function createProductListElement(
  products: Product[],
  allCategories: Map<string, Category>
): HTMLElement {
  const container = createEl({ tag: 'div', classes: ['product-list'] });

  // Handle empty product list
  if (products.length === 0) {
    const emptyMessage = createEl({
      tag: 'p',
      classes: ['text-center', 'py-2', 'text-gray-500'],
      text: 'No products found matching your criteria.'
    });
    container.appendChild(emptyMessage);
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const placeholder = entry.target as HTMLElement;
        const product = placeholder.dataset.product
          ? JSON.parse(placeholder.dataset.product)
          : undefined;
        
        if (product) {
          const card = createProductCardElement(product, () => {});
          card.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          
          placeholder.replaceWith(card);
          
          requestAnimationFrame(() => {
            card.classList.remove('opacity-0');
          });
        }
        observer.unobserve(placeholder);
      }
    });
  }, { rootMargin: '100px' });

  // Render product groups
  for (const [categoryId, categoryProducts] of groupedProducts) {
    const category = allCategories.get(categoryId);
    const categoryName =
      category
        ? category.name['en-US'] // дефолтовая локаль в проекте
            || category.name.en // вдруг всё-таки есть
            || Object.values(category.name)[0] // любая доступная локализация
            || 'Unnamed category'
        : 'Uncategorized';
    
    // Debug logging to verify category lookup
    if (!category) {
      console.warn(`Category not found for ID: ${categoryId}`);
    }

    // Create category header
    const header = createEl({
      tag: 'h2',
      // classes: ['text-2xl', 'font-semibold', 'my-6', 'border-b', 'pb-2'],
      classes: ['text-2xl', 'font-semibold', 'mt-6', 'pb-2'],
      text: categoryName
    });
    container.appendChild(header);

    // Create product grid
    const grid = createEl({
      tag: 'div',
      classes: ['grid', 'grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'gap-1']
    });
    container.appendChild(grid);

    // Add product cards with lazy loading
    for (const product of categoryProducts) {
      const placeholder = createEl({
        tag: 'div',
        classes: ['product-card-placeholder', 'bg-gray-100', 'rounded-lg'],
        styles: { minHeight: '300px' },
        attributes: { 'data-product': JSON.stringify(product) }
      });
      
      grid.appendChild(placeholder);
      observer.observe(placeholder);
    }
  }

  return container;
}