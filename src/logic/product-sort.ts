import { Product, Category, ActiveSortMode } from '../types/catalog-types';

function getSafeName(p: Product): string {
  const raw = p.name?.en ?? Object.values(p.name ?? {})[0] ?? '';
  return raw.toLowerCase(); // приводим к одному регистру
}

export function sortProducts(
  products: Product[],
  mode: ActiveSortMode
): Product[] {
  // Create a shallow copy to avoid mutating the original array
  const sortedProducts = [...products];

  sortedProducts.sort((a, b) => {
    let valueA, valueB;

    switch (mode.key) {
      case 'name': {
        const valueA = getSafeName(a);
        const valueB = getSafeName(b);
        return mode.asc
          ? valueA.localeCompare(valueB, 'en')
          : valueB.localeCompare(valueA, 'en');
      }
      case 'price': {
        // Handle possible undefined prices
        valueA = a.masterVariant.prices?.[0]?.value.centAmount || 0;
        valueB = b.masterVariant.prices?.[0]?.value.centAmount || 0;
        return mode.asc ? valueA - valueB : valueB - valueA;
      }
      default: {
        return 0;
      }
    }
  });

  return sortedProducts;
}

export function sortProductsWithinCategories(
  products: Product[],
  mode: ActiveSortMode,
  categoryOrder: string[]
): Product[] {
  const productsByCategory = new Map<string, Product[]>();

  for (const product of products) {
    const categoryId = product.categories?.[0]?.id || 'uncategorized';
    if (!productsByCategory.has(categoryId)) {
      productsByCategory.set(categoryId, []);
    }
    productsByCategory.get(categoryId)!.push(product);
  }

  for (const [categoryId, categoryProducts] of productsByCategory) {
    console.log(
      `Sorting category ${categoryId} by ${mode.key} (${mode.asc ? 'asc' : 'desc'})`
    );

    categoryProducts.sort((a, b) => {
      if (mode.key === 'name') {
        const nameA = getSafeName(a);
        const nameB = getSafeName(b);
        return mode.asc
          ? nameA.localeCompare(nameB, 'en')
          : nameB.localeCompare(nameA, 'en');
      }

      if (mode.key === 'price') {
        const priceA = a.masterVariant.prices?.[0]?.value.centAmount || 0;
        const priceB = b.masterVariant.prices?.[0]?.value.centAmount || 0;
        return mode.asc ? priceA - priceB : priceB - priceA;
      }

      return 0;
    });
  }

  const sortedProducts: Product[] = [];

  for (const categoryId of categoryOrder) {
    const categoryProducts = productsByCategory.get(categoryId);
    if (categoryProducts?.length) {
      sortedProducts.push(...categoryProducts);
    }
  }

  return sortedProducts;
}

// New function to sort categories
export function sortCategories(
  categories: Category[],
  asc: boolean
): Category[] {
  // Create a shallow copy to avoid mutating the original array
  const sortedCategories = [...categories];

  sortedCategories.sort((a, b) => {
    const nameA = a.name?.en || '';
    const nameB = b.name?.en || '';
    return asc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  return sortedCategories;
}
