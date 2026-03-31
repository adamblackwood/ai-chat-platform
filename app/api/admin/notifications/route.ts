// مسار API لإدارة الإشعارات - GET/PATCH/DELETE
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function verifyAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin";
  } catch { return false; }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");

    const admin = createSupabaseAdminClient();
    let query = admin.from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
    if (type && type !== "all") query = query.eq("type", type);
    if (priority && priority !== "all") query = query.eq("priority", priority);
    if (status === "read") query = query.eq("is_read", true);
    if (status === "unread") query = query.eq("is_read", false);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ notifications: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { id, ids, is_read } = body as { id?: string; ids?: string[]; is_read?: boolean };

    const admin = createSupabaseAdminClient();

    if (ids && ids.length > 0) {
      const { error } = await admin.from("notifications").update({ is_read: is_read ?? true }).in("id", ids);
      if (error) throw error;
    } else if (id) {
      const { error } = await admin.from("notifications").update({ is_read: is_read ?? true }).eq("id", id);
      if (error) throw error;
    } else {
      // تحديث الكل
      const { error } = await admin.from("notifications").update({ is_read: true }).eq("is_read", false);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { id, olderThanDays } = body as { id?: string; olderThanDays?: number };

    const admin = createSupabaseAdminClient();

    if (olderThanDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - olderThanDays);
      const { error } = await admin.from("notifications").delete().lt("created_at", cutoff.toISOString()).eq("is_read", true);
      if (error) throw error;
    } else if (id) {
      const { error } = await admin.from("notifications").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
