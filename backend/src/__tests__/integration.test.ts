import request from 'supertest';
import express, { Application } from 'express';
import cors from 'cors';
import uploadRoutes from '../routes/upload.routes';
import extractRoutes from '../routes/extract.routes';
import { ParsedTranscript } from '../types';

// Mock WatsonX Service for integration tests
jest.mock('../services/watsonx.service', () => {
  return {
    WatsonXService: jest.fn().mockImplementation(() => ({
      extractActionItems: jest.fn().mockResolvedValue({
        items: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Prepare quarterly report',
            description: 'Prepare and finalize the quarterly report for review',
            assignee: 'Jane Smith',
            priority: 'High',
            dueDate: '2024-01-19',
            confidenceScore: 95,
            sourceQuote: 'Jane, can you prepare the quarterly report by Friday?',
            timestamp: '00:00:05.000'
          }
        ],
        totalCount: 1,
        extractedAt: new Date().toISOString()
      }),
      testConnection: jest.fn().mockResolvedValue(true)
    }))
  };
});

describe('Integration Tests - Phase 2', () => {
  let app: Application;

  beforeAll(() => {
    // Set up test environment
    process.env.WATSONX_API_KEY = 'test-api-key';
    process.env.WATSONX_PROJECT_ID = 'test-project-id';
    process.env.WATSONX_URL = 'https://us-south.ml.cloud.ibm.com';
    process.env.UPLOAD_DIR = './uploads';
    process.env.MAX_FILE_SIZE = '10485760';

    // Create Express app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/upload', uploadRoutes);
    app.use('/api/extract', extractRoutes);
  });

  describe('Extract Endpoints', () => {
    describe('GET /api/extract/info', () => {
      it('should return extraction capabilities', async () => {
        const response = await request(app)
          .get('/api/extract/info')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.model).toBe('meta-llama/llama-3-3-70b-instruct');
        expect(response.body.data.provider).toBe('IBM watsonx.ai');
        expect(response.body.data.capabilities).toBeInstanceOf(Array);
        expect(response.body.data.capabilities.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/extract/test', () => {
      it('should test watsonx.ai connection successfully', async () => {
        const response = await request(app)
          .get('/api/extract/test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('watsonx.ai connection successful');
        expect(response.body.data.model).toBe('meta-llama/llama-3-3-70b-instruct');
        expect(response.body.data.status).toBe('connected');
      });
    });

    describe('POST /api/extract', () => {
      const validTranscript: ParsedTranscript = {
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

      it('should extract action items from valid transcript', async () => {
        const response = await request(app)
          .post('/api/extract')
          .send(validTranscript)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.totalCount).toBe(1);
        expect(response.body.message).toContain('Successfully extracted');

        // Verify action item structure
        const item = response.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('assignee');
        expect(item).toHaveProperty('priority');
        expect(item).toHaveProperty('confidenceScore');
        expect(item).toHaveProperty('sourceQuote');
      });

      it('should return 400 for missing transcript', async () => {
        const response = await request(app)
          .post('/api/extract')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid transcript data');
      });

      it('should return 400 for empty entries array', async () => {
        const response = await request(app)
          .post('/api/extract')
          .send({
            speakers: ['John Doe'],
            entries: [],
            metadata: {}
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Transcript is empty');
      });

      it('should return 400 for missing entries field', async () => {
        const response = await request(app)
          .post('/api/extract')
          .send({
            speakers: ['John Doe'],
            metadata: {}
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid transcript data');
      });
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle complete upload and extract flow', async () => {
      // This test demonstrates the expected flow:
      // 1. Upload transcript file (would be tested with actual file upload)
      // 2. Extract action items from parsed transcript
      
      const mockParsedTranscript: ParsedTranscript = {
        speakers: ['Alice Johnson', 'Bob Williams'],
        entries: [
          {
            timestamp: '00:01:00.000',
            speaker: 'Alice Johnson',
            text: 'Bob, we need to update the documentation by next Monday.'
          },
          {
            timestamp: '00:01:15.000',
            speaker: 'Bob Williams',
            text: 'Got it, I will work on it this week.'
          },
          {
            timestamp: '00:02:00.000',
            speaker: 'Alice Johnson',
            text: 'Also, can you review the pull request I sent yesterday?'
          }
        ],
        metadata: {
          duration: '00:10:00.000',
          date: '2024-01-15T14:00:00.000Z',
          fileName: 'team-meeting.vtt'
        }
      };

      // Step 2: Extract action items
      const extractResponse = await request(app)
        .post('/api/extract')
        .send(mockParsedTranscript)
        .expect(200);

      expect(extractResponse.body.success).toBe(true);
      expect(extractResponse.body.data.items).toBeInstanceOf(Array);
      expect(extractResponse.body.data.totalCount).toBeGreaterThan(0);
    });
  });
});

// Made with Bob