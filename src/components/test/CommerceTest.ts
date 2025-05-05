import {
  createApiClient,
  getCategories,
  getPublishedProducts,
  getMyOrders,
} from '../../utils/apiCommerse';
import createButton from '../ui/button/button';

export function createCommerceTestComponent(container: HTMLElement): void {
  const apiRoot = createApiClient();

  const componentDiv = document.createElement('div');
  componentDiv.classList.add(
    'commerce-test-component',
    'p-4',
    'border',
    'rounded',
    'shadow'
  );

  const title = document.createElement('h2');
  title.textContent = 'Commercetools API Test';
  title.classList.add('text-xl', 'font-bold', 'mb-2');
  componentDiv.appendChild(title);

  const note = document.createElement('p');
  note.textContent = 'Note: This API client has various scopes.';
  note.classList.add('text-sm', 'text-gray-600', 'mb-4');
  componentDiv.appendChild(note);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('flex', 'space-x-2', 'mb-4');

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'api-results';
  resultsDiv.classList.add(
    'mt-4',
    'p-2',
    'border',
    'bg-gray-100',
    'min-h-[100px]',
    'overflow-auto'
  );
  resultsDiv.textContent = 'Click a button to see API results...';

  const displayResults = (data: unknown) => {
    resultsDiv.textContent = JSON.stringify(data, null, 2);
  };

  const displayError = (error: unknown) => {
    resultsDiv.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    resultsDiv.classList.add('text-red-600');
  };

  const clearErrorStyle = () => {
    resultsDiv.classList.remove('text-red-600');
  };

  const projectButton = createButton(
    'Get Project Info (Requires view_project_settings scope)',
    buttonContainer
  ); // TODO
  projectButton.disabled = true;
  projectButton.classList.add('border', 'opacity-50', 'cursor-not-allowed');
  projectButton.title =
    'This API client does not have the view_project_settings scope';

  const categoriesButton = createButton('Get Categories', buttonContainer);
  categoriesButton.addEventListener('click', async () => {
    clearErrorStyle();
    resultsDiv.textContent = 'Fetching categories...';
    try {
      const data = await getCategories(apiRoot);
      displayResults(data);
    } catch (error) {
      displayError(error);
    }
  });

  const publishedProductsButton = createButton(
    'Get Published Products',
    buttonContainer
  );
  publishedProductsButton.addEventListener('click', async () => {
    clearErrorStyle();
    resultsDiv.textContent = 'Fetching published products...';
    try {
      const data = await getPublishedProducts(apiRoot);
      displayResults(data);
    } catch (error) {
      displayError(error);
    }
  });

  const myOrdersButton = createButton(
    'Get My Orders (Requires customer auth)',
    buttonContainer
  );
  myOrdersButton.addEventListener('click', async () => {
    clearErrorStyle();
    resultsDiv.textContent = 'Fetching my orders...';
    try {
      const data = await getMyOrders(apiRoot);
      displayResults(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('access token')) {
        displayError(
          'This endpoint requires customer authentication. The manage_my_orders scope works only with customer tokens, not with client credentials.'
        );
      } else {
        displayError(error);
      }
    }
  });

  // TODO disabled for now
  const productsButton = createButton('Get All Products', buttonContainer);
  productsButton.disabled = true;
  productsButton.classList.add('opacity-50', 'cursor-not-allowed');
  productsButton.title = 'Requires manage_products scope';

  const customersButton = createButton('Get Customers', buttonContainer);
  customersButton.disabled = true;
  customersButton.classList.add('opacity-50', 'cursor-not-allowed');
  customersButton.title = 'Requires manage_customers scope';

  componentDiv.appendChild(buttonContainer);
  componentDiv.appendChild(resultsDiv);

  container.appendChild(componentDiv);
}
