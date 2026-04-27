import type { Category, PromptItem } from "@/lib/types";

const categoryCopy: Record<string, { name: string; description: string; aliases: string[] }> = {
  portraits: {
    name: "Portraits",
    description: "Portraits, photoshoots, identity-consistent characters, and personal image prompts.",
    aliases: ["Portraits", "portrait", "portraits"]
  },
  posters: {
    name: "Posters",
    description: "Editorial, travel, event, brand, and cinematic poster prompts.",
    aliases: ["Posters", "poster", "posters"]
  },
  characters: {
    name: "Characters",
    description: "Character sheets, recurring characters, anime/game roles, and stylized IP concepts.",
    aliases: ["Characters", "character", "characters"]
  },
  "ui-mockups": {
    name: "UI Mockups",
    description: "App screens, dashboards, status pages, and product interface mockups.",
    aliases: ["UI Mockups", "ui", "mockup", "mockups"]
  },
  comparisons: {
    name: "Comparisons",
    description: "Multi-version outputs, style comparisons, and prompt experiments.",
    aliases: ["Comparison", "Comparisons", "comparison", "comparisons"]
  },
  infographics: {
    name: "Infographics",
    description: "Structured visuals, diagrams, explainers, and information layouts.",
    aliases: ["Infographics", "infographic", "infographics"]
  },
  products: {
    name: "Products",
    description: "Product photography, packaging, ecommerce visuals, and object-led prompts.",
    aliases: ["Products", "product", "products"]
  },
  spaces: {
    name: "Spaces",
    description: "Interior, architecture, landscape, and environmental image prompts.",
    aliases: ["Spaces", "space", "spaces", "Architecture", "architecture"]
  },
  community: {
    name: "Community",
    description: "Public creator discoveries, experiments, and cross-format prompt cases.",
    aliases: ["Community", "community"]
  }
};

export function getCategoryDisplayName(category: Pick<Category, "slug" | "name"> | Pick<PromptItem, "categorySlug" | "category">) {
  const slug = "categorySlug" in category ? category.categorySlug : category.slug;
  const fallback = "name" in category ? category.name : category.category;

  return categoryCopy[slug]?.name ?? fallback;
}

export function getCategoryDisplayDescription(category: Pick<Category, "slug" | "description">) {
  return categoryCopy[category.slug]?.description ?? category.description;
}

export function getCategorySearchText(prompt: Pick<PromptItem, "category" | "categorySlug">) {
  const copy = categoryCopy[prompt.categorySlug];

  return [prompt.category, copy?.name, ...(copy?.aliases ?? [])].filter(Boolean).join(" ");
}
