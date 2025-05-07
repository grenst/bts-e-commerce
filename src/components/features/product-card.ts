interface Product {
  id: string;
  name: {[key: string]: string;};
  description?: {[key: string]: string;} | undefined;
  masterVariant: {
    images?: { url: string }[];
    prices?: { value: { centAmount: number; currencyCode: string } }[];
  };
}

export function createProductCardElement(product: Product): HTMLElement {
    console.log(product)
  const card = document.createElement('div');
  card.classList.add(
    'product-card',
    'border',
    'rounded-lg',
    'p-4',
    'shadow-md',
    'flex',
    'flex-col',
    'justify-between',
    'm-2',
    'w-full',
    'h-68',
    'bg-[url(@assets/images/straw-milk.png)]',
    'transition',
    'duration-500',
    'hover:scale-110',
    '[transition-timing-function:cubic-bezier(0.68,-0.55,0.27,1.55)]',
    'cursor-pointer'
  );
  card.style.minHeight = '200px';

  const nameElement = document.createElement('h3');
  nameElement.textContent = product.name["en-US"] || 'N/A';
  nameElement.classList.add('text-lg', 'font-semibold', 'mb-2', 'truncate', 'text-gray-200');
  card.appendChild(nameElement);

  if (product.description) {
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = product.description["en-US"];
    descriptionElement.classList.add('text-sm', 'text-gray-300', 'text-shadow-sm', 'mb-2', 'overflow-hidden', 'text-ellipsis');
    descriptionElement.style.maxHeight = '3em';
    card.appendChild(descriptionElement);
  }

  const priceElement = document.createElement('p');
  const firstPrice = product.masterVariant.prices?.[0];
  if (firstPrice) {
    priceElement.textContent = `${(firstPrice.value.centAmount / 100).toFixed(2)} ${firstPrice.value.currencyCode}`;
  } else {
    priceElement.textContent = 'Price not available';
  }
  priceElement.classList.add('text-md', 'font-bold', 'text-gray-300', 'text-shadow-lg', 'mt-auto');
  card.appendChild(priceElement);

  return card;
}
