# Deployment Playbook

Updated: 2026-04-28

## Current Project

- Production: https://xiaoqi-ai.vercel.app
- Platform: Vercel
- Deploy trigger: push to `main`
- Workflow: `.github/workflows/deploy-vercel.yml`
- Static output: `out/`
- Vercel upload mode: `--archive=tgz`

## Day-to-Day Flow

```bash
git pull origin main
npm install
npm run dev
```

Before pushing:

```bash
npm run build:next
git add .
git commit -m "your change"
git push origin main
```

If GitHub is reachable in the browser but `git push` times out on this machine, use the local proxy once:

```bash
git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin main
```

## Platform Choice

Use Vercel when the project is a Next.js app, needs the smoothest Next.js deploy path, or may later use server-side rendering, API routes, image optimization, analytics, or preview deployments.

Use Cloudflare Pages when the project is mostly static and you want generous free hosting for many small sites. It is a strong default for landing pages, galleries, documentation, and front-end-only apps.

Use Netlify when you want a simple static/Jamstack workflow with hard free-plan limits and no surprise bills. It is also friendly for forms, redirects, and small marketing sites.

Use GitHub Pages only for simple public docs, portfolios, demos, and open-source project pages. Avoid it for business websites, SaaS, ecommerce, or anything that needs server features.

## Payment Rule of Thumb

You do not need to pay just to test or launch small static sites.

Consider paying when:

- The site is clearly commercial and the platform's free plan is personal-only.
- You need a custom business workflow, team seats, or reliable support.
- You need server functions, backend jobs, databases, or high traffic.
- A client or business depends on the site staying online.

For this project, keep Vercel for now. If it becomes a serious business lead site, either upgrade Vercel to Pro or move the static export to Cloudflare Pages/Netlify.
