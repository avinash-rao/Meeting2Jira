import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import { ParsedTranscript, ActionItem, ExtractedActionItems } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WatsonXService {
  private client: WatsonXAI;
  private projectId: string;
  private modelId: string = 'meta-llama/llama-3-3-70b-instruct';

  constructor() {
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

    if (!apiKey) {
      throw new Error('WATSONX_API_KEY environment variable is required');
    }
    if (!projectId) {
      throw new Error('WATSONX_PROJECT_ID environment variable is required');
    }

    this.projectId = projectId;

    this.client = WatsonXAI.newInstance({
      version: '2024-05-31',
      serviceUrl: url,
      authenticator: new IamAuthenticator({ apikey: apiKey })
    });
  }

  /**
   * Extract action items from parsed transcript using IBM watsonx.ai
   */
  async extractActionItems(transcript: ParsedTranscript): Promise<ExtractedActionItems> {
    try {
      const prompt = this.buildExtractionPrompt(transcript);

      const params = {
        messages: [{ role: 'user', content: prompt }],
        modelId: this.modelId,
        projectId: this.projectId,
        maxTokens: 2000,
        temperature: 0.3
      };
      const response = await this.client.textChat(params);

      if (!response.result || !response.result.choices || response.result.choices.length === 0) {
        throw new Error('No response from watsonx.ai');
      }

      const generatedText = response.result.choices[0].message?.content || '';

      // Extract JSON from response (watsonx may include extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from watsonx.ai response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const actionItems: ActionItem[] = (parsed.actionItems || []).map((item: any) => ({
        id: uuidv4(),
        title: item.title || 'Untitled Action Item',
        description: item.description || '',
        assignee: item.assignee || 'Unassigned',
        priority: this.validatePriority(item.priority),
        dueDate: item.dueDate,
        confidenceScore: Math.min(100, Math.max(0, item.confidenceScore || 50)),
        sourceQuote: item.sourceQuote || '',
        timestamp: item.timestamp
      }));

      return {
        items: actionItems,
        totalCount: actionItems.length,
        extractedAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('watsonx.ai extraction error:', error);
      throw new Error(`Failed to extract action items: ${error.message}`);
    }
  }

  /**
   * Build the extraction prompt from transcript
   */
  private buildExtractionPrompt(transcript: ParsedTranscript): string {
    const speakersList = transcript.speakers.join(', ');

    const transcriptText = transcript.entries
      .map(entry => {
        const timestamp = entry.timestamp ? `[${entry.timestamp}] ` : '';
        return `${timestamp}${entry.speaker}: ${entry.text}`;
      })
      .join('\n');

    return `You are an expert at analyzing meeting transcripts and extracting actionable items.

Analyze this meeting transcript and extract all action items, tasks, and commitments.

MEETING PARTICIPANTS: ${speakersList}

TRANSCRIPT:
${transcriptText}

Extract action items and return them in this exact JSON format (return ONLY the JSON, no additional text):
{
  "actionItems": [
    {
      "title": "Brief action item title",
      "description": "Detailed description of what needs to be done",
      "assignee": "Name of person responsible (must be from participants list)",
      "priority": "High|Medium|Low",
      "dueDate": "YYYY-MM-DD or null if not mentioned",
      "confidenceScore": 85,
      "sourceQuote": "Exact quote from transcript that indicates this action",
      "timestamp": "HH:MM:SS if available"
    }
  ]
}

GUIDELINES:
- Only extract clear action items, tasks, or commitments
- Assignee must be one of the meeting participants: ${speakersList}
- If no specific person is assigned, use the person who mentioned the task
- Priority: High (urgent/critical), Medium (important), Low (nice to have)
- Confidence score: 80-100 (explicit), 60-79 (implied), 40-59 (uncertain)
- Include the exact quote that supports each action item
- If a due date is mentioned, extract it; otherwise leave as null
- Return ONLY the JSON object, no additional text or markdown`;
  }

  /**
   * Validate and normalize priority value
   */
  private validatePriority(priority: string): 'High' | 'Medium' | 'Low' {
    const normalized = priority?.toLowerCase();
    if (normalized === 'high') return 'High';
    if (normalized === 'low') return 'Low';
    return 'Medium';
  }

  /**
   * Test watsonx.ai connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const params = {
        messages: [{ role: 'user', content: 'Test connection' }],
        modelId: this.modelId,
        projectId: this.projectId,
        maxTokens: 10
      };
      await this.client.textChat(params);
      return true;
    } catch (error) {
      console.error('watsonx.ai connection test failed:', error);
      return false;
    }
  }
}

// Made with Bob