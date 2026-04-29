import type { Metadata } from "next";

import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllPrompts } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Prompts",
  description: "Browse every synced GPT Image 2 prompt case in the gallery.",
  alternates: {
    canonical: "/prompts/"
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/prompts/"),
    title: "All Prompts",
    description: "Browse every synced GPT Image 2 prompt case in the gallery."
  },
  twitter: {
    card: "summary",
    title: "All Prompts",
    description: "Browse every synced GPT Image 2 prompt case in the gallery."
  }
};

export default function PromptsPage() {
  const prompts = getAllPrompts();

  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
        as="h1"
        eyebrow="Gallery"
        title="All GPT Image 2 prompts."
        description={`${prompts.length} synced cases collected in one quiet gallery.`}
      />
      <div className="mt-10">
        <PromptGrid prompts={prompts} />
      </div>
    </div>
  );
}
