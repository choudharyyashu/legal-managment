// Utah State Statutory Bankruptcy Exemptions
// Reference: Utah Code § 78B-5-501 et seq. & 11 U.S.C. § 522 (DEMO / SIMULATED)

export const UTAH_EXEMPTION_RULES = [
  {
    id: 'homestead',
    name: 'Utah Homestead Exemption (Primary Residence)',
    statute: 'Utah Code Ann. § 78B-5-501',
    singleLimit: 43300,
    jointLimit: 86600,
    description: 'Protects equity in the debtor\'s primary personal residence (mobile home, manufactured home, or real estate). Does not apply to secondary vacation properties or rental investments.',
    category: 'Real Property'
  },
  {
    id: 'motor-vehicle',
    name: 'Motor Vehicle Exemption',
    statute: 'Utah Code Ann. § 78B-5-505(1)(b)',
    singleLimit: 3000,
    jointLimit: 6000,
    description: 'Protects equity in one motor vehicle per debtor used primarily for personal or business transportation.',
    category: 'Vehicles'
  },
  {
    id: 'tools-of-trade',
    name: 'Tools of the Trade / Professional Equipment',
    statute: 'Utah Code Ann. § 78B-5-505(1)(e)',
    singleLimit: 5000,
    jointLimit: 10000,
    description: 'Implements protection for tools, professional implements, books, and equipment used in the debtor\'s trade or business.',
    category: 'Personal Property'
  },
  {
    id: 'household-furnishings',
    name: 'Household Goods, Furniture & Appliances',
    statute: 'Utah Code Ann. § 78B-5-505(1)(a)',
    singleLimit: 1000,
    jointLimit: 2000,
    description: 'Specific limit per item or aggregate categories for domestic furnishings reasonably necessary for one household.',
    category: 'Personal Property'
  },
  {
    id: 'retirement-accounts',
    name: 'Qualified Retirement Accounts (ERISA, 401k, 403b, IRA)',
    statute: '11 U.S.C. § 522(b)(3)(C) & Utah Code § 78B-5-505',
    singleLimit: 999999999, // Unlimited statutory protection
    jointLimit: 999999999,
    description: 'Fully protected without dollar limitation under Federal Bankruptcy Code and Utah state law.',
    category: 'Financial Assets'
  }
];

export const calculateExemptionEquity = ({ fairMarketValue, securedLiens, exemptionCategory, isJointDebtor }) => {
  const fmv = Number(fairMarketValue) || 0;
  const liens = Number(securedLiens) || 0;
  const rawEquity = Math.max(0, fmv - liens);

  const rule = UTAH_EXEMPTION_RULES.find(r => r.id === exemptionCategory) || UTAH_EXEMPTION_RULES[0];
  const maxExemption = isJointDebtor ? rule.jointLimit : rule.singleLimit;
  const appliedExemption = Math.min(rawEquity, maxExemption);
  const unexemptExposedEquity = Math.max(0, rawEquity - appliedExemption);

  return {
    fairMarketValue: fmv,
    securedLiens: liens,
    rawEquity,
    ruleName: rule.name,
    statute: rule.statute,
    maxExemptionAvailable: maxExemption,
    appliedExemption,
    unexemptExposedEquity,
    isFullyProtected: unexemptExposedEquity === 0
  };
};

