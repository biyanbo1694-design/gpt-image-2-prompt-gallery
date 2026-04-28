import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { getStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "About"
};

export default function AboutPage() {
  const stats = getStats();

  return (
    <div className="container-shell pb-20 pt-28">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">About</p>
        <h1 className="mt-4 text-balance text-5xl font-semibold tracking-normal text-ink sm:text-6xl">
          A calmer way to browse GPT Image 2 inspiration.
        </h1>
        <p className="mt-6 text-lg leading-8 text-neutral-600">
          This gallery syncs public cases from EvoLinkAI/awesome-gpt-image-2-prompts and presents them as clean,
          static, searchable inspiration data.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <StatCard label="Prompts" value={stats.totalPrompts} />
        <StatCard label="Categories" value={stats.totalCategories} />
        <StatCard label="Images" value={stats.totalImages} />
      </div>

      <div className="mt-12 rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Attribution</h2>
        <p className="mt-4 text-base leading-8 text-neutral-600">
          Prompt cases are curated from EvoLinkAI/awesome-gpt-image-2-prompts and original public creator posts.
          All rights belong to their respective creators.
        </p>
        <Link
          href={stats.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          View Source Repository
          <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-ink">{value.toLocaleString()}</p>
    </div>
  );
}
