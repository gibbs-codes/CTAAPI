// src/services/CalendarServiceClient.js
// Client to connect CTAAAPI to your standalone CalendarService

import { logger } from '../utils/logger.js';

class CalendarServiceClient {
  constructor() {
    // Your CalendarService URL (adjust port if different)
    this.baseUrl = process.env.CALENDAR_SERVICE_URL || 'http://localhost:3000';
    this.timeout = 10000; // 10 second timeout
  }

  /**
   * Get today's events from the standalone CalendarService
   * @returns {Promise<Array>} Array of events in CTAAAPI expected format
   */
  async getTodaysEvents() {
    try {
      logger.info(`📅 Fetching today's events from CalendarService at ${this.baseUrl}`);
      
      const response = await fetch(`${this.baseUrl}/events/today`, {
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`CalendarService responded with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`📅 CalendarService returned ${data.count || 0} events`);

      // Transform CalendarService response to CTAAAPI format
      return this.transformToCtaapiFormat(data);

    } catch (error) {
      logger.error('❌ Error fetching events from CalendarService:', error.message);
      
      // Return empty array instead of crashing - maintains API compatibility
      return [];
    }
  }

  /**
   * Transform CalendarService response to CTAAAPI expected format
   * CalendarService returns: { date, count, events: [...] }
   * CTAAAPI expects: [{ title, description, location, start, end }, ...]
   * 
   * @param {Object} calendarServiceData - Response from CalendarService
   * @returns {Array} Events in CTAAAPI format
   */
  transformToCtaapiFormat(calendarServiceData) {
    // Handle CalendarService response format: { date, count, events }
    if (calendarServiceData.events && Array.isArray(calendarServiceData.events)) {
      return calendarServiceData.events.map(event => this.transformSingleEvent(event));
    }
    
    // Fallback: if response is already an array
    if (Array.isArray(calendarServiceData)) {
      return calendarServiceData.map(event => this.transformSingleEvent(event));
    }

    logger.warn('⚠️ Unexpected CalendarService response format:', calendarServiceData);
    return [];
  }

  /**
   * Transform a single event from CalendarService format to CTAAAPI format
   * CalendarService events have: { id, summary, start: {dateTime}, end: {dateTime}, description, location }
   * CTAAAPI expects: { title, description, location, start, end } where start/end are formatted strings
   * 
   * @param {Object} event - Single event from CalendarService
   * @returns {Object} Event in CTAAAPI format
   */
  transformSingleEvent(event) {
    return {
      // Map CalendarService fields to CTAAAPI expected fields
      title: event.summary || event.title || 'No Title',
      description: event.description || '',
      location: event.location || '',
      
      // Format start/end times to match CTAAAPI's current format (h:mm A)
      start: this.formatTimeForCtaapi(event.start?.dateTime || event.start),
      end: this.formatTimeForCtaapi(event.end?.dateTime || event.end)
    };
  }

  /**
   * Format time from CalendarService to CTAAAPI expected format
   * CalendarService gives: "2024-12-20T09:00:00-08:00" or similar
   * CTAAAPI expects: "9:00 AM" format
   * 
   * @param {string|Date} timeInput - Time from CalendarService
   * @returns {string} Formatted time string like "9:00 AM"
   */
  formatTimeForCtaapi(timeInput) {
    if (!timeInput) return '';
    
    try {
      const date = new Date(timeInput);
      
      // Return in format like "9:00 AM" to match existing CTAAAPI format
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Chicago', // Match your timezone
        hour12: true
      });
    } catch (error) {
      logger.error('Error formatting time:', timeInput, error);
      return timeInput?.toString() || '';
    }
  }

  /**
   * Health check for CalendarService
   * @returns {Promise<boolean>} Whether CalendarService is responsive
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        timeout: 5000,
        method: 'GET'
      });
      const isHealthy = response.ok;
      
      if (isHealthy) {
        logger.info('✅ CalendarService health check passed');
      } else {
        logger.warn(`⚠️ CalendarService health check failed: ${response.status}`);
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('❌ CalendarService health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get configuration info for debugging
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      endpoints: {
        today: `${this.baseUrl}/events/today`,
        health: `${this.baseUrl}/health`
      }
    };
  }
}

// Export singleton instance
export const calendarServiceClient = new CalendarServiceClient();