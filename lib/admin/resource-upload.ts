import type { SupabaseClient } from "@supabase/supabase-js";

import { fileExtension } from "@/lib/resources";

/**
 * Core upload pipeline for the resource library: storage object first, then
 * the `resources` row. Kept separate from the server action so trusted
 * scripts (seeding, smoke tests) can drive the exact same code path with a
 * service-role client.
 */

export const RESOURCE_BUCKET = "public-documents";

export interface ResourceUploadInput {
  /** Raw file bytes. */
  bytes: ArrayBuffer | Uint8Array;
  /** Original filename — used for the storage path and file type. */
  fileName: string;
  contentType: string;
  title: string;
  category: string;
  productSlug?: string | null;
  language?: string;
  version?: string | null;
  description?: string | null;
}

export type ResourceUploadResult =
  | { ok: true; id: string; path: string; publicUrl: string }
  | { ok: false; error: string };

/** "Camel 42.5R Datasheet (v2).pdf" → "camel-42-5r-datasheet-v2.pdf" */
export function slugifyFileName(fileName: string): string {
  const ext = fileExtension(fileName);
  const base = ext ? fileName.slice(0, -(ext.length + 1)) : fileName;
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "document";
  return ext ? `${slug}.${ext}` : slug;
}

export async function performResourceUpload(
  supabase: SupabaseClient,
  input: ResourceUploadInput
): Promise<ResourceUploadResult> {
  const path = `resources/${Date.now()}-${slugifyFileName(input.fileName)}`;
  const sizeBytes = input.bytes.byteLength;

  const { error: storageError } = await supabase.storage
    .from(RESOURCE_BUCKET)
    .upload(path, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });
  if (storageError) {
    return {
      ok: false,
      error: `Could not upload the file to storage: ${storageError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path);

  const extension = fileExtension(input.fileName);
  const { data, error: dbError } = await supabase
    .from("resources")
    .insert({
      title: input.title,
      category: input.category,
      product_slug: input.productSlug || null,
      language: input.language || "en",
      file_url: publicUrl,
      file_type: extension ? extension.toUpperCase() : null,
      file_size_kb: Math.round(sizeBytes / 1024),
      version: input.version || null,
      description: input.description || null,
      published_at: new Date().toISOString().slice(0, 10),
      public: true,
    })
    .select("id")
    .single();

  if (dbError || !data) {
    // Roll back the orphaned storage object so retries stay clean.
    await supabase.storage.from(RESOURCE_BUCKET).remove([path]);
    return {
      ok: false,
      error: `The file was uploaded but saving the document record failed: ${
        dbError?.message ?? "unknown database error"
      }`,
    };
  }

  return { ok: true, id: data.id as string, path, publicUrl };
}

/**
 * Storage object path from a stored public URL,
 * e.g. ".../object/public/public-documents/resources/123-file.pdf"
 * → "resources/123-file.pdf". Returns null when the URL is not in the bucket.
 */
export function storagePathFromPublicUrl(fileUrl: string): string | null {
  const marker = `/${RESOURCE_BUCKET}/`;
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  const raw = fileUrl.slice(index + marker.length).split("?")[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
