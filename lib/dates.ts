import type { PromptItem } from "@/lib/types";

const promptDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

export function formatPromptDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return promptDateFormatter.format(date);
}

export function getPromptTimelineDate(prompt: Pick<PromptItem, "createdAt" | "syncedAt">) {
  const createdDate = formatPromptDate(prompt.createdAt);
  if (createdDate) {
    return {
      label: "Created",
      value: createdDate
    };
  }

  const syncedDate = formatPromptDate(prompt.syncedAt);
  if (syncedDate) {
    return {
      label: "Added",
      value: syncedDate
    };
  }

  return null;
}
