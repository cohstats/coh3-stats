import config from "../../../../config";
import { getDpsData } from "../../../../src/unitStats/dpsData.server";
import { gzipSync } from "node:zlib";

// Build the current patch once. Older patches are generated on first use and cached by Next.
export const dynamic = "force-static";
export const dynamicParams = true;

export const generateStaticParams = () => [
  { patch: config.latestPatch },
  { patch: `${config.latestPatch}.json` },
];

export async function GET(_request: Request, { params }: { params: Promise<{ patch: string }> }) {
  const { patch } = await params;
  const plainJson = patch.endsWith(".json");
  const version = plainJson ? patch.slice(0, -5) : patch;
  if (!Object.hasOwn(config.patches, version)) {
    return Response.json({ error: "Unknown patch" }, { status: 404 });
  }
  const data = await getDpsData(version);
  if (plainJson) return Response.json(data);

  // Cache the compressed file itself. Route Handler HTTP compression varies by
  // Next version and hosting provider; the client explicitly decodes this format.
  const body = gzipSync(JSON.stringify(data));
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "application/gzip" },
  });
}
