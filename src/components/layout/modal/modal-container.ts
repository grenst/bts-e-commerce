import './modal.scss';
import {
  createEl as createElement,
  body,
} from '../../../utils/element-utilities';

function createModalContainer(addClasses: string[] = []): HTMLDivElement {
  const modalContainer = createElement({
    parent: body,
    classes: ['modal-container', ...addClasses],
  });

  if (!(modalContainer instanceof HTMLDivElement)) {
    throw new TypeError('Created element is not an HTMLDivElement.');
  }

  return modalContainer;
}

export default createModalContainer;
