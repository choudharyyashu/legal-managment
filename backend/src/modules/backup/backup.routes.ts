/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Backup & Disaster Recovery Routes
 */

import { Router } from 'express';
import { BackupController } from './backup.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const backupRouter = Router();

// Requires authentication and Super Admin / Managing Partner privilege
backupRouter.use(requireAuth);
backupRouter.use(requireRole(['super_admin', 'supervisor']));

backupRouter.get('/status', BackupController.getStatus);
backupRouter.get('/snapshots', BackupController.getSnapshots);
backupRouter.post('/trigger', BackupController.triggerBackup);
backupRouter.post('/test-restore', BackupController.testRestore);
