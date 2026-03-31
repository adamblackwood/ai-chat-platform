// أنواع الإشعارات: أنواع الإشعار، الأولوية، الإشعار الكامل

/**
 * أنواع الإشعارات التسعة
 */
export type NotificationType =
  | 'user_registered'
  | 'trial_requested'
  | 'trial_expired'
  | 'premium_expired'
  | 'persona_shared'
  | 'api_low_balance'
  | 'api_depleted'
  | 'system_error'
  | 'invite_code_used';

/**
 * أولويات الإشعارات
 */
export type NotificationPriority = 'urgent' | 'normal' | 'info';

/**
 * الإشعار - يطابق جدول notifications
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  related_user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * بيانات إنشاء إشعار جديد
 */
export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  related_user_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * فلتر الإشعارات
 */
export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}
