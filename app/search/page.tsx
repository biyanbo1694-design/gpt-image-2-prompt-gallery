import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchExperience } from "@/components/search-experience";
import { SectionHeader } from "@/components/section-header";
import { getAllCategories, getAllPrompts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search"
};

export default function SearchPage() {
  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
        eyebrow="Search"
        title="Search prompts"
        description="Find cases by title, original prompt text, creator, or category."
      />
      <div className="mt-10">
        <Suspense>
          <SearchExperience prompts={getAllPrompts()} categories={getAllCategories()} />
        </Suspense>
      </div>
    </div>
  );
}
