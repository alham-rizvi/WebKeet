# Deployment

WebKeet has two separately deployed components:

1. **Web application** — TanStack Start server, browser UI, and server functions. Deploy the repository root to Railway or Render.
2. **Lab provisioner** — creates vulnerable lab containers. It requires access to a trusted Docker Engine and must run on a Docker-capable VM/host. It is not deployable as a normal Railway or Render web service because those services do not provide the host Docker socket needed to start sibling containers.

The database and authentication are provided by Supabase. Create/configure a Supabase project, apply the SQL migrations under `supabase/migrations`, enable the desired auth providers, and set the site URL plus redirect URLs for your production domain in Supabase Auth settings.

## Required environment variables

Set these in the hosting dashboard (or locally in an ignored `.env` file):

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL; embedded into browser assets at build time |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable/anon key; embedded into browser assets at build time; never use a secret key here |
| `SUPABASE_URL` | Yes | Server-side Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Server-side publishable/anon key |
| `DATABASE_URL` | Only when running Drizzle migrations | Direct Postgres connection string; keep it private |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for server code that explicitly uses the admin client | Secret service-role key; server-side only, never prefix it with `VITE_` |
| `WEBGOAT_PROVISIONER_URL` | Optional until labs are enabled | Public HTTPS base URL of the separately hosted provisioner |
| `WEBGOAT_PROVISIONER_TOKEN` | Optional until labs are enabled | Shared bearer token configured on both the web app and provisioner |
| `WEBKEET_CRON_SECRET` | Only if a protected cron endpoint is added | Secret bearer token for scheduled requests |

`VITE_` values are public: anyone can inspect them in browser downloads. Add only the Supabase project URL and publishable key. Keep service-role keys and provisioner/cron tokens server-side.

## Vercel

The repository includes `vercel.json` with the TanStack Start framework preset, and `vite.config.ts` registers Nitro for Vercel's server functions and route handling. Import the repository with the project root as the Root Directory; leave Build Command and Output Directory on **Auto**. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production, Preview, and Development as needed, then redeploy. Set matching server-side Supabase variables if runtime code uses them. Configure the production and preview origins in Supabase Auth redirect settings.

## Railway

1. Create a Railway project and deploy this repository from GitHub.
2. Railway detects the root `Dockerfile`; keep the repository root as the build context.
3. Add the Supabase variables above to the web service before its first build. Railway makes service variables available during the Docker build, and the Dockerfile declares the public `VITE_` values as build arguments.
4. Generate a public domain. The app listens on Railway's `PORT` and binds on all interfaces. `/healthz` is the readiness endpoint.
5. If labs should launch, separately deploy the provisioner on a Docker-capable VM and add its URL/token to the web service.

## Render

1. In Render, create a Blueprint and select this repository. The included `render.yaml` defines the root Docker web service and `/healthz` health check.
2. Fill in the Supabase variables when prompted. Render makes Docker service variables available as build arguments; the Dockerfile uses only the public `VITE_` values during build.
3. Deploy and set up Supabase Auth production site/redirect URLs.
4. If labs should launch, deploy the provisioner separately on a Docker-capable VM and set the two provisioner variables on the web service.

## Local Docker

```bash
cp .env.example .env
# Fill in the Supabase values in .env

docker compose up --build
```

The website is available at `http://localhost:3000`. The root Compose file is for the web application only. The provisioner has a separate Compose file in `provisioner/` and must run on the Docker host that will own and expose the lab containers.

## Provisioner host

Run `provisioner/` only on a Docker-capable host you control. Create a strong `PROVISIONER_TOKEN` (at least 24 characters), configure the host/domain and HTTPS reverse proxy, and restrict access to the provisioner. Its Docker socket provides host-level control; do not expose the socket over the public internet or mount it into an unrelated service.

Lab containers need a reachable URL/port mapping and isolation from the WebKeet control-plane/database network. Verify the provisioner health endpoint (`/health`) and test create/stop/expiry behavior before enabling lab launches for users.
