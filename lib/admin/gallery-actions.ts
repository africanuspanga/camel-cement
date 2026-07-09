"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/admin/actions";

const BUCKET = "public-media";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

type StaffContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  userId: string;
  role: string;
};

/** Same staff guard convention as lib/admin/actions.ts. */
async function requireStaff(): Promise<
  { ok: true; ctx: StaffContext } | { ok: false; error: string }
> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Add credentials to .env.local first.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.active) {
    return { ok: false, error: "Your account does not have staff access." };
  }

  return { ok: true, ctx: { supabase, userId: user.id, role: profile.role } };
}

async function writeAudit(
  ctx: StaffContext,
  action: string,
  entityId: string | null,
  afterData?: Record<string, unknown>
) {
  await ctx.supabase.from("audit_logs").insert({
    user_id: ctx.userId,
    action,
    entity: "gallery_items",
    entity_id: entityId,
    after_data: afterData ?? null,
  });
}

async function nextDisplayOrder(ctx: StaffContext): Promise<number> {
  const { data } = await ctx.supabase
    .from("gallery_items")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.display_order ?? 0) + 1;
}

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

// ── Upload a file to the public-media bucket ──────────────────────────

const uploadMetaSchema = z.object({
  title: z.string().trim().min(2, "A title is required."),
  category: z.string().trim().min(2, "A category is required."),
});

export async function uploadGalleryMedia(
  formData: FormData
): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image or MP4 video to upload." };
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type === "video/mp4";
  if (!isImage && !isVideo) {
    return { ok: false, error: "Only images and MP4 videos are supported." };
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be 10 MB or smaller." };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: "Videos must be 50 MB or smaller." };
  }

  const parsed = uploadMetaSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid media details.",
    };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const sanitizedFileName =
    file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^[-.]+|-+$/g, "")
      .slice(-80) || `upload.${isVideo ? "mp4" : "jpg"}`;
  const path = `gallery/${Date.now()}-${sanitizedFileName}`;

  const { error: uploadError } = await ctx.supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600" });
  if (uploadError) {
    return { ok: false, error: `Upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = ctx.supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await ctx.supabase
    .from("gallery_items")
    .insert({
      title: parsed.data.title,
      kind: isVideo ? "video" : "image",
      src: publicUrl,
      category: parsed.data.category,
      display_order: await nextDisplayOrder(ctx),
      published: true,
    })
    .select("id")
    .single();
  if (error) {
    // Best effort: do not orphan the uploaded object.
    await ctx.supabase.storage.from(BUCKET).remove([path]).catch(() => {});
    return { ok: false, error: error.message };
  }

  await writeAudit(ctx, "gallery.uploaded", data?.id ?? null, {
    title: parsed.data.title,
    kind: isVideo ? "video" : "image",
    path,
  });

  revalidateGallery();
  return { ok: true };
}

// ── Link an existing site path or URL ─────────────────────────────────

const linkSchema = z.object({
  title: z.string().trim().min(2, "A title is required."),
  src: z
    .string()
    .trim()
    .min(2, "A media path or URL is required.")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//.test(value),
      "Use a site path like /gallery/photo.jpg or a full https:// URL."
    ),
  kind: z.enum(["image", "video"]),
  category: z.string().trim().min(2, "A category is required."),
  poster: z.string().trim().optional(),
});

export async function addGalleryLink(input: {
  title: string;
  src: string;
  kind: "image" | "video";
  category: string;
  poster?: string;
}): Promise<ActionResult> {
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid media details.",
    };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { data, error } = await ctx.supabase
    .from("gallery_items")
    .insert({
      title: parsed.data.title,
      kind: parsed.data.kind,
      src: parsed.data.src,
      poster: parsed.data.poster || null,
      category: parsed.data.category,
      display_order: await nextDisplayOrder(ctx),
      published: true,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "gallery.linked", data?.id ?? null, {
    title: parsed.data.title,
    kind: parsed.data.kind,
    src: parsed.data.src,
  });

  revalidateGallery();
  return { ok: true };
}

// ── Publish toggle ────────────────────────────────────────────────────

export async function setGalleryItemPublished(
  id: string,
  published: boolean
): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("gallery_items")
    .update({ published })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    ctx,
    published ? "gallery.published" : "gallery.unpublished",
    id,
    { published }
  );

  revalidateGallery();
  return { ok: true };
}

// ── Delete (row + storage object when applicable) ─────────────────────

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { data: item } = await ctx.supabase
    .from("gallery_items")
    .select("title, src")
    .eq("id", id)
    .maybeSingle();
  if (!item) return { ok: false, error: "Gallery item not found." };

  const { error } = await ctx.supabase
    .from("gallery_items")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Remove the storage object when the item lives in the public-media
  // bucket. Removal errors are ignored — the row is already gone.
  const marker = `/${BUCKET}/`;
  const markerIndex = item.src.indexOf(marker);
  if (markerIndex !== -1) {
    const objectPath = decodeURIComponent(
      item.src.slice(markerIndex + marker.length).split("?")[0]
    );
    if (objectPath) {
      await ctx.supabase.storage
        .from(BUCKET)
        .remove([objectPath])
        .catch(() => {});
    }
  }

  await writeAudit(ctx, "gallery.deleted", id, {
    title: item.title,
    src: item.src,
  });

  revalidateGallery();
  return { ok: true };
}
