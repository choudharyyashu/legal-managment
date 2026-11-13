import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppError } from '../../../errors/AppError.js';

const execAsync = promisify(exec);

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

    // Try finding via shell where / which
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

  static async isPdfConverterAvailable(): Promise<boolean> {
    const exe = await this.getSofficeExecutable();
    return Boolean(exe);
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
   * Converts a DOCX buffer to a real PDF buffer using headless LibreOffice if available.
   * If LibreOffice is not installed, throws a clean operational error per Step 6 rules.
   */
  static async convertDocxToPdf(docxBuffer: Buffer, baseFileName: string): Promise<Buffer> {
    const soffice = await this.getSofficeExecutable();

    if (!soffice) {
      throw AppError.badRequest(
        'PDF conversion is currently BLOCKED: LibreOffice (soffice) is not installed on this server environment. ' +
        'DOCX generation is fully functional. Please install LibreOffice or configure an external conversion service to enable PDF generation.',
        'PDF_CONVERSION_BLOCKED'
      );
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'legal-pdf-'));
    const tempDocxPath = path.join(tempDir, `${baseFileName}.docx`);
    const tempPdfPath = path.join(tempDir, `${baseFileName}.pdf`);

    try {
      await fs.writeFile(tempDocxPath, docxBuffer);

      // Execute headless conversion
      const cmd = `"${soffice}" --headless --convert-to pdf --outdir "${tempDir}" "${tempDocxPath}"`;
      await execAsync(cmd, { timeout: 30000 });

      const pdfBuffer = await fs.readFile(tempPdfPath);
      return pdfBuffer;
    } catch (err: any) {
      throw AppError.internal(
        `PDF conversion failed during LibreOffice headless execution: ${err.message}`,
        'PDF_CONVERSION_FAILED'
      );
    } finally {
      // Clean up temporary files
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
