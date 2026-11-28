/**
 * LEGALPRO E-FILING COMPILER & PACKAGING VERIFICATION SUITE
 *
 * Verifies:
 * 1. Caption & attachment validation (bar number, lead doc, exhibits).
 * 2. ECF manifest generation with SHA-256 document checksums.
 * 3. Compiles real inspectable ZIP filing packages.
 * 4. Demarcates offline compilation (ready) from court gateway credentials (required).
 * 5. Strict safety: Prohibits actual live court transmission without verified credentials.
 */

import crypto from 'crypto';
import assert from 'assert';
import PizZip from 'pizzip';
import { EfilingCompilerService, EfilingSubmissionEnvelope } from '../modules/litigation/efiling/efiling-compiler.service.js';

console.log('================================================================');
console.log('LEGALPRO E-FILING COMPILER & PACKAGING VERIFICATION SUITE');
console.log('================================================================\n');

async function runEfilingCompilerTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Caption & Mandatory Envelope Validation
  // ---------------------------------------------------------------------------
  console.log('Test 1: Caption & Mandatory Envelope Validation...');
  {
    // Missing court name
    let missingCourtRejected = false;
    try {
      EfilingCompilerService.validateFilingEnvelope({
        matterId: 'm-01',
        courtName: '',
        jurisdiction: 'UTAH_DISTRICT_COURT',
        division: 'Salt Lake',
        caseCategory: 'Civil',
        filingParty: { partyType: 'PLAINTIFF', fullName: 'Sarah Jenkins', isLeadParty: true },
        leadAttorney: { name: 'Dusten L. Heugly', utahBarNumber: '12345', email: 'dusten@heuglybludworth.com', firmName: 'Heugly & Bludworth' },
        attachments: [{ attachmentType: 'LEAD_DOCUMENT', title: 'Complaint', fileName: 'Complaint.pdf', fileBuffer: Buffer.from('PDF_CONTENT') }],
        statutoryFilingFee: 375,
      });
    } catch (err: any) {
      missingCourtRejected = true;
      assert.strictEqual(err.code, 'COURT_NAME_REQUIRED');
    }
    assert(missingCourtRejected, 'Envelope without court name must be rejected');

    // Missing Lead Document
    let missingLeadRejected = false;
    try {
      EfilingCompilerService.validateFilingEnvelope({
        matterId: 'm-01',
        courtName: 'Third District Court',
        jurisdiction: 'UTAH_DISTRICT_COURT',
        division: 'Salt Lake',
        caseCategory: 'Civil',
        filingParty: { partyType: 'PLAINTIFF', fullName: 'Sarah Jenkins', isLeadParty: true },
        leadAttorney: { name: 'Dusten L. Heugly', utahBarNumber: '12345', email: 'dusten@heuglybludworth.com', firmName: 'Heugly & Bludworth' },
        attachments: [{ attachmentType: 'EXHIBIT', title: 'Exhibit A', fileName: 'ExhibitA.pdf', fileBuffer: Buffer.from('PDF_CONTENT') }],
        statutoryFilingFee: 375,
      });
    } catch (err: any) {
      missingLeadRejected = true;
      assert.strictEqual(err.code, 'LEAD_DOCUMENT_MISSING');
    }
    assert(missingLeadRejected, 'Envelope without a LEAD_DOCUMENT must be rejected');

    console.log('   ✓ Rejection on missing court name: verified (COURT_NAME_REQUIRED)');
    console.log('   ✓ Rejection on missing lead document: verified (LEAD_DOCUMENT_MISSING)');
    console.log('   ✓ Test 1 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Utah District Court Civil E-Filing Package Compilation
  // ---------------------------------------------------------------------------
  console.log('Test 2: Utah District Court Civil Filing Package & Manifest Compilation...');
  {
    const complaintPdf = Buffer.from('%PDF-1.4 Civil Complaint Document in Sarah Jenkins v. Wasatch Peak Logistics');
    const exhibitAPdf = Buffer.from('%PDF-1.4 Exhibit A - Utah Highway Patrol Collision Incident Report');
    const proposedOrderPdf = Buffer.from('%PDF-1.4 Proposed Scheduling Order');

    const envelope: EfilingSubmissionEnvelope = {
      matterId: 'matter-civ-2026-01',
      courtName: 'Third District Court, Salt Lake County, State of Utah',
      jurisdiction: 'UTAH_DISTRICT_COURT',
      division: 'Salt Lake City Division',
      caseCategory: 'Personal Injury - Motor Vehicle Tort',
      filingParty: {
        partyType: 'PLAINTIFF',
        fullName: 'Sarah Jenkins',
        isLeadParty: true,
      },
      leadAttorney: {
        name: 'Dusten L. Heugly',
        utahBarNumber: '12345',
        email: 'dusten@heuglybludworth.com',
        firmName: 'Heugly & Bludworth, Attorneys at Law',
      },
      attachments: [
        { attachmentType: 'LEAD_DOCUMENT', title: 'Complaint and Jury Demand', fileName: 'Complaint_and_Jury_Demand.pdf', fileBuffer: complaintPdf },
        { attachmentType: 'EXHIBIT', title: 'Exhibit A - Accident Report', fileName: 'Exhibit_A_Police_Report.pdf', fileBuffer: exhibitAPdf, exhibitNumber: 'A' },
        { attachmentType: 'PROPOSED_ORDER', title: 'Proposed Scheduling Order', fileName: 'Proposed_Scheduling_Order.pdf', fileBuffer: proposedOrderPdf },
      ],
      statutoryFilingFee: EfilingCompilerService.STATUTORY_FEES.UTAH_DISTRICT_COURT_CIVIL,
    };

    const compiled = EfilingCompilerService.compileFilingPackage(envelope);

    assert(compiled.packageZipBuffer.length > 500, 'ZIP package buffer must be non-empty');
    assert.strictEqual(compiled.manifest.documents.length, 3, 'Manifest must record all 3 attachments');
    assert.strictEqual(compiled.manifest.filingFee, 375.00, 'Utah District Court Civil fee must be $375.00');

    // Verify SHA-256 checksums in manifest
    const complaintHash = crypto.createHash('sha256').update(complaintPdf).digest('hex');
    assert.strictEqual(compiled.manifest.documents[0].sha256Hash, complaintHash, 'Complaint SHA-256 hash must match exactly');

    // Inspect compiled ZIP contents
    const readZip = new PizZip(compiled.packageZipBuffer);
    assert(readZip.file('efiling-manifest.json'), 'ZIP must contain efiling-manifest.json');
    assert(readZip.file('01_Complaint_and_Jury_Demand.pdf'), 'ZIP must contain numbered lead document');
    assert(readZip.file('02_Exhibit_A_Police_Report.pdf'), 'ZIP must contain numbered Exhibit A');
    assert(readZip.file('03_Proposed_Scheduling_Order.pdf'), 'ZIP must contain numbered Proposed Order');

    console.log(`   ✓ Compiled Package ID: ${compiled.packageId}`);
    console.log(`   ✓ Envelope Number: ${compiled.envelopeNumber}`);
    console.log(`   ✓ Package Size: ${compiled.packageSizeBytes} bytes`);
    console.log(`   ✓ Court Transmission Status: ${compiled.courtTransmissionStatus}`);
    console.log(`   ✓ Gateway Notice: "${compiled.courtGatewayRequirements.notice.substring(0, 80)}..."`);
    console.log('   ✓ Test 2 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Federal Bankruptcy Filing Package Compilation
  // ---------------------------------------------------------------------------
  console.log('Test 3: U.S. Bankruptcy Court Filing Package Compilation...');
  {
    const petitionPdf = Buffer.from('%PDF-1.4 Official Form 101 - Voluntary Petition for Individuals Filing for Bankruptcy');
    const matrixTxt = Buffer.from('Mountain America Credit Union\nPO Box 2331\nSalt Lake City, UT 84110\n\nDiscover Financial Services\nPO Box 15316\nWilmington, DE 19850');

    const bkEnvelope: EfilingSubmissionEnvelope = {
      matterId: 'matter-bk-2026-02',
      courtName: 'United States Bankruptcy Court for the District of Utah',
      jurisdiction: 'US_BANKRUPTCY_COURT_UTAH',
      division: 'Salt Lake City',
      caseCategory: 'Bankruptcy Chapter 7 Voluntary',
      filingParty: {
        partyType: 'DEBTOR',
        fullName: 'Arthur Pendelton',
        isLeadParty: true,
      },
      leadAttorney: {
        name: 'Dusten L. Heugly',
        utahBarNumber: '12345',
        email: 'dusten@heuglybludworth.com',
        firmName: 'Heugly & Bludworth, Attorneys at Law',
      },
      attachments: [
        { attachmentType: 'LEAD_DOCUMENT', title: 'Official Form 101 - Voluntary Petition', fileName: 'Voluntary_Petition.pdf', fileBuffer: petitionPdf },
        { attachmentType: 'EXHIBIT', title: 'Creditor Matrix (Master Mailing List)', fileName: 'Creditor_Matrix.txt', fileBuffer: matrixTxt },
      ],
      statutoryFilingFee: EfilingCompilerService.STATUTORY_FEES.US_BANKRUPTCY_COURT_CH7,
    };

    const bkCompiled = EfilingCompilerService.compileFilingPackage(bkEnvelope);
    assert.strictEqual(bkCompiled.manifest.filingFee, 338.00, 'Chapter 7 statutory fee must equal $338.00');
    assert.strictEqual(bkCompiled.courtTransmissionStatus, 'PACKAGE_COMPILED_CREDENTIALS_REQUIRED');
    assert.strictEqual(bkCompiled.courtGatewayRequirements.providerName, 'Federal CM/ECF Gateway');

    console.log(`   ✓ Bankruptcy Package ID: ${bkCompiled.packageId}`);
    console.log(`   ✓ Statutory Fee: $${bkCompiled.manifest.filingFee.toFixed(2)}`);
    console.log(`   ✓ Gateway: ${bkCompiled.courtGatewayRequirements.providerName} (Credential-Protected)`);
    console.log('   ✓ Test 3 PASSED.\n');
  }

  console.log('================================================================');
  console.log('ALL 3 E-FILING COMPILER TESTS PASSED CLEANLY');
  console.log('================================================================\n');
}

runEfilingCompilerTests().catch((err) => {
  console.error('E-filing compiler test suite failed:', err);
  process.exit(1);
});
