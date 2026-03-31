-- دوال قاعدة البيانات السبع مع المشغلات (Triggers)
-- تتعامل مع إنشاء المستخدمين، تحديث العدادات، التقييمات، انتهاء الصلاحية

-- ============================================
-- 1. دالة معالجة المستخدم الجديد
-- يتم تشغيلها بعد إدراج مستخدم جديد في auth.users
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    super_admin_email TEXT;
    user_role TEXT DEFAULT 'free';
    user_is_super BOOLEAN DEFAULT false;
BEGIN
    -- الحصول على بريد المدير الخارق من إعدادات التطبيق
    super_admin_email := current_setting('app.super_admin_email', true);

    -- التحقق إذا كان هذا هو المدير الخارق
    IF NEW.email = super_admin_email THEN
        user_role := 'admin';
        user_is_super := true;
    END IF;

    -- إنشاء الملف الشخصي
    INSERT INTO profiles (id, email, display_name, role, is_super_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        user_role,
        user_is_super
    );

    -- إنشاء إشعار تسجيل مستخدم جديد
    INSERT INTO notifications (type, title, message, priority, related_user_id, metadata)
    VALUES (
        'user_registered',
        'مستخدم جديد',
        'تم تسجيل مستخدم جديد: ' || NEW.email,
        'info',
        NEW.id,
        jsonb_build_object('email', NEW.email, 'role', user_role)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء المشغل
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. دالة تحديث عدد رسائل المحادثة
-- يتم تشغيلها بعد إدراج رسالة بدور 'user'
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'user' THEN
        UPDATE conversations
        SET message_count = message_count + 1,
            updated_at = now()
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted_count ON messages;
CREATE TRIGGER on_message_inserted_count
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- ============================================
-- 3. دالة تحديث عدد الرموز في المحادثة
-- يتم تشغيلها بعد إدراج رسالة بدور 'assistant'
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_tokens()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'assistant' AND NEW.tokens_used > 0 THEN
        UPDATE conversations
        SET total_tokens = total_tokens + NEW.tokens_used,
            updated_at = now()
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted_tokens ON messages;
CREATE TRIGGER on_message_inserted_tokens
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_tokens();

-- ============================================
-- 4. دالة تحديث تقييم الشخصية
-- يتم تشغيلها بعد INSERT/UPDATE/DELETE على persona_ratings
-- ============================================
CREATE OR REPLACE FUNCTION update_persona_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_persona_id UUID;
    new_avg DECIMAL(2,1);
    new_count INTEGER;
BEGIN
    -- تحديد الشخصية المستهدفة
    IF TG_OP = 'DELETE' THEN
        target_persona_id := OLD.persona_id;
    ELSE
        target_persona_id := NEW.persona_id;
    END IF;

    -- حساب المتوسط والعدد الجديد
    SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
        COUNT(*)
    INTO new_avg, new_count
    FROM persona_ratings
    WHERE persona_id = target_persona_id;

    -- تحديث الشخصية
    UPDATE personas
    SET average_rating = new_avg,
        rating_count = new_count,
        updated_at = now()
    WHERE id = target_persona_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_persona_rating_changed ON persona_ratings;
CREATE TRIGGER on_persona_rating_changed
    AFTER INSERT OR UPDATE OR DELETE ON persona_ratings
    FOR EACH ROW EXECUTE FUNCTION update_persona_rating();

-- ============================================
-- 5. دالة فحص انتهاء صلاحية الاشتراك المميز
-- يتم تشغيلها دورياً (عبر cron أو استدعاء يدوي)
-- ============================================
CREATE OR REPLACE FUNCTION check_premium_expiry()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
    expired_user RECORD;
BEGIN
    FOR expired_user IN
        SELECT id, email
        FROM profiles
        WHERE role = 'premium'
        AND premium_expires_at IS NOT NULL
        AND premium_expires_at < now()
    LOOP
        -- تحويل المستخدم إلى مجاني
        UPDATE profiles
        SET role = 'free',
            premium_expires_at = NULL,
            updated_at = now()
        WHERE id = expired_user.id;

        -- إنشاء إشعار
        INSERT INTO notifications (type, title, message, priority, related_user_id, metadata)
        VALUES (
            'premium_expired',
            'انتهاء الاشتراك المميز',
            'انتهت صلاحية الاشتراك المميز للمستخدم: ' || expired_user.email,
            'normal',
            expired_user.id,
            jsonb_build_object('email', expired_user.email)
        );

        expired_count := expired_count + 1;
    END LOOP;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. دالة فحص انتهاء الفترة التجريبية
-- يتم تشغيلها دورياً (عبر cron أو استدعاء يدوي)
-- ============================================
CREATE OR REPLACE FUNCTION check_trial_expiry()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
    expired_user RECORD;
BEGIN
    FOR expired_user IN
        SELECT id, email
        FROM profiles
        WHERE role = 'premium'
        AND trial_expires_at IS NOT NULL
        AND trial_expires_at < now()
    LOOP
        -- تحويل المستخدم إلى مجاني وتعليم التجربة كمستخدمة
        UPDATE profiles
        SET role = 'free',
            trial_used = true,
            trial_expires_at = NULL,
            premium_expires_at = NULL,
            updated_at = now()
        WHERE id = expired_user.id;

        -- إنشاء إشعار
        INSERT INTO notifications (type, title, message, priority, related_user_id, metadata)
        VALUES (
            'trial_expired',
            'انتهاء الفترة التجريبية',
            'انتهت الفترة التجريبية للمستخدم: ' || expired_user.email,
            'normal',
            expired_user.id,
            jsonb_build_object('email', expired_user.email)
        );

        expired_count := expired_count + 1;
    END LOOP;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. دالة زيادة عداد استخدام الشخصية
-- يتم تشغيلها بعد إنشاء محادثة مع شخصية
-- ============================================
CREATE OR REPLACE FUNCTION increment_persona_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.persona_id IS NOT NULL THEN
        UPDATE personas
        SET usage_count = usage_count + 1,
            updated_at = now()
        WHERE id = NEW.persona_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_conversation_created_persona ON conversations;
CREATE TRIGGER on_conversation_created_persona
    AFTER INSERT ON conversations
    FOR EACH ROW EXECUTE FUNCTION increment_persona_usage();
