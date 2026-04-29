import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchExperience } from "@/components/search-experience";
import { SectionHeader } from "@/components/section-header";
import { getAllCategories } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  description: "Search GPT Image 2 prompt examples by title, prompt text, creator, or category.",
  alternates: {
    canonical: "/search/"
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/search/"),
    title: "Search",
    description: "Search GPT Image 2 prompt examples by title, prompt text, creator, or category."
  },
  twitter: {
    card: "summary",
    title: "Search",
    description: "Search GPT Image 2 prompt examples by title, prompt text, creator, or category."
  }
};

export default function SearchPage() {
  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
        as="h1"
        eyebrow="Search"
        title="Search prompts"
        description="Find cases by title, original prompt text, creator, or category."
      />
      <div className="mt-10">
        <Suspense>
          <SearchExperience categories={getAllCategories()} />
        </Suspense>
      </div>
    </div>
  );
}
