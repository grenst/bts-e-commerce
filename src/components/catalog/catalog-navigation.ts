import './search-input.scss';
import searchIconPath from '@/assets/images/search.svg';
import { createEl } from '../../utils/element-utilities';

export function createCatalogNavigationElement(): HTMLElement {
  // Create navigation container
  const nav = createEl({
    tag: 'div',
    attributes: { class: 'flex space-x-3 items-center justify-center p-4 bg-white shadow-md' }
  });

  // Create search container
  const searchContainer = createEl({
    tag: 'div',
    attributes: { class: 'search' }
  });

  // Create SVG icon with new structure!!!

  const iconImg = createEl({
    tag: 'img',
    attributes: {
      src : searchIconPath,
      alt : 'Search',
      class: 'w-10 h-10 shrink-0 cursor-pointer p-3'
    }
  });

  searchContainer.append(iconImg);
  // const svg = createEl({
  //   tag: 'svg',
  //   attributes: {
  //     x: '0px',
  //     y: '0px',
  //     viewBox: '0 0 24 24',
  //     width: '20px',
  //     height: '20px'
  //   }
  // });

  const g = createEl({
    tag: 'g',
    attributes: {
      'stroke-linecap': 'square',
      'stroke-linejoin': 'miter',
      stroke: 'currentColor'
    }
  });

  const line = createEl({
    tag: 'line',
    attributes: {
      fill: 'none',
      'stroke-miterlimit': '10',
      x1: '22',
      y1: '22',
      x2: '16.4',
      y2: '16.4'
    }
  });

  const circle = createEl({
    tag: 'circle',
    attributes: {
      fill: 'none',
      stroke: 'currentColor',
      'stroke-miterlimit': '10',
      cx: '10',
      cy: '10',
      r: '9'
    }
  });

  g.appendChild(line);
  g.appendChild(circle);
  iconImg.appendChild(g);
  searchContainer.appendChild(iconImg);

  // Create wrapper div for input
  const inputWrapper = createEl({
    tag: 'div'
  });

  // Create search input
  const searchInput = createEl({
    tag: 'input',
    attributes: {
      class: 'text-xl p-2 rounded-xl mr-3 transition-all duration-300 w-97 opacity-0',
      type: 'text',
      placeholder: 'Search your drink...'
    }
  }) as HTMLInputElement;

  // Event listeners remain unchanged
  searchInput.addEventListener('input', () => {
    const event = new CustomEvent('search-change', {
      detail: { searchTerm: searchInput.value }
    });
    nav.dispatchEvent(event);
  });

  inputWrapper.appendChild(searchInput);
  searchContainer.appendChild(inputWrapper);

  // Create animated placeholder
  const placeholderText = searchInput.placeholder;
  const placeholderWords = placeholderText.split(/ +/);
  const placeholderSpansContainer = createEl({ tag: 'div' });

  if (placeholderWords.length) {
    placeholderWords.forEach(word => {
      const span = createEl({ tag: 'span' });
      span.innerHTML = word + '&nbsp;';
      placeholderSpansContainer.appendChild(span);
    });
    inputWrapper.appendChild(placeholderSpansContainer);
  }

  // Click to open search
  searchContainer.addEventListener('click', (event) => {
    if (event.target !== searchInput && !searchInput.contains(event.target as Node)) {
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
  const filtersButton = createEl({
    tag: 'button',
    attributes: { class: 'px-4 py-2 bg-gray-800 text-white rounded-3xl hover:bg-gray-900 cursor-pointer' },
    text: 'Filters'
  });

  filtersButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('filter-toggle'));
  });

  // Create sort button
  const sortButton = createEl({
    tag: 'button',
    attributes: { class: 'px-4 py-2 bg-gray-800 text-white rounded-3xl hover:bg-gray-900 cursor-pointer' },
    text: 'Sort'
  });

  sortButton.addEventListener('click', () => {
    nav.dispatchEvent(new CustomEvent('sort-toggle'));
  });

  const buttonsContainer = createEl({
    tag: 'div',
    attributes: { class: 'flex space-x-3' }
  });
  buttonsContainer.appendChild(filtersButton);
  buttonsContainer.appendChild(sortButton);

  nav.appendChild(searchContainer);
  nav.appendChild(buttonsContainer);
  return nav;
}