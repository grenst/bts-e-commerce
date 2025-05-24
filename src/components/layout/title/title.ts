import { createEl as createElement } from '../../../utils/element-utilities';

function createTitle(
  text: string,
  parent: HTMLElement,
  addClasses: string[] = []
  // tag = 'h1'
): HTMLHeadElement {
  return createElement({
    tag: 'h1',
    text,
    parent,
    classes: [
      'text-3xl',
      'font-bold',
      'z-1',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      // 'before:w-full',
      'before:w-[calc(100%+0.8rem)]',
      'before:bg-yellow-400',
      'before:-z-1',
      'absolute',
      'top-11',
      // 'top-6',
      'left-1/2',
      '-translate-x-1/2',
      'login-name',
      ...addClasses,
    ],
  }) as HTMLHeadElement;
}

export default createTitle;
