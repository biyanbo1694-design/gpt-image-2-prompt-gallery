import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryDisplayDescription, getCategoryDisplayName } from "@/components/category-display";
import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllCategories, getCategoryBySlug, getPromptsByCategory } from "@/lib/data";

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

  return {
    title: category ? getCategoryDisplayName(category) : "Category"
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
