-- سياسات أمان مستوى الصف (RLS) لجميع الجداول الـ 14
-- يجب تفعيل RLS على كل جدول وإنشاء سياسات محددة لكل عملية

-- ============================================
-- تفعيل RLS على جميع الجداول
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_persona_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- دالة مساعدة: هل المستخدم مدير؟
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة مساعدة: هل المستخدم مدير خارق؟
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_super_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة مساعدة: ما هو دور المستخدم؟
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
    RETURN COALESCE(user_role, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- سياسات جدول profiles
-- ============================================
-- القراءة: المستخدم يرى ملفه فقط، المدير يرى الجميع
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON profiles
    FOR SELECT USING (is_admin());

-- الإدراج: فقط عبر الـ trigger (handle_new_user)
-- لا سياسة INSERT للمستخدمين العاديين - يتم عبر service role

-- التحديث: المستخدم يحدث ملفه (بدون role/super/ban)، المدير يحدث الجميع
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
        AND is_super_admin = (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
        AND is_banned = (SELECT is_banned FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- الحذف: المدير فقط (باستثناء المدير الخارق)
CREATE POLICY "profiles_delete_admin" ON profiles
    FOR DELETE USING (
        is_admin()
        AND NOT (SELECT is_super_admin FROM profiles WHERE id = profiles.id)
    );

-- ============================================
-- سياسات جدول conversations
-- ============================================
CREATE POLICY "conversations_select_own" ON conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "conversations_insert_own" ON conversations
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND (
            get_user_role() != 'free'
            OR (SELECT COUNT(*) FROM conversations WHERE user_id = auth.uid()) < 20
        )
    );

CREATE POLICY "conversations_update_own" ON conversations
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversations_delete_own" ON conversations
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "conversations_delete_admin" ON conversations
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول messages
-- ============================================
CREATE POLICY "messages_select_own" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "messages_insert_own" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "messages_delete_own" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "messages_delete_admin" ON messages
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول personas
-- ============================================
-- القراءة: الشخصيات النظامية والمميزة والمشتركة المعتمدة للجميع
-- الشخصيات المخصصة لصاحبها فقط، المدير يرى الكل
CREATE POLICY "personas_select_public" ON personas
    FOR SELECT USING (
        type IN ('system', 'premium')
        AND is_active = true
    );

CREATE POLICY "personas_select_shared_approved" ON personas
    FOR SELECT USING (
        type = 'shared'
        AND is_approved = true
        AND is_active = true
    );

CREATE POLICY "personas_select_own" ON personas
    FOR SELECT USING (
        type = 'custom'
        AND user_id = auth.uid()
    );

CREATE POLICY "personas_select_admin" ON personas
    FOR SELECT USING (is_admin());

-- الإدراج: المستخدم ينشئ مخصصة (حد 4 للمجاني)، المدير ينشئ أي نوع
CREATE POLICY "personas_insert_own" ON personas
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND type IN ('custom', 'shared')
        AND (
            get_user_role() != 'free'
            OR (SELECT COUNT(*) FROM personas WHERE user_id = auth.uid() AND type = 'custom') < 4
        )
    );

CREATE POLICY "personas_insert_admin" ON personas
    FOR INSERT WITH CHECK (is_admin());

-- التحديث: صاحب المخصصة يحدثها، المدير يحدث الكل
CREATE POLICY "personas_update_own" ON personas
    FOR UPDATE USING (
        user_id = auth.uid()
        AND type IN ('custom', 'shared')
    )
    WITH CHECK (
        user_id = auth.uid()
        AND type IN ('custom', 'shared')
    );

CREATE POLICY "personas_update_admin" ON personas
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- الحذف: صاحب المخصصة يحذفها، المدير يحذف (باستثناء الـ 4 الأصلية)
CREATE POLICY "personas_delete_own" ON personas
    FOR DELETE USING (
        user_id = auth.uid()
        AND type IN ('custom', 'shared')
    );

CREATE POLICY "personas_delete_admin" ON personas
    FOR DELETE USING (
        is_admin()
        AND type != 'system'
    );

-- ============================================
-- سياسات جدول persona_ratings
-- ============================================
CREATE POLICY "persona_ratings_select_all" ON persona_ratings
    FOR SELECT USING (true);

CREATE POLICY "persona_ratings_insert_own" ON persona_ratings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "persona_ratings_update_own" ON persona_ratings
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "persona_ratings_delete_own" ON persona_ratings
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- سياسات جدول api_keys
-- ============================================
-- القراءة: المستخدم يرى مفاتيحه، المفاتيح العامة (platform+label فقط)، المدير يرى الكل
CREATE POLICY "api_keys_select_own" ON api_keys
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "api_keys_select_global_limited" ON api_keys
    FOR SELECT USING (is_global = true);

CREATE POLICY "api_keys_select_admin" ON api_keys
    FOR SELECT USING (is_admin());

-- الإدراج: المستخدم ينشئ (حد 2 للمجاني)، المدير ينشئ عامة
CREATE POLICY "api_keys_insert_own" ON api_keys
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND is_global = false
        AND (
            get_user_role() != 'free'
            OR (SELECT COUNT(*) FROM api_keys WHERE user_id = auth.uid() AND is_global = false) < 2
        )
    );

CREATE POLICY "api_keys_insert_admin" ON api_keys
    FOR INSERT WITH CHECK (is_admin());

-- التحديث: صاحب المفتاح أو المدير للعامة
CREATE POLICY "api_keys_update_own" ON api_keys
    FOR UPDATE USING (user_id = auth.uid() AND is_global = false)
    WITH CHECK (user_id = auth.uid() AND is_global = false);

CREATE POLICY "api_keys_update_admin" ON api_keys
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- الحذف: صاحب المفتاح أو المدير
CREATE POLICY "api_keys_delete_own" ON api_keys
    FOR DELETE USING (user_id = auth.uid() AND is_global = false);

CREATE POLICY "api_keys_delete_admin" ON api_keys
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول global_models
-- ============================================
CREATE POLICY "global_models_select_active" ON global_models
    FOR SELECT USING (is_active = true);

CREATE POLICY "global_models_select_admin" ON global_models
    FOR SELECT USING (is_admin());

CREATE POLICY "global_models_insert_admin" ON global_models
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "global_models_update_admin" ON global_models
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "global_models_delete_admin" ON global_models
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول folders
-- ============================================
CREATE POLICY "folders_select_own" ON folders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "folders_insert_own" ON folders
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "folders_update_own" ON folders
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "folders_delete_own" ON folders
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- سياسات جدول invite_codes
-- ============================================
CREATE POLICY "invite_codes_select_admin" ON invite_codes
    FOR SELECT USING (is_admin());

CREATE POLICY "invite_codes_insert_admin" ON invite_codes
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "invite_codes_update_admin" ON invite_codes
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "invite_codes_delete_admin" ON invite_codes
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول invite_code_uses
-- ============================================
CREATE POLICY "invite_code_uses_select_admin" ON invite_code_uses
    FOR SELECT USING (is_admin());

CREATE POLICY "invite_code_uses_delete_admin" ON invite_code_uses
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول notifications
-- ============================================
CREATE POLICY "notifications_select_admin" ON notifications
    FOR SELECT USING (is_admin());

CREATE POLICY "notifications_update_admin" ON notifications
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "notifications_delete_admin" ON notifications
    FOR DELETE USING (is_admin());

-- ============================================
-- سياسات جدول premium_persona_trials
-- ============================================
CREATE POLICY "premium_persona_trials_select_own" ON premium_persona_trials
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- سياسات جدول user_favorites
-- ============================================
CREATE POLICY "user_favorites_select_own" ON user_favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_favorites_insert_own" ON user_favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_favorites_update_own" ON user_favorites
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_favorites_delete_own" ON user_favorites
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- سياسات جدول usage_stats
-- ============================================
CREATE POLICY "usage_stats_select_own" ON usage_stats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usage_stats_select_admin" ON usage_stats
    FOR SELECT USING (is_admin());

CREATE POLICY "usage_stats_delete_admin" ON usage_stats
    FOR DELETE USING (is_admin());
