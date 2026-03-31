// عارض Markdown: يحول النص إلى HTML منسق مع تمييز الأكواد
'use client';

import { memo, type ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/utils/cn';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn('text-sm leading-relaxed break-words', className)}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // العناوين
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900 dark:text-gray-100">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-3 mb-1.5 text-gray-900 dark:text-gray-100">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold mt-2 mb-1 text-gray-900 dark:text-gray-100">{children}</h4>
        ),

        // الفقرات
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),

        // النص الغامق والمائل
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),

        // القوائم
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-0.5 ms-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-0.5 ms-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),

        // الروابط
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-400 underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),

        // الاقتباسات
        blockquote: ({ children }) => (
          <blockquote className="border-s-4 border-primary-500/50 ps-3 my-2 text-gray-600 dark:text-gray-400 italic">
            {children}
          </blockquote>
        ),

        // الجداول
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-dark-600">
            <table className="min-w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50 dark:bg-dark-700">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{children}</td>
        ),

        // الخط الأفقي
        hr: () => (
          <hr className="my-3 border-gray-200 dark:border-dark-600" />
        ),

        // الكود المضمن
        code: ({ className: codeClassName, children, ...props }) => {
          const match = /language-(\w+)/.exec(codeClassName ?? '');
          const isInline = !match && !codeClassName;

          if (isInline) {
            return (
              <code
                className="rounded bg-gray-200 dark:bg-dark-700 px-1.5 py-0.5 text-xs font-mono text-primary-600 dark:text-primary-400"
                {...props}
              >
                {children}
              </code>
            );
          }

          const language = match ? match[1] ?? 'text' : 'text';
          const codeContent = String(children).replace(/\n$/, '');

          return (
            <CodeBlock
              code={codeContent}
              language={language}
            />
          );
        },

        // الصور
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt ?? ''}
            className="max-w-full rounded-lg my-2"
            loading="lazy"
          />
        ),

        // pre wrapper — we handle code blocks ourselves
        pre: ({ children }) => (
          <div className="my-2">{children}</div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
