"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { CategoryPills } from "@/components/category-pills";
import { getCategorySearchText } from "@/components/category-display";
import { PromptGrid } from "@/components/prompt-grid";
import type { Category, PromptItem } from "@/lib/types";

export function SearchExperience({
  prompts,
  categories
}: {
  prompts: PromptItem[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return prompts.slice(0, 12);
    }

    return prompts.filter((prompt) =>
      [prompt.title, prompt.prompt, prompt.excerpt, getCategorySearchText(prompt), prompt.authorName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [prompts, query]);

  return (
    <div>
      <div className="glass flex items-center gap-3 rounded-full px-4 py-3">
        <Search size={20} className="shrink-0 text-neutral-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="Search prompts, categories, creators..."
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-neutral-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="grid size-9 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:text-ink"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        {query ? (
          <p className="text-sm text-neutral-500">
            Found {results.length} results for <span className="font-medium text-ink">"{query}"</span>
          </p>
        ) : (
          <>
            <p className="text-sm text-neutral-500">Browse by category, or type a keyword above.</p>
            <CategoryPills categories={categories} />
          </>
        )}
      </div>

      <div className="mt-8">
        <PromptGrid prompts={results} />
      </div>
    </div>
  );
}
