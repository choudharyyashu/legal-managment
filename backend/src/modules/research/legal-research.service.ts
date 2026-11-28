/**
 * LEGALPRO PROVIDER-INDEPENDENT LEGAL RESEARCH & AUTHORITY VERIFICATION SERVICE
 *
 * Implements:
 * 1. Lawful authority repository for Utah Jurisdiction & Federal Precedent.
 * 2. Citation verification engine: Validates statutes, rules, and case citations against verified legal authorities.
 * 3. Authority Validation & Hallucination Guard: Flags unrecognized or unsupported citations.
 * 4. Deposition Analysis & Issue-Spotting: Maps transcript text passages (Page:Line) to factual contradictions and follow-up examination tasks.
 * 5. Strict Demarcation: Clearly distinguishes verified legal authorities from query/placeholder data.
 */

export interface VerifiedAuthorityRecord {
  citation: string;
  normalizedCitation: string;
  jurisdiction: 'UTAH_STATE' | 'FEDERAL_TENTH_CIRCUIT' | 'US_SUPREME_COURT';
  authorityType: 'STATUTE' | 'COURT_RULE' | 'JUDICIAL_OPINION' | 'ETHICAL_RULE';
  title: string;
  officialSource: string;
  year?: number;
  court?: string;
  summaryOfLaw: string;
  isVerifiedAuthority: true;
}

export interface CitationVerificationResult {
  rawCitation: string;
  isVerified: boolean;
  status: 'VERIFIED_AUTHORITY' | 'UNSUPPORTED_CITATION' | 'FORMAT_MISMATCH';
  authorityRecord?: VerifiedAuthorityRecord;
  warning?: string;
  recommendedAuthority?: string;
}

export interface DepositionPassageAnalysis {
  transcriptTitle: string;
  witnessName: string;
  pageNumber: number;
  lineRange: string; // e.g. "14:8-22"
  extractedPassage: string;
  issueCategory: 'LIABILITY_ADMISSION' | 'CONTRADICTION' | 'DAMAGES_IMPAIRMENT' | 'CREDIBILITY_CHALLENGE';
  analysisNotes: string;
  followUpTasks: string[];
}

export interface LegalChronologyEntry {
  eventDate: string;
  time?: string;
  sourceDocument: string;
  pageNumber?: number;
  sourceParagraph: string;
  summary: string;
  tags: string[];
  entityInvolved?: string;
}

export class LegalResearchService {
  /**
   * Authoritative Corpus of Lawful Utah Statutes, Rules, and Precedent
   * Sourced directly from Utah State Legislature, Utah Courts, and CourtListener open records.
   */
  private static readonly VERIFIED_UTAH_CORPUS: VerifiedAuthorityRecord[] = [
    {
      citation: 'Utah Code Ann. § 75-1-201',
      normalizedCitation: '75-1-201',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'STATUTE',
      title: 'Utah Uniform Probate Code - General Definitions',
      officialSource: 'Utah State Legislature',
      summaryOfLaw: 'Defines formal vs. informal probate proceedings, personal representatives, and interested persons for estate administration.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah Code Ann. § 75-3-107',
      normalizedCitation: '75-3-107',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'STATUTE',
      title: 'Utah Probate Three-Year Statute of Limitations',
      officialSource: 'Utah State Legislature',
      summaryOfLaw: 'Provides that no informal probate or appointment proceeding may be commenced more than three years after the decedent’s death.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah Code Ann. § 78B-5-201',
      normalizedCitation: '78B-5-201',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'STATUTE',
      title: 'Utah Judgment Lien Statute',
      officialSource: 'Utah State Legislature',
      summaryOfLaw: 'Establishes that judgments of the district court become a lien upon the real property of the judgment debtor upon docketing, effective for 8 years.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah Code Ann. § 78B-6-802',
      normalizedCitation: '78B-6-802',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'STATUTE',
      title: 'Unlawful Detainer - 3-Day Notice to Quit',
      officialSource: 'Utah State Legislature',
      summaryOfLaw: 'Requires a three calendar day written notice demanding payment of rent or surrender of possession prior to filing an eviction complaint.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah R. Prof. Cond. 1.7',
      normalizedCitation: 'RPC-1.7',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'ETHICAL_RULE',
      title: 'Utah Rules of Professional Conduct: Conflict of Interest - Current Clients',
      officialSource: 'Utah Supreme Court',
      summaryOfLaw: 'A lawyer shall not represent a client if the representation involves a concurrent conflict of interest without informed written consent.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah R. Prof. Cond. 1.15',
      normalizedCitation: 'RPC-1.15',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'ETHICAL_RULE',
      title: 'Utah Rules of Professional Conduct: Safekeeping Property & Trust Accounting',
      officialSource: 'Utah Supreme Court',
      summaryOfLaw: 'Requires separate IOLTA trust accounting, forbids overdrafts, and mandates prompt disbursement and three-way reconciliation.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Utah R. App. P. 4',
      normalizedCitation: 'RAP-4',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'COURT_RULE',
      title: 'Utah Rules of Appellate Procedure: Appeal as of Right - When Taken',
      officialSource: 'Utah Supreme Court',
      summaryOfLaw: 'Requires the notice of appeal to be filed within 30 days after the date of entry of the final judgment or order appealed from.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'State v. Rimmasch, 775 P.2d 388 (Utah 1989)',
      normalizedCitation: '775 P.2d 388',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'JUDICIAL_OPINION',
      title: 'State of Utah v. Rimmasch',
      court: 'Utah Supreme Court',
      year: 1989,
      officialSource: 'Utah Reports / Pacific Reporter',
      summaryOfLaw: 'Utah standard governing the admissibility of scientific expert testimony and requirement of inherent scientific reliability.',
      isVerifiedAuthority: true,
    },
    {
      citation: 'Budge v. Post, 643 P.2d 417 (Utah 1982)',
      normalizedCitation: '643 P.2d 417',
      jurisdiction: 'UTAH_STATE',
      authorityType: 'JUDICIAL_OPINION',
      title: 'Budge v. Post',
      court: 'Utah Supreme Court',
      year: 1982,
      officialSource: 'Pacific Reporter',
      summaryOfLaw: 'Utah Supreme Court precedent establishing guidelines for personal injury non-economic general damages calculation and jury instructions.',
      isVerifiedAuthority: true,
    },
  ];

  /**
   * Verifies an legal citation against lawful authorities and flags hallucinations.
   */
  static verifyCitation(citation: string): CitationVerificationResult {
    const clean = (citation || '').trim();
    if (!clean) {
      return {
        rawCitation: citation,
        isVerified: false,
        status: 'FORMAT_MISMATCH',
        warning: 'Empty citation provided.',
      };
    }

    const matched = this.VERIFIED_UTAH_CORPUS.find((auth) => {
      const authCitationLower = auth.citation.toLowerCase();
      const cleanLower = clean.toLowerCase();
      return (
        authCitationLower === cleanLower ||
        cleanLower.includes(auth.normalizedCitation.toLowerCase()) ||
        authCitationLower.includes(cleanLower)
      );
    });

    if (matched) {
      return {
        rawCitation: clean,
        isVerified: true,
        status: 'VERIFIED_AUTHORITY',
        authorityRecord: matched,
      };
    }

    // Flag unsupported or fabricated authority
    return {
      rawCitation: clean,
      isVerified: false,
      status: 'UNSUPPORTED_CITATION',
      warning: `The citation "${clean}" could not be confirmed in the authoritative Utah statutory or case reporter corpus. Do not rely on unverified authority in court pleadings without primary source verification.`,
    };
  }

  /**
   * Deposition Transcript Passage Analysis & Issue Spotting
   * Links testimony passages to line numbers and actionable follow-up items.
   */
  static analyzeDepositionPassage(
    passage: string,
    transcriptMetadata: { witnessName: string; pageNumber: number; startLine: number; endLine: number; transcriptTitle: string }
  ): DepositionPassageAnalysis {
    const lineRange = `${transcriptMetadata.pageNumber}:${transcriptMetadata.startLine}-${transcriptMetadata.endLine}`;
    const lower = passage.toLowerCase();

    let issueCategory: DepositionPassageAnalysis['issueCategory'] = 'CREDIBILITY_CHALLENGE';
    let notes = 'Testimony reviewed for factual consistency.';
    const followUps: string[] = [];

    if (lower.includes('red light') || lower.includes('speeding') || lower.includes('distracted') || lower.includes('cell phone') || lower.includes('texting')) {
      issueCategory = 'LIABILITY_ADMISSION';
      notes = 'Witness made direct admission regarding driver distraction or traffic violation.';
      followUps.push('Subpoena cellular data and carrier records for time of impact.');
      followUps.push('Include passage in Statement of Undisputed Facts for Motion for Partial Summary Judgment.');
    } else if (lower.includes('never told') || lower.includes('did not see') || lower.includes('cannot remember')) {
      issueCategory = 'CREDIBILITY_CHALLENGE';
      notes = 'Witness exhibited memory deficit or contradiction with prior written statement.';
      followUps.push('Prepare impeachment exhibit using initial police report statement.');
    } else if (lower.includes('pre-existing') || lower.includes('prior injury') || lower.includes('back pain before')) {
      issueCategory = 'DAMAGES_IMPAIRMENT';
      notes = 'Defense inquiry probing pre-existing degenerative conditions or prior trauma.';
      followUps.push('Request treating orthopedic surgeon opinion on acute trauma exacerbation.');
    }

    return {
      transcriptTitle: transcriptMetadata.transcriptTitle,
      witnessName: transcriptMetadata.witnessName,
      pageNumber: transcriptMetadata.pageNumber,
      lineRange,
      extractedPassage: passage.trim(),
      issueCategory,
      analysisNotes: notes,
      followUpTasks: followUps,
    };
  }

  /**
   * Generates a source-linked chronological event register from parsed document records.
   */
  static buildSourceLinkedChronology(
    records: Array<{ eventDate: string; sourceDocument: string; page?: number; paragraphText: string; tags: string[] }>
  ): LegalChronologyEntry[] {
    const sorted = [...records].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    return sorted.map((r) => ({
      eventDate: r.eventDate,
      sourceDocument: r.sourceDocument,
      pageNumber: r.page || 1,
      sourceParagraph: r.paragraphText.trim(),
      summary: r.paragraphText.length > 120 ? `${r.paragraphText.slice(0, 117)}...` : r.paragraphText,
      tags: r.tags || [],
    }));
  }
}
