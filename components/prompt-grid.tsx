import { PromptCard } from "@/components/prompt-card";
import type { PromptItem } from "@/lib/types";

export function PromptGrid({ prompts, compact = false }: { prompts: PromptItem[]; compact?: boolean }) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-neutral-500">
        No prompt data yet.
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} compact={compact} />
      ))}
    </div>
  );
}
