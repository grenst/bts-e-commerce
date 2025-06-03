export interface PriceValue {
  centAmount: number;
  currencyCode: string;
}

export interface ProductVariant {
  sku?: string;
  images?: { url: string }[];
  prices?: Array<{
    value: PriceValue;
  }>;
}

export interface Product {
  id: string;
  slug?: string;
  name: { [key: string]: string };
  description?: { [key: string]: string };
  masterVariant: ProductVariant;
  categories: Array<{ id: string }>;
}

export interface Category {
  id: string;
  name: { [key: string]: string };
}

export type ActiveSortMode = {
  key: 'name' | 'price';
  asc: boolean;
};
