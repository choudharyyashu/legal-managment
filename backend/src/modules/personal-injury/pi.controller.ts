/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Controller
 */

import { Request, Response, NextFunction } from 'express';
import { PersonalInjuryService } from './pi.service.js';
import {
  incidentSchema,
  insurancePolicySchema,
  medicalProviderSchema,
  markIncompleteSchema,
  demandPackageSchema,
} from './pi.validation.js';

export class PersonalInjuryController {
  static async getIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const data = await PersonalInjuryService.getIncident(matterId, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async saveIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = incidentSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.saveIncident(matterId, validated, user, context);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const data = await PersonalInjuryService.getProviders(matterId, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async addProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = medicalProviderSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.addProvider(matterId, validated, user, context);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async markRecordsIncomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const validated = markIncompleteSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.markRecordsIncomplete(id, validated, user, context);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getInsurance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const result = await PersonalInjuryService.getInsurancePolicies(matterId, user);
      res.status(200).json({ success: true, data: result.policies, totalCount: result.totalCount });
    } catch (err) {
      next(err);
    }
  }

  static async createInsurance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = insurancePolicySchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined,
      };

      const result = await PersonalInjuryService.createInsurancePolicy(matterId, validated, user, context);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getDemands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const result = await PersonalInjuryService.getDemandPackages(matterId, user);
      res.status(200).json({ success: true, data: result.demands, totalCount: result.totalCount });
    } catch (err) {
      next(err);
    }
  }

  static async createDemand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = demandPackageSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined,
      };

      const result = await PersonalInjuryService.createDemandPackage(matterId, validated, user, context);
      res.status(201).json({
        success: true,
        data: result.demandPackage,
        eventDispatched: result.eventDispatched,
      });
    } catch (err) {
      next(err);
    }
  }

  static async signAuthorization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matterId = req.params.matterId;
      const requestId = req.params.requestId || req.params.id;
      const user = (req as any).user;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined,
      };

      const result = await PersonalInjuryService.recordAuthorizationSignature(
        matterId,
        requestId,
        req.body,
        user,
        context
      );

      res.status(200).json({
        success: true,
        message: `Medical authorization signature evidence successfully linked to request '${result.recordRequest.requestCode}'.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
