import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";

import { getStats } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the GPT Image 2 Prompt Gallery source data, attribution, and business contact details.",
  alternates: {
    canonical: "/about/"
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about/"),
    title: "About",
    description: "Learn about the GPT Image 2 Prompt Gallery source data, attribution, and business contact details."
  },
  twitter: {
    card: "summary",
    title: "About",
    description: "Learn about the GPT Image 2 Prompt Gallery source data, attribution, and business contact details."
  }
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

      <div id="contact" className="mt-6 rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
              <MessageCircle size={16} />
              Contact
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Business and feedback</h2>
            <p className="mt-3 text-base leading-8 text-neutral-600">
              业务合作或问题反馈，请私信抖音 ID：97107763943。
            </p>
          </div>
          <p className="w-fit rounded-full border border-line bg-neutral-50 px-4 py-2 text-sm font-semibold text-ink">
            97107763943
          </p>
        </div>
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
