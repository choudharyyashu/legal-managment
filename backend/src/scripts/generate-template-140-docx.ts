import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';

export function createDemandDocxBuffer(): Buffer {
  const title = 'HEUGLY & BLUDWORTH, ATTORNEYS AT LAW';
  const subtitle = 'CONFIDENTIAL SETTLEMENT DEMAND';
  const notice = '[SYNTHETIC TEST FIXTURE - NOT FOR LEGAL PRODUCTION - PENDING FIRM-APPROVED DEMAND WORDING]';

  const paragraphs = [
    notice,
    ' ',
    'SENT VIA CERTIFIED MAIL & ELECTRONIC TRANSMISSION',
    'Date: {{today}}',
    ' ',
    'TO:',
    'Recipient Carrier: {{Demand.RecipientCarrier}}',
    'Claim Number: {{Demand.ClaimNumber}}',
    'Policy Limit: {{Demand.PolicyLimitAmount}}',
    ' ',
    'RE: Personal Injury Settlement Demand',
    'Client / Injured Party: {{Client.Name}}',
    'Matter Number: {{Matter.MatterNumber}}',
    'Date of Incident: {{Incident.AccidentDate}}',
    'Location of Incident: {{Incident.IncidentLocation}}',
    'Responsible Attorney: {{Attorney.Name}}',
    ' ',
    'STATEMENT OF LIABILITY & INJURIES:',
    'Injury Category: {{Damages.InjuryCategory}}',
    'Treatment Summary: {{Damages.TreatmentSummary}}',
    ' ',
    'ITEMIZATION OF SPECIAL DAMAGES:',
    'Total Medical Billed: {{MedicalBilling.TotalBilled}}',
    'Total Lost Wages: {{WageLoss.TotalLostWages}}',
    'Total Economic Special Damages: {{Specials.TotalSpecialDamages}}',
    ' ',
    'SETTLEMENT DEMAND & TIME-SENSITIVE POLICY LIMIT TENDER:',
    'Total Demanded Amount: {{Demand.DemandedAmount}}',
    'Strict Policy Limit Demand Deadline: {{Demand.DeadlineDate}}',
    ' ',
    'Sincerely,',
    '{{firm.name}}',
    '{{firm.address}}',
    '{{firm.phone}}',
  ];

  const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${subtitle}</w:t></w:r></w:p>
    ${paragraphs.map((p) => `<w:p><w:r>${p.includes('SYNTHETIC') ? '<w:rPr><w:b/><w:color w:val="FF0000"/></w:rPr>' : ''}<w:t xml:space="preserve">${p}</w:t></w:r></w:p>`).join('\n    ')}
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

  return zip.generate({ type: 'nodebuffer' }) as Buffer;
}

export function writeTemplateFiles(): void {
  const docxBuf = createDemandDocxBuffer();

  const paths = [
    path.resolve(process.cwd(), 'storage', 'templates', '140', 'template_140_v1.0.docx'),
    path.resolve(process.cwd(), 'storage', 'templates', 'test-fixtures', 'UT-PI-DEM-140.docx'),
    path.resolve(process.cwd(), 'backend', 'storage', 'templates', '140', 'template_140_v1.0.docx'),
    path.resolve(process.cwd(), 'backend', 'storage', 'templates', 'test-fixtures', 'UT-PI-DEM-140.docx'),
  ];

  for (const p of paths) {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(p, docxBuf);
    console.log(`Created DOCX template at: ${p} (${docxBuf.length} bytes)`);
  }
}

if (process.argv[1]?.includes('generate-template-140-docx')) {
  writeTemplateFiles();
}
