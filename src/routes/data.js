// src/routes/data.js

import express from 'express';
import { doAll } from '../services/CTAService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/data
 * Get all CTA transit data (buses and trains)
 */
router.get('/', async (req, res) => {
  try {
    const data = await doAll();
    res.json(data);
  } catch (error) {
    logger.error('Error fetching API data:', error);
    res.status(500).json({ error: 'Failed to fetch API data' });
  }
});

export default router;