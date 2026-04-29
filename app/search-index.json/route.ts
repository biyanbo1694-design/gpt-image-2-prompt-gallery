import { getCategorySearchText } from "@/components/category-display";
import { getAllPrompts } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  const searchPrompts = getAllPrompts().map((prompt) => ({
    id: prompt.id,
    slug: prompt.slug,
    title: prompt.title,
    category: prompt.category,
    categorySlug: prompt.categorySlug,
    excerpt: prompt.excerpt,
    authorName: prompt.authorName,
    sourceUrl: prompt.sourceUrl,
    createdAt: prompt.createdAt,
    syncedAt: prompt.syncedAt,
    coverImage: prompt.images[0]
      ? {
          url: prompt.images[0].url,
          alt: prompt.images[0].alt,
          width: prompt.images[0].width,
          height: prompt.images[0].height
        }
      : undefined,
    imageCount: prompt.images.length,
    searchText: [
      prompt.title,
      prompt.prompt,
      prompt.excerpt,
      getCategorySearchText(prompt),
      prompt.authorName ?? ""
    ]
      .join(" ")
      .toLowerCase()
  }));

  return Response.json(searchPrompts, {
    headers: {
      "Cache-Control": "public, max-age=3600"
    }
  });
}
