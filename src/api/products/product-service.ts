import { apiInstance } from '../axios-instances';
import { AxiosError, isAxiosError } from 'axios'; // Added isAxiosError
// import { useTokenStore } from '../../store/token-store'; // No longer needed for token fetching
// import { getAnonymousToken } from '../../components/auth-services/token.service'; // No longer needed
import { Product, Category } from '../../types/catalog-types';

// Conditional logger for this file
const logger = {
  log: (...arguments_: unknown[]) => {
    if (import.meta.env.MODE !== 'production') console.log(...arguments_);
  },
  dir: (...arguments_: unknown[]) => {
    if (import.meta.env.MODE !== 'production') console.dir(...arguments_);
  },
  error: (...arguments_: unknown[]) => {
    if (import.meta.env.MODE !== 'production') console.error(...arguments_);
  },
};

export const getAllProducts = getAllPublishedProducts;

interface CategoryPagedQueryResponse {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: Category[];
}

interface ProductProjectionPagedQueryResponse {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: Product[];
}

export async function getAllPublishedProducts(
  filter?: string | string[],
  sort?: string | string[],
  text?: string
): Promise<Product[]> {
  try {
    // Token fetching logic removed
    const parameters: Record<string, string | string[]> = {
      staged: 'false',
      limit: '200',
    };

    if (filter) {
      parameters['filter.query'] = filter;
    }

    if (sort) {
      parameters.sort = sort;

      const needsPriceCurrency = (Array.isArray(sort) ? sort : [sort]).some(
        (s) => s.startsWith('price ')
      );
      if (needsPriceCurrency) {
        parameters.priceCurrency = 'EUR';
      } else {
        // No else logic needed
      }

      const nameSort = (Array.isArray(sort) ? sort : [sort]).find((s) =>
        /^name\.([a-z]{2}(?:-[A-Z]{2})?)\s/.test(s)
      );
      if (nameSort) {
        const locale = nameSort.split('.')[1].split(' ')[0];
        parameters.localeProjection = locale;
      } else {
        // No else logic needed
      }
    }

    if (text) {
      parameters['text.en'] = text;
    }

    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      '/product-projections/search',
      {
        params: parameters,
        // headers: { Authorization: ... } removed
      }
    );

    return response.data.results;
  } catch (error_: unknown) {
    const error = error_ as AxiosError | Error;
    if (isAxiosError(error) && error.response?.data) {
      logger.dir(error.response!.data, { depth: undefined });
    }
    logger.error('Error fetching published products:', error.message, error);
    if (isAxiosError(error)) {
      if (error.response?.status === 403) {
        logger.error(
          "Forbidden: token lacks the 'view_published_products' scope."
        );
      } else {
        // No else logic needed
      }
    }
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    // Token fetching logic removed
    const response = await apiInstance.get<CategoryPagedQueryResponse>(
      '/categories'
      // headers: { Authorization: ... } removed
    );

    return response.data.results;
  } catch (error_: unknown) {
    const error = error_ as AxiosError | Error;
    logger.error('Error fetching categories:', error.message, error);
    if (isAxiosError(error)) {
      if (error.response?.status === 403) {
        logger.error("Forbidden: token lacks the 'view_categories' scope.");
      } else {
        // No else logic needed
      }
    }
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<Product | undefined> {
  try {
    // Token fetching logic removed
    const response = await apiInstance.get<Product>(
      `/product-projections/${productId}`,
      {
        params: { staged: 'false' }, // staged: 'false' was in original getProductById, keeping it.
        // headers: { Authorization: ... } removed
      }
    );

    const product = response.data;
    // Slug generation logic from original file
    if (product.masterVariant.sku) {
      product.slug = product.masterVariant.sku
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-');
    }
    return product;
  } catch (error_: unknown) {
    const error = error_ as AxiosError | Error;
    // logger.error for 404 was in .ref_structure, but original code returned undefined. Let's match original.
    if (isAxiosError(error) && error.response?.status === 404) {
      logger.error(`Product with ID ${productId} not found.`); // Added logger for 404 as per .ref_structure suggestion
      return undefined;
    } else {
      // No else logic needed
    }
    logger.error(
      `Error fetching product by ID ${productId}:`,
      error.message,
      error
    );
    if (isAxiosError(error)) {
      if (error.response?.status === 403) {
        logger.error(
          "Forbidden: token lacks the 'view_published_products' scope."
        );
      } else {
        // No else logic needed
      }
    }
    throw error;
  }
}

export interface DrinkProduct {
  id: string;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

export async function getDrinkProducts(): Promise<DrinkProduct[]> {
  const products = await getAllPublishedProducts();
  return products.map(
    (product): DrinkProduct => ({
      id: product.id,
      name: product.name.en || Object.values(product.name)[0] || 'N/A',
      description:
        product.description?.en ||
        Object.values(product.description ?? {})[0] ||
        'No description available.',
      price: product.masterVariant.prices?.[0]?.value.centAmount,
      currency: product.masterVariant.prices?.[0]?.value.currencyCode,
      imageUrl: product.masterVariant.images?.[0]?.url,
    })
  );
}

export async function getProductsByCategory(
  categoryIds: string | string[]
): Promise<Product[]> {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  // categories.id:"id1"  OR  categories.id:"id1","id2",…
  const filters = ids.map((id) => `categories.id:"${id}"`);

  // getAllPublishedProducts already accepts string | string[],
  // so we can forward the array to create multiple filter.query params
  return getAllPublishedProducts(filters);
}
