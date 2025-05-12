interface Product {
  id: string;
  name: { [key: string]: string };
  description?: { [key: string]: string } | undefined;
  masterVariant: {
    images?: { url: string }[];
    prices?: { value: { centAmount: number; currencyCode: string } }[];
  };
}

export function createProductCardElement(product: Product): HTMLElement {
  const card = document.createElement('div');
  card.classList.add(
    'product-card-redesigned',
    'bg-white',
    'cursor-pointer',
    'overflow-hidden',
    'flex',
    'flex-col',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'hover:shadow-2xl',
    'hover:scale-[1.03]',
    'group'
  );
  // card.style.minHeight = '350px'; // Adjust as needed, or make it aspect ratio based

  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.classList.add(
    'w-full',
    'h-48',
    'bg-gray-100',
    'overflow-hidden'
  );
  card.appendChild(imageContainer);

  const productImage = document.createElement('img');
  const imageUrl = product.masterVariant.images?.[0]?.url;
  if (imageUrl) {
    productImage.src = imageUrl;
    productImage.alt = product.name['en-US'] || 'Product Image';
    productImage.classList.add('w-full', 'h-full', 'object-cover'); // Cover the container
  } else {
    // Placeholder if no image is available
    imageContainer.textContent = 'No Image ;(';
    imageContainer.classList.add(
      'flex',
      'items-center',
      'justify-center',
      'text-gray-400'
    );
  }
  imageContainer.appendChild(productImage);

  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('p-5', 'flex', 'flex-col', 'flex-grow');
  card.appendChild(contentContainer);

  const nameElement = document.createElement('h3');
  nameElement.textContent = product.name['en-US'] || 'N/A';
  nameElement.classList.add(
    'text-xl',
    'font-nexa-bold',
    'mb-2',
    'text-gray-800',
    'truncate' // Keep truncate if names can be long
  );
  contentContainer.appendChild(nameElement);

  if (product.description && product.description['en-US']) {
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = product.description['en-US'];
    descriptionElement.classList.add(
      'text-sm',
      'text-gray-600',
      'mb-3',
      'line-clamp-3'
    );

    contentContainer.appendChild(descriptionElement);
  }

  const priceContainer = document.createElement('div');
  priceContainer.classList.add('mt-auto', 'pt-3', 'relative', '-z-0');
  contentContainer.appendChild(priceContainer);

  const priceElement = document.createElement('p');
  const firstPrice = product.masterVariant.prices?.[0];
  if (firstPrice) {
    const pr = `${(firstPrice.value.centAmount / 100).toFixed(2)} ${firstPrice.value.currencyCode}`;

    priceElement.setAttribute('data-price', pr); // only for ::after

    const priceSpan = document.createElement('span'); // ★
    priceSpan.textContent = pr;
    priceElement.appendChild(priceSpan); // ★
  } else {
    priceElement.textContent = 'Price not available';
  }
  priceElement.classList.add(
    'text-xl',
    'pricee',
    'h-6',
    'border',
    'border-gray-300',
    'bg-gray-50',
    'text-gray-900',
    'px-3',
    "before:content-['ADD']",
    'before:px-3',
    'before:absolute',
    'before:inset-0',
    'before:bg-transparent',
    'before:z-10',
    'group-hover:bg-gray-900',
    'group-hover:text-gray-50',
    'before:hover:text-white',
    'group-hover:border-white',
    'group-hover:before:border-gray-100'
  );
  priceContainer.appendChild(priceElement);

  // TODO: Add "Add to Cart" button or other CTAs here later

  return card;
}
