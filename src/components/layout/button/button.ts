import './button.scss';
import { createEl as createElement } from '../../../utils/elementUtils';

function createButton(
  text: string,
  parent: HTMLElement,
  addClasses: string[] = [],
  type = 'button'
): HTMLButtonElement {
  return createElement({
    tag: 'button',
    parent,
    text,
    classes: ['button', 'border', 'p-2', 'rounded-sm', ...addClasses],
    attributes: { type },
  }) as HTMLButtonElement;
}

export default createButton;
