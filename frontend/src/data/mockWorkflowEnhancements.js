/**
 * Mock Phase 4 Workflow Manager Enhancements:
 * - Conditional Branches
 * - Parallel Tasks
 * - Escalation Rules
 * - Workflow Version Control
 */

export function buildInitialWorkflowEnhancements(practiceAreaNames = []) {
  const customByArea = {
    'Civil Litigation & Dispute Resolution': {
      branches: [
        {
          id: 'BR-CIV-1',
          stageId: 'civ-3',
          stageName: 'Fact Discovery',
          condition: 'IF Opposing Party Fails to Serve URCP Rule 26 Disclosures > 14 Days',
          action: 'Activate Compel Track: Generate Rule 37 Statement of Discovery Issues & Schedule Meet-and-Confer',
          targetStage: 'Dispositive Motions & Pre-Trial',
          isActive: true,
        },
        {
          id: 'BR-CIV-2',
          stageId: 'civ-3',
          stageName: 'Fact Discovery',
          condition: 'IF Both Parties Stipulate to Early Private Mediation',
          action: 'Bypass Contested Motion Queue & Dispatch Joint ADR Settlement Binder Task',
          targetStage: 'Trial & Resolution',
          isActive: false,
        },
        {
          id: 'BR-CIV-3',
          stageId: 'civ-5',
          stageName: 'Dispositive Motions & Pre-Trial',
          condition: 'IF Damages Claimed >= $250,000 AND Expert Report Disputed',
          action: 'Require Senior Partner Rule 56 Review & Oral Argument Moot Session',
          targetStage: 'Trial & Resolution',
          isActive: true,
        },
      ],
      parallelTasks: [
        {
          id: 'PT-CIV-1',
          stageId: 'civ-3',
          taskName: 'Subpoena Third-Party Freight Dispatch Logs',
          assignedUser: 'Marcus Vance (Paralegal)',
          track: 'Track A — Third-Party Evidence',
          dueWindow: 'Day 10 of Stage',
          status: 'Completed',
        },
        {
          id: 'PT-CIV-2',
          stageId: 'civ-3',
          taskName: 'Prepare 30(b)(6) Corporate Representative Outline',
          assignedUser: 'Thomas Bludworth, Esq. (Partner)',
          track: 'Track B — Depositions',
          dueWindow: 'Day 18 of Stage',
          status: 'In Progress',
        },
        {
          id: 'PT-CIV-3',
          stageId: 'civ-3',
          taskName: 'Audit Privilege Log & Bates Stamp Production Set 02',
          assignedUser: 'Sarah Jenkins, Esq. (Associate)',
          track: 'Track C — Document Review',
          dueWindow: 'Day 14 of Stage',
          status: 'Pending',
        },
      ],
      escalations: [
        {
          id: 'ESC-CIV-1',
          condition: 'Mandatory Gatekeeper unverified within 48 hours of URCP statutory cutoff',
          trigger: '48 Hours Before Statutory Deadline',
          timing: 'Initial Alert: T-48h • Follow-up: T-24h • Partner Lock: T-12h',
          responsibleUser: 'Eleanor Heugly, Esq. (Managing Partner)',
          status: 'Active',
        },
        {
          id: 'ESC-CIV-2',
          condition: 'Discovery response task overdue > 3 business days with no extension logged',
          trigger: '3 Business Days Past Task Due Date',
          timing: 'Auto-Notify Supervisor at 72h • Escalate to Lead Partner at 96h',
          responsibleUser: 'Thomas Bludworth, Esq. (Lead Trial Partner)',
          status: 'Triggered',
        },
      ],
    },
    'Family Law & Domestic Relations': {
      branches: [
        {
          id: 'BR-FAM-1',
          stageId: 'fam-2',
          stageName: 'Mandatory Financial Disclosures',
          condition: 'IF Respondent Income Exceeds $180,000 OR Business Ownership Detected',
          action: 'Route to Forensic CPA Valuation Branch & Issue Subpoena Duces Tecum',
          targetStage: 'Custody Evaluation & Mediation',
          isActive: true,
        },
        {
          id: 'BR-FAM-2',
          stageId: 'fam-3',
          stageName: 'Custody Evaluation & Mediation',
          condition: 'IF Rule 4-510 Mediation Reaches Full Stipulation',
          action: 'Generate Final Findings of Fact, Decree Draft & QDRO Checklist',
          targetStage: 'Decree, QDRO & Enforcement',
          isActive: false,
        },
      ],
      parallelTasks: [
        {
          id: 'PT-FAM-1',
          stageId: 'fam-2',
          taskName: 'Verify 12-Month Bank Statements & Retirement Valuations',
          assignedUser: 'Marcus Vance (Paralegal)',
          track: 'Track A — Asset Tracing',
          dueWindow: 'Day 12 of Stage',
          status: 'Completed',
        },
        {
          id: 'PT-FAM-2',
          stageId: 'fam-2',
          taskName: 'Draft URCP 26.1 Financial Declaration Schedules',
          assignedUser: 'Sarah Jenkins, Esq. (Associate)',
          track: 'Track B — Court Disclosures',
          dueWindow: 'Day 14 of Stage',
          status: 'In Progress',
        },
        {
          id: 'PT-FAM-3',
          stageId: 'fam-2',
          taskName: 'Coordinate Real Property Appraisal Inspection',
          assignedUser: 'Elena Vance (Client Liaison)',
          track: 'Track C — Valuation',
          dueWindow: 'Day 15 of Stage',
          status: 'Completed',
        },
      ],
      escalations: [
        {
          id: 'ESC-FAM-1',
          condition: 'URCP 26.1 Financial Declaration unsigned 72 hours prior to Temporary Orders Hearing',
          trigger: '72 Hours Prior to Hearing Date',
          timing: 'Alert Attorney at T-72h • Escalate to Managing Partner at T-24h',
          responsibleUser: 'Sarah Jenkins, Esq. (Family Law Lead)',
          status: 'Monitoring',
        },
      ],
    },
  };

  const result = {};

  practiceAreaNames.forEach((areaName, areaIdx) => {
    const custom = customByArea[areaName];
    const shortArea = areaName.split('&')[0].trim();

    const branches = custom?.branches || [
      {
        id: `BR-${areaIdx}-1`,
        stageId: 'stage-1',
        stageName: 'Initial Review & Gatekeeping',
        condition: `IF ${shortArea} Statutory Notice Deadline < 10 Business Days`,
        action: 'Activate Expedited Partner Sign-Off Path & Daily Deadline Alerting',
        targetStage: 'Expedited Filing Track',
        isActive: true,
      },
      {
        id: `BR-${areaIdx}-2`,
        stageId: 'stage-1',
        stageName: 'Standard Contested Track',
        condition: 'IF Opposing Counsel Files Formal Objection or Contested Pleading',
        action: 'Branch to Contested Hearing Calendar & Assign Litigation Support Paralegal',
        targetStage: 'Contested Resolution',
        isActive: false,
      },
    ];

    const parallelTasks = custom?.parallelTasks || [
      {
        id: `PT-${areaIdx}-1`,
        stageId: 'stage-1',
        taskName: `Collect ${shortArea} Verified Client Intake & Exhibits`,
        assignedUser: 'Marcus Vance (Paralegal)',
        track: 'Track A — Records',
        dueWindow: 'Day 5 of Stage',
        status: 'Completed',
      },
      {
        id: `PT-${areaIdx}-2`,
        stageId: 'stage-1',
        taskName: 'Draft Initial Statutory Compliance & Conflict Memorandum',
        assignedUser: 'Sarah Jenkins, Esq. (Attorney)',
        track: 'Track B — Legal Drafting',
        dueWindow: 'Day 7 of Stage',
        status: 'In Progress',
      },
      {
        id: `PT-${areaIdx}-3`,
        stageId: 'stage-1',
        taskName: 'Verify Trust Retainer Funding & Engagement Agreement',
        assignedUser: 'Rachel Adams (Billing Admin)',
        track: 'Track C — Trust Compliance',
        dueWindow: 'Day 3 of Stage',
        status: 'Pending',
      },
    ];

    const escalations = custom?.escalations || [
      {
        id: `ESC-${areaIdx}-1`,
        condition: 'Mandatory gatekeeper requirement incomplete within 48 hours of stage SLA',
        trigger: '48 Hours Before Stage SLA',
        timing: 'Reminder: T-48h • Supervisor Escalation: T-24h',
        responsibleUser: 'Eleanor Heugly, Esq. (Managing Partner)',
        status: 'Active',
      },
      {
        id: `ESC-${areaIdx}-2`,
        condition: 'Parallel compliance task unstarted 5 days after stage entry',
        trigger: '5 Calendar Days Idle',
        timing: 'Auto-Flag at Day 5 • Reassignment Prompt at Day 7',
        responsibleUser: 'Thomas Bludworth, Esq. (Supervising Partner)',
        status: 'Monitoring',
      },
    ];

    const versions = [
      {
        id: `VER-${areaIdx}-32`,
        workflowName: `${areaName} Master Workflow`,
        versionNumber: 'v3.2',
        createdDate: '2026-09-10',
        lastModifiedDate: '2026-11-02',
        modifiedBy: 'Eleanor Heugly, Esq.',
        status: 'Current',
        summary: 'Added conditional branching for expedited deadlines, 3-track parallel intake verification, and 48-hour partner escalation rule.',
        snapshot: {
          stageCount: areaName.includes('Civil') ? 6 : 4,
          gatekeeperCount: 12,
          branchCount: branches.length,
          parallelTaskCount: parallelTasks.length,
          escalationCount: escalations.length,
          highlights: [
            'Enforced URCP & Utah RPC 1.7 gatekeeper checkpoints',
            'Enabled conditional branch routing on contested filings',
            'Added 48-hour Managing Partner SLA escalation notice',
          ],
        },
      },
      {
        id: `VER-${areaIdx}-31`,
        workflowName: `${areaName} Master Workflow`,
        versionNumber: 'v3.1',
        createdDate: '2026-06-15',
        lastModifiedDate: '2026-08-24',
        modifiedBy: 'Thomas Bludworth, Esq.',
        status: 'Previous',
        summary: 'Updated paralegal due-day offsets and added billing trust verification before closing stage.',
        snapshot: {
          stageCount: areaName.includes('Civil') ? 6 : 4,
          gatekeeperCount: 10,
          branchCount: Math.max(1, branches.length - 1),
          parallelTaskCount: Math.max(2, parallelTasks.length - 1),
          escalationCount: 1,
          highlights: [
            'Reduced intake verification window from 10 to 5 days',
            'Added IOLTA disbursement review gatekeeper',
            'Single-tier escalation rule only (no branch override)',
          ],
        },
      },
      {
        id: `VER-${areaIdx}-30`,
        workflowName: `${areaName} Master Workflow`,
        versionNumber: 'v3.0',
        createdDate: '2026-01-12',
        lastModifiedDate: '2026-05-03',
        modifiedBy: 'Sarah Jenkins, Esq.',
        status: 'Previous',
        summary: 'Initial 2026 Utah State Bar standardized stage pipeline baseline.',
        snapshot: {
          stageCount: areaName.includes('Civil') ? 5 : 4,
          gatekeeperCount: 8,
          branchCount: 0,
          parallelTaskCount: 0,
          escalationCount: 0,
          highlights: [
            'Baseline sequential stage model only',
            'Manual task dispatch without parallel tracks or automated escalations',
          ],
        },
      },
    ];

    result[areaName] = {
      branches,
      parallelTasks,
      escalations,
      versions,
    };
  });

  return result;
}

