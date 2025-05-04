import { createClient, type Middleware } from '@commercetools/sdk-client-v2'; // Import Middleware type
import { createAuthMiddlewareForClientCredentialsFlow } from '@commercetools/sdk-middleware-auth';
import { createHttpMiddleware } from '@commercetools/sdk-middleware-http';
import {
  createApiBuilderFromCtpClient,
  ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
export function createCommercetoolsClient() {
  const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
  const clientId = import.meta.env.VITE_CTP_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CTP_CLIENT_SECRET;
  const authUrl = import.meta.env.VITE_CTP_AUTH_URL;
  const apiUrl = import.meta.env.VITE_CTP_API_URL;
  const scopesString = import.meta.env.VITE_CTP_SCOPES;
  let scopes: string[] | undefined;
  if (scopesString && projectKey) {
    scopes = scopesString
      .split(' ')
      .map((scope: string) => scope.replace('{projectKey}', projectKey));
  }

  if (
    !projectKey ||
    !clientId ||
    !clientSecret ||
    !authUrl ||
    !apiUrl ||
    !scopes
  ) {
    const missingVars = [
      !projectKey && 'VITE_CTP_PROJECT_KEY',
      !clientId && 'VITE_CTP_CLIENT_ID',
      !clientSecret && 'VITE_CTP_CLIENT_SECRET',
      !authUrl && 'VITE_CTP_AUTH_URL',
      !apiUrl && 'VITE_CTP_API_URL',
      !scopes && 'VITE_CTP_SCOPES',
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Missing required Commercetools environment variables: ${missingVars}. Ensure they are HAVE IT in your .env file.`
    );
  }

  const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
    host: authUrl,
    projectKey,
    credentials: {
      clientId,
      clientSecret,
    },
    scopes,
  });

  const httpMiddleware = createHttpMiddleware({
    host: apiUrl,
  });

  const client = createClient({
    // results to Middleware type
    middlewares: [authMiddleware as Middleware, httpMiddleware as Middleware],
  });

  return client;
}

export function createApiClient() {
  const client = createCommercetoolsClient();
  const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;

  if (!projectKey) {
    throw new Error(
      'Missing required Commercetools environment variable: VITE_CTP_PROJECT_KEY. Ensure it is defined in your .env file and prefixed with VITE_.'
    );
  }

  const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
    projectKey,
  });
  return apiRoot;
}

// project info
export async function getProject(apiRoot: ByProjectKeyRequestBuilder) {
  try {
    const project = await apiRoot.get().execute();
    console.log('Project Info:', project.body);
    return project.body;
  } catch (error) {
    console.error('Error fetching project info:', error);
    throw error;
  }
}

// list of products
export async function getProducts(apiRoot: ByProjectKeyRequestBuilder) {
  try {
    const products = await apiRoot.products().get().execute();
    console.log('Products:', products.body.results);
    return products.body.results;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// list of categories
export async function getCategories(apiRoot: ByProjectKeyRequestBuilder) {
  try {
    const categories = await apiRoot.categories().get().execute();
    console.log('Categories:', categories.body.results);
    return categories.body.results;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// published products
export async function getPublishedProducts(
  apiRoot: ByProjectKeyRequestBuilder
) {
  try {
    const products = await apiRoot
      .productProjections()
      .get({
        queryArgs: {
          staged: false,
        },
      })
      .execute();
    console.log('Published Products:', products.body.results);
    return products.body.results;
  } catch (error) {
    console.error('Error fetching published products:', error);
    throw error;
  }
}

// my orders
export async function getMyOrders(apiRoot: ByProjectKeyRequestBuilder) {
  try {
    const orders = await apiRoot.me().orders().get().execute();
    console.log('My Orders:', orders.body.results);
    return orders.body.results;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
}

// list of customers ----
export async function getCustomers(apiRoot: ByProjectKeyRequestBuilder) {
  try {
    const customers = await apiRoot.customers().get().execute();
    console.log('Customers:', customers.body.results);
    return customers.body.results;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}
