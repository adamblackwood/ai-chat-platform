// الصفحة الرئيسية - صفحة الهبوط للزوار غير المسجلين
// تعرض مميزات المنصة وأزرار تسجيل الدخول والتسجيل
// إذا كان المستخدم مسجل دخوله يتم توجيهه إلى /chat
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "landing" });

  return {
    title: process.env.NEXT_PUBLIC_APP_NAME || "AI Chat Platform",
    description:
      locale === "ar"
        ? "منصة دردشة احترافية متعددة المنصات بالذكاء الاصطناعي مع شخصيات متخصصة"
        : "Professional Multi-Platform AI Chat Platform with Specialized Personas",
    openGraph: {
      title: process.env.NEXT_PUBLIC_APP_NAME || "AI Chat Platform",
      description:
        locale === "ar"
          ? "منصة دردشة احترافية متعددة المنصات بالذكاء الاصطناعي"
          : "Professional Multi-Platform AI Chat Platform",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // التحقق من تسجيل الدخول - التوجيه إلى المحادثات
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      redirect(`/${locale}/chat`);
    }
  } catch {
    // متابعة عرض صفحة الهبوط
  }

  return <LandingContent locale={locale} />;
}

function LandingContent({ locale }: { locale: string }) {
  const isArabic = locale === "ar";

  const features = [
    {
      icon: "🌐",
      titleAr: "7 منصات ذكاء اصطناعي",
      titleEn: "7 AI Platforms",
      descAr:
        "تواصل مع OpenAI، Anthropic، Gemini، Groq، OpenRouter، Together AI، و Mistral من واجهة واحدة",
      descEn:
        "Connect with OpenAI, Anthropic, Gemini, Groq, OpenRouter, Together AI, and Mistral from one interface",
    },
    {
      icon: "🎭",
      titleAr: "شخصيات متخصصة",
      titleEn: "Specialized Personas",
      descAr:
        "استخدم شخصيات جاهزة مثل خبير LinkedIn وخبير العصف الذهني أو أنشئ شخصياتك المخصصة",
      descEn:
        "Use pre-built personas like LinkedIn Expert and Brainstorming Expert or create your own",
    },
    {
      icon: "🆓",
      titleAr: "مجاني للبدء",
      titleEn: "Free to Start",
      descAr:
        "ابدأ مجاناً مع مفاتيح API العامة أو أضف مفاتيحك الخاصة للاستخدام غير المحدود",
      descEn:
        "Start free with public API keys or add your own for unlimited usage",
    },
    {
      icon: "🌍",
      titleAr: "ثنائي اللغة",
      titleEn: "Bilingual",
      descAr:
        "واجهة كاملة بالعربية والإنجليزية مع دعم RTL/LTR التلقائي",
      descEn:
        "Full Arabic and English interface with automatic RTL/LTR support",
    },
    {
      icon: "📱",
      titleAr: "يعمل على جميع الأجهزة",
      titleEn: "Works on All Devices",
      descAr:
        "تصميم متجاوب يعمل بسلاسة على الهاتف والتابلت والكمبيوتر",
      descEn:
        "Responsive design that works seamlessly on mobile, tablet, and desktop",
    },
    {
      icon: "🔒",
      titleAr: "آمن ومشفّر",
      titleEn: "Secure & Encrypted",
      descAr:
        "جميع مفاتيح API مشفرة بتقنية AES-256 مع سياسات أمان صارمة",
      descEn:
        "All API keys encrypted with AES-256 and strict security policies",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* الخلفية المتحركة */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft delay-1000" />
        <div className="absolute top-1/2 start-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-soft delay-500" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10">
        {/* الشريط العلوي */}
        <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
              AI
            </div>
            <span className="text-xl font-bold text-gradient">
              {process.env.NEXT_PUBLIC_APP_NAME || "AI Chat Platform"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale === "ar" ? "en" : "ar"}`}
              className="px-3 py-1.5 text-sm rounded-lg border border-dark-500 text-dark-200 hover:bg-dark-700 transition-colors"
              aria-label={isArabic ? "Switch to English" : "التبديل للعربية"}
            >
              {isArabic ? "EN" : "عربي"}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="px-4 py-2 text-sm rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            >
              {isArabic ? "تسجيل الدخول" : "Sign In"}
            </Link>
            <Link
              href={`/${locale}/register`}
              className="px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-600 text-white transition-colors"
            >
              {isArabic ? "إنشاء حساب" : "Get Started"}
            </Link>
          </div>
        </header>

        {/* القسم الرئيسي (Hero) */}
        <section className="px-6 pt-16 pb-20 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {isArabic ? "مدعوم بأحدث نماذج الذكاء الاصطناعي" : "Powered by latest AI models"}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            {isArabic ? (
              <>
                <span className="text-gradient">دردش مع الذكاء الاصطناعي</span>
                <br />
                <span className="text-white">بطريقة احترافية</span>
              </>
            ) : (
              <>
                <span className="text-gradient">Chat with AI</span>
                <br />
                <span className="text-white">Like a Professional</span>
              </>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isArabic
              ? "منصة موحدة للتواصل مع 7 منصات ذكاء اصطناعي عبر شخصيات متخصصة. اكتب محتوى احترافي، ولّد أفكاراً إبداعية، وحسّن إنتاجيتك."
              : "A unified platform to chat with 7 AI platforms through specialized personas. Write professional content, generate creative ideas, and boost your productivity."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/register`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              {isArabic ? "ابدأ مجاناً" : "Start for Free"}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-dark-500 text-dark-200 hover:bg-dark-700 font-semibold text-lg transition-colors"
            >
              {isArabic ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>

          {/* شارات المنصات */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {[
              { emoji: "🤖", name: "OpenAI" },
              { emoji: "🧠", name: "Anthropic" },
              { emoji: "💎", name: "Gemini" },
              { emoji: "⚡", name: "Groq" },
              { emoji: "🌐", name: "OpenRouter" },
              { emoji: "🤝", name: "Together" },
              { emoji: "🌀", name: "Mistral" },
            ].map((platform) => (
              <span
                key={platform.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700/50 border border-dark-600 text-sm text-dark-200"
              >
                <span>{platform.emoji}</span>
                {platform.name}
              </span>
            ))}
          </div>
        </section>

        {/* قسم المميزات */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            {isArabic ? "لماذا تختار منصتنا؟" : "Why Choose Our Platform?"}
          </h2>
          <p className="text-dark-300 text-center mb-12 max-w-xl mx-auto">
            {isArabic
              ? "مميزات متقدمة تجعل تجربتك مع الذكاء الاصطناعي فريدة"
              : "Advanced features that make your AI experience unique"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-dark-800/50 border border-dark-600 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-dark-300 text-sm leading-relaxed">
                  {isArabic ? feature.descAr : feature.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* قسم الشخصيات */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {isArabic ? "شخصيات جاهزة للاستخدام" : "Ready-to-Use Personas"}
            </h2>
            <p className="text-dark-300 mb-8 max-w-lg mx-auto">
              {isArabic
                ? "ابدأ فوراً مع شخصيات متخصصة مُعدّة بعناية لتحقيق أفضل النتائج"
                : "Start immediately with carefully crafted specialized personas for best results"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { emoji: "💼", nameAr: "خبير LinkedIn", nameEn: "LinkedIn Expert", command: "/linkedin" },
                { emoji: "💡", nameAr: "عصف ذهني", nameEn: "Brainstorming", command: "/brainstorm" },
                { emoji: "🎯", nameAr: "هندسة برومبت", nameEn: "Prompt Engineering", command: "/prompt" },
                { emoji: "📧", nameAr: "كتابة بريد", nameEn: "Email Writing", command: "/email" },
              ].map((persona) => (
                <div
                  key={persona.command}
                  className="p-4 rounded-xl bg-dark-800/50 border border-dark-600"
                >
                  <span className="text-3xl mb-2 block">{persona.emoji}</span>
                  <p className="font-semibold text-sm mb-1">
                    {isArabic ? persona.nameAr : persona.nameEn}
                  </p>
                  <code className="text-xs text-primary">{persona.command}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم الدعوة للعمل (CTA) */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? "مستعد للبدء؟" : "Ready to Start?"}
          </h2>
          <p className="text-dark-300 mb-8">
            {isArabic
              ? "أنشئ حسابك مجاناً الآن وابدأ المحادثة مع أقوى نماذج الذكاء الاصطناعي"
              : "Create your free account now and start chatting with the most powerful AI models"}
          </p>
          <Link
            href={`/${locale}/register`}
            className="inline-flex px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            {isArabic ? "إنشاء حساب مجاني" : "Create Free Account"}
          </Link>
        </section>

        {/* الذيل */}
        <footer className="px-6 py-8 border-t border-dark-700 text-center text-dark-400 text-sm">
          <p>
            © {new Date().getFullYear()}{" "}
            {process.env.NEXT_PUBLIC_APP_NAME || "AI Chat Platform"}.{" "}
            {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </footer>
      </div>
    </div>
  );
}
