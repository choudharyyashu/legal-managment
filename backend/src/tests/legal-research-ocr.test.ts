/**
 * LEGALPRO LEGAL RESEARCH & OCR VERIFICATION SUITE
 *
 * Verifies:
 * 1. OCR text & structured entity extraction from scanned/synthetic legal documents.
 * 2. Automated document classification (PLEADING, MEDICAL_RECORD, DEPOSITION_TRANSCRIPT).
 * 3. Source-linked legal chronology generation with exact paragraph/page references.
 * 4. Provider-independent legal research citation verification against lawful Utah corpus.
 * 5. Hallucination Guard: Automatic detection and flagging of unsupported/unrecognized citations.
 * 6. Deposition transcript analysis: Page:line linking to contradictions and cross-examination outlines.
 * 7. Strict data demarcation: Verified law vs synthetic/unverified queries.
 */

import assert from 'assert';
import { OcrService } from '../modules/documents/ocr/ocr.service.js';
import { LegalResearchService } from '../modules/research/legal-research.service.js';

console.log('================================================================');
console.log('LEGALPRO LEGAL RESEARCH & OCR VERIFICATION SUITE');
console.log('================================================================\n');

async function runLegalResearchOcrTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: OCR Text & Entity Extraction on Fictional Scanned Document
  // ---------------------------------------------------------------------------
  console.log('Test 1: OCR Text & Structured Legal Entity Extraction...');
  {
    const syntheticPleadingText = `
IN THE THIRD DISTRICT COURT IN AND FOR SALT LAKE COUNTY, STATE OF UTAH
CIVIL NO. 260904412
JUDGE: HON. TROY A. GARRISON

SARAH JENKINS,
    Plaintiff,
v.
WASATCH PEAK LOGISTICS, INC. AND JOHNATHAN SMITH,
    Defendants.

COMPLAINT AND JURY DEMAND
Plaintiff Sarah Jenkins, by and through counsel Dusten L. Heugly, PLLC, alleges as follows:
1. On or about October 14, 2025, Defendant Smith operated a commercial freight vehicle on I-15.
2. Defendant failed to yield, causing severe impact resulting in traumatic spine injuries.
3. Total past medical expenses incurred to date amount to $48,750.00.
4. Future medical treatment estimates exceed $125,000.00.
WHEREFORE, Plaintiff demands judgment against Defendants for special damages of $173,750.00.
DATED: January 18, 2026.
    `;

    const entities = OcrService.extractStructuredEntities(syntheticPleadingText);
    assert(entities.dates.length >= 2, 'Must extract at least two dates');
    assert(entities.monetaryAmounts.includes('$48,750.00'), 'Must extract $48,750.00 medical damages');
    assert(entities.monetaryAmounts.includes('$125,000.00'), 'Must extract $125,000.00 future medicals');
    assert(entities.caseOrDocketNumbers.some((c) => c.includes('260904412')), 'Must extract docket number 260904412');

    console.log(`   ✓ Extracted Dates: [${entities.dates.join(', ')}]`);
    console.log(`   ✓ Extracted Damages: [${entities.monetaryAmounts.join(', ')}]`);
    console.log(`   ✓ Extracted Docket Numbers: [${entities.caseOrDocketNumbers.join(', ')}]`);
    console.log('   ✓ Test 1 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Document Classification Engine
  // ---------------------------------------------------------------------------
  console.log('Test 2: Document Classification Engine...');
  {
    const pleadingSample = 'IN THE DISTRICT COURT. PLAINTIFF v. DEFENDANT. COMPLAINT AND JURY DEMAND. CIVIL NO. 260901.';
    const medicalSample = 'INTERMOUNTAIN HEALTH CLINIC. PATIENT: Sarah Jenkins. CHIEF COMPLAINT: Cervical radiculopathy following MVC. TREATMENT PLAN: MRI and physical therapy.';
    const depositionSample = 'IN THE MATTER OF SARAH JENKINS. DEPOSITION OF JOHNATHAN SMITH. CERTIFIED SHORTHAND REPORTER. EXAMINATION BY MR. HEUGLY.';

    const pleadingClass = OcrService.classifyDocument(pleadingSample);
    const medicalClass = OcrService.classifyDocument(medicalSample);
    const depClass = OcrService.classifyDocument(depositionSample);

    assert.strictEqual(pleadingClass.category, 'PLEADING', 'Pleading sample must classify as PLEADING');
    assert.strictEqual(medicalClass.category, 'MEDICAL_RECORD', 'Medical sample must classify as MEDICAL_RECORD');
    assert.strictEqual(depClass.category, 'DEPOSITION_TRANSCRIPT', 'Deposition sample must classify as DEPOSITION_TRANSCRIPT');

    console.log(`   ✓ Pleading Classification: ${pleadingClass.category} (Confidence: ${pleadingClass.confidence})`);
    console.log(`   ✓ Medical Record Classification: ${medicalClass.category} (Confidence: ${medicalClass.confidence})`);
    console.log(`   ✓ Deposition Transcript Classification: ${depClass.category} (Confidence: ${depClass.confidence})`);
    console.log('   ✓ Test 2 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Source-Linked Legal Chronology Generation
  // ---------------------------------------------------------------------------
  console.log('Test 3: Source-Linked Chronology Generation with Paragraph Binding...');
  {
    const documentBody = `
First paragraph introducing the background of the patient's condition.

On October 14, 2025, the patient presented to the emergency room following a high-velocity motor vehicle collision with loss of consciousness.

Subsequent physical therapy evaluation was performed on November 02, 2025, showing restricted range of motion in the cervical spine.

On January 15, 2026, Dr. Vance concluded that the patient reached Maximum Medical Improvement with a 12% whole-person impairment rating.
    `;

    const chronology = OcrService.extractChronologyWithSourceReferences(documentBody, 'Exhibit-A-Medical-Summary.pdf');
    assert.strictEqual(chronology.length, 3, 'Must extract exactly 3 dated chronological events');
    assert.strictEqual(chronology[0].date, 'October 14, 2025', 'First date must be Oct 14, 2025');
    assert.strictEqual(chronology[0].paragraphIndex, 2, 'First event must bind to paragraph 2');
    assert.strictEqual(chronology[1].paragraphIndex, 3, 'Second event must bind to paragraph 3');
    assert.strictEqual(chronology[2].paragraphIndex, 4, 'Third event must bind to paragraph 4');

    console.log(`   ✓ Chronology Event 1: ${chronology[0].date} | Source: ${chronology[0].sourceDocument} (Para ${chronology[0].paragraphIndex})`);
    console.log(`   ✓ Chronology Event 2: ${chronology[1].date} | Source: ${chronology[1].sourceDocument} (Para ${chronology[1].paragraphIndex})`);
    console.log(`   ✓ Chronology Event 3: ${chronology[2].date} | Source: ${chronology[2].sourceDocument} (Para ${chronology[2].paragraphIndex})`);
    console.log('   ✓ Test 3 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Authority Verification Against Lawful Utah Corpus
  // ---------------------------------------------------------------------------
  console.log('Test 4: Legal Citation Verification Against Lawful Utah Corpus...');
  {
    // Valid Utah Statute
    const res1 = LegalResearchService.verifyCitation('Utah Code Ann. § 75-1-201');
    assert.strictEqual(res1.isVerified, true, 'Utah Probate Code definition statute must verify');
    assert.strictEqual(res1.authorityRecord?.authorityType, 'STATUTE');

    // Valid Utah Ethical Rule
    const res2 = LegalResearchService.verifyCitation('Utah R. Prof. Cond. 1.7');
    assert.strictEqual(res2.isVerified, true, 'Utah RPC 1.7 conflict of interest rule must verify');
    assert.strictEqual(res2.authorityRecord?.authorityType, 'ETHICAL_RULE');

    // Valid Utah Supreme Court Landmark Opinion
    const res3 = LegalResearchService.verifyCitation('State v. Rimmasch, 775 P.2d 388 (Utah 1989)');
    assert.strictEqual(res3.isVerified, true, 'State v. Rimmasch must verify');
    assert.strictEqual(res3.authorityRecord?.court, 'Utah Supreme Court');

    console.log(`   ✓ Verified: ${res1.rawCitation} -> "${res1.authorityRecord?.title}"`);
    console.log(`   ✓ Verified: ${res2.rawCitation} -> "${res2.authorityRecord?.title}"`);
    console.log(`   ✓ Verified: ${res3.rawCitation} -> "${res3.authorityRecord?.title}" (${res3.authorityRecord?.court})`);
    console.log('   ✓ Test 4 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Hallucination Guard - Flagging Unsupported / Fabricated Authorities
  // ---------------------------------------------------------------------------
  console.log('Test 5: Hallucination Guard - Flagging Unsupported Authorities...');
  {
    // Fake / Hallucinated citation generated by an LLM
    const fakeCitation = 'Smith v. Utah Highway Commission, 999 P.3d 1234 (Utah 2024)';
    const hallucinationCheck = LegalResearchService.verifyCitation(fakeCitation);

    assert.strictEqual(hallucinationCheck.isVerified, false, 'Fake citation must not be marked verified');
    assert.strictEqual(hallucinationCheck.status, 'UNSUPPORTED_CITATION', 'Must return UNSUPPORTED_CITATION status');
    assert(hallucinationCheck.warning?.includes('could not be confirmed'), 'Must provide actionable warning');

    console.log(`   ✓ Detected unsupported citation: "${fakeCitation}"`);
    console.log(`   ✓ System Flag: ${hallucinationCheck.status}`);
    console.log(`   ✓ Actionable Safeguard Warning: "${hallucinationCheck.warning?.substring(0, 75)}..."`);
    console.log('   ✓ Test 5 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Deposition Transcript Passage Analysis & Line-Level Issue Spotting
  // ---------------------------------------------------------------------------
  console.log('Test 6: Deposition Passage Analysis & Line-Level Issue Spotting...');
  {
    const transcriptPassage = `
Q. Mr. Smith, at the time you approached the 400 South intersection, were you looking at your cellular phone?
A. I received a delivery notification on my phone screen right before the intersection. I glanced down to tap the screen, and when I looked up, the red light was already there.
    `;

    const analysis = LegalResearchService.analyzeDepositionPassage(transcriptPassage, {
      witnessName: 'Johnathan Smith (Defendant Driver)',
      pageNumber: 34,
      startLine: 12,
      endLine: 24,
      transcriptTitle: 'Deposition of Johnathan Smith, Vol. 1',
    });

    assert.strictEqual(analysis.issueCategory, 'LIABILITY_ADMISSION', 'Passage must categorize as LIABILITY_ADMISSION');
    assert.strictEqual(analysis.lineRange, '34:12-24', 'Must link exact Page 34, Lines 12-24');
    assert(analysis.followUpTasks.length >= 2, 'Must generate follow-up cross-examination tasks');

    console.log(`   ✓ Witness: ${analysis.witnessName} | Transcript: ${analysis.transcriptTitle}`);
    console.log(`   ✓ Passage Reference: Page ${analysis.lineRange}`);
    console.log(`   ✓ Issue Spotted: ${analysis.issueCategory} -> "${analysis.analysisNotes}"`);
    console.log(`   ✓ Actionable Tasks:`);
    analysis.followUpTasks.forEach((t) => console.log(`      • ${t}`));
    console.log('   ✓ Test 6 PASSED.\n');
  }

  console.log('================================================================');
  console.log('ALL 6 LEGAL RESEARCH & OCR TESTS PASSED CLEANLY');
  console.log('================================================================\n');
}

runLegalResearchOcrTests().catch((err) => {
  console.error('Legal research & OCR test suite failed:', err);
  process.exit(1);
});
