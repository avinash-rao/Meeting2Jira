import mammoth from 'mammoth';
import { ParsedTranscript, TranscriptEntry } from '../types';
import { franc } from 'franc';

/**
 * Parse DOCX transcript files
 * Handles various formats including:
 * - "Speaker: text" format
 * - "Speaker\ntext" format
 * - Timestamped entries
 */
export class DOCXParser {
  private static readonly LANGUAGE_NAMES: { [key: string]: string } = {
    'eng': 'English',
    'fra': 'French',
    'spa': 'Spanish',
    'deu': 'German',
    'ita': 'Italian',
    'por': 'Portuguese',
    'rus': 'Russian',
    'jpn': 'Japanese',
    'kor': 'Korean',
    'cmn': 'Chinese',
    'ara': 'Arabic',
    'hin': 'Hindi',
    'und': 'Unknown'
  };
  /**
   * Parse DOCX file buffer into structured transcript
   */
  static async parse(buffer: Buffer): Promise<ParsedTranscript> {
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const entries: TranscriptEntry[] = [];
    const speakersSet = new Set<string>();
    
    let currentSpeaker = 'Unknown';
    let currentText = '';
    let currentTimestamp: string | undefined;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip common header/footer text
      if (this.isHeaderOrFooter(line)) {
        continue;
      }
      
      // Check for timestamp pattern (HH:MM:SS or MM:SS)
      const timestampMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*$/);
      if (timestampMatch) {
        currentTimestamp = timestampMatch[1];
        continue;
      }
      
      // Check for "Speaker: text" format
      const speakerColonMatch = line.match(/^([^:]+):\s*(.*)$/);
      if (speakerColonMatch) {
        // Save previous entry if exists
        if (currentText) {
          entries.push({
            timestamp: currentTimestamp,
            speaker: currentSpeaker,
            text: currentText.trim()
          });
          speakersSet.add(currentSpeaker);
          currentTimestamp = undefined;
        }
        
        currentSpeaker = speakerColonMatch[1].trim();
        currentText = speakerColonMatch[2].trim();
        
        // If text is empty, next line might be the content
        if (!currentText && i + 1 < lines.length) {
          currentText = lines[i + 1];
          i++; // Skip next line
        }
        
        // Add entry if we have text
        if (currentText) {
          entries.push({
            timestamp: currentTimestamp,
            speaker: currentSpeaker,
            text: currentText.trim()
          });
          speakersSet.add(currentSpeaker);
          currentText = '';
          currentTimestamp = undefined;
        }
        continue;
      }
      
      // Check if line looks like a speaker name (short, capitalized, no punctuation at end)
      if (this.looksLikeSpeakerName(line) && i + 1 < lines.length) {
        // Save previous entry if exists
        if (currentText) {
          entries.push({
            timestamp: currentTimestamp,
            speaker: currentSpeaker,
            text: currentText.trim()
          });
          speakersSet.add(currentSpeaker);
          currentTimestamp = undefined;
        }
        
        currentSpeaker = line;
        currentText = lines[i + 1];
        i++; // Skip next line
        
        entries.push({
          timestamp: currentTimestamp,
          speaker: currentSpeaker,
          text: currentText.trim()
        });
        speakersSet.add(currentSpeaker);
        currentText = '';
        currentTimestamp = undefined;
        continue;
      }
      
      // Otherwise, append to current text
      currentText += (currentText ? ' ' : '') + line;
    }
    
    // Add last entry if exists
    if (currentText) {
      entries.push({
        timestamp: currentTimestamp,
        speaker: currentSpeaker,
        text: currentText.trim()
      });
      speakersSet.add(currentSpeaker);
    }
    
    // Detect language from transcript text
    const allText = entries.map(e => e.text).join(' ');
    const langCode = franc(allText, { minLength: 10 });
    const language = this.LANGUAGE_NAMES[langCode] || 'Unknown';
    
    return {
      speakers: Array.from(speakersSet),
      entries,
      metadata: {
        date: new Date().toISOString(),
        language
      }
    };
  }
  
  /**
   * Check if line is likely a header or footer
   */
  private static isHeaderOrFooter(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.includes('microsoft teams') ||
      lowerLine.includes('meeting transcript') ||
      lowerLine.includes('page ') ||
      lowerLine.match(/^\d+$/) !== null // Just a number
    );
  }
  
  /**
   * Check if line looks like a speaker name
   */
  private static looksLikeSpeakerName(line: string): boolean {
    return (
      line.length < 50 && // Not too long
      line.length > 2 && // Not too short
      /^[A-Z]/.test(line) && // Starts with capital
      !line.endsWith('.') && // Doesn't end with period
      !line.endsWith('?') && // Doesn't end with question mark
      !line.includes(':') && // Doesn't contain colon
      line.split(' ').length <= 4 // Max 4 words
    );
  }
}

// Made with Bob
