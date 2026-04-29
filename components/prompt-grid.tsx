import { PromptCard } from "@/components/prompt-card";
import type { PromptCardItem } from "@/components/prompt-card";

export function PromptGrid({ prompts, compact = false }: { prompts: PromptCardItem[]; compact?: boolean }) {
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
