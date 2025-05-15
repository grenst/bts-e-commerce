import { getAllPublishedProducts } from '../../api/products/product-service';
import { createProductCardElement } from '../features/product-card';

interface Product {
  id: string;
  name: { [key: string]: string };
  description?: { [key: string]: string };
  masterVariant: {
    images?: { url: string }[];
    prices?: { value: { centAmount: number; currencyCode: string } }[];
  };
}

export async function createCommerceTestComponent(
  container: HTMLElement,
  showModal: (productId: string) => Promise<void>
): Promise<void> {
  const componentDiv = document.createElement('div');
  componentDiv.classList.add(
    'commerce-test-component',
    'p-4'
    // 'border', // Removing border for a cleaner look with cards
    // 'rounded',
    // 'shadow'
  );

  const title = document.createElement('h2');
  title.textContent = 'Published Products';
  title.classList.add(
    'text-xl',
    'font-bold',
    'mb-4',
    'text-gray-500',
    'text-center'
  );
  componentDiv.append(title);

  const productsGrid = document.createElement('div');
  productsGrid.classList.add(
    'grid',
    'grid-cols-1', // 1 column by default
    'sm:grid-cols-2', // 2 columns on small screens
    'md:grid-cols-3', // 3 columns on medium screens
    'lg:grid-cols-4', // 4 columns on large screens
    'gap-4', // Gap between cards
    'p-4'
  );
  componentDiv.append(productsGrid);

  const loadingMessage = document.createElement('p');
  loadingMessage.textContent = 'Loading products...';
  loadingMessage.classList.add('text-center', 'text-gray-500', 'my-4');
  productsGrid.append(loadingMessage);

  container.append(componentDiv);

  try {
    const products: Product[] = await getAllPublishedProducts();
    loadingMessage.remove(); // Remove loading message

    if (products.length === 0) {
      const noProductsMessage = document.createElement('p');
      noProductsMessage.textContent = 'No products found.';
      noProductsMessage.classList.add('text-center', 'text-gray-500', 'my-4');
      productsGrid.append(noProductsMessage);
      return;
    }

    for (const product of products) {
      const productCard = createProductCardElement(product, showModal);
      productsGrid.append(productCard);
    }
  } catch (error) {
    loadingMessage.remove(); // Remove loading message
    console.error('Failed to load products for CommerceTestComponent:', error);
    const errorMessage = document.createElement('p');
    errorMessage.textContent =
      'Failed to load products. Please try again later.';
    errorMessage.classList.add('text-center', 'text-red-500', 'my-4');
    productsGrid.append(errorMessage);
  }
}
