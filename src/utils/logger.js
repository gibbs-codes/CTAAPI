// src/utils/logger.js

/**
 * Simple logger utility for consistent logging across the application
 */
class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Format timestamp for logs
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Check if level should be logged based on current log level
   */
  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message with timestamp and level
   */
  _formatMessage(level, message, ...args) {
    const timestamp = this._getTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (args.length > 0) {
      return [prefix, message, ...args];
    }
    return [prefix, message];
  }

  /**
   * Log error messages
   */
  error(message, ...args) {
    if (this._shouldLog('error')) {
      console.error(...this._formatMessage('error', message, ...args));
    }
  }

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    if (this._shouldLog('warn')) {
      console.warn(...this._formatMessage('warn', message, ...args));
    }
  }

  /**
   * Log info messages
   */
  info(message, ...args) {
    if (this._shouldLog('info')) {
      console.log(...this._formatMessage('info', message, ...args));
    }
  }

  /**
   * Log debug messages
   */
  debug(message, ...args) {
    if (this._shouldLog('debug')) {
      console.log(...this._formatMessage('debug', message, ...args));
    }
  }

  /**
   * Log messages with custom level
   */
  log(level, message, ...args) {
    if (this.levels[level] !== undefined && this._shouldLog(level)) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : console.log;
      consoleMethod(...this._formatMessage(level, message, ...args));
    }
  }
}

// Create and export a singleton logger instance
export const logger = new Logger();
export default logger;