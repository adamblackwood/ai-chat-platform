// خطاف المصادقة: يدير جلسة المستخدم والملف الشخصي والدور
// يشترك في تغييرات حالة المصادقة ويحدث المخزن تلقائياً
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile, Role } from '@/types/user';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * واجهة القيم المرجعة من خطاف المصادقة
 */
interface UseAuthReturn {
  /** الملف الشخصي للمستخدم */
  user: Profile | null;
  /** دور المستخدم */
  role: Role;
  /** هل المستخدم مدير؟ */
  isAdmin: boolean;
  /** هل المستخدم مميز؟ */
  isPremium: boolean;
  /** هل المستخدم مجاني؟ */
  isFree: boolean;
  /** هل المستخدم مدير خارق؟ */
  isSuperAdmin: boolean;
  /** هل يتم تحميل البيانات؟ */
  isLoading: boolean;
  /** هل المستخدم محظور؟ */
  isBanned: boolean;
  /** تسجيل الدخول */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** إنشاء حساب */
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  /** تسجيل الخروج */
  signOut: () => Promise<void>;
  /** تحديث الملف الشخصي */
  refreshProfile: () => Promise<void>;
}

/**
 * خطاف المصادقة الرئيسي
 * يدير جلسة المستخدم والاشتراك في تغييرات الحالة
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initRef = useRef(false);

  const {
    user,
    role,
    isSuperAdmin,
    isLoading,
    isBanned,
    setUser,
    setSession,
    setLoading,
    clearAuth,
  } = useAuthStore();

  /**
   * جلب الملف الشخصي من قاعدة البيانات
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching profile:', error.message);
          }
          return null;
        }

        return data as Profile;
      } catch {
        return null;
      }
    },
    [supabase]
  );

  /**
   * تحديث الملف الشخصي
   */
  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        setUser(profile);
      }
    }
  }, [supabase, fetchProfile, setUser]);

  /**
   * معالجة تغيير حالة المصادقة
   */
  const handleAuthChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          if (profile.is_banned) {
            await supabase.auth.signOut();
            clearAuth();
            return;
          }
          setUser(profile);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
        }
      }
    },
    [supabase, fetchProfile, setUser, setSession, setLoading, clearAuth]
  );

  /**
   * الاشتراك في تغييرات المصادقة عند التحميل
   */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      setLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSession(session);
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            if (profile.is_banned) {
              await supabase.auth.signOut();
              clearAuth();
              return;
            }
            setUser(profile);
          }
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(handleAuthChange);

      subscriptionRef.current = subscription;
    };

    initializeAuth();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [supabase, fetchProfile, handleAuthChange, setUser, setSession, setLoading, clearAuth]);

  /**
   * تسجيل الدخول بالبريد وكلمة المرور
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setLoading(false);

          if (error.message.includes('Invalid login credentials')) {
            return { error: 'error_invalid_credentials' };
          }
          if (error.message.includes('Email not confirmed')) {
            return { error: 'error_invalid_credentials' };
          }
          return { error: 'error_generic' };
        }

        if (data.session?.user) {
          const profile = await fetchProfile(data.session.user.id);
          if (profile?.is_banned) {
            await supabase.auth.signOut();
            clearAuth();
            return { error: 'error_banned' };
          }
          if (profile) {
            setUser(profile);
            setSession(data.session);
          }
        }

        setLoading(false);
        return { error: null };
      } catch {
        setLoading(false);
        return { error: 'error_network' };
      }
    },
    [supabase, fetchProfile, setUser, setSession, setLoading, clearAuth]
  );

  /**
   * إنشاء حساب جديد
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ error: string | null }> => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              display_name: displayName ?? email.split('@')[0],
            },
            emailRedirectTo: undefined,
          },
        });

        if (error) {
          setLoading(false);

          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            return { error: 'error_email_exists' };
          }
          if (error.message.includes('weak_password') || error.message.includes('too short')) {
            return { error: 'error_weak_password' };
          }
          return { error: 'error_generic' };
        }

        if (data.session?.user) {
          const profile = await fetchProfile(data.session.user.id);
          if (profile) {
            setUser(profile);
            setSession(data.session);
          }
        } else if (data.user && !data.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (signInError) {
            setLoading(false);
            return { error: null };
          }

          if (signInData.session?.user) {
            const profile = await fetchProfile(signInData.session.user.id);
            if (profile) {
              setUser(profile);
              setSession(signInData.session);
            }
          }
        }

        setLoading(false);
        return { error: null };
      } catch {
        setLoading(false);
        return { error: 'error_network' };
      }
    },
    [supabase, fetchProfile, setUser, setSession, setLoading]
  );

  /**
   * تسجيل الخروج
   */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearAuth();
      router.push('/ar/login');
    } catch {
      clearAuth();
      router.push('/ar/login');
    }
  }, [supabase, clearAuth, router]);

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isPremium: role === 'premium',
    isFree: role === 'free',
    isSuperAdmin,
    isLoading,
    isBanned,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}
