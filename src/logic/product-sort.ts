import { Product, ActiveSortMode } from '../types/catalog-types';

export function sortProducts(
  products: Product[],
  mode: ActiveSortMode
): Product[] {
  // Create a shallow copy to avoid mutating the original array
  const sortedProducts = [...products];

  sortedProducts.sort((a, b) => {
    let valueA, valueB;

    switch (mode.key) {
      case 'name':
        valueA = a.name.en || '';
        valueB = b.name.en || '';
        return mode.asc
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      case 'price':
        // Handle possible undefined prices
        valueA = a.masterVariant.prices?.[0]?.value.centAmount || 0;
        valueB = b.masterVariant.prices?.[0]?.value.centAmount || 0;
        return mode.asc ? valueA - valueB : valueB - valueA;
      default:
        return 0;
    }
  });

  return sortedProducts;
}