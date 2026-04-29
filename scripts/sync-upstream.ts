import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import type {
  Category,
  GalleryStats,
  PromptImage,
  PromptItem,
  UpstreamFileRecord,
  UpstreamImageRecord
} from "../lib/types";

type UpstreamMedia = {
  type?: string;
  url?: string;
  width?: number;
  height?: number;
};

type UpstreamPrompt = {
  id?: string;
  url?: string;
  author?: string;
  createdAt?: string;
  lang?: string;
  text?: string;
  likeCount?: number;
  retweetCount?: number;
  viewCount?: number;
  followers?: number;
  media?: UpstreamMedia[];
};

type IngestedRecord = {
  tweet_url?: string;
  url?: string;
  tweet_id?: string;
  author_handle?: string;
  author?: string;
  title?: string;
  suggested_title?: string;
  category?: string;
  folder_name?: string;
  image_dir?: string;
  image_path?: string;
  case_num?: number;
  added_at?: string;
  prompt?: string;
  text?: string;
};

type ReadmeCase = {
  caseNumber: number;
  title: string;
  prompt?: string;
  sourceUrl?: string;
  authorName?: string;
  authorUrl?: string;
  imagePaths: string[];
  sectionTitle?: string;
  readmeFile: string;
};

type CategoryRule = {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
};

type GitHubTreeResponse = {
  tree: GitHubTreeItem[];
  truncated?: boolean;
};

type GitHubTreeItem = {
  type: "blob" | "tree" | "commit";
  path: string;
  size?: number;
  sha: string;
};

const SOURCE_REPO = "EvoLinkAI/awesome-gpt-image-2-prompts";
const SOURCE_URL = `https://github.com/${SOURCE_REPO}`;
const SOURCE_BRANCH = "main";
const TREE_API_URL = `https://api.github.com/repos/${SOURCE_REPO}/git/trees/${SOURCE_BRANCH}?recursive=1`;
const RAW_BASE = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_BRANCH}`;
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const DOWNLOAD_CONCURRENCY = 6;
const THUMBNAIL_MAX_WIDTH = 720;
const THUMBNAIL_MAX_HEIGHT = 720;
const THUMBNAIL_QUALITY = 78;
const POTENTIAL_SECRET_PATTERN = /(^|[^A-Za-z0-9_-])(sk-[A-Za-z0-9_-]{8,})/g;
const MEDIA_ONLY = process.argv.includes("--media-only");
const LOCAL_UPSTREAM_ONLY = MEDIA_ONLY || process.argv.includes("--local");

const OUT_ROOT = path.join(process.cwd(), "data");
const OUT_DIR = path.join(OUT_ROOT, "generated");
const UPSTREAM_DIR = path.join(OUT_ROOT, "upstream");
const UPSTREAM_TMP_DIR = path.join(OUT_ROOT, ".upstream-tmp");
const PUBLIC_UPSTREAM_IMAGE_DIR = path.join(process.cwd(), "public", "upstream", "images");
const PUBLIC_UPSTREAM_IMAGE_TMP_DIR = path.join(process.cwd(), "public", "upstream", ".images-tmp");
const PUBLIC_UPSTREAM_THUMB_DIR = path.join(process.cwd(), "public", "upstream", "thumbs");
const PUBLIC_UPSTREAM_THUMB_TMP_DIR = path.join(process.cwd(), "public", "upstream", ".thumbs-tmp");

const PRIMARY_DATA_PATH = path.join(UPSTREAM_DIR, "gpt_image2_prompts.json");
const FALLBACK_DATA_PATH = path.join(UPSTREAM_DIR, "data", "ingested_tweets.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const TEXT_EXTENSIONS_TO_SANITIZE = new Set([
  ".json",
  ".jsonl",
  ".md",
  ".txt",
  ".csv",
  ".tsv",
  ".yml",
  ".yaml"
]);
const ALLOWED_EXTERNAL_HOSTS = new Set([
  "github.com",
  "raw.githubusercontent.com",
  "opengraph.githubassets.com",
  "x.com",
  "twitter.com",
  "pbs.twimg.com"
]);

const CATEGORY_RULES: CategoryRule[] = [
  {
    slug: "portraits",
    name: "Portraits",
    description: "Polished portrait prompts, photoshoots, identity-consistent characters and personal images.",
    keywords: ["portrait", "headshot", "photo shoot", "photoshoot", "selfie", "avatar", "girl", "woman", "man", "人像", "写真"]
  },
  {
    slug: "posters",
    name: "Posters",
    description: "Editorial, travel, event, brand and cinematic poster prompt ideas.",
    keywords: ["poster", "flyer", "cover", "magazine", "movie", "cinematic", "travel", "event", "advertising", "海报", "封面", "电影"]
  },
  {
    slug: "characters",
    name: "Characters",
    description: "Character sheets, consistent roles, anime/game characters and stylized IP concepts.",
    keywords: ["character", "anime", "game", "role", "sheet", "mascot", "ip", "comic", "cartoon", "角色", "设定", "立绘"]
  },
  {
    slug: "ui-mockups",
    name: "UI Mockups",
    description: "App screens, dashboards, status pages and product interface mockups.",
    keywords: ["ui", "ux", "app", "dashboard", "interface", "mockup", "screen", "website", "wireframe", "界面", "网页"]
  },
  {
    slug: "comparisons",
    name: "Comparisons",
    description: "Before/after examples, multi-version comparisons and prompt experiments.",
    keywords: ["comparison", "compare", "before", "after", "对比", "比较"]
  },
  {
    slug: "infographics",
    name: "Infographics",
    description: "Dense visual explanations, knowledge cards, diagrams and modular information layouts.",
    keywords: ["infographic", "diagram", "encyclopedia", "chart", "knowledge", "explainer", "信息图", "图解", "知识"]
  },
  {
    slug: "products",
    name: "Products",
    description: "Product photography, packaging, commerce visuals and object-focused prompts.",
    keywords: ["product", "packaging", "ecommerce", "commerce", "bottle", "sneaker", "watch", "产品", "包装", "商品"]
  },
  {
    slug: "spaces",
    name: "Spaces",
    description: "Interior, architecture, landscape and environmental image prompts.",
    keywords: ["interior", "architecture", "room", "space", "landscape", "city", "building", "室内", "建筑", "空间", "景观"]
  },
  {
    slug: "community",
    name: "Community",
    description: "Community discoveries and prompt experiments that do not fit a single narrow format.",
    keywords: []
  }
];

async function main() {
  const syncedAt = new Date().toISOString();
  const upstreamFiles = await syncUpstreamFiles(syncedAt);
  const upstreamImages = await buildUpstreamImageIndex(upstreamFiles);

  if (MEDIA_ONLY) {
    console.log(`Prepared ${upstreamImages.length} local upstream images and thumbnails from committed data.`);
    return;
  }

  const prompts = await buildPromptItems(upstreamImages, syncedAt);
  const categories = buildCategories(prompts);
  const stats = buildStats(prompts, categories, upstreamFiles, upstreamImages, syncedAt);

  await mkdir(OUT_DIR, { recursive: true });
  await writeJson("upstream-files.json", upstreamFiles);
  await writeJson("images.json", upstreamImages);
  await writeJson("prompts.json", prompts);
  await writeJson("categories.json", categories);
  await writeJson("stats.json", stats);

  console.log(
    `Synced ${upstreamFiles.length} upstream files, ${upstreamImages.length} upstream images and ${prompts.length} prompts across ${categories.length} categories.`
  );
}

async function syncUpstreamFiles(syncedAt: string): Promise<UpstreamFileRecord[]> {
  if (LOCAL_UPSTREAM_ONLY) {
    const existing = await buildManifestFromLocalFiles(syncedAt);

    if (existing.length === 0) {
      throw new Error("No local upstream files found in data/upstream.");
    }

    return existing;
  }

  try {
    const items = await listRepositoryFiles();
    const downloadableFiles = items.filter((item) => item.size !== undefined && item.size <= MAX_DOWNLOAD_BYTES);
    const skippedFiles = items.length - downloadableFiles.length;

    await safeRm(UPSTREAM_TMP_DIR);
    await mkdir(UPSTREAM_TMP_DIR, { recursive: true });

    await mapLimit(downloadableFiles, DOWNLOAD_CONCURRENCY, async (item) => {
      await downloadFile(rawUrlForPath(item.path), path.join(UPSTREAM_TMP_DIR, ...item.path.split("/")));
    });

    await safeRm(UPSTREAM_DIR);
    await rename(UPSTREAM_TMP_DIR, UPSTREAM_DIR);

    if (skippedFiles > 0) {
      console.warn(`Skipped ${skippedFiles} files without size metadata or larger than ${MAX_DOWNLOAD_BYTES} bytes.`);
    }

    return downloadableFiles
      .map((item) => fileRecordFromTreeItem(item, syncedAt))
      .sort((a, b) => a.path.localeCompare(b.path));
  } catch (error) {
    await safeRm(UPSTREAM_TMP_DIR);
    const detail = error instanceof Error ? error.message : String(error);

    if (requiresFreshUpstreamSync()) {
      throw new Error(`Unable to complete a fresh upstream sync in CI: ${detail}`);
    }

    const existing = await buildManifestFromLocalFiles(syncedAt);

    if (existing.length > 0) {
      console.warn(
        `Unable to complete a fresh upstream sync, using existing data/upstream files. ${detail}`
      );
      return existing;
    }

    throw error;
  }
}

function requiresFreshUpstreamSync() {
  return process.env.CI === "true" && process.env.ALLOW_STALE_UPSTREAM_FALLBACK !== "1";
}

function fileRecordFromTreeItem(item: GitHubTreeItem, syncedAt: string): UpstreamFileRecord {
  return {
    path: item.path,
    type: "file",
    size: item.size ?? 0,
    sha: item.sha,
    downloadUrl: rawUrlForPath(item.path),
    htmlUrl: htmlUrlForPath(item.path),
    localPath: normalizePath(path.join("data", "upstream", item.path)),
    syncedAt
  };
}

async function listRepositoryFiles(): Promise<GitHubTreeItem[]> {
  const response = await fetchJson<GitHubTreeResponse>(TREE_API_URL);
  if (response.truncated) {
    throw new Error("GitHub tree response was truncated; refusing to create a partial upstream mirror.");
  }

  return response.tree.filter((item) => item.type === "blob" && item.path);
}

async function buildManifestFromLocalFiles(syncedAt: string): Promise<UpstreamFileRecord[]> {
  const paths = await listLocalFiles(UPSTREAM_DIR);

  return Promise.all(
    paths.map(async (absolutePath) => {
      const relativePath = normalizePath(path.relative(UPSTREAM_DIR, absolutePath));
      const fileStat = await stat(absolutePath);
      const contents = await readFile(absolutePath);

      return {
        path: relativePath,
        type: "file" as const,
        size: fileStat.size,
        sha: gitBlobSha(contents),
        downloadUrl: rawUrlForPath(relativePath),
        htmlUrl: htmlUrlForPath(relativePath),
        localPath: normalizePath(path.join("data", "upstream", relativePath)),
        syncedAt
      };
    })
  ).then((records) => records.sort((a, b) => a.path.localeCompare(b.path)));
}

async function buildUpstreamImageIndex(upstreamFiles: UpstreamFileRecord[]): Promise<UpstreamImageRecord[]> {
  const imageFiles = upstreamFiles.filter((file) => isUpstreamImagePath(file.path));

  await safeRm(PUBLIC_UPSTREAM_IMAGE_TMP_DIR);
  await safeRm(PUBLIC_UPSTREAM_THUMB_TMP_DIR);
  await mkdir(PUBLIC_UPSTREAM_IMAGE_TMP_DIR, { recursive: true });
  await mkdir(PUBLIC_UPSTREAM_THUMB_TMP_DIR, { recursive: true });

  try {
    const records = await Promise.all(
      imageFiles.map(async (file) => {
        const relativeImagePath = normalizePath(file.path.replace(/^images\//, ""));
        const upstreamAbsolutePath = path.join(process.cwd(), ...file.localPath.split("/"));
        const publicLocalPath = normalizePath(path.join("public", "upstream", "images", relativeImagePath));
        const publicTmpPath = path.join(PUBLIC_UPSTREAM_IMAGE_TMP_DIR, ...relativeImagePath.split("/"));
        const relativeThumbnailPath = thumbnailPathForImage(relativeImagePath);
        const publicThumbnailLocalPath = normalizePath(path.join("public", "upstream", "thumbs", relativeThumbnailPath));
        const publicThumbnailTmpPath = path.join(PUBLIC_UPSTREAM_THUMB_TMP_DIR, ...relativeThumbnailPath.split("/"));

        await mkdir(path.dirname(publicTmpPath), { recursive: true });
        await copyFile(upstreamAbsolutePath, publicTmpPath);

        const dimensions = await readImageDimensions(upstreamAbsolutePath);
        const thumbnail = await createThumbnail(upstreamAbsolutePath, publicThumbnailTmpPath);
        const caseSlug = caseSlugFromImagePath(file.path);

        return {
          id: uniqueImageId(file.path),
          path: file.path,
          url: `/upstream/images/${encodePath(relativeImagePath)}`,
          localPath: publicLocalPath,
          thumbnailUrl: thumbnail ? `/upstream/thumbs/${encodePath(relativeThumbnailPath)}` : undefined,
          thumbnailLocalPath: thumbnail ? publicThumbnailLocalPath : undefined,
          thumbnailWidth: thumbnail?.width,
          thumbnailHeight: thumbnail?.height,
          upstreamUrl: file.downloadUrl,
          htmlUrl: file.htmlUrl,
          width: dimensions?.width,
          height: dimensions?.height,
          caseSlug,
          categorySlug: categorySlugFromCaseSlug(caseSlug),
          source: SOURCE_REPO,
          sourceUrl: file.htmlUrl
        };
      })
    );

    await safeRm(PUBLIC_UPSTREAM_IMAGE_DIR);
    await safeRm(PUBLIC_UPSTREAM_THUMB_DIR);
    await mkdir(path.dirname(PUBLIC_UPSTREAM_IMAGE_DIR), { recursive: true });
    await mkdir(path.dirname(PUBLIC_UPSTREAM_THUMB_DIR), { recursive: true });
    await rename(PUBLIC_UPSTREAM_IMAGE_TMP_DIR, PUBLIC_UPSTREAM_IMAGE_DIR);
    await rename(PUBLIC_UPSTREAM_THUMB_TMP_DIR, PUBLIC_UPSTREAM_THUMB_DIR);

    return records.sort((a, b) => a.path.localeCompare(b.path));
  } catch (error) {
    await safeRm(PUBLIC_UPSTREAM_IMAGE_TMP_DIR);
    await safeRm(PUBLIC_UPSTREAM_THUMB_TMP_DIR);
    throw error;
  }
}

async function buildPromptItems(upstreamImages: UpstreamImageRecord[], syncedAt: string): Promise<PromptItem[]> {
  const readmeCases = await loadReadmeCases();
  const rawPrompts = await loadRawPrompts();
  const ingestedRecords = await loadIngestedRecords();
  const imageLookup = buildImageLookup(upstreamImages);
  const rawByUrl = keyedMap(rawPrompts, (item) => normalizeSourceKey(item.url));
  const rawById = keyedMap(rawPrompts, (item) => item.id);
  const ingestedByUrl = keyedMap(ingestedRecords, (item) => normalizeSourceKey(item.tweet_url ?? item.url));
  const ingestedByFolder = keyedMap(ingestedRecords, (item) => folderFromIngestedRecord(item));
  const seenSourceKeys = new Set<string>();
  const seenFolders = new Set<string>();
  const seenSlugs = new Set<string>();
  const prompts: PromptItem[] = [];

  for (const readmeCase of readmeCases) {
    const folders = unique(compact(readmeCase.imagePaths.map(folderFromImagePath)));
    const imageFolders = ownedFoldersForReadmeCase(folders, readmeCase, ingestedByFolder);
    const sourceKey = normalizeSourceKey(readmeCase.sourceUrl);
    const raw = rawByUrl.get(sourceKey) ?? rawById.get(tweetIdFromUrl(readmeCase.sourceUrl));
    const ingested = ingestedByUrl.get(sourceKey) ?? imageFolders.map((folder) => ingestedByFolder.get(folder)).find(Boolean);
    const images = imagesForFolders(imageFolders, imageLookup, readmeCase.title);

    if (sourceKey) {
      seenSourceKeys.add(sourceKey);
    }
    imageFolders.forEach((folder) => seenFolders.add(folder));

    prompts.push(
      createPromptItem({
        id: tweetIdFromUrl(readmeCase.sourceUrl) || readmeCase.imagePaths[0] || `readme-case-${readmeCase.caseNumber}`,
        title: readmeCase.title,
        categorySlug: categorySlugForCase(readmeCase, imageFolders[0], ingested),
        prompt: readmeCase.prompt || raw?.text || ingested?.prompt || ingested?.text || missingPromptCopy(),
        images: images.length > 0 ? images : remoteImages(raw, readmeCase.title),
        authorName: readmeCase.authorName ?? raw?.author ?? ingested?.author_handle ?? ingested?.author,
        authorUrl: readmeCase.authorUrl ?? authorUrl(raw?.author ?? ingested?.author_handle ?? ingested?.author),
        sourceUrl: readmeCase.sourceUrl ?? raw?.url ?? ingested?.tweet_url ?? ingested?.url,
        caseNumber: readmeCase.caseNumber,
        imageFolder: imageFolders[0],
        createdAt: normalizeDate(raw?.createdAt ?? ingested?.added_at),
        syncedAt,
        sources: compact([readmeCase.readmeFile, raw ? "gpt_image2_prompts.json" : undefined, ingested ? "data/ingested_tweets.json" : undefined]),
        metrics: {
          likes: raw?.likeCount,
          reposts: raw?.retweetCount,
          views: raw?.viewCount
        },
        seenSlugs
      })
    );
  }

  for (const raw of rawPrompts) {
    const sourceKey = normalizeSourceKey(raw.url);
    if (sourceKey && seenSourceKeys.has(sourceKey)) {
      continue;
    }

    if (sourceKey) {
      seenSourceKeys.add(sourceKey);
    }

    const title = createTitle(raw.text ?? "", raw.author);
    prompts.push(
      createPromptItem({
        id: raw.id || raw.url || title,
        title,
        categorySlug: categorizeRawPrompt(raw).slug,
        prompt: raw.text?.trim() || missingPromptCopy(),
        images: remoteImages(raw, title),
        authorName: raw.author,
        authorUrl: authorUrl(raw.author),
        sourceUrl: raw.url,
        createdAt: normalizeDate(raw.createdAt),
        syncedAt,
        sources: ["gpt_image2_prompts.json"],
        metrics: {
          likes: raw.likeCount,
          reposts: raw.retweetCount,
          views: raw.viewCount
        },
        seenSlugs
      })
    );
  }

  for (const ingested of ingestedRecords) {
    const sourceKey = normalizeSourceKey(ingested.tweet_url ?? ingested.url);
    const folder = folderFromIngestedRecord(ingested);

    if ((sourceKey && seenSourceKeys.has(sourceKey)) || (folder && seenFolders.has(folder))) {
      continue;
    }

    const title = ingested.suggested_title || ingested.title || humanizeFolder(folder) || "Untitled prompt case";
    const images = folder ? imagesForFolders([folder], imageLookup, title) : imagesForPaths(compact([ingested.image_path]), imageLookup, title);

    if (sourceKey) {
      seenSourceKeys.add(sourceKey);
    }
    if (folder) {
      seenFolders.add(folder);
    }

    prompts.push(
      createPromptItem({
        id: ingested.tweet_id || sourceKey || folder || title,
        title,
        categorySlug: categorySlugFromIngested(ingested, folder),
        prompt: ingested.prompt || ingested.text || ingested.title || missingPromptCopy(),
        images,
        authorName: ingested.author_handle ?? ingested.author,
        authorUrl: authorUrl(ingested.author_handle ?? ingested.author),
        sourceUrl: ingested.tweet_url ?? ingested.url,
        caseNumber: ingested.case_num,
        imageFolder: folder,
        createdAt: normalizeDate(ingested.added_at),
        syncedAt,
        sources: ["data/ingested_tweets.json"],
        seenSlugs
      })
    );
  }

  for (const [folder, images] of imageLookup.imagesByFolder) {
    if (!folder || seenFolders.has(folder) || !isCaseFolder(folder)) {
      continue;
    }

    seenFolders.add(folder);
    const title = humanizeFolder(folder) || "Image case";

    prompts.push(
      createPromptItem({
        id: folder,
        title,
        categorySlug: categorySlugFromCaseSlug(folder),
        prompt: missingPromptCopy(),
        images: images.map((image, index) => promptImageFromRecord(image, title, index)),
        imageFolder: folder,
        syncedAt,
        sources: ["images/"],
        seenSlugs
      })
    );
  }

  return prompts
    .filter((prompt) => prompt.images.length > 0 || prompt.prompt.trim().length > 0)
    .sort((a, b) => {
      const imageDelta = b.images.length - a.images.length;
      if (imageDelta !== 0) {
        return imageDelta;
      }

      return a.title.localeCompare(b.title);
    });
}

function createPromptItem(input: {
  id: string;
  title: string;
  categorySlug: string;
  prompt: string;
  images: PromptImage[];
  authorName?: string;
  authorUrl?: string;
  sourceUrl?: string;
  caseNumber?: number;
  imageFolder?: string;
  createdAt?: string;
  syncedAt: string;
  sources?: string[];
  metrics?: PromptItem["metrics"];
  seenSlugs: Set<string>;
}): PromptItem {
  const category = ruleBySlug(input.categorySlug);
  const title = truncate(cleanTitle(input.title), 96) || "Untitled prompt case";
  const prompt = input.prompt.trim();

  return {
    id: stableId(input.id),
    slug: uniqueSlug(`${title}-${input.id}`, input.seenSlugs),
    title,
    category: category.name,
    categorySlug: category.slug,
    prompt,
    excerpt: createExcerpt(prompt),
    images: input.images.map(safePromptImage).filter(Boolean) as PromptImage[],
    authorName: cleanAuthor(input.authorName),
    authorUrl: safeExternalUrl(input.authorUrl),
    sourceUrl: safeExternalUrl(input.sourceUrl),
    caseNumber: input.caseNumber,
    imageFolder: input.imageFolder,
    sources: unique(input.sources ?? []),
    createdAt: input.createdAt,
    syncedAt: input.syncedAt,
    metrics: input.metrics
  };
}

async function loadReadmeCases(): Promise<ReadmeCase[]> {
  const files = await listLocalFiles(UPSTREAM_DIR);
  const readmeFiles = files
    .map((file) => normalizePath(path.relative(UPSTREAM_DIR, file)))
    .filter((file) => /^README(?:_[A-Za-z-]+)?\.md$/.test(file))
    .sort((a, b) => readmePriority(a) - readmePriority(b) || a.localeCompare(b));
  const merged = new Map<string, ReadmeCase>();

  for (const file of readmeFiles) {
    const markdown = await readFile(path.join(UPSTREAM_DIR, file), "utf8");
    for (const readmeCase of extractReadmeCases(markdown, file)) {
      const folders = compact(readmeCase.imagePaths.map(folderFromImagePath));
      const key = normalizeSourceKey(readmeCase.sourceUrl) || folders[0] || `${file}-${readmeCase.caseNumber}-${readmeCase.title}`;
      const existing = merged.get(key);

      if (!existing) {
        merged.set(key, readmeCase);
        continue;
      }

      existing.imagePaths = unique([...existing.imagePaths, ...readmeCase.imagePaths]);
      existing.prompt = existing.prompt || readmeCase.prompt;
      existing.title = existing.title || readmeCase.title;
      existing.authorName = existing.authorName || readmeCase.authorName;
      existing.authorUrl = existing.authorUrl || readmeCase.authorUrl;
    }
  }

  return [...merged.values()];
}

function readmePriority(file: string) {
  if (file === "README.md") {
    return 0;
  }
  if (file === "README_zh-CN.md") {
    return 1;
  }
  return 2;
}

function extractReadmeCases(markdown: string, readmeFile: string): ReadmeCase[] {
  const headingPattern = /^###\s+Case\s+(\d+):\s+(.+)$/gm;
  const headings = [...markdown.matchAll(headingPattern)];
  const sections = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  return headings.map((heading, index) => {
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? markdown.length;
    const block = markdown.slice(start, end);
    const parsedHeading = parseCaseHeading(heading[2]);

    return {
      caseNumber: Number(heading[1]),
      title: parsedHeading.title || `Case ${heading[1]}`,
      prompt: extractPromptFromCaseBlock(block),
      sourceUrl: parsedHeading.sourceUrl,
      authorName: parsedHeading.authorName,
      authorUrl: parsedHeading.authorUrl,
      imagePaths: extractImagePathsFromCaseBlock(block),
      sectionTitle: sectionBefore(sections, start),
      readmeFile
    };
  });
}

function parseCaseHeading(value: string) {
  const sourceLink = value.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  const authorLink = value.match(/\(by\s+\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)\)/i);
  const authorPlain = value.match(/\(by\s+@?([^)]+)\)/i);
  const rawTitle = sourceLink?.[1] ?? value.replace(/\(by\s+.+?\)\s*$/i, "");

  return {
    title: stripMarkdown(rawTitle).trim(),
    sourceUrl: sourceLink?.[2],
    authorName: cleanAuthor(authorLink?.[1] ?? authorPlain?.[1]),
    authorUrl: authorLink?.[2]
  };
}

function sectionBefore(sections: RegExpMatchArray[], index: number) {
  return sections
    .filter((section) => (section.index ?? 0) < index)
    .map((section) => stripMarkdown(section[1]).trim())
    .at(-1);
}

function extractPromptFromCaseBlock(block: string) {
  const promptMatch = block.match(/\*\*(?:Prompt|提示词):\*\*\s*```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/i);
  return promptMatch?.[1]?.trim();
}

function extractImagePathsFromCaseBlock(block: string) {
  const paths: string[] = [];
  const htmlPattern = /<img\b[^>]*\bsrc=["']\.?\/?(images\/[^"']+\.(?:jpe?g|png|webp|gif|svg))["'][^>]*>/gi;
  const markdownPattern = /!\[[^\]]*]\(\.?\/?(images\/[^)]+\.(?:jpe?g|png|webp|gif|svg))\)/gi;

  for (const match of block.matchAll(htmlPattern)) {
    if (match[1] && isUpstreamImagePath(match[1])) {
      paths.push(match[1]);
    }
  }

  for (const match of block.matchAll(markdownPattern)) {
    if (match[1] && isUpstreamImagePath(match[1])) {
      paths.push(match[1]);
    }
  }

  return unique(paths);
}

async function loadRawPrompts(): Promise<UpstreamPrompt[]> {
  try {
    const data = JSON.parse(await readFile(PRIMARY_DATA_PATH, "utf8")) as unknown;
    return Array.isArray(data) ? (data as UpstreamPrompt[]) : [];
  } catch {
    return [];
  }
}

async function loadIngestedRecords(): Promise<IngestedRecord[]> {
  try {
    const data = JSON.parse(await readFile(FALLBACK_DATA_PATH, "utf8")) as unknown;
    if (Array.isArray(data)) {
      return data as IngestedRecord[];
    }
    if (data && typeof data === "object" && Array.isArray((data as { records?: unknown }).records)) {
      return (data as { records: IngestedRecord[] }).records;
    }
    return [];
  } catch {
    return [];
  }
}

function buildImageLookup(images: UpstreamImageRecord[]) {
  const imageByPath = new Map(images.map((image) => [image.path, image]));
  const imagesByFolder = new Map<string, UpstreamImageRecord[]>();

  for (const image of images) {
    const folder = folderFromImagePath(image.path);
    if (!folder) {
      continue;
    }

    const group = imagesByFolder.get(folder) ?? [];
    group.push(image);
    imagesByFolder.set(folder, group);
  }

  for (const group of imagesByFolder.values()) {
    group.sort((a, b) => naturalImageSort(a.path, b.path));
  }

  return {
    imageByPath,
    imagesByFolder
  };
}

function ownedFoldersForReadmeCase(
  folders: string[],
  readmeCase: ReadmeCase,
  ingestedByFolder: Map<string, IngestedRecord>
) {
  const readmeSourceKey = normalizeSourceKey(readmeCase.sourceUrl);

  return folders.filter((folder) => {
    const owner = ingestedByFolder.get(folder);
    const ownerSourceKey = normalizeSourceKey(owner?.tweet_url ?? owner?.url);

    return !ownerSourceKey || !readmeSourceKey || ownerSourceKey === readmeSourceKey;
  });
}

function imagesForFolders(
  folders: string[],
  lookup: ReturnType<typeof buildImageLookup>,
  title: string
): PromptImage[] {
  return unique(folders)
    .flatMap((folder) => lookup.imagesByFolder.get(folder) ?? [])
    .map((image, index) => promptImageFromRecord(image, title, index));
}

function imagesForPaths(paths: string[], lookup: ReturnType<typeof buildImageLookup>, title: string): PromptImage[] {
  return paths
    .map((value) => normalizeImagePath(value))
    .map((value) => lookup.imageByPath.get(value))
    .filter(Boolean)
    .map((image, index) => promptImageFromRecord(image as UpstreamImageRecord, title, index));
}

function promptImageFromRecord(image: UpstreamImageRecord, title: string, index: number): PromptImage {
  return {
    url: image.url,
    alt: `${title} 示例图 ${index + 1}`,
    width: image.width,
    height: image.height,
    thumbnailUrl: image.thumbnailUrl,
    thumbnailWidth: image.thumbnailWidth,
    thumbnailHeight: image.thumbnailHeight,
    sourcePath: image.path,
    sourceUrl: safeExternalUrl(image.htmlUrl)
  };
}

function remoteImages(raw: UpstreamPrompt | undefined, title: string): PromptImage[] {
  return (raw?.media ?? [])
    .filter((media) => media.type === "photo" && media.url)
    .map((media, index) =>
      safePromptImage({
      url: media.url as string,
      alt: `${title} 示例图 ${index + 1}`,
      width: media.width,
      height: media.height,
      sourceUrl: raw?.url
    })
    )
    .filter(Boolean) as PromptImage[];
}

function safePromptImage(image: PromptImage): PromptImage | undefined {
  const url = safeImageUrl(image.url);
  const thumbnailUrl = safeImageUrl(image.thumbnailUrl);

  if (!url) {
    return undefined;
  }

  return {
    ...image,
    url,
    thumbnailUrl,
    sourceUrl: safeExternalUrl(image.sourceUrl)
  };
}

function safeImageUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  if ((value.startsWith("/upstream/images/") || value.startsWith("/upstream/thumbs/")) && !value.includes("..") && !value.includes("\\")) {
    return value;
  }

  const url = safeExternalUrl(value);
  if (!url) {
    return undefined;
  }

  const hostname = new URL(url).hostname.toLowerCase();
  return ["pbs.twimg.com", "raw.githubusercontent.com", "github.com", "opengraph.githubassets.com"].includes(hostname)
    ? url
    : undefined;
}

function safeExternalUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "https:" || !ALLOWED_EXTERNAL_HOSTS.has(hostname)) {
      return undefined;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

function categorySlugForCase(readmeCase: ReadmeCase, folder?: string, ingested?: IngestedRecord) {
  if (folder) {
    return categorySlugFromCaseSlug(folder);
  }

  return categorySlugFromIngested(ingested, undefined) || categorySlugFromText(`${readmeCase.sectionTitle ?? ""} ${readmeCase.title}`);
}

function categorySlugFromIngested(record?: IngestedRecord, folder?: string) {
  if (folder) {
    return categorySlugFromCaseSlug(folder);
  }

  return categorySlugFromText(record?.category ?? "");
}

function categorySlugFromText(value: string) {
  const normalized = value.toLowerCase();
  const directMatches: Record<string, string> = {
    portrait: "portraits",
    portraits: "portraits",
    poster: "posters",
    posters: "posters",
    character: "characters",
    characters: "characters",
    ui: "ui-mockups",
    mockup: "ui-mockups",
    comparison: "comparisons",
    comparisons: "comparisons",
    product: "products",
    products: "products",
    space: "spaces",
    spaces: "spaces"
  };

  for (const [needle, slug] of Object.entries(directMatches)) {
    if (normalized.includes(needle)) {
      return slug;
    }
  }

  return "community";
}

function categorizeRawPrompt(item: UpstreamPrompt): CategoryRule {
  const text = `${item.text ?? ""} ${item.url ?? ""}`.toLowerCase();
  const matched = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  );

  if (matched) {
    return matched;
  }

  const firstImage = item.media?.find((media) => media.width && media.height);
  if (firstImage?.width && firstImage.height && firstImage.width / firstImage.height > 1.45) {
    return ruleBySlug("ui-mockups");
  }

  return ruleBySlug("community");
}

function buildCategories(prompts: PromptItem[]): Category[] {
  return CATEGORY_RULES.map((rule) => {
    const categoryPrompts = prompts.filter((prompt) => prompt.categorySlug === rule.slug);
    const coverImage = categoryPrompts.find((prompt) => prompt.images[0])?.images[0];
    return {
      slug: rule.slug,
      name: rule.name,
      description: rule.description,
      count: categoryPrompts.length,
      coverImage: coverImage?.thumbnailUrl ?? coverImage?.url
    };
  }).filter((category) => category.count > 0);
}

function buildStats(
  prompts: PromptItem[],
  categories: Category[],
  upstreamFiles: UpstreamFileRecord[],
  upstreamImages: UpstreamImageRecord[],
  syncedAt: string
): GalleryStats {
  const latestCreatedAt = prompts
    .map((prompt) => prompt.createdAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return {
    totalPrompts: prompts.length,
    totalCategories: categories.length,
    totalImages: prompts.reduce((total, prompt) => total + prompt.images.length, 0),
    totalUpstreamImages: upstreamImages.length,
    localImageCount: upstreamImages.filter((image) => image.localPath).length,
    upstreamFiles: upstreamFiles.length,
    upstreamBytes: upstreamFiles.reduce((total, file) => total + file.size, 0),
    latestCreatedAt,
    syncedAt,
    sourceRepo: SOURCE_REPO,
    sourceUrl: SOURCE_URL
  };
}

async function listLocalFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        const absolutePath = path.join(directory, entry.name);
        return entry.isDirectory() ? listLocalFiles(absolutePath) : [absolutePath];
      })
    );

    return nested.flat();
  } catch {
    return [];
  }
}

async function downloadFile(url: string, targetPath: string) {
  const response = await fetch(url, {
    headers: githubHeaders()
  });

  if (!response.ok) {
    throw new Error(`Unable to download ${url}: ${response.status} ${response.statusText}`);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());

  if (shouldSanitizeFile(targetPath)) {
    await writeFile(targetPath, sanitizePotentialSecrets(buffer.toString("utf8")), "utf8");
    return;
  }

  await writeFile(targetPath, buffer);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders()
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "gpt-image-2-prompt-gallery",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function mapLimit<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });

  await Promise.all(runners);
}

async function safeRm(targetPath: string) {
  await rm(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 200
  });
}

function isUpstreamImagePath(value: string) {
  return value.startsWith("images/") && IMAGE_EXTENSIONS.has(path.extname(value).toLowerCase());
}

function shouldSanitizeFile(filePath: string) {
  return TEXT_EXTENSIONS_TO_SANITIZE.has(path.extname(filePath).toLowerCase());
}

function sanitizePotentialSecrets(value: string) {
  return value.replace(POTENTIAL_SECRET_PATTERN, "$1[redacted-sk-token]");
}

function normalizeImagePath(value: string) {
  return value.replace(/^\.?\//, "");
}

function folderFromImagePath(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeImagePath(value);
  if (!normalized.startsWith("images/")) {
    return undefined;
  }

  return normalized.split("/")[1];
}

function folderFromIngestedRecord(record: IngestedRecord) {
  if (record.folder_name) {
    return record.folder_name;
  }

  if (record.image_dir) {
    return record.image_dir.split("/").filter(Boolean).at(-1);
  }

  return folderFromImagePath(record.image_path);
}

function isCaseFolder(value: string) {
  return /_case\d+$/i.test(value) || /^case_case\d+$/i.test(value);
}

function caseSlugFromImagePath(value: string) {
  return value.split("/")[1] ?? "unknown";
}

function categorySlugFromCaseSlug(caseSlug: string) {
  const prefix = caseSlug.split("_")[0];
  const map: Record<string, string> = {
    portrait: "portraits",
    poster: "posters",
    character: "characters",
    ui: "ui-mockups",
    comparison: "comparisons",
    product: "products",
    space: "spaces",
    case: "community"
  };

  return map[prefix] ?? "community";
}

function ruleBySlug(slug: string) {
  return CATEGORY_RULES.find((rule) => rule.slug === slug) ?? CATEGORY_RULES[CATEGORY_RULES.length - 1];
}

function authorUrl(author?: string) {
  const cleaned = cleanAuthor(author);
  return cleaned ? `https://x.com/${cleaned}` : undefined;
}

function cleanAuthor(value?: string) {
  return value?.replace(/^@/, "").trim() || undefined;
}

function cleanTitle(value: string) {
  return stripMarkdown(value).replace(/\s+/g, " ").trim();
}

function stripMarkdown(value: string) {
  return value.replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[*_`]/g, "");
}

function createTitle(text: string, author?: string) {
  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return author ? `${author}'s Prompt` : "Untitled Prompt";
  }

  const cleaned = firstLine
    .replace(/^(please\s+)?(create|generate|make)\s+/i, "")
    .replace(/[.!?;:,\s]+$/g, "")
    .trim();

  return truncate(cleaned || firstLine, 72);
}

function createExcerpt(text: string) {
  return truncate(text.replace(/\s+/g, " ").trim(), 150);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function normalizeDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeSourceKey(value?: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "").toLowerCase()}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return value.trim().toLowerCase();
  }
}

function tweetIdFromUrl(value?: string) {
  return value?.match(/status\/(\d+)/)?.[1] ?? "";
}

function stableId(value: string) {
  const input = String(value || "prompt");
  return /^[a-zA-Z0-9_-]+$/.test(input) && input.length <= 80 ? input : gitBlobSha(Buffer.from(input)).slice(0, 16);
}

function uniqueSlug(input: string, seen: Set<string>) {
  const base = slugify(input) || "prompt";
  let slug = base;
  let suffix = 2;

  while (seen.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  seen.add(slug);
  return slug;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function humanizeFolder(value?: string) {
  if (!value) {
    return undefined;
  }

  const caseNumber = value.match(/case(\d+)/i)?.[1];
  const prefix = value.split("_")[0];
  const label = ruleBySlug(categorySlugFromCaseSlug(value)).name;
  return caseNumber ? `${label} Case ${caseNumber}` : `${prefix} case`;
}

function unique<T>(values: T[]) {
  return [...new Set(values.filter(Boolean))] as T[];
}

function compact<T>(values: (T | undefined | null | "")[]) {
  return values.filter(Boolean) as T[];
}

function keyedMap<T>(items: T[], keyForItem: (item: T) => string | undefined) {
  const entries = items
    .map((item) => [keyForItem(item), item] as const)
    .filter((entry): entry is readonly [string, T] => Boolean(entry[0]));

  return new Map(entries);
}

function missingPromptCopy() {
  return "The upstream repository currently exposes images for this case, but no standalone prompt text.";
}

function naturalImageSort(a: string, b: string) {
  const aOutput = imageOutputIndex(a);
  const bOutput = imageOutputIndex(b);
  if (aOutput !== bOutput) {
    return aOutput - bOutput;
  }

  return a.localeCompare(b);
}

function imageOutputIndex(value: string) {
  const match = path.basename(value).match(/^output(\d*)\./i);
  if (!match) {
    return 999;
  }

  return match[1] ? Number(match[1]) + 1 : 0;
}

function uniqueImageId(value: string) {
  return slugify(value.replace(/^images\//, "").replace(/\.[^.]+$/, "")) || gitBlobSha(Buffer.from(value)).slice(0, 16);
}

function thumbnailPathForImage(value: string) {
  const extension = path.extname(value);
  const withoutExtension = extension ? value.slice(0, -extension.length) : value;
  return `${withoutExtension}.webp`;
}

async function createThumbnail(sourcePath: string, targetPath: string): Promise<{ width: number; height: number } | undefined> {
  try {
    await mkdir(path.dirname(targetPath), { recursive: true });
    const info = await sharp(sourcePath, { animated: false })
      .rotate()
      .resize({
        width: THUMBNAIL_MAX_WIDTH,
        height: THUMBNAIL_MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(targetPath);

    return {
      width: info.width,
      height: info.height
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(`Unable to create thumbnail for ${sourcePath}: ${detail}`);
    return undefined;
  }
}

function rawUrlForPath(value: string) {
  return `${RAW_BASE}/${encodePath(value)}`;
}

function htmlUrlForPath(value: string) {
  return `${SOURCE_URL}/blob/${SOURCE_BRANCH}/${encodePath(value)}`;
}

function encodePath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function normalizePath(value: string) {
  return value.split(path.sep).join("/");
}

function gitBlobSha(contents: Buffer) {
  return createHash("sha1")
    .update(`blob ${contents.length}\0`)
    .update(contents)
    .digest("hex");
}

async function readImageDimensions(filePath: string): Promise<{ width: number; height: number } | undefined> {
  try {
    const buffer = await readFile(filePath);
    return parseImageDimensions(buffer);
  } catch {
    return undefined;
  }
}

function parseImageDimensions(buffer: Buffer): { width: number; height: number } | undefined {
  return parsePngDimensions(buffer) ?? parseJpegDimensions(buffer) ?? parseGifDimensions(buffer) ?? parseWebpDimensions(buffer);
}

function parsePngDimensions(buffer: Buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function parseJpegDimensions(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) {
      return undefined;
    }

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5)
      };
    }

    offset += 2 + length;
  }

  return undefined;
}

function parseGifDimensions(buffer: Buffer) {
  const signature = buffer.toString("ascii", 0, 6);
  if (buffer.length < 10 || (signature !== "GIF87a" && signature !== "GIF89a")) {
    return undefined;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8)
  };
}

function parseWebpDimensions(buffer: Buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return undefined;
  }

  const format = buffer.toString("ascii", 12, 16);
  if (format === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }

  if (format === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }

  if (format === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }

  return undefined;
}

async function writeJson(name: string, data: unknown) {
  await writeFile(path.join(OUT_DIR, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
