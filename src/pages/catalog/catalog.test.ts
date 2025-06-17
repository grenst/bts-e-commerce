import { createCatalogPage } from './catalog';
import { createEl as createElement } from '../../utils/element-utilities';
import { createCatalogNavigationElement } from '../../components/catalog/catalog-navigation';
import { createCatalogSubNavElement } from '../../components/catalog/catalog-sub-nav';
import { createProductListElement } from '../../components/catalog/product-list';
import {
  getAllPublishedProducts as getAllProducts,
  getAllCategories,
} from '../../api/products/product-service';
import {
  ModalManager,
  ProductModal,
} from '../../components/layout/modal/product-modal';
import { Product, Category, ActiveSortMode } from '../../types/catalog-types';

describe('createCatalogPage', () => {
  let container: HTMLElement;
  let mockNavigation: HTMLElement;
  let mockSubNavControl: { element: HTMLElement; toggle: jest.Mock };
  let mockProductModal: ProductModal & {
    showModal: jest.Mock;
    hideModal: jest.Mock;
  };

  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: { 'en-US': 'Product 1' },
      description: { 'en-US': 'Description 1' },
      masterVariant: {
        prices: [{ value: { centAmount: 1000, currencyCode: 'USD' } }],
        images: [],
        attributes: [],
      },
      slug: 'product-1',
      categories: [],
    },
  ];

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: { 'en-US': 'Category 1' },
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    jest.clearAllMocks();

    // Mock DOM element methods
    jest
      .spyOn(HTMLElement.prototype, 'addEventListener')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype, 'dispatchEvent')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype, 'querySelector')
      .mockImplementation(jest.fn());
    jest.spyOn(HTMLElement.prototype, 'append').mockImplementation(jest.fn());
    jest.spyOn(HTMLElement.prototype, 'remove').mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype, 'setAttribute')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype, 'textContent', 'set')
      .mockImplementation(jest.fn());

    // Directly mock classList methods
    jest
      .spyOn(HTMLElement.prototype.classList, 'add')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype.classList, 'remove')
      .mockImplementation(jest.fn());
    jest
      .spyOn(HTMLElement.prototype.classList, 'contains')
      .mockImplementation(jest.fn());

    mockNavigation = document.createElement('nav');
    mockSubNavControl = {
      element: document.createElement('div'),
      toggle: jest.fn(),
    };
    mockProductModal = {
      modalElement: document.createElement('div'),
      showModal: jest.fn(),
      hideModal: jest.fn(),
    } as ProductModal & { showModal: jest.Mock; hideModal: jest.Mock };

    (createElement as jest.Mock).mockImplementation((options) => {
      const el = document.createElement(options.tag);
      if (options.classes) {
        el.classList.add(...options.classes);
      }
      if (options.attributes) {
        for (const key in options.attributes) {
          el.setAttribute(key, options.attributes[key]);
        }
      }
      if (options.text) {
        el.textContent = options.text;
      }
      return el;
    });

    (createCatalogNavigationElement as jest.Mock).mockReturnValue(
      mockNavigation
    );
    (createCatalogSubNavElement as jest.Mock).mockReturnValue(
      mockSubNavControl
    );
    (ModalManager.getModal as jest.Mock).mockReturnValue(mockProductModal);

    (getAllCategories as jest.Mock).mockResolvedValue(mockCategories);
    (getAllProducts as jest.Mock).mockResolvedValue(mockProducts);

    Object.defineProperty(globalThis, 'history', {
      value: {
        state: {},
        replaceState: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the basic catalog page structure', async () => {
    createCatalogPage(container);

    expect(container.querySelector('.catalog')).not.toBeNull();
    expect(container.querySelector('h1')?.textContent).toBe('Grab your drink');
    expect(createCatalogNavigationElement).toHaveBeenCalledTimes(1);
    expect(createCatalogSubNavElement).toHaveBeenCalledTimes(1);
    expect(createElement).toHaveBeenCalledWith({
      tag: 'div',
      classes: ['product-list-container', 'mt-8', 'xl:px-[10%]'],
    });
    expect(ModalManager.getModal).toHaveBeenCalledTimes(1);
  });

  it('should initialize page by fetching categories and products', async () => {
    createCatalogPage(container);

    await Promise.resolve();

    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getAllProducts).toHaveBeenCalledTimes(1);
    expect(createProductListElement).toHaveBeenCalledWith(
      mockProducts,
      expect.any(Map)
    );
  });

  it('should open product modal if state has openProductModal', async () => {
    Object.defineProperty(globalThis.history, 'state', {
      value: { openProductModal: 'prod123' },
      writable: true,
    });
    createCatalogPage(container);

    await Promise.resolve();

    expect(mockProductModal.showModal).toHaveBeenCalledWith('prod123');
    expect(globalThis.history.replaceState).toHaveBeenCalledWith(
      { openProductModal: undefined },
      ''
    );
  });

  it('should handle filter-toggle event', async () => {
    createCatalogPage(container);
    await Promise.resolve();

    mockNavigation.dispatchEvent(new CustomEvent('filter-toggle'));

    expect(mockSubNavControl.toggle).toHaveBeenCalledWith('filters');
  });

  it('should handle sort-toggle event', async () => {
    createCatalogPage(container);
    await Promise.resolve();

    mockNavigation.dispatchEvent(new CustomEvent('sort-toggle'));

    expect(mockSubNavControl.toggle).toHaveBeenCalledWith('sort');
  });

  it('should handle search-change event and fetch products', async () => {
    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    mockNavigation.dispatchEvent(
      new CustomEvent('search-change', { detail: { searchTerm: 'honey' } })
    );

    await Promise.resolve();

    expect(getAllProducts).toHaveBeenCalledWith(
      undefined,
      'name.en-US asc',
      'honey'
    );
  });

  it('should handle filters-changed event and fetch products', async () => {
    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    const filtersDetail = {
      selectedCategoryId: 'cat1',
      selectedVolumes: ['500ml', '1000ml'],
    };
    mockSubNavControl.element.dispatchEvent(
      new CustomEvent('filters-changed', { detail: filtersDetail })
    );

    await Promise.resolve();

    expect(getAllProducts).toHaveBeenCalledWith(
      [
        'categories.id:"cat1"',
        'variants.attributes.volume.key:"500ml","1000ml"',
      ],
      'name.en-US asc',
      ''
    );
  });

  it('should handle sort-changed event and fetch products', async () => {
    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    const sortDetail: ActiveSortMode = { key: 'price', asc: false };
    mockSubNavControl.element.dispatchEvent(
      new CustomEvent('sort-changed', { detail: sortDetail })
    );

    await Promise.resolve();

    expect(getAllProducts).toHaveBeenCalledWith(undefined, 'price desc', '');
  });

  it('should handle apply-discount-filter event and fetch products', async () => {
    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    mockNavigation.dispatchEvent(new CustomEvent('apply-discount-filter'));

    await Promise.resolve();

    expect(getAllProducts).toHaveBeenCalledWith(
      ['variants.prices.discounted:exists'],
      'name.en-US asc',
      ''
    );
  });

  it('should handle reset-filters event and fetch products', async () => {
    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    mockNavigation.append(searchInput);

    mockNavigation.dispatchEvent(new CustomEvent('reset-filters'));

    await Promise.resolve();

    expect(getAllProducts).toHaveBeenCalledWith(
      undefined,
      'name.en-US asc',
      ''
    );
    expect(searchInput.textContent).toBe('');
  });

  it('should log error if getAllCategories fails', async () => {
    (getAllCategories as jest.Mock).mockRejectedValue(new Error('API Error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    createCatalogPage(container);
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error initializing catalog page:',
      'API Error'
    );
    consoleErrorSpy.mockRestore();
  });

  it('should log error if getAllProducts fails', async () => {
    (getAllProducts as jest.Mock).mockRejectedValue(new Error('Network Error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    createCatalogPage(container);
    await Promise.resolve();
    (getAllProducts as jest.Mock).mockClear();

    mockNavigation.dispatchEvent(
      new CustomEvent('search-change', { detail: { searchTerm: 'test' } })
    );
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching products:',
      'Network Error'
    );
    consoleErrorSpy.mockRestore();
  });
});
