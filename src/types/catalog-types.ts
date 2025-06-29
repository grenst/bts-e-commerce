export interface PriceValue {
  centAmount: number;
  currencyCode: string;
}

export interface DiscountedPrice {
  value: PriceValue;
  discount: { id: string; typeId: 'product-discount' };
}

export interface Price {
  value: PriceValue;
  discounted?: DiscountedPrice;
}

export interface AttributeLocalizedEnum {
  key: string;
  label: Record<string, string>;
}

export interface Attribute {
  name: string;
  value: AttributeLocalizedEnum | string;
}

export interface ProductVariant {
  id?: number;
  sku?: string;
  images?: { url: string }[];
  prices?: Price[];
  attributes?: Attribute[];
}

export interface Product {
  id: string;
  slug?: string;
  name: { [key: string]: string };
  description?: { [key: string]: string };
  masterVariant: ProductVariant;
  variants?: ProductVariant[];
  categories: Array<{ id: string }>;
}

export interface Category {
  id: string;
  name: { [key: string]: string };
}

export type ActiveSortMode = {
  key: 'name' | 'price' | 'category';
  asc: boolean;
};
