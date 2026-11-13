/**
 * 9 Configurable Practice Areas for HEUGLY & BLUDWORTH
 * Note: Clearly labeled configurable sample values until client confirms final exact list.
 */
export const PRACTICE_AREAS = [
  { id: 'pa-1', name: 'Civil Litigation & Dispute Resolution', code: 'CIV', color: '#06244B' },
  { id: 'pa-2', name: 'Family Law & Domestic Relations', code: 'FAM', color: '#A4432B' },
  { id: 'pa-3', name: 'Criminal Defense & State Prosecution Response', code: 'CRIM', color: '#287A55' },
  { id: 'pa-4', name: 'Estate Planning, Wills & Trust Administration', code: 'EST', color: '#315F8C' },
  { id: 'pa-5', name: 'Commercial & Corporate Law', code: 'CORP', color: '#7B8890' },
  { id: 'pa-6', name: 'Real Estate, Water Rights & Land Use', code: 'PROP', color: '#A66A16' },
  { id: 'pa-7', name: 'Personal Injury & Wrongful Death', code: 'INJ', color: '#B42318' },
  { id: 'pa-8', name: 'Municipal, Administrative & Water Law', code: 'MUN', color: '#4A5568' },
  { id: 'pa-9', name: 'Labor, Employment & Workforce Compliance', code: 'LAB', color: '#2C5282' },
];

export const getPracticeAreaById = (id) => PRACTICE_AREAS.find((pa) => pa.id === id);
export const getPracticeAreaByName = (name) => PRACTICE_AREAS.find((pa) => pa.name === name);

