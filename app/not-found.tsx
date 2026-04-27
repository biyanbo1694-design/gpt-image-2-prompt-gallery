import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">Not Found</p>
      <h1 className="mt-4 text-5xl font-semibold text-ink">Nothing here yet.</h1>
      <p className="mt-4 max-w-xl text-neutral-600">
        This prompt may have moved during the latest upstream sync.
      </p>
      <Link
        href="/prompts"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        Browse Prompts
      </Link>
    </div>
  );
}
