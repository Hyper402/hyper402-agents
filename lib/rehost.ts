// lib/rehost.ts
import type { Umi } from "@metaplex-foundation/umi";
import { createGenericFile } from "@metaplex-foundation/umi";

/**
 * Re-host any image (File or external URL) to Arweave via Bundlr and return the HTTPS URI.
 * Always returns something like https://arweave.net/<id>
 */
export async function rehostToArweave(
  umi: Umi,
  input: File | string
): Promise<string> {
  // Case 1: user uploaded a file
  if (typeof input !== "string") {
    const buf = new Uint8Array(await input.arrayBuffer());
    const file = createGenericFile(buf, input.name || "image", {
      contentType: input.type || "image/png",
    });
    const [uri] = await umi.uploader.upload([file]);
    return uri; // https://arweave.net/...
  }

  // Case 2: user gave an external URL -> fetch -> reupload
  const res = await fetch(input);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  const arr = new Uint8Array(await blob.arrayBuffer());
  const file = createGenericFile(arr, "image", {
    contentType: blob.type || "image/png",
  });
  const [uri] = await umi.uploader.upload([file]);
  return uri;
}
