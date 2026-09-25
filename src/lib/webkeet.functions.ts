import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { LAB_CONTENT } from "./lab-content.server";

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
}

export const getPublicData = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [{ data: labs, error }, { data: profiles }, { data: completions }, { data: authors }] = await Promise.all([
    db.from("labs").select("id,slug,title,category,difficulty,points,description,objectives,hints,lesson_path,estimated_minutes,author_id,engine,docker_image,lab_authors(name,profile_url,organization)").eq("published", true).order("points"),
    db.from("profiles").select("id,display_name,username,avatar_url,points,completed_count").order("points", { ascending: false }).limit(25),
    db.from("completions").select("id,lab_id,user_id"),
    db.from("lab_authors").select("id,name,profile_url,organization,avatar_url"),
  ]);
  const [{ data: categories }, { data: paths }, { data: pathLabs }] = await Promise.all([
    db.from("categories").select("slug,name,blurb,sort_order").order("sort_order"),
    db.from("learn_paths").select("slug,title,summary,description,level,sort_order,id").order("sort_order"),
    db.from("path_labs").select("path_id,lab_slug,position").order("position"),
  ]);
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const completion of completions ?? []) counts.set(completion.lab_id, (counts.get(completion.lab_id) ?? 0) + 1);
  const userCount = Math.max(profiles?.length ?? 0, 1);
  return { categories: categories ?? [], paths: (paths ?? []).map(p => ({ ...p, labs: (pathLabs ?? []).filter(x => x.path_id === p.id).map(x => x.lab_slug) })), labs: (labs ?? []).map(lab => { const c = LAB_CONTENT[lab.slug]; return { ...lab, description: c?.description ?? lab.description, tags: c?.tags ?? [], completion_count: counts.get(lab.id) ?? 0, completion_rate: Math.round(((counts.get(lab.id) ?? 0) / userCount) * 100) }; }), profiles: profiles ?? [], authors: authors ?? [], stats: { users: profiles?.length ?? 0, labs: labs?.length ?? 0, completions: completions?.length ?? 0 } };
});

export const getMyDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [{ data: profile }, { data: completions }, { data: instances }, { data: roles }, { data: labs }, { data: categories }] = await Promise.all([
    context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
    context.supabase.from("completions").select("*,labs(title,slug,category,points)").eq("user_id", context.userId).order("completed_at", { ascending: false }),
    context.supabase.from("lab_instances").select("*,labs(title,slug)").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(5),
    context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
    context.supabase.from("labs").select("id,slug,title,category,difficulty,points,estimated_minutes").eq("published", true).order("points"),
    context.supabase.from("categories").select("slug,name,sort_order").order("sort_order"),
  ]);
  const completed = completions ?? [];
  const catalog = labs ?? [];
  const completedIds = new Set(completed.map(item => item.lab_id));
  const startedCategories = new Set(completed.map(item => item.labs?.category).filter((value): value is string => Boolean(value)));
  const difficultyRank: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  const recommended = catalog
    .filter(item => !completedIds.has(item.id))
    .sort((a, b) => {
      const categoryDifference = Number(startedCategories.has(b.category)) - Number(startedCategories.has(a.category));
      return categoryDifference || (difficultyRank[a.difficulty] ?? 3) - (difficultyRank[b.difficulty] ?? 3) || a.points - b.points;
    })
    .slice(0, 4);

  const dayKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  const activeDays = [...new Set(completed.map(item => dayKey(new Date(item.completed_at))))].sort().reverse();
  const today = new Date();
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (activeDays[0] !== dayKey(cursor)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let currentStreak = 0;
  while (activeDays.includes(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let longestStreak = 0;
  let runningStreak = 0;
  const ascendingDays = [...activeDays].sort();
  for (let index = 0; index < ascendingDays.length; index += 1) {
    const previous = ascendingDays[index - 1];
    const current = ascendingDays[index];
    if (!previous || !current) runningStreak = 1;
    else {
      const gap = (Date.parse(`${current}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86_400_000;
      runningStreak = gap === 1 ? runningStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const categoryProgress = (categories ?? []).map(category => {
    const categoryLabs = catalog.filter(item => item.category === category.name);
    const done = categoryLabs.filter(item => completedIds.has(item.id)).length;
    return { ...category, completed: done, total: categoryLabs.length, percent: categoryLabs.length ? Math.round((done / categoryLabs.length) * 100) : 0 };
  });

  return {
    profile,
    completions: completed,
    instances: instances ?? [],
    isAdmin: roles?.some(r => r.role === "admin") ?? false,
    totalLabs: catalog.length,
    recommended,
    categoryProgress,
    streak: { current: currentStreak, longest: longestStreak, activeDays },
  };
});

const labAction = z.object({ labId: z.string().uuid() });
export const launchLab = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => labAction.parse(v)).handler(async ({ data, context }) => {
  const now = new Date().toISOString();
  await context.supabase.from("lab_instances").update({ status: "expired", stopped_at: now }).eq("user_id", context.userId).in("status", ["provisioning", "running"]).lt("expires_at", now);
  const { data: active } = await context.supabase.from("lab_instances").select("*").eq("user_id", context.userId).in("status", ["provisioning", "running"]).gt("expires_at", now).maybeSingle();
  if (active) return active;
  const url = process.env['WEBGOAT_PROVISIONER_URL']; const token = process.env['WEBGOAT_PROVISIONER_TOKEN'];
  const { data: lab } = await context.supabase.from("labs").select("docker_image").eq("id", data.labId).single();
  const configured = Boolean(url && token);
  const { data: row, error } = await context.supabase.from("lab_instances").insert({ user_id: context.userId, lab_id: data.labId, status: configured ? "provisioning" : "failed", error_message: configured ? null : "Lab provisioner is not configured for this deployment." }).select().single();
  if (error) throw new Error(error.message);
  await context.supabase.from("audit_logs").insert({ actor_id: context.userId, action: "lab.launch", entity_type: "lab", entity_id: data.labId });
  if (!configured) return row;
  try {
    const res = await fetch(`${url!.replace(/\/$/, "")}/instances`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ instanceId: row.id, image: lab?.docker_image || "webgoat/webgoat:latest", ttlMinutes: 60 }) });
    const body = await res.json().catch(() => ({})) as { id?: string; url?: string; error?: string };
    if (!res.ok || !body.url) throw new Error(body.error || `Provisioner returned ${res.status}`);
    const { data: up } = await context.supabase.from("lab_instances").update({ status: "running", external_id: body.id ?? null, access_url: body.url, started_at: new Date().toISOString(), expires_at: new Date(Date.now() + 3600_000).toISOString() }).eq("id", row.id).select().single();
    return up ?? row;
  } catch (e) {
    console.error("provisioner error", e);
    const { data: up } = await context.supabase.from("lab_instances").update({ status: "failed", error_message: "The lab server could not start your instance. Try again in a minute." }).eq("id", row.id).select().single();
    return up ?? row;
  }
});

export const stopLab = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ instanceId: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { data: inst } = await context.supabase.from("lab_instances").select("external_id").eq("id", data.instanceId).eq("user_id", context.userId).maybeSingle();
  const url = process.env['WEBGOAT_PROVISIONER_URL']; const token = process.env['WEBGOAT_PROVISIONER_TOKEN'];
  if (inst?.external_id && url && token) {
    await fetch(`${url.replace(/\/$/, "")}/instances/${encodeURIComponent(inst.external_id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch((e) => console.error("provisioner stop", e));
  }
  const { error } = await context.supabase.from("lab_instances").update({ status: "stopped", stopped_at: new Date().toISOString() }).eq("id", data.instanceId).eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
});

export const completeLab = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => labAction.parse(v)).handler(async ({ data, context }) => {
  const { data: lab } = await context.supabase.from("labs").select("points").eq("id", data.labId).single();
  if (!lab) throw new Error("Lab not found");
  const { error } = await context.supabase.from("completions").insert({ user_id: context.userId, lab_id: data.labId, points_awarded: lab.points });
  if (error && error.code !== "23505") throw new Error(error.message);
  return { ok: true, alreadyCompleted: error?.code === "23505" };
});

export const getLabDetail = createServerFn({ method: "GET" }).inputValidator((v) => z.object({ slug: z.string().min(1).max(120) }).parse(v)).handler(async ({ data }) => {
  const c = LAB_CONTENT[data.slug];
  if (!c) return null;
  const { solution: _hidden, ...rest } = c;
  const db = publicClient();
  const { data: lab } = await db.from("labs").select("id").eq("slug", data.slug).maybeSingle();
  const { data: comments } = lab ? await db.from("discussions").select("id,body,created_at,user_id").eq("lab_id", lab.id).order("created_at", { ascending: false }).limit(50) : { data: [] };
  return { ...rest, hasSolution: Boolean(_hidden), comments: comments ?? [] };
});

export const getLabSolution = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ slug: z.string().min(1).max(120) }).parse(v)).handler(async ({ data, context }) => {
  const { data: lab } = await context.supabase.from("labs").select("id").eq("slug", data.slug).maybeSingle();
  if (!lab) return { unlocked: false, solution: null };
  const { data: done } = await context.supabase.from("completions").select("id").eq("lab_id", lab.id).eq("user_id", context.userId).maybeSingle();
  if (!done) return { unlocked: false, solution: null };
  return { unlocked: true, solution: LAB_CONTENT[data.slug]?.solution ?? null };
});

export const postComment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ labId: z.string().uuid(), body: z.string().trim().min(2).max(4000) }).parse(v)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("discussions").insert({ lab_id: data.labId, user_id: context.userId, body: data.body });
  if (error) throw new Error(error.message);
  return { ok: true };
});
