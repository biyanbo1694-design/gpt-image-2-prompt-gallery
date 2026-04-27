import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Images, Layers3, WandSparkles } from "lucide-react";

import { SearchBar } from "@/components/search-bar";
import type { GalleryStats, PromptItem } from "@/lib/types";

export function Hero({ stats, prompts }: { stats: GalleryStats; prompts: PromptItem[] }) {
  const heroImages = prompts.flatMap((prompt) =>
    prompt.images[0]
      ? [
          {
            prompt,
            image: prompt.images[0]
          }
        ]
      : []
  );

  return (
    <section className="border-b border-line bg-white">
      <div className="container-shell grid min-w-0 gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="mobile-safe-width min-w-0 overflow-hidden sm:w-auto lg:pt-16">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600">
            <WandSparkles size={15} />
            Curated from EvoLinkAI
          </div>
          <h1 className="mt-6 max-w-full break-words text-balance text-4xl font-semibold tracking-normal text-ink sm:text-6xl lg:text-7xl">
            GPT Image 2
            <span className="block">Prompt Gallery</span>
          </h1>
          <p className="mt-6 max-w-2xl break-words text-base leading-8 text-neutral-600 sm:text-lg">
            Browse portraits, posters, characters, UI mockups, and public community cases in a clean static gallery.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBar />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/prompts"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Browse Gallery
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-neutral-300"
            >
              About Sync
            </Link>
          </div>
        </div>

        <div className="mobile-safe-width grid min-w-0 gap-4 sm:w-auto">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2">
            {heroImages.slice(0, 3).map(({ prompt, image }, index) => (
              <Link
                key={prompt.id}
                href={`/prompt/${prompt.slug}`}
                className={`group relative overflow-hidden rounded-lg bg-neutral-100 shadow-sm ${
                  index === 0 ? "min-h-[260px] sm:row-span-2 sm:min-h-[360px]" : "min-h-[180px] sm:min-h-[172px]"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={image.width ?? 900}
                  height={image.height ?? 900}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  priority={index === 0}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-white">{prompt.title}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <HeroMetric icon={<Layers3 size={20} />} label="Prompts" value={stats.totalPrompts} />
            <HeroMetric icon={<Images size={20} />} label="Images" value={stats.totalImages} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-neutral-50 p-5">
      <div className="text-neutral-500">{icon}</div>
      <p className="mt-6 text-4xl font-semibold text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  );
}
