import '@styles/tailwind.css';
import '@styles/global.scss';

const bodyElement = document.body;

const h1 = document.createElement('h1');
h1.textContent = 'E-commerce App';
h1.className =
  'font-mono text-3xl font-bold text-blue-600 bg-yellow-200 p-4 m-4 rounded-lg';

const p = document.createElement('p');
p.textContent = 'Loading...';
p.className =
  'font-serif text-lg italic text-gray-500 bg-gray-100 p-2 m-4 rounded';

bodyElement.appendChild(h1);
bodyElement.appendChild(p);

// TODO: It's for now so...

export {};
