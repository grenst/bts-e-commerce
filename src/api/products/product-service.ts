import { apiInstance } from '../axios-instances';
import { isAxiosError } from 'axios'; // Added isAxiosError
import { Product, Category } from '../../types/catalog-types';

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
      }

      const nameSort = (Array.isArray(sort) ? sort : [sort]).find((s) =>
        /^name\.([a-z]{2}(?:-[A-Z]{2})?)\s/.test(s)
      );
      if (nameSort) {
        const locale = nameSort.split('.')[1].split(' ')[0];
        parameters.localeProjection = locale;
      }
    }

    if (text) {
      parameters['text.en'] = text;
    }

    const response = await apiInstance.get<ProductProjectionPagedQueryResponse>(
      '/product-projections/search',
      {
        params: parameters,
      }
    );

    return response.data.results;
  } catch (error_: unknown) {
    const error = error_ instanceof Error ? error_ : new Error(String(error_));
    if (isAxiosError(error_) && error_.response?.data) {
      logger.dir(error_.response.data, { depth: undefined });
    }
    logger.error('Error fetching published products:', error.message, error);
    if (isAxiosError(error)) {
      if (error.response?.status === 403) {
        logger.error(
          "Forbidden: token lacks the 'view_published_products' scope."
        );
      } else {
        logger.error('Unhandled error status:', error.response?.status);
      }
    }
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response =
      await apiInstance.get<CategoryPagedQueryResponse>('/categories');

    return response.data.results;
  } catch (error_: unknown) {
    const error = error_ instanceof Error ? error_ : new Error(String(error_));
    logger.error('Error fetching categories:', error.message, error);
    if (isAxiosError(error)) {
      if (error.response?.status === 403) {
        logger.error("Forbidden: token lacks the 'view_categories' scope.");
      } else {
        logger.error('Unhandled error status:', error.response?.status);
      }
    }
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<Product | undefined> {
  try {
    const response = await apiInstance.get<Product>(
      `/product-projections/${productId}`,
      {
        params: { staged: 'false' },
      }
    );

    const product = response.data;
    if (product.masterVariant.sku) {
      product.slug = product.masterVariant.sku
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-');
    }
    return product;
  } catch (error_: unknown) {
    const error = error_ instanceof Error ? error_ : new Error(String(error_));
    if (isAxiosError(error) && error.response?.status === 404) {
      logger.error(`Product with ID ${productId} not found.`);
      return undefined;
    } else {
      if (isAxiosError(error)) {
        logger.error('Unhandled error status:', error.response?.status);
      }
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
        if (isAxiosError(error)) {
          logger.error('Unhandled error status:', error.response?.status);
        }
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

  const filters = ids.map((id) => `categories.id:"${id}"`);

  return getAllPublishedProducts(filters);
}
