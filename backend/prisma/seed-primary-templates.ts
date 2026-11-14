import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PizZip from 'pizzip';

const prisma = new PrismaClient();

function createDocxBuffer(title: string, bodyText: string, mergeFields: string[]): Buffer {
  const fieldsXml = mergeFields.map(f => `<w:p><w:r><w:t>${f}: {{${f}}}</w:t></w:r></w:p>`).join('');
  const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${bodyText}</w:t></w:r></w:p>
    ${fieldsXml}
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

  return zip.generate({ type: 'nodebuffer' });
}

async function seedTemplates() {
  console.log('Seeding Document Templates & Published Versions...');

  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found to set as template creator.');
  }

  const templatesDef = [
    {
      templateCode: '096',
      templateName: 'Representation Letter - Liability Carrier (Template 096)',
      description: 'Formal representation notice transmitted to liability insurance carrier on behalf of injured client.',
      practiceAreaId: 'pa-pi',
      category: 'Correspondence',
      bodyText: 'Please be advised that Heugly & Bludworth represents {{Client.Name}} regarding the incident on {{Incident.AccidentDate}}.',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'Matter.Title', sourceEntity: 'Matter', sourceField: 'title', isRequired: true },
        { placeholderTag: 'Insurance.AdjusterName', sourceEntity: 'Insurance', sourceField: 'adjusterName', isRequired: true },
        { placeholderTag: 'Insurance.ClaimNumber', sourceEntity: 'Insurance', sourceField: 'claimNumber', isRequired: true },
        { placeholderTag: 'Insurance.CarrierName', sourceEntity: 'Insurance', sourceField: 'carrierName', isRequired: false },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'Attorney', sourceField: 'name', isRequired: true },
      ],
    },
    {
      templateCode: '113',
      templateName: 'Medical Records & Billing Request (Template 113)',
      description: 'Formal request for certified medical records, itemized billing statements, and treatment notes.',
      practiceAreaId: 'pa-pi',
      category: 'Medical',
      bodyText: 'We hereby request complete copies of certified medical records and itemized billing statements for {{Client.Name}}.',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'MedicalProvider.Name', sourceEntity: 'MedicalProvider', sourceField: 'name', isRequired: true },
        { placeholderTag: 'MedicalProvider.Address', sourceEntity: 'MedicalProvider', sourceField: 'address', isRequired: true },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'Attorney', sourceField: 'name', isRequired: true },
      ],
    },
    {
      templateCode: '112',
      templateName: 'HIPAA Medical Information Authorization (Template 112)',
      description: 'HIPAA and Utah state law-compliant authorization for release of protected health information.',
      practiceAreaId: 'pa-pi',
      category: 'Authorizations',
      bodyText: 'AUTHORIZATION TO DISCLOSE PROTECTED HEALTH INFORMATION PURSUANT TO 45 C.F.R. § 164.508',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Client.Phone', sourceEntity: 'Client', sourceField: 'phone', isRequired: false },
        { placeholderTag: 'Client.Address', sourceEntity: 'Client', sourceField: 'address', isRequired: false },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
      ],
    },
    {
      templateCode: '115',
      templateName: 'Medical Records Deficiency Notice (Template 115)',
      description: 'Notice identifying missing, incomplete, or uncertified medical records from a provider.',
      practiceAreaId: 'pa-pi',
      category: 'Notices',
      bodyText: 'DEFICIENCY IN MEDICAL RECORDS PRODUCTION: Following review of records produced for {{Client.Name}}, the following items remain missing.',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'MedicalProvider.Name', sourceEntity: 'MedicalProvider', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'Attorney', sourceField: 'name', isRequired: true },
      ],
    },
    {
      templateCode: '001',
      templateName: 'Master Client Engagement & Retainer Agreement (Template 001)',
      description: 'Standard attorney representation agreement and legal retainer agreement under Utah RPC 1.5 & 1.15.',
      practiceAreaId: 'pa-fam',
      category: 'Engagement',
      bodyText: 'LEGAL SERVICES ENGAGEMENT & RETAINER AGREEMENT: Heugly & Bludworth agrees to represent {{Client.Name}} in {{Matter.Title}}.',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'Matter.Title', sourceEntity: 'Matter', sourceField: 'title', isRequired: true },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'Attorney', sourceField: 'name', isRequired: true },
      ],
    },
    {
      templateCode: '116',
      templateName: 'Incomplete Medical Records Follow-up (Template 116)',
      description: 'Formal follow-up notice requesting complete, unredacted, certified medical and billing records.',
      practiceAreaId: 'pa-pi',
      category: 'Medical',
      bodyText: 'FOLLOW-UP REQUEST FOR INCOMPLETE/DEFICIENT MEDICAL RECORDS: Regarding {{Client.Name}} (Matter {{Matter.MatterNumber}}).',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'MedicalProvider.Name', sourceEntity: 'MedicalProvider', sourceField: 'providerName', isRequired: true },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true },
      ],
    },
    {
      templateCode: '140',
      templateName: 'Personal Injury Settlement Demand Letter (Template 140)',
      description: 'Formal comprehensive settlement demand package outlining liability, severe bodily injuries, verified economic special damages, and policy limit demand.',
      practiceAreaId: 'pa-pi',
      category: 'Demand',
      bodyText: '[SYNTHETIC TEST FIXTURE - NOT FOR LEGAL PRODUCTION - PENDING FIRM-APPROVED DEMAND WORDING]\n\nDEMAND FOR SETTLEMENT UNDER UTAH LAW AND RELEVANT INSURANCE POLICY LIMITS: Notice to {{Demand.RecipientCarrier}} regarding Claim {{Demand.ClaimNumber}} on behalf of {{Client.Name}}.',
      mappings: [
        { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: 'Demand.RecipientCarrier', sourceEntity: 'Demand', sourceField: 'recipientCarrier', isRequired: true },
        { placeholderTag: 'Demand.ClaimNumber', sourceEntity: 'Demand', sourceField: 'claimNumber', isRequired: true },
        { placeholderTag: 'Demand.DemandedAmount', sourceEntity: 'Demand', sourceField: 'demandedAmount', isRequired: true },
        { placeholderTag: 'Demand.PolicyLimitAmount', sourceEntity: 'Demand', sourceField: 'policyLimitAmount', isRequired: false },
        { placeholderTag: 'Demand.DeadlineDate', sourceEntity: 'Demand', sourceField: 'deadlineDate', isRequired: true },
        { placeholderTag: 'Incident.AccidentDate', sourceEntity: 'Incident', sourceField: 'accidentDate', isRequired: true },
        { placeholderTag: 'Incident.IncidentLocation', sourceEntity: 'Incident', sourceField: 'incidentLocation', isRequired: false },
        { placeholderTag: 'Attorney.Name', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true },
        { placeholderTag: 'Damages.InjuryCategory', sourceEntity: 'Damages', sourceField: 'injuryCategory', isRequired: false },
        { placeholderTag: 'Damages.TreatmentSummary', sourceEntity: 'Damages', sourceField: 'treatmentSummary', isRequired: false },
        { placeholderTag: 'WageLoss.TotalLostWages', sourceEntity: 'WageLoss', sourceField: 'totalLostWages', isRequired: false },
        { placeholderTag: 'MedicalBilling.TotalBilled', sourceEntity: 'MedicalBilling', sourceField: 'totalBilled', isRequired: false },
        { placeholderTag: 'Specials.TotalSpecialDamages', sourceEntity: 'Specials', sourceField: 'totalSpecialDamages', isRequired: false },
      ],
    },
  ];

  const storageDir = path.resolve(process.cwd(), 'storage', 'templates');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  for (const def of templatesDef) {
    const existing = await prisma.documentTemplate.findUnique({
      where: { templateCode: def.templateCode },
    });

    if (existing) {
      console.log(`Template ${def.templateCode} already exists.`);
      continue;
    }

    const tplDir = path.join(storageDir, def.templateCode);
    if (!fs.existsSync(tplDir)) {
      fs.mkdirSync(tplDir, { recursive: true });
    }

    const fileName = `template_${def.templateCode}_v1.0.docx`;
    const storageKey = `storage/templates/${def.templateCode}/${fileName}`;
    const fullDiskPath = path.join(tplDir, fileName);

    const docxBuf = createDocxBuffer(
      def.templateName,
      def.bodyText,
      def.mappings.map(m => m.placeholderTag)
    );
    fs.writeFileSync(fullDiskPath, docxBuf);

    const checksum = crypto.createHash('sha256').update(docxBuf).digest('hex');

    const createdTemplate = await prisma.documentTemplate.create({
      data: {
        templateCode: def.templateCode,
        templateName: def.templateName,
        description: def.description,
        practiceArea: { connect: { id: def.practiceAreaId } },
        category: def.category,
        outputFormat: 'DOCX',
        currentVersion: 'v1.0',
        isActive: true,
        isSystemDefault: true,
        createdByUser: { connect: { id: user.id } },
        versions: {
          create: {
            versionNumber: 'v1.0',
            docxStorageKey: storageKey,
            sha256Checksum: checksum,
            status: 'Published',
            changeSummary: 'Initial verified master production template release.',
            createdByUser: { connect: { id: user.id } },
            fieldMappings: {
              create: def.mappings.map(m => ({
                placeholderTag: m.placeholderTag,
                sourceEntity: m.sourceEntity,
                sourceField: m.sourceField,
                isRequired: m.isRequired,
                formattingRule: 'NONE',
              })),
            },
          },
        },
      },
    });

    console.log(`Seeded Template: ${createdTemplate.templateCode} - ${createdTemplate.templateName}`);
  }

  console.log('Seeding finished successfully.');
}

seedTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
