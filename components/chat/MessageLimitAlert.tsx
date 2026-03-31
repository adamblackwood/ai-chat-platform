// تنبيه حد الرسائل: حوار يظهر عند بلوغ 15 رسالة مع خيارات
'use client';

import { memo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Plus, Download, Trash2, FileText, FileCode, FileDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { MESSAGE_LIMIT_PER_CHAT } from '@/utils/constants';

interface MessageLimitAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat: () => void;
  onExport?: (format: 'pdf' | 'json' | 'markdown') => void;
  onDelete?: () => void;
  onKeep?: () => void;
}

export const MessageLimitAlert = memo(function MessageLimitAlert({
  open,
  onOpenChange,
  onNewChat,
  onExport,
  onDelete,
  onKeep,
}: MessageLimitAlertProps) {
  const t = useTranslations('chat');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <DialogTitle>{t('message_limit_title')}</DialogTitle>
              <DialogDescription>
                {t('message_limit_body', { limit: MESSAGE_LIMIT_PER_CHAT.toString() })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-4">
          {/* خيارات التصدير */}
          {onExport && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('export_conversation')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('pdf')}
                  className="gap-1.5"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('json')}
                  className="gap-1.5"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('markdown')}
                  className="gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Markdown
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {onKeep && (
            <Button variant="outline" onClick={onKeep}>
              {t('keep_conversation')}
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete} className="gap-1.5">
              <Trash2 className="h-4 w-4" />
              {t('delete_conversation')}
            </Button>
          )}
          <Button onClick={onNewChat} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t('start_new')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
