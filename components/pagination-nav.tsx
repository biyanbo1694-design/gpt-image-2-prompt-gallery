import Link from "next/link";

export function PaginationNav({
  currentPage,
  pageCount,
  basePath
}: {
  currentPage: number;
  pageCount: number;
  basePath: string;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pageHref = (page: number) => (page <= 1 ? basePath : `${basePath}/page/${page}`);
  const visiblePages = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])).filter(
    (page) => page >= 1 && page <= pageCount
  );

  return (
    <nav className="mt-10 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-500">
        Page <span className="font-medium text-ink">{currentPage}</span> of{" "}
        <span className="font-medium text-ink">{pageCount}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? <PageLink href={pageHref(currentPage - 1)} label="Previous" /> : null}
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const hasGap = previousPage && page - previousPage > 1;

          return (
            <span key={page} className="inline-flex items-center gap-2">
              {hasGap ? <span className="px-1 text-sm text-neutral-400">...</span> : null}
              <PageLink href={pageHref(page)} label={String(page)} active={page === currentPage} />
            </span>
          );
        })}
        {currentPage < pageCount ? <PageLink href={pageHref(currentPage + 1)} label="Next" /> : null}
      </div>
    </nav>
  );
}

function PageLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-w-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-neutral-600 hover:border-neutral-300 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
