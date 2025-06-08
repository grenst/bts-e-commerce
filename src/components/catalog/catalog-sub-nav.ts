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
  const selectedVolumeKeys = new Set<string>();

  const SORT_OPTIONS: SortOption[] = [
    { key: 'name', label: 'by name' },
    { key: 'category', label: 'by category' },
    { key: 'price', label: 'by price' },
  ];
  let activeSortMode: ActiveSortMode = { key: 'name', asc: true };

  const VOLUME_OPTIONS: { key: string; label: string }[] = [
    { key: '350-ml', label: '350 ml' },
    { key: '500-ml', label: '500 ml' },
  ];

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

  const dispatchFiltersChanged = (): void => {
    element.dispatchEvent(
      new CustomEvent('filters-changed', {
        detail: {
          selectedCategoryId,
          selectedVolumes: new Set(selectedVolumeKeys),
        },
      })
    );
  };

  const renderFilterPills = (): void => {
    contentElement.innerHTML = '';

    if (!categories || categories.length === 0) {
      contentElement.append(
        createElement({
          tag: 'p',
          classes: ['text-gray-600', 'text-center', 'w-full'],
          text: 'No categories available',
        })
      );
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

    contentElement.append(
      createElement({
        tag: 'div',
        attributes: { class: 'basis-full h-0' },
      })
    );

    for (const option of VOLUME_OPTIONS) {
      const active = selectedVolumeKeys.has(option.key);
      contentElement.append(
        buildPill(option.label, active, () => {
          if (active) {
            selectedVolumeKeys.delete(option.key);
          } else {
            selectedVolumeKeys.add(option.key);
          }
          renderFilterPills();
          dispatchFiltersChanged();
        })
      );
    }
  };

  const renderSortOptions = (): void => {
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
        sortButton.append(
          createElement({
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
          })
        );
      }

      sortButton.addEventListener('click', () => {
        activeSortMode =
          activeSortMode.key === option.key
            ? { ...activeSortMode, asc: !activeSortMode.asc }
            : { key: option.key, asc: true };
        renderSortOptions();
        element.dispatchEvent(
          new CustomEvent('sort-changed', {
            detail: { ...activeSortMode },
          })
        );
      });
      contentElement.append(sortButton);
    }
  };

  const show = (mode: 'filters' | 'sort'): void => {
    if (currentMode === mode) return;
    currentMode = mode;
    element.classList.add('open');
    contentElement.innerHTML = '';
    if (mode === 'filters') {
      if (categories) {
        renderFilterPills();
      } else {
        contentElement.append(
          createElement({
            tag: 'p',
            classes: ['text-gray-600', 'text-center'],
            text: 'Loading filters...',
          })
        );
        getAllCategories()
          .then((cats) => {
            categories = cats;
            renderFilterPills();
          })
          .catch(() => {
            contentElement.innerHTML = '';
            contentElement.append(
              createElement({
                tag: 'p',
                classes: ['text-red-500', 'text-center'],
                text: 'Failed to load filters',
              })
            );
          });
      }
    } else {
      renderSortOptions();
    }
  };

  const hide = (): void => {
    currentMode = undefined;
    element.classList.remove('open');
  };

  const toggle = (mode: 'filters' | 'sort'): void => {
    if (currentMode === mode) {
      hide();
    } else {
      show(mode);
    }
  };

  const getCurrentMode = (): 'filters' | 'sort' | undefined => currentMode;

  return { element, show, hide, toggle, getCurrentMode };
}
