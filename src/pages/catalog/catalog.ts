import { createEl } from '../../utils/element-utilities';
import { Router } from '../../router/router';
import { createCatalogNavigationElement } from '../../components/catalog/catalog-navigation';
import { createCatalogSubNavElement } from '../../components/catalog/catalog-sub-nav';
import { createProductListElement } from '../../components/catalog/product-list';
import { applyFilters } from '../../logic/product-filter';
import { sortProducts } from '../../logic/product-sort';
import { getAllProducts } from '../../api/products/product-service';
import { getAllCategories } from '../../api/products/product-service';
import {
  Product,
  Category,
  ActiveSortMode
} from '../../types/catalog-types';

export function createCatalogPage(container: HTMLElement, router: Router): void {
  container.innerHTML = '';

  const section = createEl({
    tag: 'section',
    classes: ['catalog', 'px-2', 'bg-white', 'pb-8']
  });

  const title = createEl({
    tag: 'h1',
    attributes: { class: 'text-4xl font-impact text-center my-8 pt-8' },
    text: 'Grab your drink'
  });

  const navigation = createCatalogNavigationElement();
  const subNavControl = createCatalogSubNavElement();

  const productListContainer = createEl({
    tag: 'div',
    classes: ['product-list-container', 'mt-8', 'xl:px-[10%]']
  });
  
  section.append(title, navigation, subNavControl.element, productListContainer);
  
  container.appendChild(section);

  // State management variables
  let allProducts: Product[] = [];
  let displayedProducts: Product[] = [];
  let allCategoriesMap: Map<string, Category> = new Map();
  let activeCategoryIds: Set<string> = new Set();
  let currentSearchTerm: string = '';
  let currentSortMode: ActiveSortMode = { key: 'name', asc: true };

  async function initializePage() {
    try {
      // Fetch all products and categories
      allProducts = await getAllProducts();
      const categories = await getAllCategories();
      
      // categories map
      categories.forEach((category: Category) => {
        allCategoriesMap.set(category.id, category);
      });
      
      // DEFAULT with all categories active
      activeCategoryIds = new Set(allCategoriesMap.keys());
      
      // Render initial product list
      renderOrUpdateProductList();
    } catch (error) {
      console.error('Error initializing catalog page:', error);
    }
  }

  function renderOrUpdateProductList() {
    // Apply filters and sorting
    const filteredProducts = applyFilters(allProducts, activeCategoryIds, currentSearchTerm);
    displayedProducts = sortProducts(filteredProducts, currentSortMode);
    
    // Clear and update product list container
    productListContainer.innerHTML = '';
    const productListEl = createProductListElement(displayedProducts, allCategoriesMap);
    productListContainer.appendChild(productListEl);
  }

  // Event listeners for navigation toggle events!!!
  navigation.addEventListener('filter-toggle', () => {
    subNavControl.toggle('filters');
  });

  navigation.addEventListener('sort-toggle', () => {
    subNavControl.toggle('sort');
  });

  // Handle search changes
  navigation.addEventListener('search-change', (event: Event) => {
    const customEvent = event as CustomEvent<{ searchTerm: string }>;
    currentSearchTerm = customEvent.detail.searchTerm;
    renderOrUpdateProductList();
  });

  // Handle filter changes
  subNavControl.element.addEventListener('filters-changed', (event: Event) => {
    const customEvent = event as CustomEvent<{ activeCategoryIds: Set<string> }>;
    activeCategoryIds = customEvent.detail.activeCategoryIds;
    renderOrUpdateProductList();
  });

  // Handle sort changes
  subNavControl.element.addEventListener('sort-changed', (event: Event) => {
    const customEvent = event as CustomEvent<ActiveSortMode>;
    currentSortMode = customEvent.detail;
    renderOrUpdateProductList();
  });

  initializePage();
}
