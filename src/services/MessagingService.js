// src/services/MessagingService.js

import { logger } from '../utils/logger.js';

export class MessagingService {
  constructor() {
    this.currentMessage = null;
    this.messageHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Queue a message for display on the projector
   * @param {Object} messageData - The message to queue
   * @param {string} messageData.text - Message content
   * @param {string} messageData.priority - low, normal, high, urgent
   * @param {string} messageData.type - info, success, warning, alert
   * @param {number} messageData.duration - Display duration in ms (3000-30000)
   * @param {string} messageData.source - Message source identifier
   * @returns {Object} Result object with message ID and status
   */
  queueMessage({ text, priority = 'normal', type = 'info', duration = 8000, source = 'AI Agent' }) {
    // Validation
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    const validTypes = ['info', 'success', 'warning', 'alert'];

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Message text is required and must be a non-empty string');
    }

    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Clamp duration to reasonable bounds
    const clampedDuration = Math.max(3000, Math.min(30000, duration));

    const message = {
      id: Date.now() + Math.random(), // Ensure uniqueness
      text: text.trim(),
      priority,
      type,
      duration: clampedDuration,
      source: source.trim(),
      timestamp: new Date().toISOString(),
      queued: true
    };

    // Replace current message if new one is higher priority
    if (this.shouldReplaceCurrentMessage(message)) {
      if (this.currentMessage) {
        logger.info(`📢 Replacing message "${this.currentMessage.text}" with higher priority message`);
        this.addToHistory(this.currentMessage, 'replaced');
      }
      this.currentMessage = message;
    } else if (!this.currentMessage) {
      this.currentMessage = message;
    } else {
      logger.info(`📢 Message queued but lower priority than current message`);
      return {
        messageId: message.id,
        status: 'queued_lower_priority',
        currentMessageId: this.currentMessage.id
      };
    }

    logger.info(`📢 Message queued: "${text}" (${priority}/${type}) from ${source}`);

    return {
      messageId: message.id,
      status: 'queued',
      estimatedDisplayTime: new Date(Date.now() + (this.currentMessage === message ? 0 : this.currentMessage?.duration || 0))
    };
  }

  /**
   * Get the current pending message (consumed by projector UI)
   * @returns {Object|null} Current message or null
   */
  getPendingMessage() {
    if (!this.currentMessage) {
      return null;
    }

    const message = { ...this.currentMessage };
    
    // Mark as sent and move to history
    this.addToHistory(this.currentMessage, 'sent');
    this.currentMessage = null;

    logger.info(`📤 Message sent to projector: "${message.text}"`);

    return message;
  }

  /**
   * Clear the current pending message
   * @returns {boolean} True if message was cleared
   */
  clearPendingMessage() {
    if (this.currentMessage) {
      this.addToHistory(this.currentMessage, 'cleared');
      this.currentMessage = null;
      logger.info('📢 Pending message cleared');
      return true;
    }
    return false;
  }

  /**
   * Get service status and statistics
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      hasPendingMessage: this.currentMessage !== null,
      currentMessage: this.currentMessage ? {
        id: this.currentMessage.id,
        preview: this.currentMessage.text.substring(0, 50) + (this.currentMessage.text.length > 50 ? '...' : ''),
        priority: this.currentMessage.priority,
        type: this.currentMessage.type,
        source: this.currentMessage.source,
        queuedAt: this.currentMessage.timestamp
      } : null,
      messageHistory: {
        total: this.messageHistory.length,
        recent: this.messageHistory.slice(-5).map(entry => ({
          preview: entry.message.text.substring(0, 30) + '...',
          priority: entry.message.priority,
          source: entry.message.source,
          status: entry.status,
          timestamp: entry.completedAt
        }))
      },
      statistics: this.getStatistics()
    };
  }

  /**
   * Get message statistics
   * @returns {Object} Statistics about message usage
   */
  getStatistics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent24h = this.messageHistory.filter(entry => 
      new Date(entry.completedAt) >= last24Hours
    );
    const recent7d = this.messageHistory.filter(entry => 
      new Date(entry.completedAt) >= last7Days
    );

    const priorityCounts = this.messageHistory.reduce((counts, entry) => {
      counts[entry.message.priority] = (counts[entry.message.priority] || 0) + 1;
      return counts;
    }, {});

    const sourceCounts = this.messageHistory.reduce((counts, entry) => {
      counts[entry.message.source] = (counts[entry.message.source] || 0) + 1;
      return counts;
    }, {});

    return {
      totalMessages: this.messageHistory.length,
      last24Hours: recent24h.length,
      last7Days: recent7d.length,
      priorityDistribution: priorityCounts,
      topSources: Object.entries(sourceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source, count })),
      averageMessagesPerDay: recent7d.length / 7
    };
  }

  /**
   * Get message history with optional filtering
   * @param {Object} options - Filter options
   * @returns {Array} Filtered message history
   */
  getHistory(options = {}) {
    let history = [...this.messageHistory];

    if (options.priority) {
      history = history.filter(entry => entry.message.priority === options.priority);
    }

    if (options.type) {
      history = history.filter(entry => entry.message.type === options.type);
    }

    if (options.source) {
      history = history.filter(entry => entry.message.source === options.source);
    }

    if (options.status) {
      history = history.filter(entry => entry.status === options.status);
    }

    if (options.limit) {
      history = history.slice(-options.limit);
    }

    return history.reverse(); // Most recent first
  }

  /**
   * Determine if a new message should replace the current one
   * @private
   */
  shouldReplaceCurrentMessage(newMessage) {
    if (!this.currentMessage) return true;

    const priorityRank = { low: 1, normal: 2, high: 3, urgent: 4 };
    return priorityRank[newMessage.priority] > priorityRank[this.currentMessage.priority];
  }

  /**
   * Add message to history with completion status
   * @private
   */
  addToHistory(message, status) {
    this.messageHistory.push({
      message: { ...message },
      status, // 'sent', 'replaced', 'cleared'
      completedAt: new Date().toISOString()
    });

    // Trim history if it gets too long
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }
}

export default MessagingService;