export type PromptImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  sourcePath?: string;
  sourceUrl?: string;
};

export type PromptItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  prompt: string;
  excerpt: string;
  lang?: string;
  images: PromptImage[];
  authorName?: string;
  authorUrl?: string;
  sourceUrl?: string;
  caseNumber?: number;
  imageFolder?: string;
  sources?: string[];
  createdAt?: string;
  syncedAt: string;
  metrics?: {
    likes?: number;
    reposts?: number;
    views?: number;
  };
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  count: number;
  coverImage?: string;
};

export type GalleryStats = {
  totalPrompts: number;
  totalCategories: number;
  totalImages: number;
  totalUpstreamImages: number;
  localImageCount: number;
  upstreamFiles: number;
  upstreamBytes: number;
  latestCreatedAt?: string;
  syncedAt: string;
  sourceRepo: string;
  sourceUrl: string;
};

export type UpstreamFileRecord = {
  path: string;
  type: "file";
  size: number;
  sha: string;
  downloadUrl: string;
  htmlUrl: string;
  localPath: string;
  syncedAt: string;
};

export type UpstreamImageRecord = {
  id: string;
  path: string;
  url: string;
  localPath: string;
  thumbnailUrl?: string;
  thumbnailLocalPath?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  upstreamUrl: string;
  htmlUrl: string;
  width?: number;
  height?: number;
  caseSlug: string;
  categorySlug: string;
  source: string;
  title?: string;
  prompt?: string;
  sourceUrl?: string;
};
