import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Images } from "lucide-react";

import { getCategoryDisplayName } from "@/components/category-display";
import { getPromptTimelineDate } from "@/lib/dates";
import type { PromptImage, PromptItem } from "@/lib/types";

export type PromptCardItem = Pick<
  PromptItem,
  "id" | "slug" | "title" | "category" | "categorySlug" | "excerpt" | "authorName" | "sourceUrl" | "createdAt" | "syncedAt"
> & {
  images?: PromptImage[];
  coverImage?: PromptImage;
  imageCount?: number;
};

export function PromptCard({ prompt, compact = false }: { prompt: PromptCardItem; compact?: boolean }) {
  const image = prompt.coverImage ?? prompt.images?.[0];
  const imageCount = prompt.imageCount ?? prompt.images?.length ?? 0;
  const timelineDate = getPromptTimelineDate(prompt);

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-card">
      <Link href={`/prompt/${prompt.slug}`} className="block">
        <div className={`relative overflow-hidden bg-neutral-100 ${compact ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width ?? 900}
              height={image.height ?? 900}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes={
                compact
                  ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
              <Images size={34} />
              <span className="text-xs font-medium uppercase tracking-[0.16em]">Prompt-only</span>
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full bg-white/82 px-3 py-1 text-xs font-medium text-ink backdrop-blur-xl">
            {getCategoryDisplayName(prompt)}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/prompt/${prompt.slug}`} className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-ink">{prompt.title}</h3>
          </Link>
          {prompt.sourceUrl ? (
            <Link
              href={prompt.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-neutral-500 transition hover:border-neutral-300 hover:text-ink"
            >
              <ExternalLink size={15} />
            </Link>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{prompt.excerpt}</p>

        <div className="mt-5 space-y-2 text-xs text-neutral-400">
          <div className="flex items-center justify-between gap-4">
            <span>{prompt.authorName ?? "Public creator"}</span>
            <span>{imageCount > 0 ? `${imageCount} images` : "Prompt-only"}</span>
          </div>
          {timelineDate ? (
            <p className="text-neutral-500">
              {timelineDate.label} {timelineDate.value}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
