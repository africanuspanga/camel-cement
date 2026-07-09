"use server";

import { revalidatePath } from "next/cache";

import {
  performResourceUpload,
  RESOURCE_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/admin/resource-upload";
import { requireStaff, writeAudit } from "@/lib/admin/staff";
import {
  ALLOWED_RESOURCE_EXTENSIONS,
  fileExtension,
  MAX_RESOURCE_FILE_BYTES,
  RESOURCE_CATEGORIES,
} from "@/lib/resources";

export type ActionResult = { ok: boolean; error?: string };

function revalidateResources() {
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function uploadResource(formData: FormData): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Give the document a title." };

  const category = String(formData.get("category") ?? "").trim();
  if (!(RESOURCE_CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, error: "Choose one of the document categories." };
  }

  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const languageRaw = String(formData.get("language") ?? "en").trim();
  const language = languageRaw === "sw" ? "sw" : "en";
  const version = String(formData.get("version") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (file.size > MAX_RESOURCE_FILE_BYTES) {
    return {
      ok: false,
      error: `The file is ${(file.size / (1024 * 1024)).toFixed(
        1
      )} MB — the maximum is 25 MB.`,
    };
  }

  const extension = fileExtension(file.name);
  const allowedMimes = ALLOWED_RESOURCE_EXTENSIONS[extension];
  if (!allowedMimes) {
    return {
      ok: false,
      error:
        "That file type is not supported. Upload PDF, Word, Excel, PowerPoint, PNG or JPG files.",
    };
  }
  // Browsers occasionally send an empty MIME type — the extension check above
  // still applies; a non-empty MIME must match the extension.
  if (file.type && !allowedMimes.includes(file.type)) {
    return {
      ok: false,
      error: `The file content (${file.type}) does not match its .${extension} extension.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await performResourceUpload(ctx.supabase, {
    bytes,
    fileName: file.name,
    contentType: file.type || allowedMimes[0],
    title,
    category,
    productSlug: productSlug || null,
    language,
    version: version || null,
    description: description || null,
  });
  if (!result.ok) return { ok: false, error: result.error };

  await writeAudit(ctx, "resource.uploaded", "resources", result.id, {
    title,
    category,
    path: result.path,
    size_kb: Math.round(file.size / 1024),
  });

  revalidateResources();
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing document id." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { data: row, error: fetchError } = await ctx.supabase
    .from("resources")
    .select("id, title, file_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "That document no longer exists." };

  const { error: deleteError } = await ctx.supabase
    .from("resources")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return { ok: false, error: `Could not delete the record: ${deleteError.message}` };
  }

  // Remove the storage object after the record is gone. A failure here only
  // leaves an orphaned file, so it should not fail the whole action.
  const path = row.file_url ? storagePathFromPublicUrl(row.file_url) : null;
  if (path) {
    await ctx.supabase.storage.from(RESOURCE_BUCKET).remove([path]);
  }

  await writeAudit(ctx, "resource.deleted", "resources", id, {
    title: row.title,
    path,
  });

  revalidateResources();
  return { ok: true };
}

export async function toggleResourcePublic(
  id: string,
  value: boolean
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing document id." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("resources")
    .update({ public: value })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    ctx,
    value ? "resource.published" : "resource.unpublished",
    "resources",
    id,
    { public: value }
  );

  revalidateResources();
  return { ok: true };
}
