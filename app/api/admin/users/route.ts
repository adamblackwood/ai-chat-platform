// مسار API لإدارة المستخدمين - GET/PATCH/DELETE مع حماية المدير الأعلى
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * التحقق من صلاحية المدير
 */
async function verifyAdmin(request: NextRequest): Promise<{ userId: string; isSuperAdmin: boolean } | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") return null;
    return { userId: user.id, isSuperAdmin: profile.is_super_admin };
  } catch {
    return null;
  }
}

/**
 * GET - جلب المستخدمين مع البحث والتصفية والترقيم
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "0");
    const perPage = parseInt(searchParams.get("perPage") ?? "20");
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role") ?? "";
    const status = searchParams.get("status") ?? "";
    const sortField = searchParams.get("sortField") ?? "created_at";
    const sortDir = searchParams.get("sortDir") ?? "desc";

    const adminClient = createSupabaseAdminClient();
    let query = adminClient
      .from("profiles")
      .select("*", { count: "exact" })
      .order(sortField, { ascending: sortDir === "asc" })
      .range(page * perPage, (page + 1) * perPage - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (role && role !== "all") query = query.eq("role", role);
    if (status === "banned") query = query.eq("is_banned", true);
    if (status === "active") query = query.eq("is_banned", false);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ users: data, total: count });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH - تحديث دور أو حالة مستخدم
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, role, is_banned, premium_duration_days } = body as {
      userId: string;
      role?: string;
      is_banned?: boolean;
      premium_duration_days?: number;
    };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // حماية المدير الأعلى
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .single();

    if (targetProfile?.is_super_admin && !admin.isSuperAdmin) {
      return NextResponse.json({ error: "Cannot modify super admin" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role !== undefined) {
      updateData.role = role;
      if (role === "premium" && premium_duration_days) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + premium_duration_days);
        updateData.premium_expires_at = expiry.toISOString();
      } else if (role === "free") {
        updateData.premium_expires_at = null;
      }
    }

    if (is_banned !== undefined) {
      updateData.is_banned = is_banned;
    }

    const { error } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE - حذف مستخدم مع جميع بياناته
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId } = body as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // حماية المدير الأعلى
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .single();

    if (targetProfile?.is_super_admin) {
      return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 });
    }

    // الحذف يتتالي بفضل CASCADE في قاعدة البيانات
    const { error } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
