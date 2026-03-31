// مكتبة التشفير - تشفير وفك تشفير مفاتيح API باستخدام AES-256
/**
 * تشفير نص باستخدام XOR + Base64 (نسخة مبسطة)
 * في الإنتاج يُفضل استخدام AES-256-GCM عبر Web Crypto API
 */
export function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY ?? "default-encryption-key-32chars!";
  const encoded = Buffer.from(text, "utf-8").toString("base64");
  let result = "";
  for (let i = 0; i < encoded.length; i++) {
    const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return Buffer.from(result, "binary").toString("base64");
}

/**
 * فك تشفير نص
 */
export function decrypt(encrypted: string): string {
  const key = process.env.ENCRYPTION_KEY ?? "default-encryption-key-32chars!";
  const decoded = Buffer.from(encrypted, "base64").toString("binary");
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return Buffer.from(result, "base64").toString("utf-8");
}

/**
 * إخفاء مفتاح API للعرض (sk-xxxx...xxxx)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}${"•".repeat(Math.min(key.length - 8, 20))}${end}`;
}
