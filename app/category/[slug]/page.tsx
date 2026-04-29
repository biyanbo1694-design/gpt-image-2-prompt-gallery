import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryDisplayDescription, getCategoryDisplayName } from "@/components/category-display";
import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllCategories, getCategoryBySlug, getPromptsByCategory } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({
    slug: category.slug
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category"
    };
  }

  const title = getCategoryDisplayName(category);
  const description = getCategoryDisplayDescription(category);

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${category.slug}/`
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/category/${category.slug}/`),
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const prompts = getPromptsByCategory(slug);

  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
        as="h1"
        eyebrow="Category"
        title={getCategoryDisplayName(category)}
        description={`${getCategoryDisplayDescription(category)} This section includes ${prompts.length} synced prompt cases.`}
      />
      <div className="mt-10">
        <PromptGrid prompts={prompts} />
      </div>
    </div>
  );
}
