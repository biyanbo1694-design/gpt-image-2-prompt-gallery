# GPT Image 2 Prompt Gallery

A minimal, Apple-like prompt gallery built on top of the public
`EvoLinkAI/awesome-gpt-image-2-prompts` repository.

## Commands

```bash
npm install
npm run sync:upstream
npm run dev
npm run build
```

## Data Flow

```text
EvoLinkAI/awesome-gpt-image-2-prompts
  -> GitHub contents API
  -> scripts/sync-upstream.ts
  -> data/upstream/<original path>
  -> data/generated/upstream-files.json
  -> data/generated/{prompts,categories,stats}.json
  -> Next.js pages
```

`npm run sync:upstream` recursively reads file metadata from the upstream
GitHub repository, downloads every reasonably sized file that exposes a
`download_url`, and preserves the upstream directory structure under
`data/upstream/`. The generated manifest at
`data/generated/upstream-files.json` records each synced file's path, size,
sha, upstream URLs, local path, and sync timestamp.

Prompt generation prefers `data/upstream/gpt_image2_prompts.json` and falls
back to `data/upstream/data/ingested_tweets.json`. Gallery stats also include
the synced upstream file count and byte total.

Prompt cases are curated from EvoLinkAI/awesome-gpt-image-2-prompts and original public creator posts. All rights belong to their respective creators.

## Deployment

The app is configured for static export through `next build`, so it can be deployed to Vercel, Cloudflare Pages, Netlify, or GitHub Pages. The generated site lives in `out/` after a successful build.

Production URL:

https://xiaoqi-ai.vercel.app
