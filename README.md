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

For a new computer:

```bash
git clone https://github.com/biyanbo1694-design/gpt-image-2-prompt-gallery.git
cd gpt-image-2-prompt-gallery
npm install
npm run dev
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

The GitHub Actions deployment uses Vercel's prebuilt output API and uploads the static export as a tgz archive:

```bash
npx vercel@52.0.0 deploy --prebuilt --prod --yes --archive=tgz
```

The archive upload is intentional. Without it, large static exports can hit Vercel's free upload file-count limit.

## Operations

After making changes:

```bash
git pull origin main
git add .
git commit -m "your change"
git push origin main
```

Pushing to `main` triggers GitHub Actions and deploys to Vercel. If the production site does not update, check the latest `Deploy to Vercel` workflow run first.

Business or feedback contact:

```text
Douyin ID: 97107763943
```
