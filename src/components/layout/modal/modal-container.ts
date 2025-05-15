import './modal.scss';
import {
  createEl as createElement,
  body,
} from '../../../utils/element-utilities';

function createModalContainer(addClasses: string[] = []): HTMLButtonElement {
  return createElement({
    parent: body,
    classes: ['modal-container', ...addClasses],
  }) as HTMLButtonElement;
}

export default createModalContainer;
