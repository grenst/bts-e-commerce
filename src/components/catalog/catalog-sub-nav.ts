import './catalog-sub-nav.scss';
import arrowsIconPath from '@/assets/images/arrows.svg';
import { createEl as createElement } from '../../utils/element-utilities';
import { getAllCategories } from '../../api/products/product-service';

// Define sort types
export type SortKey = 'name' | 'category' | 'price';
export interface SortOption {
  key: SortKey;
  label: string;
}
export interface ActiveSortMode {
  key: SortKey;
  asc: boolean;
}

export interface Category {
  id: string;
  name: Record<string, string>;
}

interface CatalogSubNavControl {
  element: HTMLElement;
  show: (mode: 'filters' | 'sort') => void;
  hide: () => void;
  toggle: (mode: 'filters' | 'sort') => void;
  getCurrentMode: () => 'filters' | 'sort' | undefined;
}

export function createCatalogSubNavElement(): CatalogSubNavControl {
  const element = createElement({
    tag: 'div',
    classes: ['catalog-sub-nav', 'bg-white', 'shadow-md', 'rounded-b-lg'],
  });

  let currentMode: 'filters' | 'sort' | undefined = undefined;
  const contentElement = createElement({
    tag: 'div',
    classes: ['py-2', 'flex', 'flex-wrap', 'gap-2'],
  });
  element.append(contentElement);

  let categories: Category[] | undefined = undefined;
  const activeCategoryIds = new Set<string>();

  // Define sort options
  const SORT_OPTIONS: SortOption[] = [
    { key: 'name', label: 'by name' },
    { key: 'category', label: 'by category' },
    { key: 'price', label: 'by price' },
  ];

  // Initialize active sort mode
  let activeSortMode: ActiveSortMode = { key: 'name', asc: true };

  const renderFilterPills = () => {
    contentElement.innerHTML = '';

    if (!categories || categories.length === 0) {
      const noCategoriesElement = createElement({
        tag: 'p',
        classes: ['text-gray-600', 'text-center', 'w-full'],
        text: 'No categories available',
      });
      contentElement.append(noCategoriesElement);
      return;
    }

    for (const category of categories) {
      const isActive = activeCategoryIds.has(category.id);
      // Use English name if available, otherwise use first available translation
      const categoryName =
        category.name.en ||
        Object.values(category.name)[0] ||
        'Unnamed Category';

      const pill = createElement({
        tag: 'button',
        classes: [
          'px-4',
          'py-2',
          'rounded-full',
          'text-sm',
          'font-medium',
          'transition-colors',
          isActive ? 'bg-gray-600' : 'bg-gray-300',
          isActive ? 'text-white' : 'text-black',
        ],
        text: categoryName,
      });

      pill.addEventListener('click', () => {
        if (activeCategoryIds.has(category.id)) {
          activeCategoryIds.delete(category.id);
          pill.classList.remove('bg-gray-600', 'text-white');
          pill.classList.add('bg-gray-200', 'text-black');
        } else {
          activeCategoryIds.add(category.id);
          pill.classList.remove('bg-gray-200', 'text-black');
          pill.classList.add('bg-gray-600', 'text-white');
        }

        // Dispatch filters-changed event
        const event = new CustomEvent('filters-changed', {
          detail: { activeCategoryIds: new Set(activeCategoryIds) },
        });
        element.dispatchEvent(event);
      });

      contentElement.append(pill);
    }
  };

  const renderSortOptions = () => {
    contentElement.innerHTML = '';

    for (const option of SORT_OPTIONS) {
      const isActive = activeSortMode.key === option.key;
      const sortButton = createElement({
        tag: 'button',
        classes: [
          'px-4',
          'py-2',
          'rounded-full',
          'text-sm',
          'font-medium',
          'transition-colors',
          'flex',
          'items-center',
          'gap-1',
          isActive ? 'bg-gray-600' : 'bg-gray-200',
          isActive ? 'text-white' : 'text-black',
        ],
        text: option.label,
      });

      if (isActive) {
        const arrowImg = createElement({
          tag: 'img',
          attributes: {
            src: arrowsIconPath,
            alt: 'sort arrow',
            class: [
              'w-3',
              'h-3',
              'filter',
              'invert',
              'brightness-0',
              'cursor-pointer',
              'shrink-0',
              'transition-transform',
              activeSortMode.asc ? '' : 'rotate-180',
            ].join(' '),
          },
        });

        sortButton.append(arrowImg);
      }

      sortButton.addEventListener('click', () => {
        activeSortMode =
          activeSortMode.key === option.key
            ? { ...activeSortMode, asc: !activeSortMode.asc }
            : { key: option.key, asc: true };

        // Re-render sort options to update UI
        renderSortOptions();

        // Dispatch sort-changed event
        const event = new CustomEvent('sort-changed', {
          detail: { ...activeSortMode },
        });
        element.dispatchEvent(event);
      });

      contentElement.append(sortButton);
    }
  };

  const show = (mode: 'filters' | 'sort') => {
    if (currentMode === mode) return;

    currentMode = mode;
    element.classList.add('open');

    contentElement.innerHTML = '';

    if (mode === 'filters') {
      if (categories) {
        renderFilterPills();
      } else {
        // Show loading indicator......
        const loadingElement = createElement({
          tag: 'p',
          classes: ['text-gray-600', 'text-center'],
          text: 'Loading filters...',
        });
        contentElement.append(loadingElement);

        getAllCategories()
          .then((fetchedCategories) => {
            categories = fetchedCategories;
            // Initialize all categories as active
            for (const cat of categories) activeCategoryIds.add(cat.id);
            renderFilterPills();
          })
          .catch((error: Error) => {
            console.error('Failed to fetch categories', error);
            contentElement.innerHTML = '';
            const errorElement = createElement({
              tag: 'p',
              classes: ['text-red-500', 'text-center'],
              text: 'Failed to load filters',
            });
            contentElement.append(errorElement);
          });
      }
    } else {
      renderSortOptions();
    }
  };

  const hide = () => {
    currentMode = undefined;
    element.classList.remove('open');
  };

  const toggle = (mode: 'filters' | 'sort') => {
    if (currentMode === mode) {
      hide();
    } else {
      show(mode);
    }
  };

  const getCurrentMode = () => currentMode;

  return {
    element,
    show,
    hide,
    toggle,
    getCurrentMode,
  };
}
