// صفحة الإعدادات: تبويبات الملف الشخصي ومفاتيح API واللغة والمظهر والتصدير
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Settings, User, Key, Globe, Moon, Download } from 'lucide-react';
import { cn } from '@/utils/cn';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useChat } from '@/hooks/useChat';
import { useFolders } from '@/hooks/useFolders';
import { useUIStore } from '@/stores/uiStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';
import { LanguageSwitch } from '@/components/settings/LanguageSwitch';
import { ThemeSwitch } from '@/components/settings/ThemeSwitch';
import { ExportImport } from '@/components/settings/ExportImport';

export default function SettingsPage() {
  return (
    <RouteGuard>
      <SettingsContent />
    </RouteGuard>
  );
}

function SettingsContent() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';
  const { sidebarOpen } = useUIStore();

  const [activeTab, setActiveTab] = useState('profile');

  const {
    conversations, isLoadingConversations,
    createConversation, deleteConversation, updateConversation,
  } = useChat();
  const { folders, createFolder, deleteFolder, updateFolder } = useFolders();

  const tabs = [
    { value: 'profile', label: t('profile_tab'), icon: User },
    { value: 'api-keys', label: t('api_keys_tab'), icon: Key },
    { value: 'language', label: t('language_tab'), icon: Globe },
    { value: 'theme', label: t('theme_tab'), icon: Moon },
    { value: 'export', label: t('export_tab'), icon: Download },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-dark-950">
      <Sidebar
        conversations={conversations}
        folders={folders}
        onNewChat={async () => {
          const conv = await createConversation({ platform: 'openrouter', model: 'default' });
          if (conv) router.push(`/${locale}/chat/${conv.id}`);
        }}
        onSelectConversation={(id) => router.push(`/${locale}/chat/${id}`)}
        onDeleteConversation={deleteConversation}
        onRenameConversation={(id, title) => updateConversation(id, { title })}
        onMoveConversation={(id, folderId) => updateConversation(id, { folder_id: folderId })}
        onCreateFolder={(name) => createFolder(name, 'custom')}
        onDeleteFolder={deleteFolder}
        onRenameFolder={updateFolder}
        isLoadingConversations={isLoadingConversations}
      />

      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 overflow-hidden',
          sidebarOpen ? (isRTL ? 'lg:me-sidebar' : 'lg:ms-sidebar') : ''
        )}
      >
        {/* شريط علوي */}
        <div className="h-14 shrink-0 border-b border-gray-200 dark:border-dark-700 flex items-center px-4 gap-2">
          <Settings className="h-5 w-5 text-primary-500" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-gray-200 dark:border-dark-700">
              <CardContent className="p-4 md:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    {tabs.map(({ value, label, icon: Icon }) => (
                      <TabsTrigger key={value} value={value}>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 hidden sm:block" />
                          <span>{label}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="profile">
                    <ProfileSettings />
                  </TabsContent>

                  <TabsContent value="api-keys">
                    <ApiKeyManager />
                  </TabsContent>

                  <TabsContent value="language">
                    <LanguageSwitch />
                  </TabsContent>

                  <TabsContent value="theme">
                    <ThemeSwitch />
                  </TabsContent>

                  <TabsContent value="export">
                    <ExportImport />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
