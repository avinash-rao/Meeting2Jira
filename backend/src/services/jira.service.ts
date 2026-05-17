import axios, { AxiosInstance } from 'axios';
import { JiraConfig, JiraUser, JiraTicket, JiraCreateResponse, ActionItem } from '../types';

export class JiraService {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.validateConfig(config);
    this.config = config;

    // Create axios instance with basic auth
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    
    this.client = axios.create({
      baseURL: `https://${config.domain}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Validate Jira configuration
   */
  private validateConfig(config: JiraConfig): void {
    if (!config.domain) {
      throw new Error('Jira domain is required');
    }
    if (!config.email) {
      throw new Error('Jira email is required');
    }
    if (!config.apiToken) {
      throw new Error('Jira API token is required');
    }
    if (!config.projectKey) {
      throw new Error('Jira project key is required');
    }

    // Validate domain format
    if (!config.domain.includes('.atlassian.net')) {
      throw new Error('Invalid Jira domain. Expected format: yourcompany.atlassian.net');
    }
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/myself');
      return true;
    } catch (error: any) {
      console.error('Jira connection test failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get all active users in the Jira instance
   */
  async getUsers(): Promise<JiraUser[]> {
    try {
      const response = await this.client.get('/users/search', {
        params: {
          maxResults: 1000
        }
      });

      return response.data
        .filter((user: any) => user.active)
        .map((user: any) => ({
          accountId: user.accountId,
          displayName: user.displayName,
          emailAddress: user.emailAddress,
          active: user.active
        }));
    } catch (error: any) {
      console.error('Failed to fetch Jira users:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Jira users: ${error.message}`);
    }
  }

  /**
   * Find Jira user by name using fuzzy matching
   */
  async findUserByName(name: string): Promise<JiraUser | null> {
    try {
      const users = await this.getUsers();
      const normalizedName = name.toLowerCase().trim();

      // Exact match
      let match = users.find(user => 
        user.displayName.toLowerCase() === normalizedName
      );

      if (match) return match;

      // Partial match (contains)
      match = users.find(user => 
        user.displayName.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(user.displayName.toLowerCase())
      );

      if (match) return match;

      // First name or last name match
      const nameParts = normalizedName.split(' ');
      match = users.find(user => {
        const userNameParts = user.displayName.toLowerCase().split(' ');
        return nameParts.some(part => userNameParts.includes(part));
      });

      return match || null;
    } catch (error: any) {
      console.error('User search failed:', error.message);
      return null;
    }
  }

  /**
   * Create a single Jira ticket from action item
   */
  async createTicket(actionItem: ActionItem, assigneeAccountId?: string): Promise<JiraTicket> {
    try {
      // If assignee was specified but not found, throw specific error
      if (actionItem.assignee && actionItem.assignee !== 'Unassigned' && !assigneeAccountId) {
        throw new Error(`ASSIGNEE_NOT_FOUND: Could not find Jira user matching "${actionItem.assignee}". Please check the name or leave unassigned.`);
      }

      const issueData = {
        fields: {
          project: {
            key: this.config.projectKey
          },
          summary: actionItem.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: actionItem.description
                  }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: '\n---\n',
                    marks: [{ type: 'strong' }]
                  }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Source: ',
                    marks: [{ type: 'strong' }]
                  },
                  {
                    type: 'text',
                    text: actionItem.sourceQuote
                  }
                ]
              },
              ...(actionItem.timestamp ? [{
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Timestamp: ',
                    marks: [{ type: 'strong' }]
                  },
                  {
                    type: 'text',
                    text: actionItem.timestamp
                  }
                ]
              }] : []),
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `Confidence Score: ${actionItem.confidenceScore}%`,
                    marks: [{ type: 'em' }]
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: 'Task'
          },
          priority: {
            name: this.mapPriority(actionItem.priority)
          },
          ...(assigneeAccountId && {
            assignee: {
              accountId: assigneeAccountId
            }
          }),
          ...(actionItem.dueDate && {
            duedate: actionItem.dueDate
          })
        }
      };

      const response = await this.client.post('/issue', issueData);

      return {
        id: response.data.id,
        key: response.data.key,
        self: response.data.self
      };
    } catch (error: any) {
      console.error('Failed to create Jira ticket:', error.response?.data || error.message);
      throw new Error(`Failed to create ticket: ${error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : error.message}`);
    }
  }

  /**
   * Create multiple Jira tickets from action items
   */
  async createTickets(actionItems: ActionItem[]): Promise<JiraCreateResponse> {
    const created: Array<JiraTicket & { itemId: string }> = [];
    const failed: Array<{ itemId: string; item: ActionItem; error: string }> = [];

    for (const item of actionItems) {
      try {
        // Try to find Jira user for assignee
        let assigneeAccountId: string | undefined;
        if (item.assignee && item.assignee !== 'Unassigned') {
          const user = await this.findUserByName(item.assignee);
          if (user) {
            assigneeAccountId = user.accountId;
          } else {
            // Log warning if user not found but continue without assignee
            console.warn(`User '${item.assignee}' not found in Jira. Creating ticket without assignee.`);
          }
        }

        const ticket = await this.createTicket(item, assigneeAccountId);
        created.push({
          ...ticket,
          itemId: item.id
        });
      } catch (error: any) {
        failed.push({
          itemId: item.id,
          item,
          error: error.message
        });
      }
    }

    return {
      success: failed.length === 0,
      created,
      failed
    };
  }

  /**
   * Map action item priority to Jira priority
   */
  private mapPriority(priority: 'High' | 'Medium' | 'Low'): string {
    const priorityMap: Record<string, string> = {
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low'
    };
    return priorityMap[priority] || 'Medium';
  }

  /**
   * Get project information
   */
  async getProject(): Promise<any> {
    try {
      const response = await this.client.get(`/project/${this.config.projectKey}`);
      return {
        id: response.data.id,
        key: response.data.key,
        name: response.data.name,
        projectTypeKey: response.data.projectTypeKey
      };
    } catch (error: any) {
      console.error('Failed to fetch project:', error.response?.data || error.message);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }
}

// Made with Bob