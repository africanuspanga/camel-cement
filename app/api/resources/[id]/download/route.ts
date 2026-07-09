import { NextResponse, after } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public download endpoint: counts the download and 302-redirects to the
 * file's public storage URL. Linked from the public resources library so
 * `download_count` reflects real usage.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Downloads are not available right now." },
      { status: 503 }
    );
  }

  const { data } = await supabase
    .from("resources")
    .select("id, file_url, download_count, public")
    .eq("id", id)
    .maybeSingle();

  if (!data?.file_url || !data.public) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fire-and-forget: count the download after the redirect is sent.
  after(async () => {
    await supabase
      .from("resources")
      .update({ download_count: (data.download_count ?? 0) + 1 })
      .eq("id", id);
  });

  return NextResponse.redirect(data.file_url, 302);
}
