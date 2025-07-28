// src/routes/events.js - Updated to use CalendarService

import express from 'express';
import { calendarServiceClient } from '../services/CalendarServiceClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/events
 * Get today's calendar events via CalendarService
 */
router.get('/', async (req, res) => {
  try {
    logger.info('📅 Fetching calendar events via CalendarService...');
    
    // Get events from your standalone CalendarService
    const events = await calendarServiceClient.getTodaysEvents();
    
    if (events.length === 0) {
      logger.info('⚠️ No events returned from CalendarService');
    } else {
      logger.info(`✅ Retrieved ${events.length} events from CalendarService`);
    }
    
    // Return events in the same format CTAAAPI has always used
    res.json(events);
    
  } catch (err) {
    logger.error('❌ Failed to fetch calendar events from CalendarService:', err);
    
    // Return error response
    res.status(500).json({ 
      error: 'Failed to fetch calendar events from CalendarService',
      details: err.message,
      service: 'CalendarService',
      suggestion: 'Check if CalendarService is running on the expected port'
    });
  }
});

/**
 * GET /api/events/debug
 * Debug endpoint to test CalendarService connection
 */
router.get('/debug', async (req, res) => {
  try {
    const healthCheck = await calendarServiceClient.healthCheck();
    const config = calendarServiceClient.getConfig();
    
    let events = [];
    let eventsError = null;
    
    try {
      events = await calendarServiceClient.getTodaysEvents();
    } catch (error) {
      eventsError = error.message;
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      calendarService: {
        config,
        healthCheck,
        eventsCount: events.length,
        eventsError,
        sampleEvents: events.slice(0, 2) // Show first 2 events as sample
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'CalendarService debug failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;