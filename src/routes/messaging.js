// src/routes/messaging.js

import express from 'express';
import MessagingService from '../services/MessagingService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const messagingService = new MessagingService();

/**
 * GET /api/message/pending
 * Get the current pending message (consumed by projector UI)
 */
router.get('/pending', (req, res) => {
  try {
    const message = messagingService.getPendingMessage();
    
    if (message) {
      res.json({ message });
    } else {
      res.json({ message: null });
    }
  } catch (error) {
    logger.error('Error getting pending message:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pending message',
      details: error.message 
    });
  }
});

/**
 * POST /api/message/send
 * Send a new message to the projector
 */
router.post('/send', (req, res) => {
  try {
    const { text, priority, type, duration, source } = req.body;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ 
        error: 'Message text is required',
        example: {
          text: "Your message here",
          priority: "normal",
          type: "info",
          duration: 8000,
          source: "AI Agent"
        }
      });
    }

    const result = messagingService.queueMessage({
      text,
      priority,
      type,
      duration,
      source
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Error sending message:', error);
    
    if (error.message.includes('Invalid')) {
      res.status(400).json({ 
        error: error.message,
        validPriorities: ['low', 'normal', 'high', 'urgent'],
        validTypes: ['info', 'success', 'warning', 'alert']
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to queue message',
        details: error.message 
      });
    }
  }
});

/**
 * DELETE /api/message/clear
 * Clear any pending message
 */
router.delete('/clear', (req, res) => {
  try {
    const wasCleared = messagingService.clearPendingMessage();
    
    res.json({
      success: true,
      wasCleared,
      message: wasCleared ? 'Message cleared' : 'No message to clear'
    });
  } catch (error) {
    logger.error('Error clearing message:', error);
    res.status(500).json({ 
      error: 'Failed to clear message',
      details: error.message 
    });
  }
});

/**
 * GET /api/message/status
 * Get messaging service status and statistics
 */
router.get('/status', (req, res) => {
  try {
    const status = messagingService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error getting message status:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve status',
      details: error.message 
    });
  }
});

/**
 * GET /api/message/history
 * Get message history with optional filtering
 */
router.get('/history', (req, res) => {
  try {
    const { priority, type, source, status, limit } = req.query;
    
    const options = {};
    if (priority) options.priority = priority;
    if (type) options.type = type;
    if (source) options.source = source;
    if (status) options.status = status;
    if (limit) options.limit = parseInt(limit, 10);

    const history = messagingService.getHistory(options);
    
    res.json({
      history,
      filters: options,
      total: history.length
    });
  } catch (error) {
    logger.error('Error getting message history:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve history',
      details: error.message 
    });
  }
});

/**
 * GET /api/message/stats
 * Get detailed messaging statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = messagingService.getStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting message statistics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve statistics',
      details: error.message 
    });
  }
});

/**
 * POST /api/message/bulk
 * Send multiple messages (for testing or batch operations)
 */
router.post('/bulk', (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages must be an array',
        example: {
          messages: [
            { text: "First message", priority: "normal" },
            { text: "Second message", priority: "high" }
          ]
        }
      });
    }

    const results = [];
    const errors = [];

    messages.forEach((messageData, index) => {
      try {
        const result = messagingService.queueMessage(messageData);
        results.push({ index, ...result });
      } catch (error) {
        errors.push({ index, error: error.message });
      }
    });

    res.json({
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: messages.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    logger.error('Error processing bulk messages:', error);
    res.status(500).json({ 
      error: 'Failed to process bulk messages',
      details: error.message 
    });
  }
});

// Export both the router and the service instance for use in other modules
export { messagingService };
export default router;