import { createEl as createElement } from '../../../utils/element-utilities';
import './title.scss';

interface CreateTitleOptions {
  tag?: string;
  textSize?: string;
  marginBottom?: string;
  beforeWidth?: string;
  isAbsolutePositioned?: boolean;
  zIndex?: string;
  top?: string;
}

function createTitle(
  text: string,
  parent: HTMLElement,
  addClasses: string[] = [],
  options: CreateTitleOptions = {}
): HTMLElement {
  const {
    tag = 'h1',
    textSize = 'text-3xl',
    marginBottom,
    beforeWidth = 'before:w-[calc(100%+0.8rem)]',
    isAbsolutePositioned = true,
    zIndex = 'z-10',
    top = 'top-11',
  } = options;

  const baseClasses = [
    textSize,
    'font-bold',
    zIndex,
    'text-center',
    'text-gray-800',
    "before:content-['']",
    'before:absolute',
    'before:h-6',
    beforeWidth,
    'before:bg-yellow-400',
    'before:-z-1',
    'login-name',
  ];

  if (marginBottom) {
    baseClasses.push(marginBottom);
  }

  if (isAbsolutePositioned) {
    baseClasses.push('absolute', top, 'left-1/2', '-translate-x-1/2');
  }

  baseClasses.push(...addClasses);

  return createElement({
    tag,
    text,
    parent,
    classes: baseClasses,
  });
}

export default createTitle;
