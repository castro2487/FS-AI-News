/**
 * AI Summary Generator
 * Mock deterministic AI summary generation
 * Generates 50-100 token summaries in chunks of 2-5 tokens
 */

import { PublicEvent } from '../models/Event';

export class AISummaryGenerator {
  /**
   * Generate deterministic summary based on event details
   */
  private generateSummary(event: PublicEvent): string {
    const startDate = new Date(event.startAt);
    const endDate = new Date(event.endAt);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)); // hours
    
    const dateStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const timeStr = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const statusInfo = event.status === 'CANCELLED' 
      ? ' This event has been cancelled.' 
      : event.isUpcoming 
        ? ' This is an upcoming event.' 
        : ' This event has already taken place.';

    const summary = `${event.title} is scheduled to take place at ${event.location} on ${dateStr} starting at ${timeStr}. ` +
      `The event is expected to last approximately ${duration} hours. ` +
      `${statusInfo} ` +
      `Attendees can expect a well-organized event with comprehensive planning and execution. ` +
      `The location provides excellent facilities for the event activities. ` +
      `For more information, please contact the event organizers.`;

    return summary;
  }

  /**
   * Split summary into chunks of 2-5 tokens (words)
   */
  private chunkSummary(summary: string): string[] {
    const words = summary.split(' ');
    const chunks: string[] = [];
    let i = 0;

    while (i < words.length) {
      // Random chunk size between 2-5 words (deterministic based on index)
      const chunkSize = 2 + (i % 4);
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
      i += chunkSize;
    }

    return chunks;
  }

  /**
   * Generate summary in streaming fashion
   * Returns chunks with delay to simulate AI generation
   */
  async *generateStreamingSummary(event: PublicEvent): AsyncGenerator<string, void, unknown> {
    const summary = this.generateSummary(event);
    const chunks = this.chunkSummary(summary);

    for (const chunk of chunks) {
      // Simulate AI processing delay (50-150ms per chunk)
      const delay = 50 + Math.floor((chunk.length % 10) * 10);
      await new Promise(resolve => setTimeout(resolve, delay));
      yield chunk;
    }
  }
}

// Singleton instance
export const aiSummaryGenerator = new AISummaryGenerator();
