// مسار API لإدارة رموز الدعوة - GET/POST/PATCH/DELETE
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function verifyAdmin(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin" ? user.id : null;
  } catch { return null; }
}

export async function GET(): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("invite_codes").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ codes: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const adminId = await verifyAdmin();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { code, max_uses, premium_duration_days, expires_at } = body as {
      code: string; max_uses?: number; premium_duration_days?: number | null; expires_at?: string | null;
    };
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("invite_codes").insert({
      code, created_by: adminId, max_uses: max_uses ?? 1,
      premium_duration_days: premium_duration_days ?? null,
      expires_at: expires_at ?? null, is_active: true,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ code: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { id, is_active } = body as { id: string; is_active?: boolean };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const updateData: Record<string, unknown> = {};
    if (is_active !== undefined) updateData.is_active = is_active;

    const { error } = await admin.from("invite_codes").update(updateData).eq("id", id);
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

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("invite_codes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
