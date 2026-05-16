import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

/**
 * POST /api/upload
 * Upload and parse transcript file (.vtt or .docx)
 */
router.post(
  '/',
  uploadMiddleware.single('transcript'),
  UploadController.uploadTranscript
);

/**
 * GET /api/upload/supported-types
 * Get information about supported file types
 */
router.get(
  '/supported-types',
  UploadController.getSupportedTypes
);

export default router;

// Made with Bob
