# WebKeet

WebKeet is a full-stack web security training platform built with TanStack Start, React, Tailwind CSS, and Lovable Cloud. It provisions OWASP WebGoat lessons through a separate container service and tracks verified completion and points.

## Architecture

```text
Browser → WebKeet (TanStack Start) → Lovable Cloud
                    │
                    └── authenticated provisioner API → isolated WebGoat container
```

The control plane and vulnerable labs must never share a database or private network. The container-capable provisioner enforces one active container per user, 60-minute expiry, CPU/RAM limits, and no outbound internet.

## Development

```bash
bun install
bun run dev
```

Email/password and Google authentication are managed by Lovable Cloud. Database migrations are in `drizzle/migrations`.

## WebGoat provisioner contract

The hosted app runtime cannot launch Docker. Set `WEBGOAT_PROVISIONER_URL` and `WEBGOAT_PROVISIONER_TOKEN` on a separate trusted deployment. Until configured, launch attempts are stored as `failed` with an honest unavailable message.

Expected provisioner operations:

- `POST /instances` — authenticated JSON `{ instanceId, userId, labId, lessonPath, expiresAt }`; returns `{ externalId, accessUrl }`.
- `DELETE /instances/:externalId` — stops and removes the container.
- `POST /instances/:externalId/reset` — replaces it with a clean container.

Run `webgoat/webgoat` with no outbound network, a read-only root filesystem where possible, memory and CPU limits, and a dedicated per-instance network. The reverse proxy must verify the signed-in owner before forwarding traffic.

## Deployment

Deploy the WebKeet app and database on Lovable. Deploy the Docker provisioner to a container host with Docker access. Render web services cannot start sibling Docker containers on standard plans; use a private VM/container host for the provisioner and keep its token in secret storage.

## Licensing

WebKeet is MIT licensed. WebGoat remains GPL-2.0 and is run as an external program. See `ATTRIBUTIONS.md` and `third-party/CODETRACK-LICENSE.txt`.