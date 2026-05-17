import { ParsedTranscript, TranscriptEntry } from '../types';
import { franc } from 'franc';

/**
 * Parse VTT (WebVTT) transcript files
 * Format example:
 * WEBVTT
 *
 * 00:00:00.000 --> 00:00:05.000
 * <v Speaker Name>Dialogue text here
 */
export class VTTParser {
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
   * Parse VTT file content into structured transcript
   */
  static parse(content: string): ParsedTranscript {
    const lines = content.split('\n').map(line => line.trim());
    const entries: TranscriptEntry[] = [];
    const speakersSet = new Set<string>();
    
    let currentTimestamp: string | undefined;
    let currentSpeaker = 'Unknown';
    let currentText = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and WEBVTT header
      if (!line || line === 'WEBVTT' || line.startsWith('NOTE')) {
        continue;
      }
      
      // Check if line is a timestamp
      if (line.includes('-->')) {
        // Save previous entry if exists
        if (currentText) {
          entries.push({
            timestamp: currentTimestamp,
            speaker: currentSpeaker,
            text: currentText.trim()
          });
          speakersSet.add(currentSpeaker);
          currentText = '';
        }
        
        // Extract start timestamp
        currentTimestamp = line.split('-->')[0].trim();
        continue;
      }
      
      // Check if line contains speaker tag <v Speaker Name>
      const speakerMatch = line.match(/<v\s+([^>]+)>/);
      if (speakerMatch) {
        currentSpeaker = speakerMatch[1].trim();
        // Extract text after speaker tag
        currentText = line.replace(/<v\s+[^>]+>/, '').trim();
      } else if (line && !line.match(/^\d+$/)) {
        // Regular dialogue line (not a sequence number)
        // Try to extract speaker from "Speaker: text" format
        const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch) {
          currentSpeaker = colonMatch[1].trim();
          currentText = colonMatch[2].trim();
        } else {
          // Append to current text if no speaker found
          currentText += (currentText ? ' ' : '') + line;
        }
      }
    }
    
    // Add last entry
    if (currentText) {
      entries.push({
        timestamp: currentTimestamp,
        speaker: currentSpeaker,
        text: currentText.trim()
      });
      speakersSet.add(currentSpeaker);
    }
    
    // Calculate duration from last timestamp
    let duration: string | undefined;
    if (entries.length > 0 && entries[entries.length - 1].timestamp) {
      duration = entries[entries.length - 1].timestamp;
    }
    
    // Detect language from transcript text
    const allText = entries.map(e => e.text).join(' ');
    const langCode = franc(allText, { minLength: 10 });
    const language = this.LANGUAGE_NAMES[langCode] || 'Unknown';
    
    return {
      speakers: Array.from(speakersSet),
      entries,
      metadata: {
        duration,
        date: new Date().toISOString(),
        language
      }
    };
  }
  
  /**
   * Validate if content is valid VTT format
   */
  static isValid(content: string): boolean {
    return content.trim().startsWith('WEBVTT') || content.includes('-->');
  }
}

// Made with Bob
