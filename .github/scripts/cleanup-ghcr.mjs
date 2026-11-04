#!/usr/bin/env node
/**
 * Cleanup of old container image versions in GHCR. No dependencies, only Node built-ins.
 *
 * Retention policy:
 *   - keep every version that has one of KEEP_TAGS (latest, development, production, master)
 *   - keep the newest KEEP_RELEASES versions tagged vX.Y.Z (prod releases, for rollbacks)
 *   - keep the newest KEEP_MASTER versions tagged master-<sha> (dev builds)
 *   - keep everything created in the last MIN_AGE_HOURS (protects builds that are being pushed)
 *   - keep every manifest referenced by a kept image index (multi-arch / attestation children).
 *     They are untagged in GHCR, deleting them would break the tagged image ("manifest unknown").
 *   - delete everything else (old tagged builds and orphaned untagged sha256 versions)
 *
 * Env:
 *   GITHUB_TOKEN    token with packages:write (required)
 *   GITHUB_ACTOR    user for registry auth (defaults to "github-actions")
 *   ORG, PACKAGE    defaults cohstats / coh3-stats
 *   KEEP_TAGS       space separated, default "latest development production master"
 *   KEEP_RELEASES   default 10
 *   KEEP_MASTER     default 10
 *   MIN_AGE_HOURS   default 24
 *   DRY_RUN         "true" only prints what would be deleted (default "true")
 */

import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const API = "https://api.github.com";
const REGISTRY = "ghcr.io";

const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;
const MASTER_TAG = /^master-/;

const MANIFEST_ACCEPT = [
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.docker.distribution.manifest.v2+json",
].join(", ");

/**
 * Decides which versions to keep based on tags and age only.
 * Returns versions sorted newest first, each with `keepReason` (string) or null when it's a delete candidate.
 */
export function classifyVersions(versions, opts) {
  const { keepTags, keepReleases, keepMaster, minAgeHours, now = Date.now() } = opts;
  const cutoff = now - minAgeHours * 3600 * 1000;
  const tagsOf = (v) => v.metadata?.container?.tags ?? [];

  const sorted = [...versions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id,
  );

  const recentReleases = new Set(
    sorted
      .filter((v) => tagsOf(v).some((t) => RELEASE_TAG.test(t)))
      .slice(0, keepReleases)
      .map((v) => v.id),
  );
  const recentMaster = new Set(
    sorted
      .filter((v) => tagsOf(v).some((t) => MASTER_TAG.test(t)))
      .slice(0, keepMaster)
      .map((v) => v.id),
  );

  return sorted.map((v) => {
    const tags = tagsOf(v);
    let keepReason = null;
    const protectedTag = tags.find((t) => keepTags.includes(t));
    if (protectedTag) keepReason = `tag ${protectedTag}`;
    else if (recentReleases.has(v.id)) keepReason = `one of last ${keepReleases} releases`;
    else if (recentMaster.has(v.id)) keepReason = `one of last ${keepMaster} master builds`;
    else if (new Date(v.created_at).getTime() > cutoff) keepReason = `younger than ${minAgeHours}h`;
    return { id: v.id, digest: v.name, tags, created_at: v.created_at, keepReason };
  });
}

/**
 * Marks delete candidates that are referenced by a kept image index as kept.
 * `getChildDigests(digest)` returns the digests listed in that manifest (empty for a plain image).
 */
export async function protectIndexChildren(classified, getChildDigests) {
  const children = new Map();
  for (const v of classified.filter((x) => x.keepReason)) {
    for (const child of await getChildDigests(v.digest)) children.set(child, v.digest);
  }
  return classified.map((v) =>
    !v.keepReason && children.has(v.digest)
      ? { ...v, keepReason: `part of kept index ${children.get(v.digest).slice(0, 19)}` }
      : v,
  );
}

async function gh(path, { method = "GET", token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return res;
}

async function listVersions(org, pkg, token) {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await gh(
      `/orgs/${org}/packages/container/${pkg}/versions?per_page=100&page=${page}`,
      { token },
    );
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

async function registryToken(org, pkg, actor, token) {
  const scope = `repository:${org}/${pkg}:pull`;
  const res = await fetch(`https://${REGISTRY}/token?service=${REGISTRY}&scope=${scope}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${actor}:${token}`).toString("base64")}` },
  });
  if (!res.ok) throw new Error(`registry token -> ${res.status} ${await res.text()}`);
  return (await res.json()).token;
}

function manifestChildrenFetcher(org, pkg, regToken) {
  return async (digest) => {
    const res = await fetch(`https://${REGISTRY}/v2/${org}/${pkg}/manifests/${digest}`, {
      headers: { Authorization: `Bearer ${regToken}`, Accept: MANIFEST_ACCEPT },
    });
    // A kept version whose manifest can't be read: fail rather than risk deleting its children
    if (!res.ok) throw new Error(`manifest ${digest} -> ${res.status} ${await res.text()}`);
    const manifest = await res.json();
    return (manifest.manifests ?? []).map((m) => m.digest);
  };
}

function summary(lines) {
  const text = lines.join("\n");
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n");
}

const row = (v) =>
  `| \`${v.digest.slice(0, 19)}\` | ${v.tags.join(", ") || "_untagged_"} | ${v.created_at} | ${v.keepReason ?? "**delete**"} |`;

async function main() {
  const env = process.env;
  const token = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const org = env.ORG || "cohstats";
  const pkg = env.PACKAGE || "coh3-stats";
  const dryRun = (env.DRY_RUN ?? "true") !== "false";
  const opts = {
    keepTags: (env.KEEP_TAGS || "latest development production master").split(/\s+/),
    keepReleases: Number(env.KEEP_RELEASES ?? 10),
    keepMaster: Number(env.KEEP_MASTER ?? 10),
    minAgeHours: Number(env.MIN_AGE_HOURS ?? 24),
  };

  const versions = await listVersions(org, pkg, token);
  const regToken = await registryToken(org, pkg, env.GITHUB_ACTOR || "github-actions", token);
  const result = await protectIndexChildren(
    classifyVersions(versions, opts),
    manifestChildrenFetcher(org, pkg, regToken),
  );

  const toDelete = result.filter((v) => !v.keepReason);
  summary([
    `## GHCR cleanup ${org}/${pkg}${dryRun ? " (dry run)" : ""}`,
    "",
    `Versions: ${result.length}, keeping ${result.length - toDelete.length}, deleting ${toDelete.length}`,
    "",
    "| Digest | Tags | Created | Result |",
    "| --- | --- | --- | --- |",
    ...result.map(row),
  ]);

  if (dryRun) return;
  // Tagged versions (indexes) first, so an index never points to an already deleted child
  toDelete.sort((a, b) => b.tags.length - a.tags.length);
  for (const v of toDelete) {
    await gh(`/orgs/${org}/packages/container/${pkg}/versions/${v.id}`, { method: "DELETE", token });
    console.log(`Deleted ${v.id} ${v.digest} [${v.tags.join(", ")}]`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
