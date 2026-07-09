import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rateLimit,
  clientIp,
  localReference,
} from "@/lib/validation/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const applicationSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(30),
  region: z.string().trim().min(2).max(80),
  currentLocation: z.string().trim().min(2).max(160),
  workExperience: z.enum([
    "0-2 years",
    "3-5 years",
    "6-10 years",
    "10+ years",
  ]),
  educationLevel: z.enum([
    "Certificate",
    "Diploma",
    "Bachelor degree",
    "Master degree",
    "Other",
  ]),
  coverLetter: z.string().trim().max(5000).optional().default(""),
  consent: z.literal("true"),
});

function validateUpload(
  file: File,
  required: boolean
): { ok: true; file: File | null } | { ok: false; error: string } {
  if (!(file instanceof File) || file.size === 0) {
    if (required) return { ok: false, error: "A CV file is required." };
    return { ok: true, file: null };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Files must be 5 MB or smaller." };
  }
  const name = file.name.toLowerCase();
  const extensionOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const typeOk = file.type === "" || ALLOWED_MIME_TYPES.includes(file.type);
  if (!extensionOk || !typeOk) {
    return { ok: false, error: "Only PDF, DOC or DOCX files are accepted." };
  }
  return { ok: true, file };
}

function sanitizeFileName(name: string): string {
  const trimmed = name.slice(-120);
  return trimmed.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uploadToApplications(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  file: File
): Promise<string | null> {
  const path = `cv/${Date.now()}-${sanitizeFileName(file.name) || "document"}`;
  const { error } = await supabase.storage
    .from("applications")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) {
    console.error("[api/careers/apply] upload failed:", error.message);
    return null;
  }
  // Private bucket: store the storage path, never a public URL.
  return path;
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`careers-apply:${clientIp(request)}`, 5, 5 * 60 * 1000)) {
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
        { ok: false, persisted: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    // Honeypot: pretend success so bots learn nothing.
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        reference: localReference("JA"),
        persisted: false,
      });
    }

    const parsed = applicationSchema.safeParse({
      slug: formData.get("slug"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      region: formData.get("region"),
      currentLocation: formData.get("currentLocation"),
      workExperience: formData.get("workExperience"),
      educationLevel: formData.get("educationLevel"),
      coverLetter: formData.get("coverLetter") ?? "",
      consent: formData.get("consent"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Please check the highlighted fields and try again.",
        },
        { status: 400 }
      );
    }

    const cvCheck = validateUpload(formData.get("cv") as File, true);
    if (!cvCheck.ok) {
      return NextResponse.json(
        { ok: false, persisted: false, error: cvCheck.error },
        { status: 400 }
      );
    }
    const supportingCheck = validateUpload(
      formData.get("supporting") as File,
      false
    );
    if (!supportingCheck.ok) {
      return NextResponse.json(
        { ok: false, persisted: false, error: supportingCheck.error },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      // Preview mode: accept the application without persistence.
      return NextResponse.json({
        ok: true,
        persisted: false,
        reference: "JA-DEMO",
      });
    }

    const { data: vacancy, error: vacancyError } = await supabase
      .from("vacancies")
      .select("id,title")
      .eq("slug", parsed.data.slug)
      .eq("published", true)
      .maybeSingle();
    if (vacancyError || !vacancy) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "This vacancy is no longer accepting applications.",
        },
        { status: 400 }
      );
    }

    const cvPath = cvCheck.file
      ? await uploadToApplications(supabase, cvCheck.file)
      : null;
    if (!cvPath) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "The CV could not be uploaded. Please try again.",
        },
        { status: 500 }
      );
    }
    const supportingPath = supportingCheck.file
      ? await uploadToApplications(supabase, supportingCheck.file)
      : null;

    const { data: application, error: insertError } = await supabase
      .from("job_applications")
      .insert({
        vacancy_id: vacancy.id,
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        region: parsed.data.region,
        current_location: parsed.data.currentLocation,
        position: vacancy.title,
        work_experience: parsed.data.workExperience,
        education_level: parsed.data.educationLevel,
        cover_letter: parsed.data.coverLetter || null,
        cv_url: cvPath,
        supporting_url: supportingPath,
        consent: true,
      })
      .select("reference")
      .single();

    if (insertError || !application) {
      console.error(
        "[api/careers/apply] insert failed:",
        insertError?.message
      );
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "The application could not be saved. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      reference: application.reference,
      persisted: true,
    });
  } catch (error) {
    console.error("[api/careers/apply] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          "Something went wrong while submitting your application. Please try again.",
      },
      { status: 500 }
    );
  }
}
