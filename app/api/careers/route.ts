import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/validation/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const talentProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(30),
  interests: z.string().trim().min(3).max(2000),
  consent: z.literal("true"),
});

function sanitizeFileName(name: string): string {
  const trimmed = name.slice(-120);
  return trimmed.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function validateOptionalCv(
  value: FormDataEntryValue | null
): { ok: true; file: File | null } | { ok: false; error: string } {
  if (!(value instanceof File) || value.size === 0) {
    return { ok: true, file: null };
  }
  if (value.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "The CV must be 5 MB or smaller." };
  }
  const name = value.name.toLowerCase();
  const extensionOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const typeOk = value.type === "" || ALLOWED_MIME_TYPES.includes(value.type);
  if (!extensionOk || !typeOk) {
    return { ok: false, error: "Only PDF, DOC or DOCX files are accepted." };
  }
  return { ok: true, file: value };
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`careers-talent:${clientIp(request)}`)) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Too many requests. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    // Honeypot: silently accept without persisting anything.
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return NextResponse.json({ ok: true, persisted: false });
    }

    const parsed = talentProfileSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      interests: formData.get("interests"),
      consent: formData.get("consent"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please check the submitted details." },
        { status: 400 }
      );
    }

    const cvCheck = validateOptionalCv(formData.get("cv"));
    if (!cvCheck.ok) {
      return NextResponse.json(
        { ok: false, error: cvCheck.error },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      // Preview mode: accept the submission without persistence.
      return NextResponse.json({ ok: true, persisted: false });
    }

    let cvPath: string | null = null;
    if (cvCheck.file) {
      const path = `talent/${Date.now()}-${
        sanitizeFileName(cvCheck.file.name) || "cv"
      }`;
      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(path, cvCheck.file, {
          contentType: cvCheck.file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        console.error(
          "[api/careers] talent CV upload failed:",
          uploadError.message
        );
        return NextResponse.json(
          {
            ok: false,
            error: "The CV could not be uploaded. Please try again.",
          },
          { status: 500 }
        );
      }
      // Private bucket: store the storage path, never a public URL.
      cvPath = path;
    }

    const { error } = await supabase.from("talent_profiles").insert({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      areas_of_interest: parsed.data.interests,
      cv_url: cvPath,
      consent: true,
    });

    if (error) {
      console.error(
        "[api/careers] talent profile insert failed:",
        error.message
      );
      return NextResponse.json(
        {
          ok: false,
          error: "The profile could not be saved. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    console.error("[api/careers] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong while submitting. Please try again.",
      },
      { status: 500 }
    );
  }
}
