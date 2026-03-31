// مسار API لإدارة مفاتيح API العامة - GET/POST/PATCH/DELETE مع التشفير
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * تشفير بسيط للمفتاح (في الإنتاج استخدم AES-256 الكامل)
 */
function encryptKey(key: string): string {
  const encKey = process.env.ENCRYPTION_KEY ?? "default-encryption-key-32chars!";
  const encoded = Buffer.from(key).toString("base64");
  // تشفير XOR بسيط مع مفتاح التشفير
  let result = "";
  for (let i = 0; i < encoded.length; i++) {
    const charCode = encoded.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
    result += String.fromCharCode(charCode);
  }
  return Buffer.from(result).toString("base64");
}

/**
 * فك تشفير المفتاح
 */
function decryptKey(encrypted: string): string {
  const encKey = process.env.ENCRYPTION_KEY ?? "default-encryption-key-32chars!";
  const decoded = Buffer.from(encrypted, "base64").toString();
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
    result += String.fromCharCode(charCode);
  }
  return Buffer.from(result, "base64").toString();
}

/**
 * التحقق من صلاحية المدير
 */
async function verifyAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * GET - جلب المفاتيح العامة (بدون قيمة المفتاح)
 */
export async function GET(): Promise<NextResponse> {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("api_keys")
      .select("id, platform, label, is_global, is_active, last_used_at, created_at")
      .eq("is_global", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ keys: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST - إضافة مفتاح API عام مع التشفير
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { platform, key, label } = body as {
      platform: string;
      key: string;
      label: string;
    };

    if (!platform || !key || !label) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encryptedKey = encryptKey(key);

    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("api_keys")
      .insert({
        platform,
        encrypted_key: encryptedKey,
        label,
        is_global: true,
        is_active: true,
        user_id: null,
      })
      .select("id, platform, label, is_global, is_active, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ key: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH - تحديث مفتاح API عام
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, label, is_active, key } = body as {
      id: string;
      label?: string;
      is_active?: boolean;
      key?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (key) updateData.encrypted_key = encryptKey(key);

    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient
      .from("api_keys")
      .update(updateData)
      .eq("id", id)
      .eq("is_global", true);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE - حذف مفتاح API عام مع نماذجه
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // حذف النماذج المرتبطة أولاً (CASCADE يفعل هذا تلقائياً)
    const { error } = await adminClient
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("is_global", true);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
