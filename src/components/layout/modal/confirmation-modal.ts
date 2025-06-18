import { createEl as createElement } from '../../../utils/element-utilities';
import createModalContainer from './modal-container';

export default function createConfirmationModal(
  message: string,
  confirmText: string,
  cancelText: string
): {
  element: HTMLDivElement;
  onConfirm: (callback: () => void) => void;
  onCancel: (callback: () => void) => void;
  close: () => void;
} {
  const modalContainer = createModalContainer();
  const modalContent = createElement({
    tag: 'div',
    classes: ['modal-content', 'confirmation-modal'],
    parent: modalContainer,
  });

  // Add event listener to close when clicking outside the modal content
  modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
      if (cancelCallback) cancelCallback();
      close();
    }
  });

  createElement({
    tag: 'p',
    classes: ['confirmation-message'],
    text: message,
    parent: modalContent,
  });

  const buttonContainer = createElement({
    tag: 'div',
    classes: ['confirmation-buttons'],
    parent: modalContent,
  });

  const confirmButton = createElement({
    tag: 'button',
    classes: ['confirm-button'],
    text: confirmText,
    parent: buttonContainer,
  });

  const cancelButton = createElement({
    tag: 'button',
    classes: ['cancel-button'],
    text: cancelText,
    parent: buttonContainer,
  });

  let confirmCallback: (() => void) | undefined = undefined;
  let cancelCallback: (() => void) | undefined = undefined;

  confirmButton.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    close();
  });

  cancelButton.addEventListener('click', () => {
    if (cancelCallback) cancelCallback();
    close();
  });

  function close() {
    modalContainer.remove();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  return {
    element: modalContainer,
    onConfirm: (callback) => (confirmCallback = callback),
    onCancel: (callback) => (cancelCallback = callback),
    close,
  };
}
