-- مخطط قاعدة البيانات الكامل: 14 جدول لمنصة الدردشة بالذكاء الاصطناعي
-- يتضمن جميع الأعمدة والقيود والمفاتيح الخارجية والفهارس

-- ============================================
-- تفعيل الامتدادات المطلوبة
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. جدول الملفات الشخصية (profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('admin', 'premium', 'free')),
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    trial_used BOOLEAN NOT NULL DEFAULT false,
    trial_expires_at TIMESTAMPTZ,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    preferred_language TEXT NOT NULL DEFAULT 'ar',
    preferred_theme TEXT NOT NULL DEFAULT 'dark',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_super_admin ON profiles(is_super_admin);

-- ============================================
-- 2. جدول المجلدات (folders)
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('auto', 'custom')),
    persona_id UUID,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);

-- ============================================
-- 3. جدول الشخصيات (personas)
-- ============================================
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    icon_url TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'premium', 'custom', 'shared')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    average_rating DECIMAL(2,1) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_personas_type ON personas(type);
CREATE INDEX idx_personas_category ON personas(category);
CREATE INDEX idx_personas_is_active ON personas(is_active);
CREATE INDEX idx_personas_user_id ON personas(user_id);

-- إضافة المرجع الخارجي للمجلدات بعد إنشاء جدول الشخصيات
ALTER TABLE folders ADD CONSTRAINT fk_folders_persona_id
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;

-- ============================================
-- 4. جدول المحادثات (conversations)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'محادثة جديدة',
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    model TEXT NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_favorited BOOLEAN NOT NULL DEFAULT false,
    message_count INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_folder_id ON conversations(folder_id);
CREATE INDEX idx_conversations_persona_id ON conversations(persona_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- ============================================
-- 5. جدول الرسائل (messages)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model TEXT,
    platform TEXT,
    persona_name TEXT,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- 6. جدول تقييمات الشخصيات (persona_ratings)
-- ============================================
CREATE TABLE IF NOT EXISTS persona_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (persona_id, user_id)
);

CREATE INDEX idx_persona_ratings_persona_id ON persona_ratings(persona_id);
CREATE INDEX idx_persona_ratings_user_id ON persona_ratings(user_id);

-- ============================================
-- 7. جدول مفاتيح API (api_keys)
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    label TEXT NOT NULL,
    is_global BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_platform ON api_keys(platform);
CREATE INDEX idx_api_keys_is_global ON api_keys(is_global);

-- ============================================
-- 8. جدول النماذج العامة (global_models)
-- ============================================
CREATE TABLE IF NOT EXISTS global_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_global_models_api_key_id ON global_models(api_key_id);
CREATE INDEX idx_global_models_is_active ON global_models(is_active);
CREATE INDEX idx_global_models_sort_order ON global_models(sort_order);

-- ============================================
-- 9. جدول أكواد الدعوة (invite_codes)
-- ============================================
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    premium_duration_days INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_is_active ON invite_codes(is_active);

-- ============================================
-- 10. جدول استخدامات أكواد الدعوة (invite_code_uses)
-- ============================================
CREATE TABLE IF NOT EXISTS invite_code_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code_id UUID NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (invite_code_id, user_id)
);

CREATE INDEX idx_invite_code_uses_invite_code_id ON invite_code_uses(invite_code_id);
CREATE INDEX idx_invite_code_uses_user_id ON invite_code_uses(user_id);

-- ============================================
-- 11. جدول الإشعارات (notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'info')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 12. جدول تجارب الشخصيات المميزة (premium_persona_trials)
-- ============================================
CREATE TABLE IF NOT EXISTS premium_persona_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, persona_id)
);

CREATE INDEX idx_premium_persona_trials_user_id ON premium_persona_trials(user_id);
CREATE INDEX idx_premium_persona_trials_persona_id ON premium_persona_trials(persona_id);

-- ============================================
-- 13. جدول المفضلات (user_favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('persona', 'model')),
    item_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item_type ON user_favorites(item_type);

-- ============================================
-- 14. جدول إحصائيات الاستخدام (usage_stats)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_sent INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    conversations_created INTEGER NOT NULL DEFAULT 0,
    persona_id_most_used UUID REFERENCES personas(id) ON DELETE SET NULL,
    UNIQUE (user_id, date)
);

CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_date ON usage_stats(date);

-- ============================================
-- تحديث updated_at تلقائياً
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
