import { createEl as createElement } from '../../utils/element-utilities';
import { createCatalogNavigationElement } from '../../components/catalog/catalog-navigation';
import { createCatalogSubNavElement } from '../../components/catalog/catalog-sub-nav';
import { createProductListElement } from '../../components/catalog/product-list';
import { getAllPublishedProducts as getAllProducts } from '../../api/products/product-service';
import { getAllCategories } from '../../api/products/product-service';
import { Product, Category, ActiveSortMode } from '../../types/catalog-types';
import {
  // createProductModal,
  // ProductModal,
  ModalManager,
} from '../../components/layout/modal/product-modal';

// export let productModal: ProductModal;

// export class ModalManager {
//   private static instance: ProductModal | undefined = undefined;

//   static getModal(): ProductModal {
//     if (!this.instance) {
//       this.instance = createProductModal();
//       document.body.append(this.instance.modalElement);
//       this.instance.modalElement.classList.add('first');
//     }
//     return this.instance;
//   }

//   static clearModal(): void {
//     if (this.instance) {
//       this.instance.modalElement.remove();
//       this.instance = undefined;
//     }
//   }
// }

export function createCatalogPage(container: HTMLElement): void {
  container.innerHTML = '';

  const section = createElement({
    tag: 'section',
    classes: ['catalog', 'px-2', 'bg-white', 'pb-8'],
  });

  const title = createElement({
    tag: 'h1',
    attributes: {
      class: 'text-4xl font-impact text-center my-1 pt-8 min-[680px]:my-6',
    },
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

  // if (!productModal) {
  //   productModal = createProductModal();
  //   document.body.append(productModal.modalElement);
  // }

  const productModal = ModalManager.getModal();
  productModal.modalElement.classList.add('second');

  const state = globalThis.history.state;
  if (state?.openProductModal) {
    productModal.showModal(state.openProductModal);
    globalThis.history.replaceState(
      { ...state, openProductModal: undefined },
      ''
    );
  }

  let allProducts: Product[] = [];
  let displayedProducts: Product[] = [];
  const allCategoriesMap: Map<string, Category> = new Map();
  let selectedCategoryId: string | undefined;
  const selectedSizes = new Set<string>();
  let currentSearchTerm = '';
  let discountOnly = false;
  let currentSortMode: ActiveSortMode = { key: 'name', asc: true };

  async function initializePage() {
    try {
      const categories = await getAllCategories();
      for (const category of categories) {
        allCategoriesMap.set(category.id, category);
      }
      await fetchProducts();
    } catch (error) {
      console.error(
        'Error initializing catalog page:',
        (error as Error).message
      );
    }
  }

  async function fetchProducts() {
    try {
      const filterClauses: string[] = [];

      if (selectedCategoryId) {
        filterClauses.push(`categories.id:"${selectedCategoryId}"`);
      }

      if (selectedSizes.size > 0) {
        const values = [...selectedSizes].map((s) => `"${s}"`).join(',');
        filterClauses.push(`variants.attributes.size:${values}`);
      }

      if (discountOnly) {
        filterClauses.push('variants.prices.discounted:exists');
      }

      const filterParameter =
        filterClauses.length > 0 ? filterClauses : undefined;

      const sortParameter =
        currentSortMode.key === 'name'
          ? `name.en-US ${currentSortMode.asc ? 'asc' : 'desc'}`
          : `price ${currentSortMode.asc ? 'asc' : 'desc'}`;

      allProducts = await getAllProducts(
        filterParameter,
        sortParameter,
        currentSearchTerm
      );
      renderProductList();
    } catch (error) {
      console.error('Error fetching products:', (error as Error).message);
    }
  }

  function renderProductList() {
    displayedProducts = allProducts;
    productListContainer.innerHTML = '';
    productListContainer.append(
      createProductListElement(displayedProducts, allCategoriesMap)
    );
  }

  navigation.addEventListener('filter-toggle', () => {
    subNavControl.toggle('filters');
  });

  navigation.addEventListener('sort-toggle', () => {
    subNavControl.toggle('sort');
  });

  navigation.addEventListener('search-change', (event: Event) => {
    currentSearchTerm = (event as CustomEvent<{ searchTerm: string }>).detail
      .searchTerm;
    fetchProducts();
  });

  subNavControl.element.addEventListener('filters-changed', (event: Event) => {
    const detail = (
      event as CustomEvent<{
        selectedCategoryId: string | undefined;
        selectedSizes: Set<string>;
      }>
    ).detail;
    selectedCategoryId = detail.selectedCategoryId;
    selectedSizes.clear();
    for (const size of detail.selectedSizes) {
      selectedSizes.add(size);
    }
    fetchProducts();
  });

  subNavControl.element.addEventListener('sort-changed', (event: Event) => {
    currentSortMode = (event as CustomEvent<ActiveSortMode>).detail;
    fetchProducts();
  });

  navigation.addEventListener('apply-discount-filter', () => {
    discountOnly = true;
    fetchProducts();
  });

  navigation.addEventListener('reset-filters', () => {
    selectedCategoryId = undefined;
    selectedSizes.clear();
    currentSearchTerm = '';
    discountOnly = false;
    currentSortMode = { key: 'name', asc: true };
    const searchInput = navigation.querySelector('input[type="text"]');
    if (searchInput) {
      (searchInput as HTMLInputElement).value = '';
    }
    fetchProducts();
  });

  initializePage();
}
