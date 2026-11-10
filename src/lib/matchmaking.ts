export const AVAILABLE_TOPICS = [
  'Gaming',
  'Anime & Manga',
  'Tech & AI',
  'Music & Bands',
  'Philosophy',
  'Travel Stories',
  'Creative Writing',
  'Movies & Cinema',
  'Late Night Chill',
  'Science & Space',
  'Fitness & Sports',
  'Language Exchange',
];

export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'any', label: 'Any Language (Global)', flag: '🌐' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', label: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', label: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'pt', label: 'Portuguese (Português)', flag: '🇧🇷' },
  { code: 'it', label: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'hi', label: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'zh', label: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'ko', label: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'ru', label: 'Russian (Русский)', flag: '🇷🇺' },
];

export function getLanguageLabel(code?: string): string {
  if (!code || code === 'any') return 'Any Language';
  const found = AVAILABLE_LANGUAGES.find((l) => l.code === code);
  return found ? `${found.flag} ${found.label}` : code.toUpperCase();
}

export function getLanguageFlag(code?: string): string {
  if (!code || code === 'any') return '🌐';
  const found = AVAILABLE_LANGUAGES.find((l) => l.code === code);
  return found ? found.flag : '🌐';
}
export function calculateCompatibilityScore(
  userInterests: string[],
  peerInterests: string[],
  userLang?: string,
  peerLang?: string
): {
  score: number;
  shared: string[];
  sameLanguage: boolean;
} {
  const sameLanguage = Boolean(
    userLang &&
    peerLang &&
    userLang !== 'any' &&
    peerLang !== 'any' &&
    userLang.toLowerCase() === peerLang.toLowerCase()
  );

  let baseline = sameLanguage ? 60 : 45;

  if (!userInterests.length || !peerInterests.length) {
    return { score: sameLanguage ? 80 : 65, shared: [], sameLanguage };
  }

  const setA = new Set(userInterests.map((t) => t.toLowerCase()));
  const shared = peerInterests.filter((t) => setA.has(t.toLowerCase()));
  const unionCount = new Set([...userInterests, ...peerInterests]).size;
  const jaccard = unionCount > 0 ? shared.length / unionCount : 0;

  const calculated = Math.min(99, Math.round(baseline + jaccard * 35 + (shared.length > 0 ? 8 : 0)));
  return {
    score: Math.min(99, Math.max(50, calculated)),
    shared,
    sameLanguage,
  };
}
