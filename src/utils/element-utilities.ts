export const { body } = document;

interface CreateElementOptions {
  tag?: string;
  text?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
  parent?: HTMLElement | undefined;
  children?: HTMLElement[];
}

function createElement(options: CreateElementOptions): HTMLElement {
  const {
    tag = 'div',
    text = '',
    classes = [],
    attributes = {},
    parent = undefined,
    children = [],
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;
  element.classList.add(...classes);

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, String(value));
    }
  }

  if (parent) parent.append(element);

  element.append(...children);

  return element;
}

interface CreateHtmlElementOptions<K extends keyof HTMLElementTagNameMap>
  extends CreateElementOptions {
  tag: K;
}

function createHtmlElement<K extends keyof HTMLElementTagNameMap>(
  options: CreateHtmlElementOptions<K>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(options.tag);
  if (options.text) {
    element.textContent = options.text;
  }
  if (options.classes) {
    element.classList.add(...options.classes);
  }
  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, String(value));
    }
  }
  if (options.parent) {
    options.parent.append(element);
  }
  if (options.children) {
    element.append(...options.children);
  }
  return element;
}

/* *************************************** */

function createSvgUse(idSvgSymbol: string, elementClass: string): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', elementClass);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${idSvgSymbol}`);
  svg.append(use);
  return svg;
}

/* *************************************** */

function removeAllChild(element: HTMLElement): void {
  while (element.firstElementChild) {
    element.firstElementChild.remove();
  }
}

/* *************************************** */

function shuffleArray<T>(baseArray: T[]): T[] {
  const array = [...baseArray];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const index_ = Math.floor(Math.random() * (index + 1));
    [array[index], array[index_]] = [array[index_], array[index]];
  }
  return array;
}

/* *************************************** */

function createCounterID(initialValue: number = 0) {
  let count = initialValue;

  return {
    getCount: (): number => {
      count += 1;
      return count;
    },
    resetCount: (): void => {
      count = 0;
    },
    loadCount: (loadValue: number): void => {
      count = loadValue;
    },
  };
}

/* *************************************** */

function getMaxID<T extends { id: string | number }>(initialData: T[]): number {
  let maxId = 0;
  for (const item of initialData) {
    maxId = Math.max(maxId, Number(item.id));
  }
  return maxId;
}

/* *************************************** */

const getUUID = (): string => globalThis.crypto.randomUUID();

/* *************************************** */

/* *************************************** */

export {
  createElement as createEl,
  createHtmlElement,
  createSvgUse,
  removeAllChild,
  shuffleArray,
  createCounterID,
  getMaxID,
  getUUID,
};
