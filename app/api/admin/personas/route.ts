// مسار API لإدارة الشخصيات - GET/POST/PATCH/DELETE مع حماية الأصلية الأربع
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const ORIGINAL_IDS = [
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "d4e5f6a7-b8c9-0123-defa-234567890123",
];

async function verifyAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin";
  } catch { return false; }
}

export async function GET(): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("personas").select("*").in("type", ["system", "premium", "shared"]).order("created_at");
    if (error) throw error;
    return NextResponse.json({ personas: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { name, description, system_prompt, icon_url, category, type } = body as Record<string, string>;
    if (!name || !system_prompt) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("personas").insert({
      name, description: description ?? "", system_prompt, icon_url: icon_url ?? null,
      category: category ?? "general", type: type ?? "system",
      is_active: true, is_approved: true,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ persona: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { id, ...updates } = body as Record<string, unknown>;
    if (!id || typeof id !== "string") return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const updateData = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await admin.from("personas").update(updateData).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { id } = body as { id: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (ORIGINAL_IDS.includes(id)) return NextResponse.json({ error: "Cannot delete original personas" }, { status: 403 });

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("personas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
