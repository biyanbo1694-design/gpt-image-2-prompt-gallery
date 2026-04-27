import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
};

export function SectionHeader({ eyebrow, title, description, href, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">{eyebrow}</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-normal text-ink sm:text-5xl">{title}</h2>
        {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">{description}</p> : null}
      </div>
      {href && action ? (
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-neutral-300"
        >
          {action}
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}
