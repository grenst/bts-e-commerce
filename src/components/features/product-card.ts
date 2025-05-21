interface Product {
  id: string;
  name: { [key: string]: string };
  description?: { [key: string]: string } | undefined;
  masterVariant: {
    images?: { url: string }[];
    prices?: { value: { centAmount: number; currencyCode: string } }[];
  };
}

export function createProductCardElement(
  product: Product,
  showModal: (id: string, origin: { x: number; y: number }) => void,
): HTMLElement {
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
  card.append(imageContainer);

  const productImage = document.createElement('img');
  const imageUrl = product.masterVariant.images?.[1]?.url;
  if (imageUrl) {
    productImage.src = `${imageUrl}?format=webp`;
    productImage.alt = product.name['en-US'] || 'Product Image';
    productImage.classList.add('object-cover', 'object-top', 'h-[140%]'); // Cover the container
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
  imageContainer.append(productImage);

  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('p-5', 'flex', 'flex-col', 'flex-grow');
  card.append(contentContainer);

  const nameElement = document.createElement('h3');
  nameElement.textContent = product.name['en-US'] || 'N/A';
  nameElement.classList.add(
    'text-xl',
    'font-nexa-bold',
    'mb-2',
    'text-gray-800',
    'truncate' // Keep truncate if names can be long
  );
  contentContainer.append(nameElement);

  if (product.description && product.description['en-US']) {
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = product.description['en-US'];
    descriptionElement.classList.add(
      'text-sm',
      'text-gray-600',
      'mb-3',
      'line-clamp-3'
    );

    contentContainer.append(descriptionElement);
  }

  const priceContainer = document.createElement('div');
  priceContainer.classList.add('mt-auto', 'pt-3', 'relative', '-z-0');
  contentContainer.append(priceContainer);

  const priceElement = document.createElement('p');
  const firstPrice = product.masterVariant.prices?.[0];
  if (firstPrice) {
    const pr = `${(firstPrice.value.centAmount / 100).toFixed(2)} ${firstPrice.value.currencyCode}`;

    priceElement.dataset.price = pr; // only for ::after

    const priceSpan = document.createElement('span'); // ★
    priceSpan.textContent = pr;
    priceElement.append(priceSpan); // ★
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
  priceContainer.append(priceElement);

  // TODO: Add "Add to Cart" button or other CTAs here later

  // card.addEventListener('click', (e: MouseEvent) => {
  //   showModal(product.id, { x: e.clientX, y: e.clientY });
  // });

  card.addEventListener('click', (e: MouseEvent) => {
  // полный набор координат
  const info = {
    client: { x: e.clientX, y: e.clientY },   // внутри вьюпорта
    page:   { x: e.pageX,   y: e.pageY },     // учтён скролл
    screen: { x: e.screenX, y: e.screenY },   // координаты монитора
    scroll: { x: window.scrollX, y: window.scrollY },
  };
  console.table(info);        // удобнее, чем console.log

  // для модалки чаще удобнее pageX/pageY (видимо вы скроллите страницу)
  showModal(product.id, { x: e.pageX, y: e.pageY });
});


  return card;
}
