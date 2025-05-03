export const { body } = document;

interface CreateElOptions {
  tag?: string;
  text?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
  parent?: HTMLElement | null;
  children?: HTMLElement[];
}

function createEl(options: CreateElOptions): HTMLElement {
  const {
    tag = 'div',
    text = '',
    classes = [],
    attributes = {},
    // styles = {},
    parent = null,
    // parent = body,
    children = [],
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;
  element.classList.add(...classes);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (parent) parent.append(element);

  element.append(...children);

  return element;
}

/* *************************************** */

function createSvgUse(idSvgSymbol: string, elClass: string): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', elClass);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${idSvgSymbol}`);
  svg.appendChild(use);
  return svg;
}

/* *************************************** */

function removeAllChild(element: HTMLElement): void {
  while (element.firstElementChild) {
    element.removeChild(element.firstElementChild);
  }
}

/* *************************************** */

function shuffleArray<T>(baseArray: T[]): T[] {
  const array = [...baseArray];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* *************************************** */

function createCounterID(initialValue?: number) {
  let count = initialValue ?? 0;

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
  const maxId = initialData.reduce(
    (max, item) => Math.max(max, Number(item.id)),
    0
  );
  return maxId;
}

/* *************************************** */

const getUUID = (): string => self.crypto.randomUUID();

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
  createEl,
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
