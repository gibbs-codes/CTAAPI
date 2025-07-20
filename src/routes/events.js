// src/routes/events.js

import express from 'express';
import { listTodaysEvents } from '../services/CalendarService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/events
 * Get today's calendar events
 */
router.get('/', async (req, res) => {
  try {
    const events = await listTodaysEvents();
    res.json(events);
  } catch (err) {
    logger.error('Failed to fetch calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;