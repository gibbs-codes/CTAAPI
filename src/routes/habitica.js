// src/routes/habitica.js

import express from 'express';
import { fetchTasks } from '../services/HabiticaService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/habitica
 * Get habits and todos from Habitica
 */
router.get('/', async (req, res) => {
  try {
    const { habits, todos } = await fetchTasks();
    res.json({ habits, todos });
  } catch (error) {
    logger.error('Error fetching tasks from Habitica:', error);
    res.status(500).json({ error: 'Failed to fetch Habitica tasks' });
  }
});

export default router;