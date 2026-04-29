import type { MetadataRoute } from "next";

import { getAllCategories, getAllPrompts } from "@/lib/data";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const prompts = getAllPrompts();
  const categories = getAllCategories();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/prompts/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: absoluteUrl("/search/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: absoluteUrl("/about/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/category/${category.slug}/`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...prompts.map((prompt) => ({
      url: absoluteUrl(`/prompt/${prompt.slug}/`),
      lastModified: prompt.createdAt ?? prompt.syncedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
