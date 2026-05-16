import { Router } from 'express';
import { ExtractController } from '../controllers/extract.controller';

const router = Router();

/**
 * POST /api/extract
 * Extract action items from parsed transcript
 * Body: ParsedTranscript object
 */
router.post('/', ExtractController.extractActionItems);

/**
 * GET /api/extract/test
 * Test OpenAI API connection
 */
router.get('/test', ExtractController.testConnection);

/**
 * GET /api/extract/info
 * Get information about extraction capabilities
 */
router.get('/info', ExtractController.getInfo);

export default router;

// Made with Bob