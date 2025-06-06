import './catalog-sub-nav.scss';
import arrowsIconPath from '@/assets/images/arrows.svg';
import { createEl as createElement } from '../../utils/element-utilities';
import { getAllCategories } from '../../api/products/product-service';

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

  let currentMode: 'filters' | 'sort' | undefined;
  const contentElement = createElement({
    tag: 'div',
    classes: ['py-2', 'flex', 'flex-wrap', 'gap-2'],
  });
  element.append(contentElement);

  let categories: Category[] | undefined;
  let selectedCategoryId: string | undefined;
  const selectedSizes = new Set<string>();

  const SORT_OPTIONS: SortOption[] = [
    { key: 'name', label: 'by name' },
    { key: 'category', label: 'by category' },
    { key: 'price', label: 'by price' },
  ];
  let activeSortMode: ActiveSortMode = { key: 'name', asc: true };

  const SIZE_VALUES = ['350 ml', '500 ml'];

  const buildPill = (
    label: string,
    active: boolean,
    onClick: () => void
  ): HTMLElement => {
    const pill = createElement({
      tag: 'button',
      classes: [
        'px-4',
        'py-2',
        'rounded-full',
        'text-sm',
        'font-medium',
        'transition-colors',
        active ? 'bg-gray-600' : 'bg-gray-200',
        active ? 'text-white' : 'text-black',
      ],
      text: label,
    });
    pill.addEventListener('click', onClick);
    return pill;
  };

  const renderFilterPills = () => {
    contentElement.innerHTML = '';

    if (!categories || categories.length === 0) {
      const noCat = createElement({
        tag: 'p',
        classes: ['text-gray-600', 'text-center', 'w-full'],
        text: 'No categories available',
      });
      contentElement.append(noCat);
      return;
    }

    contentElement.append(
      buildPill('All', !selectedCategoryId, () => {
        selectedCategoryId = undefined;
        renderFilterPills();
        dispatchFiltersChanged();
      })
    );

    for (const category of categories) {
      const name =
        category.name.en || Object.values(category.name)[0] || 'Unnamed';
      contentElement.append(
        buildPill(name, selectedCategoryId === category.id, () => {
          selectedCategoryId = category.id;
          renderFilterPills();
          dispatchFiltersChanged();
        })
      );
    }

    const divider = createElement({
      tag: 'div',
      attributes: { class: 'basis-full h-0' },
    });
    contentElement.append(divider);

    for (const size of SIZE_VALUES) {
      const active = selectedSizes.has(size);
      contentElement.append(
        buildPill(size, active, () => {
          if (active) {
            selectedSizes.delete(size);
          } else {
            selectedSizes.add(size);
          }
          renderFilterPills();
          dispatchFiltersChanged();
        })
      );
    }
  };

  const dispatchFiltersChanged = () => {
    const event = new CustomEvent('filters-changed', {
      detail: {
        selectedCategoryId,
        selectedSizes: new Set(selectedSizes),
      },
    });
    element.dispatchEvent(event);
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
        renderSortOptions();
        const event_ = new CustomEvent('sort-changed', {
          detail: { ...activeSortMode },
        });
        element.dispatchEvent(event_);
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
        const loading = createElement({
          tag: 'p',
          classes: ['text-gray-600', 'text-center'],
          text: 'Loading filters...',
        });
        contentElement.append(loading);
        getAllCategories()
          .then((cats) => {
            categories = cats;
            renderFilterPills();
          })
          .catch(() => {
            contentElement.innerHTML = '';
            const error = createElement({
              tag: 'p',
              classes: ['text-red-500', 'text-center'],
              text: 'Failed to load filters',
            });
            contentElement.append(error);
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

  return { element, show, hide, toggle, getCurrentMode };
}
