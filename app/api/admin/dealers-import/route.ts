import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { requireStaff, writeAudit } from "@/lib/admin/staff";

export const runtime = "nodejs";

/**
 * Bulk dealer import from .xlsx/.xls/.csv. Staff-only (session cookie +
 * profiles row — RLS applies through the server client). Returns
 * { ok, imported, skipped: [{ row, reason }] }.
 */

const IMPORT_EXTENSIONS = ["xlsx", "xls", "csv"];
const MAX_IMPORT_ROWS = 2000;

/** Normalised header → dealers column. Keys are lower-cased alphanumerics. */
const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  dealer: "name",
  dealername: "name",
  shopname: "name",
  region: "region",
  district: "district",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  telephone: "phone",
  whatsapp: "whatsapp",
  whatsappnumber: "whatsapp",
  email: "email",
  emailaddress: "email",
  address: "address",
  location: "address",
  contactperson: "contact_person",
  contact: "contact_person",
  contactname: "contact_person",
  openinghours: "opening_hours",
  hours: "opening_hours",
  workinghours: "opening_hours",
  delivery: "delivery_available",
  deliveryavailable: "delivery_available",
  offersdelivery: "delivery_available",
  collection: "collection_available",
  collectionavailable: "collection_available",
  offerscollection: "collection_available",
  notes: "notes",
  note: "notes",
  comments: "notes",
  authorised: "authorised",
  authorized: "authorised",
};

function normaliseHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** yes/no/true/false/1/0/y/n → boolean; anything else → undefined. */
function parseBoolean(value: unknown): boolean | undefined {
  const text = asText(value).toLowerCase();
  if (["yes", "y", "true", "1"].includes(text)) return true;
  if (["no", "n", "false", "0"].includes(text)) return false;
  return undefined;
}

interface SkippedRow {
  row: number;
  reason: string;
}

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error }, { status: 401 });
  }
  const { ctx } = guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send the file as multipart form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Choose a spreadsheet to import." },
      { status: 400 }
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!IMPORT_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { ok: false, error: "Upload a .xlsx, .xls or .csv file." },
      { status: 400 }
    );
  }

  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), {
      type: "buffer",
    });
    const sheetName = workbook.SheetNames[0];
    const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
    if (!sheet) {
      return NextResponse.json(
        { ok: false, error: "The spreadsheet has no sheets." },
        { status: 400 }
      );
    }
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not read the spreadsheet. Is the file valid?" },
      { status: 400 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "The spreadsheet has no data rows below the header." },
      { status: 400 }
    );
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return NextResponse.json(
      { ok: false, error: `Import at most ${MAX_IMPORT_ROWS} dealers at a time.` },
      { status: 400 }
    );
  }

  const skipped: SkippedRow[] = [];
  const dealers: Record<string, unknown>[] = [];

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // 1-based, after the header row.

    // Remap the sheet's headers onto dealers columns.
    const mapped: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      const column = HEADER_ALIASES[normaliseHeader(key)];
      if (column && !(column in mapped && asText(mapped[column]))) {
        mapped[column] = value;
      }
    }

    const hasAnyValue = Object.values(raw).some((value) => asText(value));
    if (!hasAnyValue) return; // Silently ignore fully blank rows.

    const name = asText(mapped.name);
    const region = asText(mapped.region);
    if (!name) {
      skipped.push({ row: rowNumber, reason: "Missing dealer name" });
      return;
    }
    if (!region) {
      skipped.push({ row: rowNumber, reason: "Missing region" });
      return;
    }

    dealers.push({
      name,
      region,
      district: asText(mapped.district) || null,
      phone: asText(mapped.phone) || null,
      whatsapp: asText(mapped.whatsapp) || null,
      email: asText(mapped.email) || null,
      address: asText(mapped.address) || null,
      contact_person: asText(mapped.contact_person) || null,
      opening_hours: asText(mapped.opening_hours) || null,
      notes: asText(mapped.notes) || null,
      delivery_available: parseBoolean(mapped.delivery_available) ?? false,
      collection_available: parseBoolean(mapped.collection_available) ?? true,
      authorised: parseBoolean(mapped.authorised) ?? true,
      active: true,
    });
  });

  if (dealers.length > 0) {
    const { error } = await ctx.supabase.from("dealers").insert(dealers);
    if (error) {
      return NextResponse.json(
        { ok: false, error: `Import failed: ${error.message}` },
        { status: 500 }
      );
    }

    await writeAudit(ctx, "dealer.imported", "dealers", null, {
      imported: dealers.length,
      skipped: skipped.length,
      file: file.name,
    });

    revalidatePath("/admin/dealers");
    revalidatePath("/dealers");
  }

  return NextResponse.json({
    ok: true,
    imported: dealers.length,
    skipped,
  });
}
