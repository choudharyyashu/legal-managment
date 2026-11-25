/**
 * 9 Approved Practice Areas for HEUGLY & BLUDWORTH (Utah Jurisdiction)
 * Matches the canonical practice_areas table seeded in MySQL InnoDB.
 */
export const PRACTICE_AREAS = [
  { id: 'pa-civ', legacyId: 'pa-1', name: 'Civil/Commercial Litigation', code: 'CIV', color: '#06244B' },
  { id: 'pa-fam', legacyId: 'pa-2', name: 'Family Law', code: 'FAM', color: '#A4432B' },
  { id: 'pa-crim', legacyId: 'pa-3', name: 'Criminal Defense', code: 'CRIM', color: '#287A55' },
  { id: 'pa-prob', legacyId: 'pa-4', name: 'Probate', code: 'PROB', color: '#8b5cf6' },
  { id: 'pa-bk', legacyId: 'pa-5', name: 'Bankruptcy', code: 'BK', color: '#0284c7' },
  { id: 'pa-evict', legacyId: 'pa-6', name: 'Landlord-Tenant/Evictions', code: 'EVICT', color: '#A66A16' },
  { id: 'pa-pi', legacyId: 'pa-7', name: 'Personal Injury', code: 'PI', color: '#B42318' },
  { id: 'pa-imm', legacyId: 'pa-8', name: 'Immigration', code: 'IMM', color: '#059669' },
  { id: 'pa-app', legacyId: 'pa-9', name: 'Appeals', code: 'APP', color: '#4f46e5' },
];

export const PRACTICE_AREA_ALIAS_MAP = {
  'pa-civ': 'pa-civ',
  'pa-1': 'pa-civ',
  'pa-lit': 'pa-civ',
  'pa-litigation': 'pa-civ',
  'pa-fam': 'pa-fam',
  'pa-2': 'pa-fam',
  'pa-family': 'pa-fam',
  'pa-crim': 'pa-crim',
  'pa-3': 'pa-crim',
  'pa-criminal': 'pa-crim',
  'pa-prob': 'pa-prob',
  'pa-4': 'pa-prob',
  'pa-probate': 'pa-prob',
  'pa-bk': 'pa-bk',
  'pa-5': 'pa-bk',
  'pa-bankruptcy': 'pa-bk',
  'pa-evict': 'pa-evict',
  'pa-6': 'pa-evict',
  'pa-eviction': 'pa-evict',
  'pa-evictions': 'pa-evict',
  'pa-pi': 'pa-pi',
  'pa-7': 'pa-pi',
  'pa-imm': 'pa-imm',
  'pa-8': 'pa-imm',
  'pa-immigration': 'pa-imm',
  'pa-app': 'pa-app',
  'pa-9': 'pa-app',
  'pa-appeals': 'pa-app',
};

export const normalizePracticeAreaId = (id) => {
  if (!id) return null;
  const key = String(id).trim().toLowerCase();
  return PRACTICE_AREA_ALIAS_MAP[key] || id;
};

export const matchesPracticeArea = (practiceAreaId, targetCanonicalId) => {
  if (!practiceAreaId || !targetCanonicalId) return false;
  return normalizePracticeAreaId(practiceAreaId) === normalizePracticeAreaId(targetCanonicalId);
};

export const getPracticeAreaById = (id) => {
  const canonical = normalizePracticeAreaId(id);
  return PRACTICE_AREAS.find((pa) => pa.id === canonical || pa.id === id || pa.legacyId === id);
};

export const getPracticeAreaByName = (name) =>
  PRACTICE_AREAS.find((pa) => pa.name.toLowerCase() === (name || '').toLowerCase());
