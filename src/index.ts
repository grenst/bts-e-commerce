import { Buffer } from 'buffer/';
interface WindowWithBuffer extends Window {
  Buffer: typeof Buffer;
}

(window as unknown as WindowWithBuffer).Buffer = Buffer;
import '@styles/global.scss';
import '@styles/tailwind.css';

import svgSpriteElement from './sources/svg-sprite';
import createFooter from './components/layout/footer/footer';
// import createButton from './components/ui/button/button';
import { createCommerceTestComponent } from './components/test/CommerceTest';
import { body } from './utils/elementUtils';

svgSpriteElement();

const container = document.createElement('div');
container.className = 'max-w-4xl mx-auto p-4';
body.appendChild(container);

const h1 = document.createElement('h1');
h1.textContent = 'E-commerce App';
h1.className =
  'font-mono text-3xl font-bold text-blue-600 bg-yellow-200 p-4 m-4 rounded-lg';
container.appendChild(h1);

const p = document.createElement('p');
p.textContent = 'Here is CommerceTools tester';
p.className =
  'font-serif text-lg text-center italic text-gray-500 bg-gray-100 p-2 m-4 rounded';
container.appendChild(p);

// Add the Commercetools test component
createCommerceTestComponent(container);
createFooter(body);

export {};
