import './button.scss';
import { createEl as createElement } from '../../../utils/element-utilities';

function createButton(
  text: string,
  parent: HTMLElement,
  addClasses: string[] = [],
  type = 'button'
): HTMLButtonElement {
  const buttonElement = createElement({
    tag: 'button',
    parent,
    text,
    classes: ['button', 'border', 'p-2', 'rounded-sm', ...addClasses],
    attributes: { type },
  });

  if (!(buttonElement instanceof HTMLButtonElement)) {
    throw new TypeError('Created element is not an HTMLButtonElement.');
  }

  return buttonElement;
}

export default createButton;
