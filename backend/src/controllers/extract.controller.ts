import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';
import { ApiResponse, ParsedTranscript, ExtractedActionItems } from '../types';

export class ExtractController {
  private static openaiService: OpenAIService;

  /**
   * Initialize OpenAI service (lazy loading)
   */
  private static getOpenAIService(): OpenAIService {
    if (!this.openaiService) {
      this.openaiService = new OpenAIService();
    }
    return this.openaiService;
  }

  /**
   * Extract action items from transcript
   * POST /api/extract
   */
  static async extractActionItems(req: Request, res: Response): Promise<void> {
    try {
      const transcript: ParsedTranscript = req.body;

      // Validate request body
      if (!transcript || !transcript.entries || !Array.isArray(transcript.entries)) {
        res.status(400).json({
          success: false,
          error: 'Invalid transcript data. Expected ParsedTranscript object with entries array.'
        } as ApiResponse);
        return;
      }

      if (transcript.entries.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Transcript is empty. No entries to process.'
        } as ApiResponse);
        return;
      }

      // Extract action items using OpenAI
      const service = this.getOpenAIService();
      const extractedItems = await service.extractActionItems(transcript);

      res.json({
        success: true,
        data: extractedItems,
        message: `Successfully extracted ${extractedItems.totalCount} action item(s)`
      } as ApiResponse<ExtractedActionItems>);

    } catch (error: any) {
      console.error('Extract error:', error);
      
      // Handle specific OpenAI errors
      if (error.message?.includes('OPENAI_API_KEY')) {
        res.status(500).json({
          success: false,
          error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to extract action items'
      } as ApiResponse);
    }
  }

  /**
   * Test OpenAI connection
   * GET /api/extract/test
   */
  static async testConnection(_req: Request, res: Response): Promise<void> {
    try {
      const service = this.getOpenAIService();
      const isConnected = await service.testConnection();

      if (isConnected) {
        res.json({
          success: true,
          message: 'OpenAI connection successful',
          data: {
            model: 'gpt-4o',
            status: 'connected'
          }
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to connect to OpenAI API'
        } as ApiResponse);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test OpenAI connection'
      } as ApiResponse);
    }
  }

  /**
   * Get extraction info
   * GET /api/extract/info
   */
  static getInfo(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        model: 'gpt-4o',
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
    } as ApiResponse);
  }
}

// Made with Bob