import { Router } from 'express';
import { JiraController } from '../controllers/jira.controller';

const router = Router();

/**
 * POST /api/jira/create-tickets
 * Create Jira tickets from action items
 * Body: { config: JiraConfig, actionItems: ActionItem[] | ExtractedActionItems }
 */
router.post('/create-tickets', JiraController.createTickets);

/**
 * POST /api/jira/users
 * Get all active Jira users for assignee mapping
 * Body: JiraConfig
 */
router.post('/users', JiraController.getUsers);

/**
 * POST /api/jira/test
 * Test Jira connection and authentication
 * Body: JiraConfig
 */
router.post('/test', JiraController.testConnection);

/**
 * POST /api/jira/find-user
 * Find Jira user by speaker name (fuzzy matching)
 * Body: { config: JiraConfig, name: string }
 */
router.post('/find-user', JiraController.findUser);

/**
 * GET /api/jira/info
 * Get information about Jira integration capabilities
 */
router.get('/info', JiraController.getInfo);

export default router;

// Made with Bob