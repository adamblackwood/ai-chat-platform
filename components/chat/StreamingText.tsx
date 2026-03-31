// نص البث المباشر: يعرض النص المتدفق مع مؤشر وامض
'use client';

import { memo } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface StreamingTextProps {
  content: string;
}

export const StreamingText = memo(function StreamingText({ content }: StreamingTextProps) {
  if (!content) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MarkdownRenderer content={content} />
      {/* مؤشر الكتابة الوامض */}
      <span className="inline-block w-2 h-4 bg-primary-500 animate-blink align-middle ms-0.5 -mb-0.5 rounded-sm" />
    </div>
  );
});
