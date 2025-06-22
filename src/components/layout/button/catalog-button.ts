import { createEl as createElement } from '../../../utils/element-utilities';

export function createCatalogButton(parent: HTMLElement): HTMLElement {
  const button = createElement({
    tag: 'a',
    parent,
    attributes: { href: '/catalog', id: 'hero-button' },
    classes: ['absolute', 'bottom-10', 'hero_btn', 'inline-block'],
  });

  createElement({
    tag: 'span',
    parent: button,
    text: 'To Catalog',
    classes: ['button_liquid'],
  });

  const liquid = createElement({
    tag: 'div',
    parent: button,
    classes: ['liquid'],
  });

  for (let index = 0; index < 6; index++) {
    createElement({ tag: 'div', parent: liquid, classes: ['bubble'] });
  }

  return button;
}
