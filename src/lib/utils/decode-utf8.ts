/**
 * Decodes HTML entities in a string
 * Handles cases like &#039; -> ' and &amp; -> &
 */
function decodeHTMLEntities(str: string): string {
  if (!str) return str;
  
  // Common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
  };
  
  // Replace named and numeric entities
  let decoded = str;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.split(entity).join(char);
  }
  
  // Handle numeric entities (&#NNN;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  
  // Handle hex entities (&#xHHH;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
}

/**
 * Fixes common mojibake patterns (UTF-8 interpreted as Windows-1252)
 */
function fixMojibake(str: string): string {
  if (!str) return str;
  
  // Common mojibake patterns: UTF-8 bytes interpreted as Windows-1252
  // Using explicit character codes to avoid encoding issues in source file
  const mojibakePatterns: Array<[string, string]> = [
    // RIGHT SINGLE QUOTATION MARK (') - â€™
    [String.fromCharCode(0xE2, 0x80, 0x99), '\u2019'],
    // LEFT SINGLE QUOTATION MARK (') - â€˜
    [String.fromCharCode(0xE2, 0x80, 0x98), '\u2018'],
    // LEFT DOUBLE QUOTATION MARK (") - â€œ
    [String.fromCharCode(0xE2, 0x80, 0x9C), '\u201C'],
    // RIGHT DOUBLE QUOTATION MARK (") - â€
    [String.fromCharCode(0xE2, 0x80, 0x9D), '\u201D'],
    // EN DASH (–) - â€"
    [String.fromCharCode(0xE2, 0x80, 0x93), '\u2013'],
    // EM DASH (—) - â€"
    [String.fromCharCode(0xE2, 0x80, 0x94), '\u2014'],
    // BULLET (•) - â€¢
    [String.fromCharCode(0xE2, 0x80, 0xA2), '\u2022'],
    // HORIZONTAL ELLIPSIS (…) - â€¦
    [String.fromCharCode(0xE2, 0x80, 0xA6), '\u2026'],
    // Common accented characters
    ['Ã©', 'é'],
    ['Ã¨', 'è'],
    ['Ã ', 'à'],
    ['Ã¢', 'â'],
    ['Ã®', 'î'],
    ['Ã´', 'ô'],
    ['Ã»', 'û'],
    ['Ã§', 'ç'],
    ['Ã‰', 'É'],
    ['Ã¼', 'ü'],
    ['Ã¶', 'ö'],
    ['Ã¤', 'ä'],
    ['Ã±', 'ñ'],
    ['Ã­', 'í'],
  ];
  
  let fixed = str;
  for (const [mojibake, correct] of mojibakePatterns) {
    fixed = fixed.split(mojibake).join(correct);
  }
  
  return fixed;
}

/**
 * Fixes incorrectly encoded UTF-8 strings
 * Handles cases where UTF-8 was double-encoded or misinterpreted
 */
export function decodeUTF8(str: string): string {
  if (!str) return str;
  
  // First decode HTML entities
  let decoded = decodeHTMLEntities(str);
  
  // Fix common mojibake patterns
  decoded = fixMojibake(decoded);
  
  try {
    // Try to fix double-encoded UTF-8 (common issue when data goes through multiple encoding steps)
    // This handles cases like "MÃ©ridien" -> "Méridien"
    decoded = decodeURIComponent(escape(decoded));
  } catch {
    // If that fails, try using TextDecoder
    try {
      const bytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
      decoded = new TextDecoder('utf-8').decode(bytes);
    } catch {
      // Return decoded string if UTF-8 decoding fails
    }
  }
  
  return decoded;
}

/**
 * Recursively decode all string values in an object
 */
export function decodeObjectStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return decodeUTF8(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => decodeObjectStrings(item)) as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const decoded: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      decoded[key] = decodeObjectStrings(value);
    }
    return decoded as T;
  }
  
  return obj;
}
