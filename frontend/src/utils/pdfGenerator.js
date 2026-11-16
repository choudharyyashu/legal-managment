/**
 * HEUGLY & BLUDWORTH LEGAL PRACTICE MANAGEMENT SAAS
 * Client-side PDF 1.4 Legal Instrument Generator
 * Formats official representation letters, retainer agreements, medical authorizations, and demand letters
 */

export function createLegalDocumentPdf({
  title = 'Legal Document Instrument',
  draftCode = 'DFT-2026-0001',
  client = 'Client Records',
  matter = 'General Legal Matter',
  attorney = 'Thomas Bludworth, Esq.',
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  customBodyLines = null,
}) {
  const sanitize = (str) => (str || '').replace(/[\\()]/g, (c) => '\\' + c);

  const defaultLines = [
    'HEUGLY & BLUDWORTH ATTORNEYS AT LAW',
    'Salt Lake City, Utah • Utah State Bar Practice SaaS',
    '=========================================================================',
    ' ',
    `INSTRUMENT: ${title.toUpperCase()}`,
    `Draft Identifier: ${draftCode}`,
    `Date Generated: ${date}`,
    `Linked Matter: ${matter}`,
    `Client Caption: ${client}`,
    `Lead Responsible Counsel: ${attorney}`,
    ' ',
    '=========================================================================',
    'FORMAL LEGAL INSTRUMENT TERMS & PROVISIONS:',
    ' ',
    '1. SCOPE OF ENGAGEMENT & REPRESENTATION:',
    `   Heugly & Bludworth hereby formalizes legal representation regarding ${matter}`,
    `   captioned above on behalf of ${client} pursuant to Utah Rules of Professional Conduct.`,
    ' ',
    '2. CONFIDENTIALITY & PRIVILEGE (UTAH RPC 1.6):',
    '   This document and all associated correspondence constitute privileged attorney-client',
    '   communications protected under Utah Rule of Evidence 504.',
    ' ',
    '3. FIDUCIARY & TRUST SAFEGUARDS (UTAH RPC 1.15):',
    '   All retainer funds and trust liabilities remain governed under strict anti-commingling',
    '   safeguards with mandatory three-way reconciliation oversight.',
    ' ',
    'IN WITNESS WHEREOF, the authorized firm counsel and client parties record this instrument.',
    ' ',
    '___________________________________        ___________________________________',
    'Responsible Attorney Signature             Client Signature',
    `${attorney}                                ${client}`,
  ];

  const lines = customBodyLines && Array.isArray(customBodyLines) ? customBodyLines : defaultLines;

  let stream = `BT\n/F1 14 Tf\n50 740 Td\n(${sanitize(lines[0])}) Tj\n/F1 10 Tf\n0 -16 Td\n(${sanitize(lines[1])}) Tj\n/F1 8 Tf\n0 -12 Td\n(${sanitize(lines[2])}) Tj\n`;

  for (let i = 3; i < lines.length; i++) {
    const l = lines[i];
    const isBold = i === 4 || i === 12;
    const font = isBold ? '/F1 11 Tf' : '/F1 9 Tf';
    stream += `${font}\n0 -14 Td\n(${sanitize(l)}) Tj\n`;
  }
  stream += 'ET\n';

  const parts = [];
  parts.push('%PDF-1.4\n');

  const objOffsets = [];

  function addObj(content) {
    const offset = parts.join('').length;
    objOffsets.push(offset);
    parts.push(content + '\n');
  }

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  addObj(`5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj`);

  const startXref = parts.join('').length;
  let xref = `xref\n0 ${objOffsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of objOffsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  parts.push(xref);
  parts.push(`trailer\n<< /Size ${objOffsets.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`);

  const fullPdfString = parts.join('');
  return new Blob([fullPdfString], { type: 'application/pdf' });
}
