# WebKeet

WebKeet is a cybersecurity training platform built with TanStack Start, React, Tailwind CSS, and Supabase. It provides hands-on labs, learner progress, and an optional Docker-backed lab provisioner.

## Develop locally

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env
npm ci
npm run dev
```

Set the Supabase values in `.env` before using pages that read the live catalog or signing in. Never commit `.env` or server secrets.

## Deploy the web application

The root Dockerfile builds a production Node server for Railway and Render. Vercel uses the included `vercel.json` and Nitro plugin for TanStack Start server routes. Configure the variables listed in `.env.example` in the platform dashboard; `VITE_` variables are embedded into browser assets during the build and must contain only the Supabase project URL and publishable key.

`/healthz` is a lightweight readiness endpoint that does not depend on Supabase. The public homepage and authenticated features do require a configured Supabase project and the SQL migrations in `supabase/migrations`.

## Lab provisioner

The web app and the lab provisioner are separate services. The provisioner creates isolated Docker containers and therefore requires a trusted host with a Docker Engine. Railway and standard Render web services do not expose a host Docker socket for starting sibling lab containers. Deploy `provisioner/` on a Docker-capable VM or an independently managed Docker host, then set `WEBGOAT_PROVISIONER_URL` and `WEBGOAT_PROVISIONER_TOKEN` on the web service. Do not mount the host Docker socket into an untrusted public web service.

See [DEPLOY.md](DEPLOY.md) for platform steps and required configuration.

## Licensing

WebKeet is MIT licensed. Third-party lab images and dependencies retain their respective licenses; see `ATTRIBUTIONS.md` and `third-party/CODETRACK-LICENSE.txt`.
