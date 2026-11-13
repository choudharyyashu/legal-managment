/**
 * Mock Phase 4 Unmatched Communications Queues (Emails & Messages)
 * Demo / simulation records requiring manual attorney/staff verification and matching.
 */

export const INITIAL_UNMATCHED_EMAILS = [
  {
    id: 'UEM-301',
    senderName: 'Gregory K. Halvorsen',
    senderEmail: 'g.halvorsen@mountainwestadjusters.com',
    subject: 'RE: Cold-Chain Loss Appraisal & Subrogation Exhibits',
    receivedDate: '2026-11-05 15:18 MT',
    preview: 'Attached are the revised compressor inspection photos and loss mitigation spreadsheets. Please confirm which claim docket this belongs under...',
    fullBody:
      'Counsel,\n\nAttached are the revised compressor inspection photos, freight manifest cross-checks, and loss mitigation spreadsheets from last week’s warehouse inspection in Salt Lake City.\n\nPlease confirm which active litigation docket or adjuster reference number should be listed on our final affidavit.\n\nRegards,\nGregory K. Halvorsen\nMountain West Adjusters LLC',
    attachments: ['Compressor_Inspection_Photos.pdf', 'Loss_Mitigation_Sheet_v4.xlsx'],
    suggestedClientId: 'CLI-1001',
    suggestedClientName: 'Wasatch Mountain Logistics LLC',
    suggestedMatterId: 'MAT-2025-0101',
    suggestedMatterLabel: '25-CV-0101 — Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Unmatched',
  },
  {
    id: 'UEM-302',
    senderName: 'Heber Municipal Water Desk',
    senderEmail: 'permits@heberwaterutility.org',
    subject: 'Public Hearing Notice — Recharge Easement Parcel 14B',
    receivedDate: '2026-11-05 11:40 MT',
    preview: 'Notice of continued public administrative hearing scheduled for November 19 regarding culinary recharge basin access...',
    fullBody:
      'Notice to Interested Parties:\n\nThe administrative hearing regarding Parcel 14B Recharge Easement and Culinary Conveyance Application has been continued to November 19, 2026 at 10:00 AM MT.\n\nCounsel of record should enter an updated appearance sheet prior to the hearing date.',
    attachments: ['Notice_Continued_Hearing_14B.pdf'],
    suggestedClientId: 'CLI-1003',
    suggestedClientName: 'Apex Horizon Real Estate Group',
    suggestedMatterId: '',
    suggestedMatterLabel: '',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Unmatched',
  },
  {
    id: 'UEM-303',
    senderName: 'Unknown External Counsel',
    senderEmail: 'intake-notices@utahcourtalerts.example',
    subject: 'Courtesy Copy: Stipulated Scheduling Order Proposal',
    receivedDate: '2026-11-04 16:55 MT',
    preview: 'Please find attached our redlined Rule 26 scheduling stipulation. Let us know if Thomas has objections before Friday filing...',
    fullBody:
      'Hello,\n\nPlease find attached our redlined Rule 26 scheduling stipulation. Let us know if Thomas Bludworth has any objections before we submit via GreenFiling on Friday afternoon.\n\nThank you,\nLitigation Support Desk',
    attachments: ['Redlined_Scheduling_Stipulation.docx'],
    suggestedClientId: '',
    suggestedClientName: '',
    suggestedMatterId: '',
    suggestedMatterLabel: '',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Reviewed',
  },
];

export const INITIAL_UNMATCHED_MESSAGES = [
  {
    id: 'UMS-401',
    senderName: 'Unknown Mobile Contact',
    contactNumber: '+1 (801) 555-0147',
    channel: 'iPhone Export / Manual Log',
    receivedDate: '2026-11-05 14:05 MT',
    preview: 'Hey Sarah, I uploaded the signed financial sheet to the portal just now. Can you check if the retirement statement came through clearly?',
    fullMessage:
      'Hey Sarah, I uploaded the signed financial sheet to the portal just now. Can you check if the retirement statement came through clearly? [Attachment omitted by iOS export — manual portal check required]',
    suggestedClientId: 'CLI-1002',
    suggestedClientName: 'Dr. Evelyn Martinez',
    suggestedMatterId: 'MAT-2025-0201',
    suggestedMatterLabel: '25-DOM-0418 — In re Marriage of Martinez and Sterling',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Unmatched',
  },
  {
    id: 'UMS-402',
    senderName: 'Unmatched VoIP SMS',
    contactNumber: '+1 (435) 555-0199',
    channel: 'Firm VoIP SMS',
    receivedDate: '2026-11-05 09:50 MT',
    preview: 'Confirming our Summit County surveyor will meet your paralegal at the parcel gate Thursday at 2 PM.',
    fullMessage:
      'Confirming our Summit County surveyor will meet your paralegal at the parcel gate Thursday at 2 PM. Call me at this new field number if access code is needed.',
    suggestedClientId: 'CLI-1004',
    suggestedClientName: 'Harrison & Claire Thorne',
    suggestedMatterId: '',
    suggestedMatterLabel: '',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Unmatched',
  },
  {
    id: 'UMS-403',
    senderName: 'Unrecognized SMS Sender',
    contactNumber: '+1 (385) 555-0122',
    channel: 'iPhone Export / Manual Log',
    receivedDate: '2026-11-03 18:12 MT',
    preview: 'Received the subpoena packet at our Salt Lake terminal desk. Forwarding to corporate counsel tomorrow morning.',
    fullMessage:
      'Received the subpoena packet at our Salt Lake terminal desk. Forwarding to corporate counsel tomorrow morning. [Media attachment unavailable due to iPhone sync limitations]',
    suggestedClientId: '',
    suggestedClientName: '',
    suggestedMatterId: '',
    suggestedMatterLabel: '',
    matchedClientName: '',
    matchedMatterLabel: '',
    matchingStatus: 'Reviewed',
  },
];

