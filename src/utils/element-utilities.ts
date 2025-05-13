export const { body } = document;

interface CreateElementOptions {
  tag?: string;
  text?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
  parent?: HTMLElement | null;
  children?: HTMLElement[];
}

function createElement(options: CreateElementOptions): HTMLElement {
  const {
    tag = 'div',
    text = '',
    classes = [],
    attributes = {},
    // styles = {},
    parent = undefined,
    // parent = body,
    children = [],
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;
  element.classList.add(...classes);

  if (attributes) {
    for (const key of Object.keys(attributes)) {
      element.setAttribute(key, attributes[key]);
    }
  }

  if (parent) parent.append(element);

  element.append(...children);

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

// function hexaDecimal() {
//   return Math.floor(Math.random() * 256)
//     .toString(16)
//     .padStart(2, '0');
// }
// function getRandomColor() {
//   return `#${hexaDecimal()}${hexaDecimal()}${hexaDecimal()}`;
// }

// function rgbToHex(rgbStr: string) {
//   const decimalArr = rgbStr.slice(4, -1).split(',');

//   const hexArr = decimalArr.map((item) => {
//     const num = Number(item.trim());
//     return num.toString(16).padStart(2, '0');
//   });

//   return `#${hexArr.join('')}`;
// }

/* *************************************** */

export {
  createElement as createEl,
  createSvgUse,
  removeAllChild,
  shuffleArray,
  // getRandomIntegerArr,
  createCounterID,
  getMaxID,
  getUUID,
  // getRandomColor,
  // rgbToHex,
};
