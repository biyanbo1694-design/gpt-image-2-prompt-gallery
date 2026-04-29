import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Images, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { getCategoryDisplayName } from "@/components/category-display";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { PromptGrid } from "@/components/prompt-grid";
import { getAllPrompts, getPromptBySlug, getRelatedPrompts } from "@/lib/data";
import { getPromptTimelineDate } from "@/lib/dates";
import { absoluteUrl, seoDescription } from "@/lib/site";

type PromptPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllPrompts().map((prompt) => ({
    slug: prompt.slug
  }));
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);

  if (!prompt) {
    return {
      title: "Prompt"
    };
  }

  const description = seoDescription(prompt.excerpt || prompt.prompt);
  const image = prompt.images[0];

  return {
    title: prompt.title,
    description,
    alternates: {
      canonical: `/prompt/${prompt.slug}/`
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/prompt/${prompt.slug}/`),
      title: prompt.title,
      description,
      images: image
        ? [
            {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt
            }
          ]
        : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: prompt.title,
      description,
      images: image ? [image.url] : undefined
    }
  };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);

  if (!prompt) {
    notFound();
  }

  const related = getRelatedPrompts(prompt);
  const heroImage = prompt.images[0];
  const timelineDate = getPromptTimelineDate(prompt);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    description: prompt.excerpt,
    url: absoluteUrl(`/prompt/${prompt.slug}/`),
    creator: prompt.authorName
      ? {
          "@type": "Person",
          name: prompt.authorName,
          url: prompt.authorUrl
        }
      : undefined,
    dateCreated: prompt.createdAt,
    dateModified: prompt.syncedAt,
    image: prompt.images.map((image) => image.url)
  };

  return (
    <div className="pb-20 pt-24">
      <div className="container-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-neutral-600 transition hover:border-neutral-300 hover:text-ink"
        >
          <ArrowLeft size={16} />
          All Prompts
        </Link>

        <article className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div>
            <div className="overflow-hidden rounded-lg bg-neutral-100 shadow-soft">
              {heroImage ? (
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt}
                  width={heroImage.width ?? 1200}
                  height={heroImage.height ?? 900}
                  className="h-auto w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-neutral-400">
                  <Images size={40} />
                  <span className="text-xs font-medium uppercase tracking-[0.16em]">Prompt-only</span>
                </div>
              )}
            </div>

            {prompt.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {prompt.images.slice(1, 4).map((image) => (
                  <div key={image.url} className="overflow-hidden rounded-lg bg-neutral-100">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={image.width ?? 600}
                      height={image.height ?? 600}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass rounded-lg p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
                <Sparkles size={14} />
                {getCategoryDisplayName(prompt)}
              </div>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
                {prompt.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-neutral-500">
                {prompt.authorName ? <span>Creator: {prompt.authorName}</span> : null}
                {timelineDate ? <span>{`${timelineDate.label}: ${timelineDate.value}`}</span> : null}
                <span>{prompt.images.length > 0 ? `${prompt.images.length} images` : "Prompt-only"}</span>
              </div>

              <div className="mt-8 rounded-lg bg-white p-5 shadow-[inset_0_0_0_1px_rgba(230,232,236,0.95)]">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-neutral-500">Prompt</p>
                  <CopyPromptButton prompt={prompt.prompt} />
                </div>
                <p className="whitespace-pre-wrap break-words text-base leading-8 text-neutral-800">{prompt.prompt}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {prompt.sourceUrl ? (
                  <Link
                    href={prompt.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-neutral-300"
                  >
                    View Source
                    <ExternalLink size={15} />
                  </Link>
                ) : null}
                {prompt.authorUrl ? (
                  <Link
                    href={prompt.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-neutral-300"
                  >
                    Creator
                    <ExternalLink size={15} />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="mt-20">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">Related</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">More {getCategoryDisplayName(prompt)} cases</h2>
            </div>
            <PromptGrid prompts={related} compact />
          </section>
        ) : null}
      </div>
    </div>
  );
}
