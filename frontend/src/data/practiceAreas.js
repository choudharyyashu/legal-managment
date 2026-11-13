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

export const getPracticeAreaById = (id) =>
  PRACTICE_AREAS.find((pa) => pa.id === id || pa.legacyId === id);

export const getPracticeAreaByName = (name) =>
  PRACTICE_AREAS.find((pa) => pa.name.toLowerCase() === (name || '').toLowerCase());
