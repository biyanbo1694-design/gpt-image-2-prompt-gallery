import type { Metadata } from "next";

import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllPrompts } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Prompts"
};

export default function PromptsPage() {
  const prompts = getAllPrompts();

  return (
    <div className="container-shell pb-20 pt-28">
      <SectionHeader
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
