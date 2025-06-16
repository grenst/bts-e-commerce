import './search-input.scss';
import searchIconPath from '@/assets/images/search.svg';
import {
  createEl as createElement,
  createHtmlElement,
} from '../../utils/element-utilities';

export function createCatalogNavigationElement(): HTMLElement {
  const nav = createElement({
    tag: 'div',
    attributes: {
      class: 'space-x-3 filter_atributes justify-items-center items-center',
    },
  });

  const searchContainer = createElement({
    tag: 'div',
    attributes: { class: 'search' },
  });

  const iconImg = createElement({
    tag: 'img',
    attributes: {
      src: searchIconPath,
      alt: 'Search',
      class: 'w-10 h-10 shrink-0 cursor-pointer p-3',
    },
  });

  searchContainer.append(iconImg);

  const g = createElement({
    tag: 'g',
    attributes: {
      'stroke-linecap': 'square',
      'stroke-linejoin': 'miter',
      stroke: 'currentColor',
    },
  });

  const line = createElement({
    tag: 'line',
    attributes: {
      fill: 'none',
      'stroke-miterlimit': '10',
      x1: '22',
      y1: '22',
      x2: '16.4',
      y2: '16.4',
    },
  });

  const circle = createElement({
    tag: 'circle',
    attributes: {
      fill: 'none',
      stroke: 'currentColor',
      'stroke-miterlimit': '10',
      cx: '10',
      cy: '10',
      r: '9',
    },
  });

  g.append(line, circle);
  iconImg.append(g);
  searchContainer.append(iconImg);

  const inputWrapper = createElement({
    tag: 'div',
  });

  const searchInput = createHtmlElement({
    tag: 'input',
    attributes: {
      class:
        'text-xl p-2 rounded-xl mr-3 transition-all duration-300 w-97 opacity-0',
      type: 'text',
      placeholder: 'Search your drink...',
    },
  });

  searchInput.addEventListener('input', () => {
    const event = new CustomEvent('search-change', {
      detail: { searchTerm: searchInput.value },
    });
    nav.dispatchEvent(event);
  });

  inputWrapper.append(searchInput);
  searchContainer.append(inputWrapper);

  const placeholderText = searchInput.placeholder;
  const placeholderWords = placeholderText.split(/ +/);
  const placeholderSpansContainer = createElement({ tag: 'div' });

  if (placeholderWords.length > 0) {
    for (const word of placeholderWords) {
      const span = createElement({ tag: 'span' });
      span.textContent = word;
      span.append(document.createTextNode('\u00A0'));
      placeholderSpansContainer.append(span);
    }
    inputWrapper.append(placeholderSpansContainer);
  }

  searchContainer.addEventListener('click', (event) => {
    if (
      event.target !== searchInput &&
      event.target instanceof Node &&
      !searchInput.contains(event.target)
    ) {
      searchContainer.classList.add('open');
      requestAnimationFrame(() => {
        searchInput.focus();
        setTimeout(() => {
          searchInput.focus();
        }, 800);
      });
    }
  });

  document.addEventListener('click', (event) => {
    if (
      event.target instanceof Node &&
      !searchContainer.contains(event.target)
    ) {
      searchContainer.classList.remove('open');
    }
  });

  const filtersButton = createElement({
    tag: 'button',
    attributes: {
      class: 'text-gray-700 hover:text-gray-900 cursor-pointer',
    },
    text: 'Filters',
  });

  filtersButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('filter-toggle'));
  });

  const sortButton = createElement({
    tag: 'button',
    attributes: {
      class: 'text-gray-700 hover:text-gray-900 cursor-pointer',
    },
    text: 'Sort',
  });

  sortButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('sort-toggle'));
  });

  const buttonsContainer = createElement({
    tag: 'div',
    attributes: {
      class: 'flex space-x-3 flex-row gap-2 filter_buttons',
    },
  });
  buttonsContainer.append(filtersButton);
  buttonsContainer.append(sortButton);

  const actionsButton = createElement({
    tag: 'button',
    attributes: {
      class: 'text-gray-700 hover:text-gray-900 cursor-pointer',
    },
    text: 'Actions',
  });

  actionsButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('apply-discount-filter'));
  });

  buttonsContainer.append(actionsButton);

  const resetButton = createElement({
    tag: 'button',
    attributes: {
      class: 'text-gray-700 hover:text-gray-900 cursor-pointer',
    },
    text: 'Reset',
  });

  resetButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('reset-filters'));
  });

  buttonsContainer.append(resetButton);

  nav.append(searchContainer);
  nav.append(buttonsContainer);
  return nav;
}
