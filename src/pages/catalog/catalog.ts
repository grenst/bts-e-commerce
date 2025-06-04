import { createEl as createElement } from '../../utils/element-utilities';
import { createCatalogNavigationElement } from '../../components/catalog/catalog-navigation';
import { createCatalogSubNavElement } from '../../components/catalog/catalog-sub-nav';
import { createProductListElement } from '../../components/catalog/product-list';
import { applyFilters } from '../../logic/product-filter';
import { sortProducts } from '../../logic/product-sort';
import { getAllProducts } from '../../api/products/product-service';
import { getAllCategories } from '../../api/products/product-service';
import { Product, Category, ActiveSortMode } from '../../types/catalog-types';
import {
  createProductModal,
  ProductModal,
} from '../../components/layout/modal/product-modal';

let productModal: ProductModal;

export function createCatalogPage(container: HTMLElement): void {
  container.innerHTML = '';

  const section = createElement({
    tag: 'section',
    classes: ['catalog', 'px-2', 'bg-white', 'pb-8'],
  });

  const title = createElement({
    tag: 'h1',
    attributes: { class: 'text-4xl font-impact text-center my-1 pt-8 min-[500px]:my-6' }, // TODO @451-490 wide is header UI-bug
    text: 'Grab your drink',
  });

  const navigation = createCatalogNavigationElement();
  const subNavControl = createCatalogSubNavElement();

  const productListContainer = createElement({
    tag: 'div',
    classes: ['product-list-container', 'mt-8', 'xl:px-[10%]'],
  });

  section.append(
    title,
    navigation,
    subNavControl.element,
    productListContainer
  );

  container.append(section);

  // Initialize product modal
  if (!productModal) {
    productModal = createProductModal();
    document.body.append(productModal.modalElement);
  }

  // State management variables
  let allProducts: Product[] = [];
  let displayedProducts: Product[] = [];
  const allCategoriesMap: Map<string, Category> = new Map();
  let activeCategoryIds: Set<string> = new Set();
  let currentSearchTerm: string = '';
  let currentSortMode: ActiveSortMode = { key: 'name', asc: true };

  async function initializePage() {
    try {
      // Fetch all products and categories
      allProducts = await getAllProducts();
      const categories = await getAllCategories();

      // categories map
      for (const category of categories) {
        allCategoriesMap.set(category.id, category);
      }

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
    const filteredProducts = applyFilters(
      allProducts,
      activeCategoryIds,
      currentSearchTerm
    );
    displayedProducts = sortProducts(filteredProducts, currentSortMode);

    // Clear and update product list container
    productListContainer.innerHTML = '';
    const productListElement = createProductListElement(
      displayedProducts,
      allCategoriesMap
    );
    productListContainer.append(productListElement);
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
    const customEvent = event as CustomEvent<{
      activeCategoryIds: Set<string>;
    }>;
    activeCategoryIds = customEvent.detail.activeCategoryIds;
    renderOrUpdateProductList();
  });

  // Handle sort changes
  subNavControl.element.addEventListener('sort-changed', (event: Event) => {
    const customEvent = event as CustomEvent<ActiveSortMode>;
    currentSortMode = customEvent.detail;
    renderOrUpdateProductList();
  });

  // Handle apply-discount-filter event
  navigation.addEventListener('apply-discount-filter', () => {
    // Logic to filter products with discounts
    const discountedProducts = allProducts.filter(
      (product) => product.masterVariant.prices?.[0]?.discounted?.value
    );
    displayedProducts = sortProducts(discountedProducts, currentSortMode);

    // Update product list
    productListContainer.innerHTML = '';
    const productListElement = createProductListElement(
      displayedProducts,
      allCategoriesMap
    );
    productListContainer.append(productListElement);
  });

  // Handle reset-filters event
  navigation.addEventListener('reset-filters', () => {
    // Reset all filters
    activeCategoryIds = new Set(allCategoriesMap.keys());
    currentSearchTerm = '';
    currentSortMode = { key: 'name', asc: true };

    // Reset search input
    const searchInput = navigation.querySelector('input[type="text"]');
    if (searchInput) {
      (searchInput as HTMLInputElement).value = '';
    }

    // Re-render with all products
    renderOrUpdateProductList();
  });

  initializePage();
}
