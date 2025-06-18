import { createEl as createElement } from '../../utils/element-utilities';
import './product-card.scss';

export function createProductCardSkeletonElement(): HTMLElement {
  const skeleton = createElement({
    tag: 'div',
    classes: ['product-card', 'skeleton', 'bg-white', 'flex', 'flex-col', 'animate-pulse'],
  });

  // Image placeholder
  createElement({
    tag: 'div',
    parent: skeleton,
    classes: ['w-full', 'h-48', 'bg-gray-200', 'rounded-t-lg'],
  });

  const contentContainer = createElement({
    tag: 'div',
    parent: skeleton,
    classes: ['p-2', 'pt-8', 'flex', 'flex-col', 'flex-grow'],
  });

  // Title placeholder
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-6', 'bg-gray-200', 'rounded', 'mb-2'],
  });

  // Description placeholder
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-4', 'bg-gray-200', 'rounded', 'mb-1', 'w-3/4'],
  });
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-4', 'bg-gray-200', 'rounded', 'mb-1', 'w-1/2'],
  });
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-4', 'bg-gray-200', 'rounded', 'mb-3', 'w-2/3'],
  });

  // Price placeholder
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-6', 'bg-gray-200', 'rounded', 'w-1/2'],
  });

  // Button placeholder
  createElement({
    tag: 'div',
    parent: contentContainer,
    classes: ['h-8', 'bg-gray-200', 'rounded-b-lg', 'mt-3'],
  });

  return skeleton;
}