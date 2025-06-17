import { AxiosError } from 'axios';
import {
  getAllPublishedProducts,
  getAllCategories,
  getProductById,
  getDrinkProducts,
  getProductsByCategory,
} from './product-service';
import { apiInstance } from '../axios-instances';
import { Product, Category } from '../../types/catalog-types';

jest.mock('../axios-instances');

const mockApiInstance = apiInstance as jest.MockedFunction<typeof apiInstance>;

const mockProduct: Product = {
  id: '1',
  name: { en: 'Test Product' },
  description: { en: 'This is a test product.' },
  slug: 'test-product',
  masterVariant: {
    id: 1,
    sku: 'TP-001',
    prices: [{ value: { centAmount: 1000, currencyCode: 'EUR' } }],
    images: [{ url: 'http://example.com/image.jpg' }],
    attributes: [],
  },
  variants: [],
  categories: [],
};

const mockCategory: Category = {
  id: 'cat1',
  name: { en: 'Test Category' },
};

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPublishedProducts', () => {
    it('should fetch all published products without filters or sorting', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const products = await getAllPublishedProducts();

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: { staged: 'false', limit: '200' },
        }
      );
    });

    it('should fetch products with a single filter', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const filter = 'categories.id:"some-category-id"';
      const products = await getAllPublishedProducts(filter);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: { staged: 'false', limit: '200', 'filter.query': filter },
        }
      );
    });

    it('should fetch products with multiple filters', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const filters = [
        'categories.id:"cat1"',
        'variants.attributes.color:"red"',
      ];
      const products = await getAllPublishedProducts(filters);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: { staged: 'false', limit: '200', 'filter.query': filters },
        }
      );
    });

    it('should fetch products with a single sort', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const sort = 'name.en asc';
      const products = await getAllPublishedProducts(undefined, sort);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: {
            staged: 'false',
            limit: '200',
            sort: sort,
            localeProjection: 'en',
          },
        }
      );
    });

    it('should fetch products with multiple sorts', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const sorts = ['name.en asc', 'price desc'];
      const products = await getAllPublishedProducts(undefined, sorts);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: {
            staged: 'false',
            limit: '200',
            sort: sorts,
            priceCurrency: 'EUR',
            localeProjection: 'en',
          },
        }
      );
    });

    it('should fetch products with text search', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const text = 'honey';
      const products = await getAllPublishedProducts(
        undefined,
        undefined,
        text
      );

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: { staged: 'false', limit: '200', 'text.en': text },
        }
      );
    });

    it('should handle errors when fetching published products', async () => {
      const error = new Error('Network Error');
      mockApiInstance.get = jest.fn().mockRejectedValue(error);

      await expect(getAllPublishedProducts()).rejects.toThrow('Network Error');
    });
  });

  describe('getAllCategories', () => {
    it('should fetch all categories', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockCategory] },
      });

      const categories = await getAllCategories();

      expect(categories).toEqual([mockCategory]);
      expect(mockApiInstance.get).toHaveBeenCalledWith('/categories');
    });

    it('should handle errors when fetching categories', async () => {
      const error = new Error('API Error');
      mockApiInstance.get = jest.fn().mockRejectedValue(error);

      await expect(getAllCategories()).rejects.toThrow('API Error');
    });
  });

  describe('getProductById', () => {
    it('should fetch a product by ID', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: mockProduct,
      });

      const product = await getProductById('1');

      expect(product).toEqual(mockProduct);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/1',
        {
          params: { staged: 'false' },
        }
      );
    });

    it('should return undefined if product is not found (404 error)', async () => {
      const error = new AxiosError('Not Found', '404', undefined, undefined, {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: { 'Content-Type': 'application/json' } },
        data: 'Product not found',
      });
      mockApiInstance.get = jest.fn().mockRejectedValue(error);

      const product = await getProductById('non-existent-id');

      expect(product).toBeUndefined();
    });

    it('should throw other errors when fetching product by ID', async () => {
      const error = new Error('Forbidden');
      mockApiInstance.get = jest.fn().mockRejectedValue(error);

      await expect(getProductById('1')).rejects.toThrow('Forbidden');
    });
  });

  describe('getDrinkProducts', () => {
    it('should return drink products with correct format', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const drinkProducts = await getDrinkProducts();

      expect(drinkProducts).toEqual([
        {
          id: mockProduct.id,
          name: mockProduct.name.en,
          description: mockProduct.description?.en,
          price: mockProduct.masterVariant.prices?.[0]?.value.centAmount,
          currency: mockProduct.masterVariant.prices?.[0]?.value.currencyCode,
          imageUrl: mockProduct.masterVariant.images?.[0]?.url,
        },
      ]);
    });

    it('should handle products with missing description', async () => {
      const productWithoutDescription = {
        ...mockProduct,
        description: undefined,
      };
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [productWithoutDescription] },
      });

      const drinkProducts = await getDrinkProducts();

      expect(drinkProducts[0]?.description).toEqual(
        'No description available.'
      );
    });

    it('should handle products with missing name', async () => {
      const productWithoutName = {
        ...mockProduct,
        name: {},
      };
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [productWithoutName] },
      });

      const drinkProducts = await getDrinkProducts();

      expect(drinkProducts[0]?.name).toEqual('N/A');
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by a single category ID', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const categoryId = 'cat1';
      const products = await getProductsByCategory(categoryId);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: {
            staged: 'false',
            limit: '200',
            'filter.query': ['categories.id:"cat1"'],
          },
        }
      );
    });

    it('should fetch products by multiple category IDs', async () => {
      mockApiInstance.get = jest.fn().mockResolvedValue({
        data: { results: [mockProduct] },
      });

      const categoryIds = ['cat1', 'cat2'];
      const products = await getProductsByCategory(categoryIds);

      expect(products).toEqual([mockProduct]);
      expect(mockApiInstance.get).toHaveBeenCalledWith(
        '/product-projections/search',
        {
          params: {
            staged: 'false',
            limit: '200',
            'filter.query': ['categories.id:"cat1"', 'categories.id:"cat2"'],
          },
        }
      );
    });

    it('should handle errors when fetching products by category', async () => {
      const error = new Error('Category Error');
      mockApiInstance.get = jest.fn().mockRejectedValue(error);

      await expect(getProductsByCategory('cat1')).rejects.toThrow(
        'Category Error'
      );
    });
  });
});
