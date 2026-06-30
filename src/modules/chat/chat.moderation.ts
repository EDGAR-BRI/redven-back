const PROFANITY_LIST = [
  'mierda', 'puto', 'puta', 'joder', 'coño', 'pendejo', 'pendeja',
  'cabron', 'verga', 'marico', 'maricon', 'mamawebo', 'mamahuevo',
  'hijo de puta', 'hdp', 'perra', 'imbecil', 'idiota', 'estupido',
  'tonto', 'mamon', 'chingar', 'chingado', 'nazi', 'racista', 'asesino',
];

const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g',
  '@': 'a', '$': 's', '!': 'i', '+': 't',
};

export function normalizeForProfanityCheck(text: string): string {
  let result = text.toLowerCase();
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[0-9@$!+]/g, (ch) => LEET_MAP[ch] || ch);
  result = result.replace(/([a-z])[\s.\-_*]+([a-z])/g, '$1$2');
  result = result.replace(/([a-z])[\s.\-_*]+([a-z])/g, '$1$2');
  result = result.replace(/(.)\1{2,}/g, '$1');
  return result;
}

export function isOffensive(rawText: string): boolean {
  if (!rawText || rawText.trim().length === 0) return false;
  const normalized = normalizeForProfanityCheck(rawText);
  for (const word of PROFANITY_LIST) {
    const normalizedWord = normalizeForProfanityCheck(word);
    if (normalized.includes(normalizedWord)) return true;
  }
  return false;
}

export const BLOCK_MESSAGE = 'Tu mensaje contiene lenguaje ofensivo. Por favor, mantén un lenguaje cordial.';

export interface ModerationResult {
  blocked: boolean;
  reason?: string;
  content?: string;
}

export function moderateMessage(content: string): ModerationResult {
  if (isOffensive(content)) {
    return { blocked: true, reason: BLOCK_MESSAGE };
  }
  return { blocked: false, content };
}
