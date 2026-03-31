// التخطيط الجذري: يغلف جميع الصفحات بإعدادات اللغة والخطوط والمظهر
// يدعم العربية (RTL) والإنجليزية (LTR) مع خطوط Cairo و Inter
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Cairo, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import '@/app/globals.css';

/**
 * خط Cairo للعربية
 */
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

/**
 * خط Inter للإنجليزية
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * اللغات المدعومة
 */
const locales = ['ar', 'en'] as const;

/**
 * البيانات الوصفية للتطبيق
 */
export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat Platform',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat Platform'}`,
  },
  description: 'Professional Multi-Platform AI Chat Platform with Personas - منصة دردشة احترافية متعددة المنصات بالذكاء الاصطناعي',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat Platform',
    description: 'Professional Multi-Platform AI Chat Platform with Personas',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
    siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat Platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat Platform',
    description: 'Professional Multi-Platform AI Chat Platform with Personas',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * إعدادات العرض
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6c63ff',
};

/**
 * واجهة خصائص التخطيط
 */
interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

/**
 * توليد المسارات الثابتة للغات
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * التخطيط الجذري للتطبيق
 * يتعامل مع اللغة والاتجاه والخطوط والمظهر
 */
export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // التحقق من صحة اللغة
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // تحميل رسائل الترجمة
  const messages = await getMessages();

  // تحديد الاتجاه بناءً على اللغة
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // تحديد الخط الرئيسي بناءً على اللغة
  const fontVariable = locale === 'ar' ? cairo.variable : inter.variable;
  const fontClass = locale === 'ar' ? 'font-sans-arabic' : 'font-sans';

  return (
    <html
      lang={locale}
      dir={direction}
      className={`dark ${cairo.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${fontClass} min-h-screen bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-100 antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
