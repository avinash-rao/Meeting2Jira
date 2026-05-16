import { Request, Response } from 'express';
import { VTTParser } from '../parsers/vtt-parser';
import { DOCXParser } from '../parsers/docx-parser';
import { ApiResponse, ParsedTranscript } from '../types';
import fs from 'fs/promises';

export class UploadController {
  /**
   * Handle transcript file upload and parsing
   * POST /api/upload
   */
  static async uploadTranscript(req: Request, res: Response): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        } as ApiResponse);
        return;
      }

      const file = req.file;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

      let parsedTranscript: ParsedTranscript;

      try {
        // Parse based on file type
        if (fileExtension === 'vtt') {
          // Read VTT file content
          const content = await fs.readFile(file.path, 'utf-8');
          
          // Validate VTT format
          if (!VTTParser.isValid(content)) {
            throw new Error('Invalid VTT file format');
          }
          
          parsedTranscript = VTTParser.parse(content);
        } else if (fileExtension === 'docx') {
          // Read DOCX file buffer
          const buffer = await fs.readFile(file.path);
          parsedTranscript = await DOCXParser.parse(buffer);
        } else {
          throw new Error('Unsupported file type. Only .vtt and .docx files are supported.');
        }

        // Add filename to metadata
        parsedTranscript.metadata.fileName = file.originalname;

        // Clean up uploaded file
        await fs.unlink(file.path);

        // Return parsed transcript
        res.json({
          success: true,
          data: parsedTranscript,
          message: 'Transcript parsed successfully'
        } as ApiResponse<ParsedTranscript>);

      } catch (parseError: any) {
        // Clean up file on parse error
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }

        throw new Error(`Failed to parse transcript: ${parseError.message}`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process transcript'
      } as ApiResponse);
    }
  }

  /**
   * Get supported file types
   * GET /api/upload/supported-types
   */
  static getSupportedTypes(req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        types: ['.vtt', '.docx'],
        maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
        description: 'Microsoft Teams transcript files in VTT or DOCX format'
      }
    } as ApiResponse);
  }
}

// Made with Bob
