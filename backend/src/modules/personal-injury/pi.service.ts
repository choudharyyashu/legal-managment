/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { MatterService } from '../matters/matter.service.js';
import { AuthenticatedUser } from '../auth/auth.types.js';
import { AutoDraftService } from '../documents/events/auto-draft.service.js';
import {
  IncidentInput,
  MedicalProviderInput,
  MarkIncompleteInput,
} from './pi.types.js';

export class PersonalInjuryService {
  private static async generateRequestCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.medicalRecordRequest.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `MRR-${year}-${sequence}`;
      const existing = await prisma.medicalRecordRequest.findUnique({ where: { requestCode: candidate } });
      if (!existing) return candidate;
    }
    return `MRR-${year}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Retrieves incident and liability investigation details for a PI matter.
   */
  static async getIncident(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const incident = await prisma.incident.findFirst({
      where: { matterId: matter.id },
      include: {
        insurancePolicies: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      matterId: matter.id,
      matterNumber: matter.matterNumber,
      title: matter.title,
      incident: incident || null,
    };
  }

  /**
   * Saves or updates an accident and liability investigation record.
   * Dispatches Document 096 Auto-Draft trigger (Liability Insurer Representation Letter).
   */
  static async saveIncident(
    matterId: string,
    input: IncidentInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    // Upsert or create incident
    let incident = await prisma.incident.findFirst({
      where: { matterId: matter.id },
    });

    const incidentDateObj = input.incidentDate ? new Date(input.incidentDate) : null;

    if (incident) {
      incident = await prisma.incident.update({
        where: { id: incident.id },
        data: {
          incidentDate: incidentDateObj,
          incidentTime: input.incidentTime || null,
          incidentLocation: input.incidentLocation || null,
          accidentType: input.accidentType || null,
          description: input.description || null,
          policeAgency: input.policeAgency || null,
          reportNumber: input.reportNumber || null,
          investigatingOfficer: input.investigatingOfficer || null,
          liabilityAssessment: input.liabilityAssessment || null,
          plaintiffFaultPercentage: input.plaintiffFaultPercentage ?? null,
          adverseFaultPercentage: input.adverseFaultPercentage ?? null,
          notes: input.notes || null,
        },
      });
    } else {
      incident = await prisma.incident.create({
        data: {
          matterId: matter.id,
          incidentDate: incidentDateObj,
          incidentTime: input.incidentTime || null,
          incidentLocation: input.incidentLocation || null,
          accidentType: input.accidentType || null,
          description: input.description || null,
          policeAgency: input.policeAgency || null,
          reportNumber: input.reportNumber || null,
          investigatingOfficer: input.investigatingOfficer || null,
          liabilityAssessment: input.liabilityAssessment || null,
          plaintiffFaultPercentage: input.plaintiffFaultPercentage ?? null,
          adverseFaultPercentage: input.adverseFaultPercentage ?? null,
          notes: input.notes || null,
        },
      });
    }

    // Save Insurance Policy if provided
    let policy = null;
    if (input.insurancePolicy && input.insurancePolicy.insuranceCompany) {
      const polInput = input.insurancePolicy;
      policy = await prisma.insurancePolicy.create({
        data: {
          matterId: matter.id,
          incidentId: incident.id,
          coverageType: polInput.coverageType || 'Liability',
          insuranceCompany: polInput.insuranceCompany,
          policyNumber: polInput.policyNumber || null,
          claimNumber: polInput.claimNumber || null,
          adjusterName: polInput.adjusterName || null,
          adjusterPhone: polInput.adjusterPhone || null,
          adjusterEmail: polInput.adjusterEmail || null,
          adjusterFax: polInput.adjusterFax || null,
          insuredName: polInput.insuredName || null,
          policyLimits: polInput.policyLimits || null,
          status: polInput.status || 'Active',
        },
      });
    }

    // Trigger Document 096 Auto-Draft (Liability Insurer Representation Letter)
    const autoDraftResult = await AutoDraftService.handleAccidentSaved(
      {
        matterId: matter.id,
        incidentDate: input.incidentDate,
        incidentTime: input.incidentTime,
        incidentLocation: input.incidentLocation,
        accidentType: input.accidentType,
        description: input.description,
        policeAgency: input.policeAgency,
        reportNumber: input.reportNumber,
        investigatingOfficer: input.investigatingOfficer,
        insuranceCompany: input.insurancePolicy?.insuranceCompany,
        claimNumber: input.insurancePolicy?.claimNumber,
        adjusterName: input.insurancePolicy?.adjusterName,
        adjusterPhone: input.insurancePolicy?.adjusterPhone,
        adjusterEmail: input.insurancePolicy?.adjusterEmail,
        liabilityAssessment: input.liabilityAssessment,
      },
      currentUser,
      context
    );

    return {
      incident,
      insurancePolicy: policy,
      autoDraftResult,
    };
  }

  /**
   * Retrieves all treating medical providers and their record request history for a PI matter.
   */
  static async getProviders(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const providers = await prisma.medicalProvider.findMany({
      where: { matterId: matter.id },
      include: {
        recordRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return providers;
  }

  /**
   * Adds a medical provider to a PI matter and initializes record request workflow.
   * Dispatches Document 113 (Records Request) and 112 (Medical Authorization) Auto-Draft triggers.
   */
  static async addProvider(
    matterId: string,
    input: MedicalProviderInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const startDate = input.treatmentStartDate ? new Date(input.treatmentStartDate) : null;
    const endDate = input.treatmentEndDate ? new Date(input.treatmentEndDate) : null;

    const provider = await prisma.medicalProvider.create({
      data: {
        matterId: matter.id,
        providerName: input.providerName,
        providerType: input.providerType || 'Clinic / Hospital',
        facilityAddress: input.facilityAddress || null,
        phone: input.phone || null,
        fax: input.fax || null,
        email: input.email || null,
        treatmentStartDate: startDate,
        treatmentEndDate: endDate,
        notes: input.notes || null,
      },
    });

    // Create medical record request record
    const requestCode = await this.generateRequestCode();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days statutory turnaround standard

    const recordRequest = await prisma.medicalRecordRequest.create({
      data: {
        matterId: matter.id,
        providerId: provider.id,
        requestCode,
        status: 'Requested',
        authorizationSigned: Boolean(input.requestAuthorization),
        requestSentDate: new Date(),
        requestDueDate: dueDate,
      },
    });

    // Trigger Document 113 & 112 Auto-Drafts
    const autoDraftResult = await AutoDraftService.handleProviderAdded(
      {
        matterId: matter.id,
        providerName: provider.providerName,
        providerType: provider.providerType || undefined,
        facilityAddress: provider.facilityAddress || undefined,
        phone: provider.phone || undefined,
        fax: provider.fax || undefined,
        email: provider.email || undefined,
        treatmentDates: input.treatmentStartDate && input.treatmentEndDate
          ? `${input.treatmentStartDate} to ${input.treatmentEndDate}`
          : input.treatmentStartDate || undefined,
        requestAuthorization: input.requestAuthorization !== false,
        requestRecords: input.requestRecords !== false,
      },
      currentUser,
      context
    );

    return {
      provider,
      recordRequest,
      autoDraftResult,
    };
  }

  /**
   * Flags received medical records packet as incomplete or deficient.
   * Dispatches Document 116 Auto-Draft trigger (Incomplete medical records follow-up).
   */
  static async markRecordsIncomplete(
    recordRequestId: string,
    input: MarkIncompleteInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const recordRequest = await prisma.medicalRecordRequest.findUnique({
      where: { id: recordRequestId },
      include: {
        provider: true,
        matter: true,
      },
    });

    if (!recordRequest) {
      throw AppError.notFound(`Medical record request '${recordRequestId}' not found.`, 'REQUEST_NOT_FOUND');
    }

    // Authorize matter access (Ethical Wall enforcement)
    await MatterService.getMatterByIdOrNumber(recordRequest.matterId, currentUser);

    const updatedRequest = await prisma.medicalRecordRequest.update({
      where: { id: recordRequestId },
      data: {
        status: 'Incomplete',
        isComplete: false,
        deficiencyNotes: input.deficiencyNotes,
      },
    });

    // Trigger Document 116 Auto-Draft (Incomplete medical records follow-up)
    const autoDraftResult = await AutoDraftService.handleMissingRecords(
      {
        matterId: recordRequest.matterId,
        providerName: recordRequest.provider.providerName,
        daysOverdue: input.daysOverdue || 30,
        outstandingRecords: input.outstandingRecords || [],
        followUpNotes: input.deficiencyNotes,
      },
      currentUser,
      context
    );

    return {
      recordRequest: updatedRequest,
      autoDraftResult,
    };
  }
}
