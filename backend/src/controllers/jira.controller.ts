import { Request, Response } from 'express';
import { JiraService } from '../services/jira.service';
import { ApiResponse, JiraConfig, JiraCreateResponse, ActionItem, ExtractedActionItems } from '../types';

export class JiraController {
  /**
   * Create Jira tickets from action items
   * POST /api/jira/create-tickets
   */
  static async createTickets(req: Request, res: Response): Promise<void> {
    try {
      const { config, actionItems } = req.body as {
        config: JiraConfig;
        actionItems: ActionItem[] | ExtractedActionItems;
      };

      // Validate config
      if (!config || !config.domain || !config.email || !config.apiToken || !config.projectKey) {
        res.status(400).json({
          success: false,
          error: 'Invalid Jira configuration. Required: domain, email, apiToken, projectKey'
        } as ApiResponse);
        return;
      }

      // Extract action items array
      let items: ActionItem[];
      if (Array.isArray(actionItems)) {
        items = actionItems;
      } else if (actionItems && 'items' in actionItems) {
        items = actionItems.items;
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid action items. Expected array or ExtractedActionItems object'
        } as ApiResponse);
        return;
      }

      if (items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No action items to create'
        } as ApiResponse);
        return;
      }

      // Create Jira service instance
      const jiraService = new JiraService(config);

      // Test connection first
      const isConnected = await jiraService.testConnection();
      if (!isConnected) {
        res.status(401).json({
          success: false,
          error: 'Failed to authenticate with Jira. Please check your credentials.'
        } as ApiResponse);
        return;
      }

      // Create tickets
      const result = await jiraService.createTickets(items);

      // Build response with ticket URLs
      const createdWithUrls = result.created.map(ticket => ({
        ...ticket,
        url: `https://${config.domain}/browse/${ticket.key}`
      }));

      res.json({
        success: result.success,
        data: {
          ...result,
          created: createdWithUrls
        },
        message: `Successfully created ${result.created.length} ticket(s)${result.failed.length > 0 ? `, ${result.failed.length} failed` : ''}`
      } as ApiResponse<JiraCreateResponse>);

    } catch (error: any) {
      console.error('Create tickets error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create Jira tickets'
      } as ApiResponse);
    }
  }

  /**
   * Get Jira users for assignee mapping
   * POST /api/jira/users
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as JiraConfig;

      // Validate config
      if (!config || !config.domain || !config.email || !config.apiToken || !config.projectKey) {
        res.status(400).json({
          success: false,
          error: 'Invalid Jira configuration. Required: domain, email, apiToken, projectKey'
        } as ApiResponse);
        return;
      }

      // Create Jira service instance
      const jiraService = new JiraService(config);

      // Test connection first
      const isConnected = await jiraService.testConnection();
      if (!isConnected) {
        res.status(401).json({
          success: false,
          error: 'Failed to authenticate with Jira. Please check your credentials.'
        } as ApiResponse);
        return;
      }

      // Fetch users
      const users = await jiraService.getUsers();

      res.json({
        success: true,
        data: users,
        message: `Found ${users.length} active user(s)`
      } as ApiResponse);

    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch Jira users'
      } as ApiResponse);
    }
  }

  /**
   * Test Jira connection
   * POST /api/jira/test
   */
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as JiraConfig;

      // Validate config
      if (!config || !config.domain || !config.email || !config.apiToken || !config.projectKey) {
        res.status(400).json({
          success: false,
          error: 'Invalid Jira configuration. Required: domain, email, apiToken, projectKey'
        } as ApiResponse);
        return;
      }

      // Create Jira service instance
      const jiraService = new JiraService(config);

      // Test connection
      const isConnected = await jiraService.testConnection();

      if (isConnected) {
        // Get project info
        const project = await jiraService.getProject();

        res.json({
          success: true,
          data: {
            connected: true,
            project: project
          },
          message: 'Successfully connected to Jira'
        } as ApiResponse);
      } else {
        res.status(401).json({
          success: false,
          error: 'Failed to authenticate with Jira. Please check your credentials.'
        } as ApiResponse);
      }

    } catch (error: any) {
      console.error('Test connection error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test Jira connection'
      } as ApiResponse);
    }
  }

  /**
   * Find Jira user by speaker name
   * POST /api/jira/find-user
   */
  static async findUser(req: Request, res: Response): Promise<void> {
    try {
      const { config, name } = req.body as {
        config: JiraConfig;
        name: string;
      };

      // Validate config
      if (!config || !config.domain || !config.email || !config.apiToken || !config.projectKey) {
        res.status(400).json({
          success: false,
          error: 'Invalid Jira configuration'
        } as ApiResponse);
        return;
      }

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Name is required'
        } as ApiResponse);
        return;
      }

      // Create Jira service instance
      const jiraService = new JiraService(config);

      // Find user
      const user = await jiraService.findUserByName(name);

      if (user) {
        res.json({
          success: true,
          data: user,
          message: `Found user: ${user.displayName}`
        } as ApiResponse);
      } else {
        res.json({
          success: false,
          data: null,
          message: `No user found matching: ${name}`
        } as ApiResponse);
      }

    } catch (error: any) {
      console.error('Find user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to find user'
      } as ApiResponse);
    }
  }

  /**
   * Get Jira configuration info
   * GET /api/jira/info
   */
  static getInfo(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        requiredConfig: {
          domain: 'yourcompany.atlassian.net',
          email: 'your-email@company.com',
          apiToken: 'your-api-token',
          projectKey: 'PROJ'
        },
        capabilities: [
          'Create Jira tickets from action items',
          'Bulk ticket creation',
          'Automatic assignee mapping',
          'Fuzzy name matching',
          'Priority mapping',
          'Due date support'
        ],
        issueType: 'Task',
        apiVersion: 'Jira REST API v3'
      }
    } as ApiResponse);
  }
}

// Made with Bob