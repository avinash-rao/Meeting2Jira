import { WatsonXService } from '../watsonx.service';
import { ParsedTranscript } from '../../types';

// Mock watsonx.ai
jest.mock('@ibm-cloud/watsonx-ai', () => {
  return jest.fn().mockImplementation(() => ({
    generateText: jest.fn()
  }));
});

describe('WatsonXService', () => {
  let service: WatsonXService;
  let mockWatsonX: any;

  beforeEach(() => {
    // Set up environment
    process.env.WATSONX_API_KEY = 'test-api-key';
    process.env.WATSONX_PROJECT_ID = 'test-project-id';
    process.env.WATSONX_URL = 'https://us-south.ml.cloud.ibm.com';
    
    // Get mocked watsonx instance
    const WatsonXAI = require('@ibm-cloud/watsonx-ai');
    service = new WatsonXService();
    mockWatsonX = new WatsonXAI();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if WATSONX_API_KEY is not set', () => {
      delete process.env.WATSONX_API_KEY;
      expect(() => new WatsonXService()).toThrow('WATSONX_API_KEY environment variable is required');
    });

    it('should throw error if WATSONX_PROJECT_ID is not set', () => {
      process.env.WATSONX_API_KEY = 'test-key';
      delete process.env.WATSONX_PROJECT_ID;
      expect(() => new WatsonXService()).toThrow('WATSONX_PROJECT_ID environment variable is required');
    });

    it('should initialize with credentials', () => {
      process.env.WATSONX_API_KEY = 'test-key';
      process.env.WATSONX_PROJECT_ID = 'test-project';
      expect(() => new WatsonXService()).not.toThrow();
    });
  });

  describe('extractActionItems', () => {
    const mockTranscript: ParsedTranscript = {
      speakers: ['John Doe', 'Jane Smith'],
      entries: [
        {
          timestamp: '00:00:05.000',
          speaker: 'John Doe',
          text: 'Jane, can you prepare the quarterly report by Friday?'
        },
        {
          timestamp: '00:00:10.000',
          speaker: 'Jane Smith',
          text: 'Sure, I will have it ready by end of week.'
        }
      ],
      metadata: {
        duration: '00:15:30.000',
        date: '2024-01-15T10:30:00.000Z',
        fileName: 'meeting.vtt'
      }
    };

    it('should extract action items successfully', async () => {
      const mockResponse = {
        results: [{
          generated_text: JSON.stringify({
            actionItems: [
              {
                title: 'Prepare quarterly report',
                description: 'Prepare and finalize the quarterly report',
                assignee: 'Jane Smith',
                priority: 'High',
                dueDate: '2024-01-19',
                confidenceScore: 95,
                sourceQuote: 'Jane, can you prepare the quarterly report by Friday?',
                timestamp: '00:00:05.000'
              }
            ]
          })
        }]
      };

      mockWatsonX.generateText.mockResolvedValue(mockResponse);

      const result = await service.extractActionItems(mockTranscript);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Prepare quarterly report');
      expect(result.items[0].assignee).toBe('Jane Smith');
      expect(result.items[0].priority).toBe('High');
      expect(result.items[0].confidenceScore).toBe(95);
      expect(result.totalCount).toBe(1);
      expect(result.extractedAt).toBeDefined();
    });

    it('should generate unique IDs for each action item', async () => {
      const mockResponse = {
        results: [{
          generated_text: JSON.stringify({
            actionItems: [
              {
                title: 'Task 1',
                description: 'Description 1',
                assignee: 'John Doe',
                priority: 'High',
                confidenceScore: 90,
                sourceQuote: 'Quote 1'
              },
              {
                title: 'Task 2',
                description: 'Description 2',
                assignee: 'Jane Smith',
                priority: 'Medium',
                confidenceScore: 85,
                sourceQuote: 'Quote 2'
              }
            ]
          })
        }]
      };

      mockWatsonX.generateText.mockResolvedValue(mockResponse);

      const result = await service.extractActionItems(mockTranscript);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBeDefined();
      expect(result.items[1].id).toBeDefined();
      expect(result.items[0].id).not.toBe(result.items[1].id);
    });

    it('should normalize priority values', async () => {
      const mockResponse = {
        results: [{
          generated_text: JSON.stringify({
            actionItems: [
              { title: 'Task 1', priority: 'high', confidenceScore: 90, sourceQuote: 'Quote' },
              { title: 'Task 2', priority: 'LOW', confidenceScore: 80, sourceQuote: 'Quote' },
              { title: 'Task 3', priority: 'invalid', confidenceScore: 70, sourceQuote: 'Quote' }
            ]
          })
        }]
      };

      mockWatsonX.generateText.mockResolvedValue(mockResponse);

      const result = await service.extractActionItems(mockTranscript);

      expect(result.items[0].priority).toBe('High');
      expect(result.items[1].priority).toBe('Low');
      expect(result.items[2].priority).toBe('Medium'); // Default for invalid
    });

    it('should clamp confidence scores to 0-100 range', async () => {
      const mockResponse = {
        results: [{
          generated_text: JSON.stringify({
            actionItems: [
              { title: 'Task 1', confidenceScore: 150, sourceQuote: 'Quote' },
              { title: 'Task 2', confidenceScore: -10, sourceQuote: 'Quote' }
            ]
          })
        }]
      };

      mockWatsonX.generateText.mockResolvedValue(mockResponse);

      const result = await service.extractActionItems(mockTranscript);

      expect(result.items[0].confidenceScore).toBe(100);
      expect(result.items[1].confidenceScore).toBe(0);
    });

    it('should handle empty action items array', async () => {
      const mockResponse = {
        results: [{
          generated_text: JSON.stringify({
            actionItems: []
          })
        }]
      };

      mockWatsonX.generateText.mockResolvedValue(mockResponse);

      const result = await service.extractActionItems(mockTranscript);

      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should throw error if watsonx.ai returns no response', async () => {
      mockWatsonX.generateText.mockResolvedValue({
        results: []
      });

      await expect(service.extractActionItems(mockTranscript))
        .rejects.toThrow('No response from watsonx.ai');
    });

    it('should throw error if watsonx.ai API fails', async () => {
      mockWatsonX.generateText.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(service.extractActionItems(mockTranscript))
        .rejects.toThrow('Failed to extract action items: API rate limit exceeded');
    });

    it('should include timestamps in prompt when available', async () => {
      mockWatsonX.generateText.mockResolvedValue({
        results: [{
          generated_text: JSON.stringify({ actionItems: [] })
        }]
      });

      await service.extractActionItems(mockTranscript);

      const callArgs = mockWatsonX.generateText.mock.calls[0][0];
      const prompt = callArgs.input;

      expect(prompt).toContain('[00:00:05.000]');
      expect(prompt).toContain('John Doe:');
      expect(prompt).toContain('Jane Smith:');
    });

    it('should use correct model and parameters', async () => {
      mockWatsonX.generateText.mockResolvedValue({
        results: [{
          generated_text: JSON.stringify({ actionItems: [] })
        }]
      });

      await service.extractActionItems(mockTranscript);

      const callArgs = mockWatsonX.generateText.mock.calls[0][0];

      expect(callArgs.modelId).toBe('meta-llama/llama-3-3-70b-instruct');
      expect(callArgs.parameters.temperature).toBe(0.3);
      expect(callArgs.projectId).toBeDefined();
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockWatsonX.generateText.mockResolvedValue({ results: [{ generated_text: 'test' }] });

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockWatsonX.generateText).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockWatsonX.generateText.mockRejectedValue(new Error('Connection failed'));

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });
});

// Made with Bob