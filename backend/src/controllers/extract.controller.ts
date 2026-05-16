import { Request, Response } from 'express';
import { WatsonXService } from '../services/watsonx.service';
import { ApiResponse, ParsedTranscript, ExtractedActionItems } from '../types';

export class ExtractController {
  private static watsonxService: WatsonXService;

  /**
   * Initialize watsonx.ai service (lazy loading)
   */
  private static getWatsonXService(): WatsonXService {
    if (!ExtractController.watsonxService) {
      ExtractController.watsonxService = new WatsonXService();
    }
    return ExtractController.watsonxService;
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

      // Extract action items using watsonx.ai
      const service = ExtractController.getWatsonXService();
      const extractedItems = await service.extractActionItems(transcript);

      res.json({
        success: true,
        data: extractedItems,
        message: `Successfully extracted ${extractedItems.totalCount} action item(s)`
      } as ApiResponse<ExtractedActionItems>);

    } catch (error: any) {
      console.error('Extract error:', error);
      
      // Handle specific watsonx.ai errors
      if (error.message?.includes('WATSONX_API_KEY') || error.message?.includes('WATSONX_PROJECT_ID')) {
        res.status(500).json({
          success: false,
          error: 'watsonx.ai credentials are not configured. Please set WATSONX_API_KEY and WATSONX_PROJECT_ID environment variables.'
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
   * Test watsonx.ai connection
   * GET /api/extract/test
   */
  static async testConnection(_req: Request, res: Response): Promise<void> {
    try {
      const service = ExtractController.getWatsonXService();
      const isConnected = await service.testConnection();

      if (isConnected) {
        res.json({
          success: true,
          message: 'watsonx.ai connection successful',
          data: {
            model: 'meta-llama/llama-3-3-70b-instruct',
            status: 'connected'
          }
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to connect to watsonx.ai'
        } as ApiResponse);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test watsonx.ai connection'
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
    } as ApiResponse);
  }
}

// Made with Bob