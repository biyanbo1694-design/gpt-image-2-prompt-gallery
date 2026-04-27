import Link from "next/link";

import { getCategoryDisplayName } from "@/components/category-display";
import type { Category } from "@/lib/types";

export function CategoryPills({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <EmptyState message="No category data yet." />;
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="group rounded-full border border-line bg-white px-5 py-3 text-sm text-neutral-600 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-ink"
        >
          <span className="font-medium">{getCategoryDisplayName(category)}</span>
          <span className="ml-2 text-neutral-400">{category.count}</span>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-line bg-white p-8 text-neutral-500">
      {message}
    </div>
  );
}
