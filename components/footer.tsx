import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white/80">
      <div className="container-shell flex flex-col gap-4 py-10 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>
          Prompt cases are curated from{" "}
          <Link
            href="https://github.com/EvoLinkAI/awesome-gpt-image-2-prompts"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink"
          >
            EvoLinkAI/awesome-gpt-image-2-prompts
          </Link>{" "}
          and original public creator posts. All rights belong to their respective creators.
        </p>
        <div className="shrink-0 space-y-1 md:text-right">
          <p>A static-first inspiration gallery.</p>
          <p lang="zh-CN">业务合作或问题反馈，请私信抖音 ID：97107763943</p>
        </div>
      </div>
    </footer>
  );
}
