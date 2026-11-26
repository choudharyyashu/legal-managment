/**
 * Canonical practice area normalization between legacy frontend IDs (pa-1..pa-9, pa-lit, pa-bankruptcy, etc.)
 * and live MySQL `practice_areas` primary keys (`pa-civ`, `pa-fam`, `pa-crim`, `pa-prob`, `pa-bk`, `pa-evict`, `pa-pi`, `pa-imm`, `pa-app`).
 */
const PRACTICE_AREA_ALIAS_MAP: Record<string, string> = {
  'pa-civ': 'pa-civ',
  'pa-1': 'pa-civ',
  'pa-lit': 'pa-civ',
  'pa-litigation': 'pa-civ',
  civil: 'pa-civ',
  litigation: 'pa-civ',
  'pa-fam': 'pa-fam',
  'pa-2': 'pa-fam',
  'pa-family': 'pa-fam',
  family: 'pa-fam',
  'pa-crim': 'pa-crim',
  'pa-3': 'pa-crim',
  'pa-criminal': 'pa-crim',
  criminal: 'pa-crim',
  'pa-prob': 'pa-prob',
  'pa-4': 'pa-prob',
  'pa-probate': 'pa-prob',
  probate: 'pa-prob',
  'pa-bk': 'pa-bk',
  'pa-5': 'pa-bk',
  'pa-bankruptcy': 'pa-bk',
  bankruptcy: 'pa-bk',
  'pa-evict': 'pa-evict',
  'pa-6': 'pa-evict',
  'pa-eviction': 'pa-evict',
  'pa-evictions': 'pa-evict',
  eviction: 'pa-evict',
  'pa-pi': 'pa-pi',
  'pa-7': 'pa-pi',
  pi: 'pa-pi',
  personal_injury: 'pa-pi',
  'personal injury': 'pa-pi',
  'pa-imm': 'pa-imm',
  'pa-8': 'pa-imm',
  'pa-immigration': 'pa-imm',
  immigration: 'pa-imm',
  'pa-app': 'pa-app',
  'pa-9': 'pa-app',
  'pa-appeals': 'pa-app',
  appeals: 'pa-app',
};

export function normalizePracticeAreaId(practiceAreaId?: string | null): string | null | undefined {
  if (practiceAreaId === undefined) return undefined;
  if (practiceAreaId === null) return null;
  const trimmed = String(practiceAreaId).trim();
  if (!trimmed) return null;
  return PRACTICE_AREA_ALIAS_MAP[trimmed.toLowerCase()] || trimmed;
}
