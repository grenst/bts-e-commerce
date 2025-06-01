import './search-input.scss';
import searchIconPath from '@/assets/images/search.svg';
import { createEl as createElement } from '../../utils/element-utilities';

export function createCatalogNavigationElement(): HTMLElement {
  // Create navigation container
  const nav = createElement({
    tag: 'div',
    attributes: {
      class:
        'flex space-x-3 items-center justify-center p-4 bg-white shadow-md',
    },
  });

  // Create search container
  const searchContainer = createElement({
    tag: 'div',
    attributes: { class: 'search' },
  });

  // Create SVG icon with new structure!!!

  const iconImg = createElement({
    tag: 'img',
    attributes: {
      src: searchIconPath,
      alt: 'Search',
      class: 'w-10 h-10 shrink-0 cursor-pointer p-3',
    },
  });

  searchContainer.append(iconImg);
  // const svg = createElement({
  //   tag: 'svg',
  //   attributes: {
  //     x: '0px',
  //     y: '0px',
  //     viewBox: '0 0 24 24',
  //     width: '20px',
  //     height: '20px'
  //   }
  // });

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

  // Create wrapper div for input
  const inputWrapper = createElement({
    tag: 'div',
  });

  // Create search input
  const searchInput = createElement({
    tag: 'input',
    attributes: {
      class:
        'text-xl p-2 rounded-xl mr-3 transition-all duration-300 w-97 opacity-0',
      type: 'text',
      placeholder: 'Search your drink...',
    },
  }) as HTMLInputElement;

  // Event listeners remain unchanged
  searchInput.addEventListener('input', () => {
    const event = new CustomEvent('search-change', {
      detail: { searchTerm: searchInput.value },
    });
    nav.dispatchEvent(event);
  });

  inputWrapper.append(searchInput);
  searchContainer.append(inputWrapper);

  // Create animated placeholder
  const placeholderText = searchInput.placeholder;
  const placeholderWords = placeholderText.split(/ +/);
  const placeholderSpansContainer = createElement({ tag: 'div' });

  if (placeholderWords.length > 0) {
    for (const word of placeholderWords) {
      const span = createElement({ tag: 'span' });
      span.innerHTML = word + '&nbsp;';
      placeholderSpansContainer.append(span);
    }
    inputWrapper.append(placeholderSpansContainer);
  }

  // Click to open search
  searchContainer.addEventListener('click', (event) => {
    if (
      event.target !== searchInput &&
      !searchInput.contains(event.target as Node)
    ) {
      searchContainer.classList.add('open');
      requestAnimationFrame(() => {
        searchInput.focus();
        // searchInput.select(); // focusing placeholder
        setTimeout(() => {
          searchInput.focus();
        }, 800); // Focus on input field by delay- in css its .75
      });
    }
  });

  // Click outside to close
  document.addEventListener('click', (event) => {
    if (!searchContainer.contains(event.target as Node)) {
      searchContainer.classList.remove('open');
    }
  });

  // Create filters button
  const filtersButton = createElement({
    tag: 'button',
    attributes: {
      class:
        'px-4 py-2 bg-gray-800 text-white rounded-3xl hover:bg-gray-900 cursor-pointer',
    },
    text: 'Filters',
  });

  filtersButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('filter-toggle'));
  });

  // Create sort button
  const sortButton = createElement({
    tag: 'button',
    attributes: {
      class:
        'px-4 py-2 bg-gray-800 text-white rounded-3xl hover:bg-gray-900 cursor-pointer',
    },
    text: 'Sort',
  });

  sortButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('sort-toggle'));
  });

  const buttonsContainer = createElement({
    tag: 'div',
    attributes: { class: 'flex space-x-3' },
  });
  buttonsContainer.append(filtersButton);
  buttonsContainer.append(sortButton);

  nav.append(searchContainer);
  nav.append(buttonsContainer);
  return nav;
}
