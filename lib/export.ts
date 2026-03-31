// مكتبة التصدير: توليد PDF و TXT و Markdown من المحادثات
import type { Conversation, Message } from '@/types/chat';

/**
 * توليد ملف PDF ملون من محادثة
 */
export async function generatePDF(
  conversation: Conversation,
  messages: Message[]
): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // العنوان
  doc.setFontSize(18);
  doc.setTextColor(108, 99, 255); // primary
  doc.text(conversation.title, margin, y);
  y += 10;

  // المعلومات
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Platform: ${conversation.platform} | Model: ${conversation.model} | Date: ${new Date(conversation.created_at).toLocaleDateString()}`,
    margin,
    y
  );
  y += 8;

  // خط فاصل
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // الرسائل
  for (const msg of messages) {
    if (msg.role === 'system') continue;

    const isUser = msg.role === 'user';
    const label = isUser ? '👤 User' : '🤖 AI';
    const content = msg.content;

    // التحقق من الحاجة لصفحة جديدة
    const lines = doc.splitTextToSize(content, contentWidth - 10);
    const blockHeight = (lines as string[]).length * 5 + 12;

    if (y + blockHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // خلفية الرسالة
    if (isUser) {
      doc.setFillColor(108, 99, 255);
      doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'F');
      doc.setTextColor(50, 50, 50);
    }

    // التسمية
    doc.setFontSize(8);
    doc.text(label, margin + 5, y + 5);

    // المحتوى
    doc.setFontSize(10);
    doc.text(lines as string[], margin + 5, y + 10);

    y += blockHeight + 4;
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

/**
 * توليد ملف نصي من محادثة
 */
export function generateTXT(
  conversation: Conversation,
  messages: Message[]
): string {
  const lines: string[] = [];

  lines.push(`Title: ${conversation.title}`);
  lines.push(`Platform: ${conversation.platform}`);
  lines.push(`Model: ${conversation.model}`);
  lines.push(`Date: ${new Date(conversation.created_at).toLocaleString()}`);
  lines.push('='.repeat(60));
  lines.push('');

  for (const msg of messages) {
    if (msg.role === 'system') continue;

    const prefix = msg.role === 'user' ? 'User:' : 'AI:';
    lines.push(prefix);
    lines.push(msg.content);
    lines.push('');
    lines.push('-'.repeat(40));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * توليد ملف Markdown من محادثة
 */
export function generateMarkdown(
  conversation: Conversation,
  messages: Message[]
): string {
  const lines: string[] = [];

  lines.push(`# ${conversation.title}`);
  lines.push('');
  lines.push(`> **Platform:** ${conversation.platform} | **Model:** ${conversation.model}`);
  lines.push(`> **Date:** ${new Date(conversation.created_at).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const msg of messages) {
    if (msg.role === 'system') continue;

    if (msg.role === 'user') {
      lines.push('### 👤 User');
    } else {
      lines.push('### 🤖 AI');
      if (msg.persona_name) {
        lines.push(`*Persona: ${msg.persona_name}*`);
      }
    }

    lines.push('');
    lines.push(msg.content);
    lines.push('');

    if (msg.role === 'assistant') {
      const meta: string[] = [];
      if (msg.tokens_used > 0) meta.push(`Tokens: ${msg.tokens_used}`);
      if (msg.response_time_ms) meta.push(`Time: ${msg.response_time_ms}ms`);
      if (msg.model) meta.push(`Model: ${msg.model}`);
      if (meta.length > 0) {
        lines.push(`> ${meta.join(' | ')}`);
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * توليد اسم ملف التصدير
 */
export function generateExportFilename(
  title: string,
  extension: string
): string {
  const sanitized = title
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40);

  const date = new Date().toISOString().split('T')[0];

  return `${sanitized}_${date}.${extension}`;
}
