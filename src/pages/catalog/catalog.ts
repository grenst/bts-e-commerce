import { createEl as createElement } from '../../utils/element-utilities';
import { createCatalogNavigationElement } from '../../components/catalog/catalog-navigation';
import { createCatalogSubNavElement } from '../../components/catalog/catalog-sub-nav';
import { createProductListElement } from '../../components/catalog/product-list';
import { getAllPublishedProducts as getAllProducts } from '../../api/products/product-service';
import { getAllCategories } from '../../api/products/product-service';
import { Product, Category, ActiveSortMode } from '../../types/catalog-types';
import { createProductCardSkeletonElement } from '../../components/features/product-card-skeleton';
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
  // productModal.modalElement.classList.add('second');

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
  const selectedVolumes = new Set<string>();
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
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async function fetchProducts() {
    try {
      // Show loading state
      renderProductList(true);

      const filterClauses: string[] = [];

      if (selectedCategoryId) {
        filterClauses.push(`categories.id:"${selectedCategoryId}"`);
      }

      if (selectedVolumes.size > 0) {
        const values = [...selectedVolumes].map((v) => `"${v}"`).join(',');
        filterClauses.push(`variants.attributes.volume.key:${values}`);
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
      console.error(
        'Error fetching products:',
        error instanceof Error ? error.message : String(error)
      );
      // Render empty state on error
      renderProductList();
    }
  }

  function renderProductList(isLoading = false) {
    productListContainer.innerHTML = '';

    if (isLoading) {
      // Show skeleton placeholders while loading
      const skeletonGrid = createElement({
        tag: 'div',
        classes: ['grid', 'grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'gap-4']
      });
      
      for (let i = 0; i < 8; i++) {
        skeletonGrid.append(createProductCardSkeletonElement());
      }
      
      productListContainer.append(skeletonGrid);
      return;
    }

    if (allProducts.length === 0) {
      // Show empty state
      const emptyState = createElement({
        tag: 'div',
        classes: ['text-center', 'py-12'],
        text: 'No products found. Try changing your filters.'
      });
      productListContainer.append(emptyState);
      return;
    }

    displayedProducts = allProducts;
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
    if (event instanceof CustomEvent && 'searchTerm' in event.detail) {
      currentSearchTerm = event.detail.searchTerm;
      fetchProducts();
    }
  });

  subNavControl.element.addEventListener('filters-changed', (event: Event) => {
    if (
      event instanceof CustomEvent &&
      'selectedCategoryId' in event.detail &&
      'selectedVolumes' in event.detail
    ) {
      const detail = event.detail;
      selectedCategoryId = detail.selectedCategoryId;
      selectedVolumes.clear();
      for (const volume of detail.selectedVolumes) {
        selectedVolumes.add(volume);
      }
      fetchProducts();
    }
  });

  subNavControl.element.addEventListener('sort-changed', (event: Event) => {
    if (
      event instanceof CustomEvent &&
      'key' in event.detail &&
      'asc' in event.detail
    ) {
      currentSortMode = event.detail;
      fetchProducts();
    }
  });

  navigation.addEventListener('apply-discount-filter', () => {
    discountOnly = true;
    fetchProducts();
  });

  navigation.addEventListener('reset-filters', () => {
    selectedCategoryId = undefined;
    selectedVolumes.clear();
    currentSearchTerm = '';
    discountOnly = false;
    currentSortMode = { key: 'name', asc: true };
    const searchInput = navigation.querySelector('input[type="text"]');
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = '';
    }
    fetchProducts();
  });

  // Add event listener for PROMO CODES button
  const promoButton = navigation.querySelector('.promo-codes-button');
  if (promoButton) {
    promoButton.addEventListener('click', () => {
      subNavControl.toggle('promo');
    });
  }

  initializePage();
}
