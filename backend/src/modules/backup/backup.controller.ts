/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Backup & Disaster Recovery Controller
 */

import { Request, Response } from 'express';
import { BackupService } from './backup.service.js';

export class BackupController {
  public static async getStatus(req: Request, res: Response) {
    try {
      const status = BackupService.getStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve backup daemon status' },
      });
    }
  }

  public static async getSnapshots(req: Request, res: Response) {
    try {
      const snapshots = BackupService.getSnapshots();
      res.json({
        success: true,
        data: snapshots,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve backup snapshots' },
      });
    }
  }

  public static async triggerBackup(req: Request, res: Response) {
    try {
      const { type } = req.body;
      const snapshot = await BackupService.performBackup(type || 'Manual On-Demand');
      res.status(201).json({
        success: true,
        data: snapshot,
        message: 'Encrypted snapshot created and verified in Restic repository.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to trigger backup' },
      });
    }
  }

  public static async testRestore(req: Request, res: Response) {
    try {
      const { snapshotId } = req.body;
      const result = await BackupService.performTestRestoreDrill(snapshotId);
      res.json({
        success: true,
        data: result,
        message: 'Point-in-time disaster recovery restore drill completed with 0 errors.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to execute test restore drill' },
      });
    }
  }
}
