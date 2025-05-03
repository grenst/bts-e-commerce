import '@styles/global.scss';
import '@styles/tailwind.css';

const bodyElement = document.body;

const container = document.createElement('div');
container.className = 'max-w-4xl mx-auto p-4';
bodyElement.appendChild(container);

const h1 = document.createElement('h1');
h1.textContent = 'E-commerce App';
h1.className =
  'font-mono text-3xl font-bold text-blue-600 bg-yellow-200 p-4 m-4 rounded-lg';
container.appendChild(h1);

const p = document.createElement('p');
p.textContent = 'Here is Tailwind CSS and SCSS working together';
p.className =
  'font-serif text-lg text-center italic text-gray-500 bg-gray-100 p-2 m-4 rounded';
container.appendChild(p);

const scssContainer = document.createElement('div');
scssContainer.className = 'scss-container bg-gray-50 m-4 rounded-lg';
container.appendChild(scssContainer);

const scssTitle = document.createElement('h2');
scssTitle.textContent = 'SCSS & TW Styles Buttons:';
scssTitle.className = 'text-l text-right font-bold';
scssContainer.appendChild(scssTitle);

const scssButton = document.createElement('button');
scssButton.textContent = 'SCSS Button';
scssButton.className = 'scss-button mr-2';
scssContainer.appendChild(scssButton);

const tailwindButton = document.createElement('button');
tailwindButton.textContent = 'Tailwind Button';
tailwindButton.className = 'bg-blue-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded shadow ml-2';
scssContainer.appendChild(tailwindButton);

// color changing wia SCSS or Tailwind by click 
const removeBackgroundClasses = (element: HTMLElement) => {
  const classesToRemove = Array.from(element.classList).filter(
    (cls) => cls.startsWith('bg-') || cls === 'h1-bg-scss',
  );
  element.classList.remove(...classesToRemove);
};

scssButton.addEventListener('click', () => {
  removeBackgroundClasses(h1);
  h1.classList.add('h1-bg-scss');
});

tailwindButton.addEventListener('click', () => {
  removeBackgroundClasses(h1);
  h1.classList.add('bg-green-500');
});

export {};
