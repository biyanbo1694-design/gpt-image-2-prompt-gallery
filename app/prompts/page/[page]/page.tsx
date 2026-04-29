import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginationNav } from "@/components/pagination-nav";
import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllPrompts } from "@/lib/data";
import { getPageCount, getPageItems } from "@/lib/pagination";
import { absoluteUrl } from "@/lib/site";

type PromptsPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const pageCount = getPageCount(getAllPrompts().length);

  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
    page: String(index + 2)
  }));
}

export async function generateMetadata({ params }: PromptsPageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);
  const pageCount = getPageCount(getAllPrompts().length);

  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > pageCount) {
    return {
      title: "All Prompts"
    };
  }

  const title = `All Prompts - Page ${pageNumber}`;
  const description = `Browse GPT Image 2 prompt cases, page ${pageNumber} of ${pageCount}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/prompts/page/${pageNumber}/`
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/prompts/page/${pageNumber}/`),
      title,
      description
    },
    twitter: {
      card: "summary",
      title,
      description
    }
  };
}

export default async function PromptArchivePage({ params }: PromptsPageProps) {
  const { page } = await params;
  const pageNumber = Number(page);
  const prompts = getAllPrompts();
  const pageCount = getPageCount(prompts.length);

  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > pageCount) {
    notFound();
  }

  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
        as="h1"
        eyebrow="Gallery"
        title={`All GPT Image 2 prompts - page ${pageNumber}.`}
        description={`${prompts.length} synced cases collected in one quiet gallery, paged for faster browsing.`}
      />
      <div className="mt-10">
        <PromptGrid prompts={getPageItems(prompts, pageNumber)} />
        <PaginationNav currentPage={pageNumber} pageCount={pageCount} basePath="/prompts" />
      </div>
    </div>
  );
}
