import "server-only";

import categoriesData from "@/data/generated/categories.json";
import promptsData from "@/data/generated/prompts.json";
import statsData from "@/data/generated/stats.json";
import type { Category, GalleryStats, PromptItem } from "@/lib/types";

const prompts = promptsData as PromptItem[];
const categories = categoriesData as Category[];
const stats = statsData as GalleryStats;

export function getAllPrompts() {
  return prompts;
}

export function getFeaturedPrompts(limit = 8) {
  return prompts
    .filter((prompt) => prompt.images.length > 0)
    .sort((a, b) => (b.metrics?.likes ?? 0) - (a.metrics?.likes ?? 0))
    .slice(0, limit);
}

export function getLatestPrompts(limit = 8) {
  return [...prompts]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export function getPromptBySlug(slug: string) {
  return prompts.find((prompt) => prompt.slug === slug);
}

export function getRelatedPrompts(prompt: PromptItem, limit = 4) {
  return prompts
    .filter((item) => item.slug !== prompt.slug && item.categorySlug === prompt.categorySlug)
    .slice(0, limit);
}

export function getAllCategories() {
  return categories;
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getPromptsByCategory(slug: string) {
  return prompts.filter((prompt) => prompt.categorySlug === slug);
}

export function getStats() {
  return stats;
}

export function searchPrompts(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return prompts.filter((prompt) => {
    const haystack = [
      prompt.title,
      prompt.prompt,
      prompt.excerpt,
      prompt.category,
      prompt.authorName ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
