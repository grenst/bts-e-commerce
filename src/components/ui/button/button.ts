import './button.scss';
import { createEl } from '../../../utils/elementUtils';

function createButton(
  text: string,
  parent: HTMLElement,
  addClasses: string[] = [],
  type = 'button'
): HTMLButtonElement {
  return createEl({
    tag: 'button',
    parent,
    text,
    classes: ['button', 'border', 'p-2', 'rounded-xl', ...addClasses],
    attributes: { type },
  }) as HTMLButtonElement;
}

export default createButton;
