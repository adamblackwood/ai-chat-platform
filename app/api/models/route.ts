// مسار API للنماذج: جلب النماذج المتاحة حسب المنصة ونوع المفتاح
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const apiType = searchParams.get('apiType') ?? 'global';

    if (!platform) {
      return NextResponse.json({ error: 'المنصة مطلوبة' }, { status: 400 });
    }

    if (apiType === 'global') {
      // جلب النماذج العامة من قاعدة البيانات
      const adminClient = createSupabaseAdminClient();

      const { data: models, error } = await adminClient
        .from('global_models')
        .select(\`
          id,
          model_id,
          model_name,
          is_active,
          sort_order,
          api_keys!inner (
            platform,
            is_active,
            is_global
          )
        \`)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'خطأ في جلب النماذج' }, { status: 500 });
      }

      interface ModelRow {
        id: string;
        model_id: string;
        model_name: string;
        is_active: boolean;
        sort_order: number;
        api_keys: {
          platform: string;
          is_active: boolean;
          is_global: boolean;
        };
      }

      const filteredModels = (models as unknown as ModelRow[])
        .filter((m) => {
          const key = m.api_keys;
          return key && key.platform === platform && key.is_active && key.is_global;
        })
        .map((m) => ({
          id: m.model_id,
          name: m.model_name,
          sortOrder: m.sort_order,
        }));

      return NextResponse.json(filteredModels);
    }

    // المفتاح الخاص: إرجاع تعليمات للعميل
    return NextResponse.json({
      message: 'Private API keys: fetch models directly from the provider',
      instruction: 'client_side_fetch',
      platform,
    });
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
