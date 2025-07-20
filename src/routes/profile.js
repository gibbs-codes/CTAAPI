// src/routes/profile.js

import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory storage for profile (consider moving to database or service)
let currentProfile = 'morning';

/**
 * GET /api/profile
 * Get current profile setting
 */
router.get('/', async (req, res) => {
  try {
    res.json({ profile: currentProfile });
  } catch (error) {
    logger.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * POST /api/profile
 * Update profile setting
 */
router.post('/', async (req, res) => {
  try {
    const { profile: newProfile } = req.body;
    
    if (!newProfile) {
      return res.status(400).json({ error: 'Profile is required' });
    }
    
    currentProfile = newProfile;
    logger.info(`Profile updated to: ${newProfile}`);
    res.json({ profile: currentProfile });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;