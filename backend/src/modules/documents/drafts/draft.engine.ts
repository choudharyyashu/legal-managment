import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppError } from '../../../errors/AppError.js';

const execAsync = promisify(exec);

export interface PdfRenderMetadata {
  title?: string;
  draftCode?: string;
  matterNumber?: string;
  clientName?: string;
  attorneyName?: string;
}

export class DraftEngine {
  private static cachedSofficePath: string | null | false = null;

  /**
   * Checks whether LibreOffice (soffice) headless executable is installed on the server environment.
   */
  static async getSofficeExecutable(): Promise<string | null> {
    if (this.cachedSofficePath !== null) {
      return this.cachedSofficePath === false ? null : this.cachedSofficePath;
    }

    const candidatePaths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      '/usr/bin/soffice',
      '/usr/bin/libreoffice',
    ];

    for (const p of candidatePaths) {
      try {
        await fs.access(p);
        this.cachedSofficePath = p;
        return p;
      } catch {
        // Continue searching
      }
    }

    try {
      const isWindows = os.platform() === 'win32';
      const cmd = isWindows ? 'where soffice' : 'which soffice';
      const { stdout } = await execAsync(cmd);
      const found = stdout.trim().split(/\r?\n/)[0];
      if (found) {
        this.cachedSofficePath = found;
        return found;
      }
    } catch {
      // not found in PATH
    }

    this.cachedSofficePath = false;
    return null;
  }

  /**
   * PDF conversion is always available: uses LibreOffice if installed,
   * otherwise renders crisp legal PDFs natively via PDFKit.
   */
  static async isPdfConverterAvailable(): Promise<boolean> {
    return true;
  }

  private static escapeXml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private static decodeXml(text: string): string {
    return (text || '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  /**
   * Builds a valid OpenXML .docx binary from plain text / paragraphs (for inline template creation).
   */
  static buildDocxFromText(title: string, bodyText: string): Buffer {
    const lines = (bodyText || '').split(/\r?\n/);
    const bodyParagraphs = lines
      .map((line) => {
        const escaped = this.escapeXml(line);
        return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
      })
      .join('');

    const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:t>${this.escapeXml(title)}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    ${bodyParagraphs}
    <w:sectPr/>
  </w:body>
</w:document>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const zip = new PizZip();
    zip.file('word/document.xml', contentXml);
    zip.file('_rels/.rels', relsXml);
    zip.file('[Content_Types].xml', contentTypesXml);

    return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
  }

  /**
   * Extracts clean ordered paragraphs from a DOCX buffer's word/document.xml.
   */
  static extractTextFromDocx(docxBuffer: Buffer): string[] {
    const zip = new PizZip(docxBuffer);
    const docXml = zip.file('word/document.xml')?.asText() || '';
    const pMatches = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
    const paragraphs: string[] = [];

    for (const pXml of pMatches) {
      const runs = Array.from(pXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) as Iterable<RegExpMatchArray>).map((m) =>
        this.decodeXml(m[1])
      );
      const text = runs.join('').trim();
      if (text) {
        paragraphs.push(text);
      }
    }
    return paragraphs;
  }

  /**
   * Detects unique {{placeholder}} tags inside a DOCX template archive (handles split XML runs).
   */
  static extractPlaceholdersFromDocx(docxBuffer: Buffer): string[] {
    const paragraphs = this.extractTextFromDocx(docxBuffer);
    const joined = paragraphs.join('\n');
    const matches = joined.match(/\{\{[^}]+\}\}/g) || [];
    const cleaned = matches
      .map((tag) => tag.trim())
      .filter((tag) => !tag.startsWith('{{#') && !tag.startsWith('{{/'));
    return Array.from(new Set(cleaned));
  }

  /**
   * Populates DOCX template buffer with resolved field data using Docxtemplater & PizZip.
   */
  static generateDocx(
    templateBuffer: Buffer,
    resolvedData: Record<string, any>
  ): Buffer {
    let zip: PizZip;
    try {
      zip = new PizZip(templateBuffer);
    } catch (err: any) {
      throw AppError.badRequest(
        `Failed to parse template archive: ${err.message || 'Corrupted DOCX binary'}`,
        'CORRUPTED_TEMPLATE_ARCHIVE'
      );
    }

    let doc: Docxtemplater;
    try {
      doc = new Docxtemplater(zip, {
        delimiters: { start: '{{', end: '}}' },
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => '',
        parser: (tag: string) => {
          return {
            get: (scope: any) => {
              if (tag === '.') return scope;
              if (scope && scope[tag] !== undefined) return scope[tag];
              if (tag.includes('.')) {
                const parts = tag.split('.');
                let curr = scope;
                for (const p of parts) {
                  if (curr === null || curr === undefined) return '';
                  curr = curr[p];
                }
                if (curr !== undefined) return curr;
              }
              return '';
            },
          };
        },
      });
    } catch (err: any) {
      throw AppError.badRequest(
        `Failed to initialize template processor: ${err.message}`,
        'TEMPLATE_INITIALIZATION_ERROR'
      );
    }

    try {
      doc.render(resolvedData);
    } catch (err: any) {
      const details = err.properties?.errors || err.message;
      throw AppError.unprocessable(
        'Document template rendering failed due to syntax or unclosed tag mismatch.',
        details,
        'TEMPLATE_RENDER_ERROR'
      );
    }

    try {
      const outputBuffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      }) as Buffer;

      return outputBuffer;
    } catch (err: any) {
      throw AppError.internal(
        `Failed to generate final Word document archive: ${err.message}`,
        'DOCX_COMPILATION_ERROR'
      );
    }
  }

  /**
   * Renders a real, multi-page legal PDF directly from populated DOCX paragraphs via PDFKit.
   */
  static async renderDocxToPdfWithPdfKit(
    docxBuffer: Buffer,
    baseFileName: string,
    metadata?: PdfRenderMetadata
  ): Promise<Buffer> {
    const paragraphs = this.extractTextFromDocx(docxBuffer);

    return await new Promise<Buffer>((resolve, reject) => {
      const pdf = new PDFDocument({
        size: 'LETTER',
        margins: { top: 56, bottom: 56, left: 60, right: 60 },
        bufferPages: true,
        info: {
          Title: metadata?.title || baseFileName,
          Author: metadata?.attorneyName || 'Heugly & Bludworth, Attorneys at Law',
          Subject: metadata?.matterNumber ? `Matter ${metadata.matterNumber}` : 'Legal Instrument',
        },
      });

      const chunks: Buffer[] = [];
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', (err: any) => reject(err));

      // Firm Header
      pdf
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#06244B')
        .text('HEUGLY & BLUDWORTH, ATTORNEYS AT LAW', { align: 'center' });
      pdf
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#475467')
        .text('136 E South Temple, Suite 1400, Salt Lake City, UT 84111 • (801) 532-7300', { align: 'center' });
      pdf.moveDown(0.5);
      pdf
        .moveTo(60, pdf.y)
        .lineTo(552, pdf.y)
        .strokeColor('#06244B')
        .lineWidth(1)
        .stroke();
      pdf.moveDown(0.75);

      // Metadata block when provided
      if (metadata && (metadata.draftCode || metadata.matterNumber || metadata.clientName)) {
        pdf.font('Helvetica').fontSize(9).fillColor('#344054');
        const metaItems = [
          metadata.draftCode ? `Draft Code: ${metadata.draftCode}` : null,
          metadata.matterNumber ? `Matter: ${metadata.matterNumber}` : null,
          metadata.clientName ? `Client: ${metadata.clientName}` : null,
          `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        ].filter(Boolean);
        pdf.text(metaItems.join('   |   '), { align: 'left' });
        pdf.moveDown(0.75);
      }

      // Document Title
      const heading = paragraphs[0] || metadata?.title || baseFileName;
      pdf
        .font('Helvetica-Bold')
        .fontSize(12.5)
        .fillColor('#111827')
        .text(heading, { align: 'left' });
      pdf.moveDown(0.75);

      // Body Paragraphs
      const bodyLines = paragraphs.length > 1 ? paragraphs.slice(1) : paragraphs;
      pdf.font('Helvetica').fontSize(10.5).fillColor('#1F2937');

      for (const line of bodyLines) {
        if (!line) {
          pdf.moveDown(0.5);
          continue;
        }
        const isSectionHeader =
          line === line.toUpperCase() && line.length > 4 && line.length < 90 && /[A-Z]/.test(line);
        if (isSectionHeader) {
          pdf.moveDown(0.35);
          pdf.font('Helvetica-Bold').fontSize(10.5).fillColor('#06244B').text(line, { lineGap: 3 });
          pdf.font('Helvetica').fontSize(10.5).fillColor('#1F2937');
        } else {
          pdf.text(line, { lineGap: 3, align: 'left' });
        }
        pdf.moveDown(0.45);
      }

      // Page Footer numbering
      const range = pdf.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        pdf.switchToPage(i);
        pdf
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#667085')
          .text(
            `CONFIDENTIAL LEGAL INSTRUMENT — Page ${i + 1} of ${range.count}`,
            60,
            746,
            { align: 'center', width: 492 }
          );
      }

      pdf.end();
    });
  }

  /**
   * Converts a DOCX buffer to a real PDF buffer using LibreOffice if installed,
   * or falls back seamlessly to native PDFKit rendering of the populated DOCX content.
   */
  static async convertDocxToPdf(
    docxBuffer: Buffer,
    baseFileName: string,
    metadata?: PdfRenderMetadata
  ): Promise<Buffer> {
    const soffice = await this.getSofficeExecutable();

    if (soffice) {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'legal-pdf-'));
      const tempDocxPath = path.join(tempDir, `${baseFileName}.docx`);
      const tempPdfPath = path.join(tempDir, `${baseFileName}.pdf`);

      try {
        await fs.writeFile(tempDocxPath, docxBuffer);
        const cmd = `"${soffice}" --headless --convert-to pdf --outdir "${tempDir}" "${tempDocxPath}"`;
        await execAsync(cmd, { timeout: 30000 });
        return await fs.readFile(tempPdfPath);
      } catch {
        // Fallback to PDFKit if LibreOffice execution fails
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    }

    try {
      return await this.renderDocxToPdfWithPdfKit(docxBuffer, baseFileName, metadata);
    } catch (err: any) {
      throw AppError.internal(
        `PDF generation failed: ${err?.message || 'Unknown PDF rendering error'}`,
        'PDF_CONVERSION_FAILED'
      );
    }
  }
}
