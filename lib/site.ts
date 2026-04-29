export const SITE_URL = "https://gpt-image-2-prompt-gallery.vercel.app";
export const SITE_NAME = "GPT Image 2 Prompt Gallery";
export const SITE_DESCRIPTION =
  "A searchable gallery of GPT Image 2 prompt examples, synced from public creator cases and organized for fast inspiration.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function seoDescription(text: string | undefined, fallback = SITE_DESCRIPTION) {
  const normalized = (text ?? fallback).replace(/\s+/g, " ").trim();

  if (normalized.length <= 155) {
    return normalized;
  }

  return `${normalized.slice(0, 152).trimEnd()}...`;
}
