import OpenAI from 'openai';
import { ParsedTranscript, ActionItem, ExtractedActionItems } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey
    });
  }

  /**
   * Extract action items from parsed transcript using GPT-4o
   */
  async extractActionItems(transcript: ParsedTranscript): Promise<ExtractedActionItems> {
    try {
      const prompt = this.buildExtractionPrompt(transcript);
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing meeting transcripts and extracting actionable items. 
Your task is to identify tasks, action items, and commitments made during the meeting.
For each action item, determine:
- A clear, concise title
- Detailed description
- Who is responsible (assignee)
- Priority level based on urgency and importance
- Due date if mentioned
- Confidence score (0-100) indicating how certain you are this is an action item
- The exact quote from the transcript that supports this action item
- Timestamp if available

Return ONLY valid JSON without any markdown formatting or code blocks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(responseContent);
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
      console.error('OpenAI extraction error:', error);
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

    return `Analyze this meeting transcript and extract all action items, tasks, and commitments.

MEETING PARTICIPANTS: ${speakersList}

TRANSCRIPT:
${transcriptText}

Extract action items and return them in this JSON format:
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
   * Test OpenAI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Made with Bob