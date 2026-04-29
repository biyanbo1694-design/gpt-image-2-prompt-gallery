"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { CategoryPills } from "@/components/category-pills";
import { PromptGrid } from "@/components/prompt-grid";
import type { PromptCardItem } from "@/components/prompt-card";
import type { Category } from "@/lib/types";

export type SearchPromptItem = PromptCardItem & {
  searchText: string;
};

export function SearchExperience({
  categories
}: {
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [prompts, setPrompts] = useState<SearchPromptItem[]>([]);
  const [indexState, setIndexState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load search index.");
        }

        return response.json() as Promise<SearchPromptItem[]>;
      })
      .then((items) => {
        if (active) {
          setPrompts(items);
          setIndexState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setIndexState("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (indexState !== "ready") {
      return [];
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return prompts.slice(0, 12);
    }

    return prompts.filter((prompt) => prompt.searchText.includes(normalized));
  }, [indexState, prompts, query]);

  return (
    <div>
      <div className="glass flex items-center gap-3 rounded-full px-4 py-3">
        <Search size={20} className="shrink-0 text-neutral-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          aria-label="Search prompts"
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
        {indexState === "loading" ? (
          <div className="rounded-lg border border-line bg-white p-8 text-sm text-neutral-500">Loading prompt index...</div>
        ) : null}
        {indexState === "error" ? (
          <div className="rounded-lg border border-line bg-white p-8 text-sm text-neutral-500">
            Search data could not be loaded. Try refreshing the page.
          </div>
        ) : null}
        {indexState === "ready" ? <PromptGrid prompts={results} /> : null}
      </div>
    </div>
  );
}
