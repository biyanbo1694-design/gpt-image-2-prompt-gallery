import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

const navItems = [
  { href: "/prompts", label: "Prompts" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/about#contact", label: "Contact" }
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-white/72 backdrop-blur-2xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="grid size-8 place-items-center rounded-full bg-ink text-white">
            <Sparkles size={16} />
          </span>
          Prompt Gallery
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-line bg-white/72 p-1 text-sm text-neutral-600 shadow-sm sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:bg-neutral-100 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/search"
          aria-label="Search prompts"
          className="grid size-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-neutral-300"
        >
          <Search size={18} />
        </Link>
      </div>
    </header>
  );
}
