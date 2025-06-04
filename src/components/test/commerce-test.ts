import { getAllPublishedProducts } from '../../api/products/product-service';
import { createProductCardElement } from '../features/product-card';
import { Product } from '../../types/catalog-types';

export async function createCommerceTestComponent(
  container: HTMLElement
): Promise<void> {
  const componentDiv = document.createElement('div');
  componentDiv.classList.add('commerce-test-component', 'p-4');

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
    'grid-cols-1',
    'sm:grid-cols-2',
    'md:grid-cols-3',
    'lg:grid-cols-4',
    'gap-4',
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
    loadingMessage.remove();

    if (products.length === 0) {
      const noProductsMessage = document.createElement('p');
      noProductsMessage.textContent = 'No products found.';
      noProductsMessage.classList.add('text-center', 'text-gray-500', 'my-4');
      productsGrid.append(noProductsMessage);
      return;
    }

    for (const product of products) {
      const productCard = createProductCardElement(product);
      productsGrid.append(productCard);
    }
  } catch (error) {
    loadingMessage.remove();
    console.error('Failed to load products for CommerceTestComponent:', error);
    const errorMessage = document.createElement('p');
    errorMessage.textContent =
      'Failed to load products. Please try again later.';
    errorMessage.classList.add('text-center', 'text-red-500', 'my-4');
    productsGrid.append(errorMessage);
  }
}
