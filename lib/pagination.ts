export const PROMPTS_PER_PAGE = 60;

export function getPageCount(totalItems: number, perPage = PROMPTS_PER_PAGE) {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

export function getPageItems<T>(items: T[], page: number, perPage = PROMPTS_PER_PAGE) {
  const start = (page - 1) * perPage;

  return items.slice(start, start + perPage);
}
