import { Request, Response } from 'express';
import { ExtractController } from '../extract.controller';
import { WatsonXService } from '../../services/watsonx.service';
import { ParsedTranscript, ExtractedActionItems } from '../../types';

// Mock WatsonX Service
jest.mock('../../services/watsonx.service');

describe('ExtractController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    jest.clearAllMocks();
  });

  describe('extractActionItems', () => {
    const validTranscript: ParsedTranscript = {
      speakers: ['John Doe', 'Jane Smith'],
      entries: [
        {
          timestamp: '00:00:05.000',
          speaker: 'John Doe',
          text: 'Jane, can you prepare the report?'
        }
      ],
      metadata: {
        date: '2024-01-15T10:30:00.000Z'
      }
    };

    const mockExtractedItems: ExtractedActionItems = {
      items: [
        {
          id: '123',
          title: 'Prepare report',
          description: 'Prepare the quarterly report',
          assignee: 'Jane Smith',
          priority: 'High',
          confidenceScore: 90,
          sourceQuote: 'Jane, can you prepare the report?',
          timestamp: '00:00:05.000'
        }
      ],
      totalCount: 1,
      extractedAt: '2024-01-15T10:35:00.000Z'
    };

    it('should extract action items successfully', async () => {
      mockRequest.body = validTranscript;

      const mockExtractActionItems = jest.fn().mockResolvedValue(mockExtractedItems);
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.extractActionItems = mockExtractActionItems;

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockExtractedItems,
        message: 'Successfully extracted 1 action item(s)'
      });
    });

    it('should return 400 if transcript is missing', async () => {
      mockRequest.body = null;

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid transcript data. Expected ParsedTranscript object with entries array.'
      });
    });

    it('should return 400 if entries array is missing', async () => {
      mockRequest.body = {
        speakers: ['John Doe'],
        metadata: {}
      };

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid transcript data. Expected ParsedTranscript object with entries array.'
      });
    });

    it('should return 400 if entries array is empty', async () => {
      mockRequest.body = {
        speakers: ['John Doe'],
        entries: [],
        metadata: {}
      };

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Transcript is empty. No entries to process.'
      });
    });

    it('should handle OpenAI API key error', async () => {
      mockRequest.body = validTranscript;

      const mockExtractActionItems = jest.fn().mockRejectedValue(
        new Error('WATSONX_API_KEY environment variable is required')
      );
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.extractActionItems = mockExtractActionItems;

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'watsonx.ai credentials are not configured. Please set WATSONX_API_KEY and WATSONX_PROJECT_ID environment variables.'
      });
    });

    it('should handle generic extraction errors', async () => {
      mockRequest.body = validTranscript;

      const mockExtractActionItems = jest.fn().mockRejectedValue(
        new Error('API rate limit exceeded')
      );
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.extractActionItems = mockExtractActionItems;

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'API rate limit exceeded'
      });
    });

    it('should handle multiple action items', async () => {
      mockRequest.body = validTranscript;

      const multipleItems: ExtractedActionItems = {
        items: [
          {
            id: '1',
            title: 'Task 1',
            description: 'Description 1',
            assignee: 'John Doe',
            priority: 'High',
            confidenceScore: 90,
            sourceQuote: 'Quote 1'
          },
          {
            id: '2',
            title: 'Task 2',
            description: 'Description 2',
            assignee: 'Jane Smith',
            priority: 'Medium',
            confidenceScore: 85,
            sourceQuote: 'Quote 2'
          }
        ],
        totalCount: 2,
        extractedAt: '2024-01-15T10:35:00.000Z'
      };

      const mockExtractActionItems = jest.fn().mockResolvedValue(multipleItems);
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.extractActionItems = mockExtractActionItems;

      await ExtractController.extractActionItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: multipleItems,
        message: 'Successfully extracted 2 action item(s)'
      });
    });
  });

  describe('testConnection', () => {
    it('should return success when connection is successful', async () => {
      const mockTestConnection = jest.fn().mockResolvedValue(true);
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.testConnection = mockTestConnection;

      await ExtractController.testConnection(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'watsonx.ai connection successful',
        data: {
          model: 'meta-llama/llama-3-3-70b-instruct',
          status: 'connected'
        }
      });
    });

    it('should return error when connection fails', async () => {
      const mockTestConnection = jest.fn().mockResolvedValue(false);
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.testConnection = mockTestConnection;

      await ExtractController.testConnection(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to connect to watsonx.ai'
      });
    });

    it('should handle connection test errors', async () => {
      const mockTestConnection = jest.fn().mockRejectedValue(
        new Error('Network error')
      );
      (WatsonXService as jest.MockedClass<typeof WatsonXService>).prototype.testConnection = mockTestConnection;

      await ExtractController.testConnection(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('getInfo', () => {
    it('should return extraction capabilities info', () => {
      ExtractController.getInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          model: 'meta-llama/llama-3-3-70b-instruct',
          provider: 'IBM watsonx.ai',
          capabilities: [
            'Extract action items from meeting transcripts',
            'Identify assignees from participants',
            'Suggest priorities based on context',
            'Calculate confidence scores',
            'Include source quotes and timestamps'
          ],
          inputFormat: 'ParsedTranscript object',
          outputFormat: 'ExtractedActionItems object'
        }
      });
    });
  });
});

// Made with Bob