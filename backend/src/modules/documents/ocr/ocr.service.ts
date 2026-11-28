import path from 'path';
import PizZip from 'pizzip';

export interface ExtractedLegalEntities {
  dates: string[];
  monetaryAmounts: string[];
  emails: string[];
  phoneNumbers: string[];
  caseOrDocketNumbers: string[];
  claimOrPolicyNumbers: string[];
  summary: string;
}

export interface OcrExtractionResult {
  text: string;
  method: 'TEXT_DECODE' | 'DOCX_XML' | 'PDF_TEXT' | 'TESSERACT_OCR' | 'FALLBACK';
  wordCount: number;
  characterCount: number;
  pageCount: number | null;
  confidence: number | null;
  extractedFields: ExtractedLegalEntities;
  warnings: string[];
}

/**
 * OCR & Document Text Extraction Service
 * Extracts searchable full text and structured legal entities from PDF, DOCX, TXT, and Image files.
 */
export class OcrService {
  static extractStructuredEntities(text: string): ExtractedLegalEntities {
    const clean = (text || '').trim();
    if (!clean) {
      return {
        dates: [],
        monetaryAmounts: [],
        emails: [],
        phoneNumbers: [],
        caseOrDocketNumbers: [],
        claimOrPolicyNumbers: [],
        summary: '',
      };
    }

    const unique = (matches: RegExpMatchArray | null, max = 15): string[] => {
      if (!matches) return [];
      return Array.from(new Set(matches.map((m) => m.trim()))).slice(0, max);
    };

    const dateRegex = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/gi;
    const moneyRegex = /\$[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const phoneRegex = /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
    const docketRegex = /\b(?:Case|Docket|Civil|Matter|Cause)\s*(?:No\.?|Number|#)?\s*[:#]?\s*[A-Z0-9\-]{4,24}\b/gi;
    const claimRegex = /\b(?:Claim|Policy)\s*(?:No\.?|Number|#)?\s*[:#]?\s*[A-Z0-9\-]{4,24}\b/gi;

    const collapsed = clean.replace(/\s+/g, ' ');
    const summary = collapsed.length > 300 ? `${collapsed.slice(0, 297)}...` : collapsed;

    return {
      dates: unique(clean.match(dateRegex)),
      monetaryAmounts: unique(clean.match(moneyRegex)),
      emails: unique(clean.match(emailRegex)),
      phoneNumbers: unique(clean.match(phoneRegex)),
      caseOrDocketNumbers: unique(clean.match(docketRegex)),
      claimOrPolicyNumbers: unique(clean.match(claimRegex)),
      summary,
    };
  }

  static extractTextFromDocxBuffer(buffer: Buffer): string {
    const zip = new PizZip(buffer) as any;
    const xmlFiles = Object.keys(zip.files || {}).filter((name) =>
      /^word\/(document|header\d*|footer\d*)\.xml$/i.test(name)
    );

    const paragraphs: string[] = [];
    for (const fileName of xmlFiles) {
      const xml = zip.file(fileName)?.asText() || '';
      const pMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
      for (const pXml of pMatches) {
        const textParts = Array.from(pXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) as Iterable<RegExpMatchArray>).map((m) =>
          m[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
        );
        const line = textParts.join('').trim();
        if (line) paragraphs.push(line);
      }
    }
    return paragraphs.join('\n');
  }

  static async extract(
    buffer: Buffer,
    fileName: string,
    mimeType?: string
  ): Promise<OcrExtractionResult> {
    const ext = path.extname(fileName || '').toLowerCase();
    const mime = (mimeType || '').toLowerCase();
    const warnings: string[] = [];

    let text = '';
    let method: OcrExtractionResult['method'] = 'FALLBACK';
    let pageCount: number | null = null;
    let confidence: number | null = null;

    try {
      if (['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm', '.log'].includes(ext) || mime.startsWith('text/')) {
        text = buffer.toString('utf8');
        if (ext === '.html' || ext === '.htm') {
          text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        method = 'TEXT_DECODE';
        confidence = 100;
      } else if (ext === '.docx' || mime.includes('wordprocessingml')) {
        text = this.extractTextFromDocxBuffer(buffer);
        method = 'DOCX_XML';
        confidence = 100;
      } else if (ext === '.pdf' || mime === 'application/pdf') {
        const pdfParseMod: any = await import('pdf-parse');
        const PDFParseClass = pdfParseMod.PDFParse || pdfParseMod.default?.PDFParse;
        if (PDFParseClass) {
          const parser = new PDFParseClass({ data: buffer });
          try {
            const parsed = await parser.getText();
            text = (parsed?.text || '').trim();
            pageCount = typeof parsed?.total === 'number' ? parsed.total : (Array.isArray(parsed?.pages) ? parsed.pages.length : null);
          } finally {
            await parser.destroy().catch(() => {});
          }
        } else {
          const pdfParseFn = typeof pdfParseMod.default === 'function' ? pdfParseMod.default : pdfParseMod;
          const parsed = await pdfParseFn(buffer);
          text = (parsed?.text || '').trim();
          pageCount = typeof parsed?.numpages === 'number' ? parsed.numpages : null;
        }
        method = 'PDF_TEXT';
        confidence = text.length > 0 ? 95 : 0;
        if (!text) {
          warnings.push('PDF contains no embedded text layer (scanned image PDF).');
        }
      } else if (['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tif', '.tiff'].includes(ext) || mime.startsWith('image/')) {
        const tesseract: any = await import('tesseract.js');
        const createWorker = tesseract.createWorker || tesseract.default?.createWorker;
        if (createWorker) {
          const worker = await createWorker('eng');
          try {
            const { data } = await worker.recognize(buffer);
            text = (data?.text || '').trim();
            confidence = typeof data?.confidence === 'number' ? Math.round(data.confidence) : null;
            method = 'TESSERACT_OCR';
          } finally {
            await worker.terminate();
          }
        }
      } else {
        // Attempt UTF-8 printable fallback for unknown text-like payloads
        const decoded = buffer.toString('utf8');
        const printableRatio = decoded.length > 0
          ? (decoded.match(/[\x20-\x7E\r\n\t]/g)?.length || 0) / decoded.length
          : 0;
        if (printableRatio > 0.8) {
          text = decoded.trim();
          method = 'TEXT_DECODE';
        } else {
          warnings.push(`Unsupported binary format '${ext || mime || 'unknown'}' for text extraction.`);
        }
      }
    } catch (err: any) {
      warnings.push(`Extraction warning: ${err?.message || 'Unable to parse file contents'}`);
    }

    const normalizedText = (text || '').trim();
    const wordCount = normalizedText ? normalizedText.split(/\s+/).filter(Boolean).length : 0;

    return {
      text: normalizedText,
      method,
      wordCount,
      characterCount: normalizedText.length,
      pageCount,
      confidence,
      extractedFields: this.extractStructuredEntities(normalizedText),
      warnings,
    };
  }

  /**
   * Classifies extracted document text into functional legal document categories.
   */
  static classifyDocument(text: string): {
    category: 'PLEADING' | 'MEDICAL_RECORD' | 'POLICE_ACCIDENT_REPORT' | 'DEPOSITION_TRANSCRIPT' | 'CONTRACT_ENGAGEMENT' | 'GENERAL_CORRESPONDENCE';
    confidence: number;
    matchedKeywords: string[];
  } {
    const upper = (text || '').toUpperCase();
    const checks = [
      {
        category: 'DEPOSITION_TRANSCRIPT' as const,
        keywords: ['DEPOSITION OF', 'CERTIFIED SHORTHAND', 'EXAMINATION BY', 'QUESTIONS AND ANSWERS', 'REPORTED BY'],
      },
      {
        category: 'PLEADING' as const,
        keywords: ['PLAINTIFF', 'DEFENDANT', 'DISTRICT COURT', 'CIVIL NO.', 'COMPLAINT AND', 'MOTION FOR', 'SUMMONS'],
      },
      {
        category: 'POLICE_ACCIDENT_REPORT' as const,
        keywords: ['POLICE DEPARTMENT', 'TRAFFIC ACCIDENT', 'INVESTIGATING OFFICER', 'VEHICLE 1', 'CRASH DIAGRAM'],
      },
      {
        category: 'MEDICAL_RECORD' as const,
        keywords: ['CHIEF COMPLAINT', 'PHYSICAL EXAMINATION', 'DIAGNOSIS', 'PROGNOSIS', 'TREATMENT PLAN', 'CLINIC', 'PATIENT:'],
      },
      {
        category: 'CONTRACT_ENGAGEMENT' as const,
        keywords: ['RETAINER AGREEMENT', 'SCOPE OF REPRESENTATION', 'LEGAL FEES', 'IN WITNESS WHEREOF', 'TERMS OF ENGAGEMENT'],
      },
    ];

    let bestMatch = {
      category: 'GENERAL_CORRESPONDENCE' as 'PLEADING' | 'MEDICAL_RECORD' | 'POLICE_ACCIDENT_REPORT' | 'DEPOSITION_TRANSCRIPT' | 'CONTRACT_ENGAGEMENT' | 'GENERAL_CORRESPONDENCE',
      confidence: 0.6,
      matchedKeywords: [] as string[],
    };

    let highestScore = 0;
    for (const check of checks) {
      const matched = check.keywords.filter((kw) => upper.includes(kw));
      if (matched.length > highestScore) {
        highestScore = matched.length;
        bestMatch = {
          category: check.category,
          confidence: matched.length >= 2 ? 0.95 : 0.75,
          matchedKeywords: matched,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Generates source-linked chronological entries preserving paragraph and line references.
   */
  static extractChronologyWithSourceReferences(
    text: string,
    documentTitle: string
  ): Array<{ date: string; sourceDocument: string; paragraphIndex: number; excerpt: string }> {
    const paragraphs = (text || '').split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
    const dateRegex = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i;

    const chronology: Array<{ date: string; sourceDocument: string; paragraphIndex: number; excerpt: string }> = [];

    paragraphs.forEach((para, idx) => {
      const match = para.match(dateRegex);
      if (match) {
        chronology.push({
          date: match[0],
          sourceDocument: documentTitle,
          paragraphIndex: idx + 1,
          excerpt: para.length > 200 ? `${para.substring(0, 197)}...` : para,
        });
      }
    });

    return chronology;
  }
}
