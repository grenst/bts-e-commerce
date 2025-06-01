import { Product } from '../types/catalog-types';

export function applyFilters(
  products: Product[],
  activeCategoryIds: Set<string>,
  searchTermRaw: string
): Product[] {
  const searchTerm = searchTermRaw.trim().toLowerCase();

  return products.filter((product) => {
    /* ---------- 1. filter by category ---------- */
    const categoryOk =
      activeCategoryIds.size > 0 &&
      product.categories.some((c) => activeCategoryIds.has(c.id));

    /* ---------- 2. filter by search ---------- */
    if (!searchTerm) return categoryOk;

    // looking ANY match in local
    const nameMatches = Object.values(product.name).some((name) =>
      name.toLowerCase().includes(searchTerm)
    );

    return categoryOk && nameMatches; // && (nameMatches || descMatches)
  });
}
