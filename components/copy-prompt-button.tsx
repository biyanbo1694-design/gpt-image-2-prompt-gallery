"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyPrompt}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      <span className="whitespace-nowrap">{copied ? "Copied" : "Copy Prompt"}</span>
    </button>
  );
}
