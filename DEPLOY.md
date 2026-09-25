# Deploying WebKeet

WebKeet has two parts:

| Part | What it does | Where it can run |
|---|---|---|
| **Website** (this repo root) | Pages, sign-in, labs list, dashboard | Lovable Publish, Vercel, Render, or a Hostinger VPS |
| **Instance spawner** (`provisioner/`) | Starts a private Docker lab per user, kills it after 60 min | **Only a machine with Docker** – a Hostinger VPS (KVM plan). Vercel and Render cannot run Docker containers. |

The database and sign-in are on Lovable Cloud, so you do not host a database yourself.

Environment variables the website needs everywhere:

```
VITE_SUPABASE_URL=...            # copy from .env
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...                 # same value as VITE_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY=...     # same value as VITE_SUPABASE_PUBLISHABLE_KEY
WEBGOAT_PROVISIONER_URL=https://spawner.yourdomain.com
WEBGOAT_PROVISIONER_TOKEN=<same token as the spawner>
```

---

## 1. Instance spawner on Hostinger VPS (required for Launch)

1. Buy a Hostinger **VPS** (KVM 2 or higher, Ubuntu 22.04/24.04). Shared web hosting will not work.
2. SSH in: `ssh root@YOUR_VPS_IP`
3. Install Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
4. Copy the `provisioner/` folder to the server (e.g. `scp -r provisioner root@YOUR_VPS_IP:/opt/webkeet-spawner`).
5. Create the secret and config:
   ```bash
   cd /opt/webkeet-spawner
   cp .env.example .env
   sed -i "s/^PROVISIONER_TOKEN=.*/PROVISIONER_TOKEN=$(openssl rand -hex 32)/" .env
   nano .env        # set PUBLIC_HOST to your VPS IP or labs domain
   ```
6. Pre-pull lab images (optional, makes first launch fast):
   ```bash
   docker pull webgoat/webgoat:latest bkimminich/juice-shop:latest vulnerables/web-dvwa:latest
   ```
7. Start it: `docker compose up -d --build` then check `curl localhost:4000/health`.
8. Firewall: open 4000 (spawner) and 20000-20999 (lab ports):
   ```bash
   ufw allow 22 && ufw allow 4000 && ufw allow 20000:20999/tcp && ufw enable
   ```
9. **HTTPS (recommended):** point `spawner.yourdomain.com` at the VPS in Hostinger DNS, install Caddy and proxy it:
   ```
   spawner.yourdomain.com {
     reverse_proxy localhost:4000
   }
   ```
   Then close public port 4000 (`ufw delete allow 4000`).
10. Put `WEBGOAT_PROVISIONER_URL` and `WEBGOAT_PROVISIONER_TOKEN` (the token from `.env`) into your website host's environment variables.

Security built in: bearer token (constant-time check), image allow-list, 1 GB RAM / 1 CPU / 256 PIDs per lab, dropped Linux capabilities, `no-new-privileges`, max concurrent labs, auto-removal after the time limit. Each user gets only one running lab.

---

## 2a. Website on Vercel

1. Push this project to GitHub (Lovable: GitHub button > Connect).
2. vercel.com > **Add New Project** > import the repo.
3. Framework preset: **Other**. Build command: `bun run build`. Install: `bun install`.
4. Add all environment variables listed above.
5. Deploy. TanStack Start builds for Vercel automatically when the `VERCEL` env is present; if the build outputs Cloudflare format instead, set `NITRO_PRESET=vercel` in env.
6. In Lovable Cloud auth settings add your Vercel URL as an allowed redirect for Google sign-in and password reset.

## 2b. Website on Render

`render.yaml` is already in the repo.

1. render.com > **New > Blueprint** > pick the repo. It uses the root `Dockerfile`.
2. Fill in the environment variables (set `NITRO_PRESET=node-server` too).
3. Deploy. Health check is `/`.

## 2c. Website on the same Hostinger VPS

```bash
git clone <your repo> /opt/webkeet && cd /opt/webkeet
cp .env.example .env   # or create .env with the variables above + NITRO_PRESET=node-server
docker compose up -d --build   # serves on :3000
```
Add to Caddy:
```
yourdomain.com {
  reverse_proxy localhost:3000
}
```

## 2d. Easiest: Lovable Publish

Click **Publish** in Lovable, then add the two `WEBGOAT_PROVISIONER_*` secrets in the project's Cloud secrets. Custom domains from Hostinger can be connected in Project Settings > Domains.

---

## Checklist
- [ ] Spawner `/health` returns `{"ok":true}`
- [ ] Website env vars set, including the provisioner URL and token
- [ ] Sign up, open a lab, press **Launch** – an "Open in new tab" button appears
- [ ] Press **Stop** – the container disappears from `docker ps`
