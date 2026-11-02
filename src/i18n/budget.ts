import { STATIC_EXPENSE_CATEGORIES, STATIC_INCOME_CATEGORIES } from '@/lib/budget/report/categories';

/** Only built-in category wording is app copy. Custom and historical names
 * remain exactly as the account owner entered them, even if they match a key. */
export function personalCategoryNames(rows: readonly { categoryId: string; categoryName: string }[]): Set<string> {
  return new Set(rows.filter(row => !Object.hasOwn(STATIC_EXPENSE_CATEGORIES, row.categoryId)
    && !Object.hasOwn(STATIC_INCOME_CATEGORIES, row.categoryId)).map(row => row.categoryName));
}
