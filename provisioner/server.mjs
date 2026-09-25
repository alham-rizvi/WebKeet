// WebKeet instance spawner — zero-dependency Node 20 service.
// Talks to the local Docker Engine over /var/run/docker.sock and starts one
// isolated, resource-limited, auto-expiring container per lab launch.
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.PORT || 4000);
const TOKEN = process.env.PROVISIONER_TOKEN || "";
const PUBLIC_HOST = process.env.PUBLIC_HOST || "localhost"; // e.g. labs.example.com or VPS IP
const PUBLIC_SCHEME = process.env.PUBLIC_SCHEME || "http";
const PORT_MIN = Number(process.env.PORT_MIN || 20000);
const PORT_MAX = Number(process.env.PORT_MAX || 20999);
const MAX_INSTANCES = Number(process.env.MAX_INSTANCES || 10);
const ALLOWED = (process.env.ALLOWED_IMAGES || "webgoat/webgoat:latest,bkimminich/juice-shop:latest,vulnerables/web-dvwa:latest,contrastsecurity/nodegoat:latest").split(",").map((s) => s.trim());
const DEFAULT_IMAGE = process.env.DEFAULT_IMAGE || "webgoat/webgoat:latest";
const INTERNAL_PORTS = { "webgoat/webgoat": 8080, "bkimminich/juice-shop": 3000, "vulnerables/web-dvwa": 80, "contrastsecurity/nodegoat": 4000 };
const LABEL = "webkeet.instance";

if (!TOKEN || TOKEN.length < 24) { console.error("PROVISIONER_TOKEN must be set (24+ chars)"); process.exit(1); }

function docker(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath: "/var/run/docker.sock", path: `/v1.43${path}`, method, headers: { "Content-Type": "application/json" } }, (res) => {
      let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => {
        let j = null; try { j = d ? JSON.parse(d) : null; } catch { j = d; }
        res.statusCode >= 400 ? reject(new Error(`docker ${res.statusCode}: ${j?.message ?? d}`)) : resolve(j);
      });
    });
    req.on("error", reject); if (body) req.write(JSON.stringify(body)); req.end();
  });
}

async function listOurs() {
  const f = encodeURIComponent(JSON.stringify({ label: [LABEL] }));
  return docker("GET", `/containers/json?all=1&filters=${f}`);
}

async function freePort() {
  const used = new Set((await listOurs()).flatMap((c) => c.Ports.map((p) => p.PublicPort)));
  for (let i = 0; i < 50; i++) { const p = PORT_MIN + crypto.randomInt(PORT_MAX - PORT_MIN); if (!used.has(p)) return p; }
  throw new Error("No free ports");
}

async function pull(image) {
  const [name, tag = "latest"] = image.split(":");
  await docker("POST", `/images/create?fromImage=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
}

async function create({ instanceId, image, ttlMinutes }) {
  image = ALLOWED.includes(image) ? image : DEFAULT_IMAGE;
  const ours = await listOurs();
  if (ours.filter((c) => c.State === "running").length >= MAX_INSTANCES) throw Object.assign(new Error("Lab server is full, try again soon"), { status: 503 });
  const internal = INTERNAL_PORTS[image.split(":")[0]] ?? 8080;
  const hostPort = await freePort();
  const expires = Date.now() + Math.min(Number(ttlMinutes) || 60, 120) * 60_000;
  const name = `wk-${String(instanceId).replace(/[^a-z0-9-]/gi, "").slice(0, 36)}`;
  const spec = {
    Image: image,
    Labels: { [LABEL]: "1", "webkeet.expires": String(expires) },
    ExposedPorts: { [`${internal}/tcp`]: {} },
    HostConfig: {
      PortBindings: { [`${internal}/tcp`]: [{ HostPort: String(hostPort) }] },
      Memory: 1024 * 1024 * 1024, NanoCpus: 1_000_000_000, PidsLimit: 256,
      CapDrop: ["ALL"], CapAdd: ["CHOWN", "SETUID", "SETGID", "NET_BIND_SERVICE", "DAC_OVERRIDE"],
      SecurityOpt: ["no-new-privileges"], AutoRemove: true,
    },
  };
  let c;
  try { c = await docker("POST", `/containers/create?name=${name}`, spec); }
  catch (e) { if (!/No such image/i.test(e.message)) throw e; await pull(image); c = await docker("POST", `/containers/create?name=${name}`, spec); }
  await docker("POST", `/containers/${c.Id}/start`);
  const path = image.startsWith("webgoat/") ? "/WebGoat" : "";
  return { id: c.Id, url: `${PUBLIC_SCHEME}://${PUBLIC_HOST}:${hostPort}${path}`, expiresAt: new Date(expires).toISOString() };
}

async function remove(id) {
  await docker("DELETE", `/containers/${encodeURIComponent(id)}?force=1`).catch((e) => { if (!/404|No such/.test(e.message)) throw e; });
}

// Reaper: kill expired containers every minute.
setInterval(async () => {
  try { for (const c of await listOurs()) if (Number(c.Labels["webkeet.expires"]) < Date.now()) { await remove(c.Id); console.log("reaped", c.Id.slice(0, 12)); } }
  catch (e) { console.error("reaper", e.message); }
}, 60_000);

function send(res, status, obj) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); }
function authed(req) {
  const got = Buffer.from((req.headers.authorization || "").replace(/^Bearer /, "")); const want = Buffer.from(TOKEN);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

http.createServer(async (req, res) => {
  try {
    if (req.url === "/health") return send(res, 200, { ok: true });
    if (!authed(req)) return send(res, 401, { error: "Unauthorized" });
    if (req.method === "POST" && req.url === "/instances") {
      let raw = ""; for await (const ch of req) { raw += ch; if (raw.length > 10_000) return send(res, 413, { error: "Too large" }); }
      return send(res, 201, await create(JSON.parse(raw || "{}")));
    }
    const m = req.url.match(/^\/instances\/([a-f0-9]{12,64})$/);
    if (req.method === "DELETE" && m) { await remove(m[1]); return send(res, 200, { ok: true }); }
    send(res, 404, { error: "Not found" });
  } catch (e) { console.error(e); send(res, e.status || 500, { error: e.message }); }
}).listen(PORT, () => console.log(`WebKeet spawner on :${PORT}`));
