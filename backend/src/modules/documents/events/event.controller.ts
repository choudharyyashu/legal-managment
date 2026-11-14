/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Event-Driven Auto Draft Controller (Phase 4)
 */

import { Request, Response, NextFunction } from 'express';
import { DOCUMENT_EVENT, DocumentEventType } from './event.types.js';
import { AutoDraftService } from './auto-draft.service.js';
import { AppError } from '../../../errors/AppError.js';

export class DocumentEventController {
  /**
   * Returns supported domain events and their automatic document generation triggers.
   */
  static getEventCatalog(req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        events: [
          {
            event: DOCUMENT_EVENT.PI_ACCIDENT_SAVED,
            description: 'Triggered when a Personal Injury accident and liability investigation is saved.',
            targetDocumentCode: '096',
            targetDocumentTitle: 'Liability Insurer Letter of Representation',
            idempotencyScope: 'One per PI matter',
          },
          {
            event: DOCUMENT_EVENT.PI_PROVIDER_ADDED,
            description: 'Triggered when a treating medical provider is linked to a Personal Injury case.',
            targetDocumentCode: '113 & 112',
            targetDocumentTitle: 'Medical Records Request Letter (113) & Medical Authorization Packet (112)',
            idempotencyScope: 'One per treating provider',
          },
          {
            event: DOCUMENT_EVENT.PI_MISSING_RECORDS,
            description: 'Triggered when medical records are flagged as overdue or missing.',
            targetDocumentCode: '115',
            targetDocumentTitle: 'Medical Records Deficiency Follow-up Letter',
            idempotencyScope: 'One per provider per calendar day',
          },
        ],
      },
    });
  }

  /**
   * Dispatches a domain event and synchronously executes auto-draft evaluation.
   */
  static async triggerEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event, matterId, payload } = req.body;

      if (!event || !matterId) {
        throw AppError.badRequest('Both "event" and "matterId" are required in the trigger payload.');
      }

      const user = (req as any).user;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      let result;

      switch (event) {
        case DOCUMENT_EVENT.PI_ACCIDENT_SAVED:
          result = await AutoDraftService.handleAccidentSaved(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_PROVIDER_ADDED:
          result = await AutoDraftService.handleProviderAdded(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_MISSING_RECORDS:
          result = await AutoDraftService.handleMissingRecords(
            { matterId, ...payload },
            user,
            context
          );
          break;

        default:
          throw AppError.badRequest(`Unknown document trigger event: '${event}'`);
      }

      res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

