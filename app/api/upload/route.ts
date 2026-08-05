import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentType, filename } = await request.json();
  if (!contentType || !filename) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `uploads/${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from("ugc-media")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicUrl = supabaseAdmin.storage
    .from("ugc-media")
    .getPublicUrl(path).data.publicUrl;

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl });
}
