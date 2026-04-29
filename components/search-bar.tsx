"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={onSubmit} className="glass flex items-center gap-3 rounded-full px-3 py-3 sm:px-4">
      <Search size={20} className="shrink-0 text-neutral-400" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search prompts"
        placeholder="Search prompts, categories, creators..."
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400 sm:text-base"
      />
      <button
        type="submit"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-medium text-white transition hover:bg-neutral-800 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
      >
        <Search size={16} className="sm:hidden" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
