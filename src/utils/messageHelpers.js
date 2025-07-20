// src/utils/messageHelpers.js - Convenience functions for common message patterns

import { messagingService } from '../routes/messaging.js';

/**
 * Pre-built message templates for common scenarios
 */
export class MessageTemplates {
  
  // Morning motivation messages
  static morningMotivation(customText = null) {
    const messages = [
      "🌅 Good morning! Time to dominate this day with intention and energy",
      "☀️ Rise and grind! Your future self is counting on today's actions", 
      "🔥 New day, new opportunities to become legendary. Let's go!",
      "💪 Morning warrior! Your body and mind are ready for greatness"
    ];
    
    const text = customText || messages[Math.floor(Math.random() * messages.length)];
    
    return messagingService.queueMessage({
      text,
      priority: 'normal',
      type: 'success',
      duration: 8000,
      source: 'Morning Coach'
    });
  }

  // Workout reminders with escalating urgency
  static workoutDeadline(minutesRemaining) {
    let priority, type, text;
    
    if (minutesRemaining > 60) {
      priority = 'low';
      type = 'info';
      text = `⏰ ${minutesRemaining} minutes to complete your workout. Plenty of time to crush it!`;
    } else if (minutesRemaining > 30) {
      priority = 'normal';
      type = 'warning';
      text = `⚡ ${minutesRemaining} minutes remaining for your workout. Time to get moving!`;
    } else if (minutesRemaining > 15) {
      priority = 'high';
      type = 'warning';
      text = `🚨 ONLY ${minutesRemaining} MINUTES LEFT! Get to your workout NOW!`;
    } else {
      priority = 'urgent';
      type = 'alert';
      text = `🔥 FINAL WARNING: ${minutesRemaining} minutes to avoid punishment!`;
    }
    
    return messagingService.queueMessage({
      text,
      priority,
      type,
      duration: Math.min(15000, minutesRemaining * 500), // Longer duration for more urgent
      source: 'Deadline Monitor'
    });
  }

  // Achievement celebrations
  static achievement(achievementTitle, bonus = null) {
    const text = bonus 
      ? `🏆 ACHIEVEMENT UNLOCKED: ${achievementTitle}! Bonus earned: $${bonus}`
      : `🎉 ACHIEVEMENT UNLOCKED: ${achievementTitle}! You're building unstoppable momentum!`;
    
    return messagingService.queueMessage({
      text,
      priority: 'high',
      type: 'success',
      duration: 12000,
      source: 'Achievement System'
    });
  }

  // Punishment notifications
  static punishment(violation, punishmentDetails) {
    return messagingService.queueMessage({
      text: `⚠️ CONSEQUENCE ASSIGNED: ${violation}. Punishment: ${punishmentDetails}`,
      priority: 'urgent',
      type: 'alert',
      duration: 20000,
      source: 'Accountability Judge'
    });
  }

  // Progress updates
  static progressUpdate(metric, current, target, timeframe = 'today') {
    const percentage = Math.round((current / target) * 100);
    let type, priority;
    
    if (percentage >= 100) {
      type = 'success';
      priority = 'high';
    } else if (percentage >= 75) {
      type = 'info';
      priority = 'normal';
    } else if (percentage >= 50) {
      type = 'warning';
      priority = 'normal';
    } else {
      type = 'warning';
      priority = 'high';
    }
    
    return messagingService.queueMessage({
      text: `📊 ${metric} Progress (${timeframe}): ${current}/${target} (${percentage}%)`,
      priority,
      type,
      duration: 8000,
      source: 'Progress Tracker'
    });
  }

  // Weekly review summary
  static weeklyReview(data) {
    const { grade, workouts, violations, earnings } = data;
    let type = grade >= 80 ? 'success' : grade >= 60 ? 'warning' : 'alert';
    
    return messagingService.queueMessage({
      text: `📋 Week Complete! Grade: ${grade}% | Workouts: ${workouts} | Earnings: $${earnings}`,
      priority: 'high',
      type,
      duration: 15000,
      source: 'Weekly Analyzer'
    });
  }

  // Custom urgent alert
  static urgentAlert(message, source = 'Emergency System') {
    return messagingService.queueMessage({
      text: `🚨 URGENT: ${message}`,
      priority: 'urgent',
      type: 'alert',
      duration: 25000,
      source
    });
  }

  // Gentle encouragement
  static encouragement(context = 'general') {
    const encouragements = {
      workout: [
        "Your body is capable of amazing things. Show it what you're made of! 💪",
        "Every rep brings you closer to the person you're becoming",
        "Strong bodies build strong minds. You've got this!"
      ],
      focus: [
        "Deep work creates extraordinary results. Focus is your superpower ⚡",
        "This moment of concentration could change everything",
        "Eliminate distractions. Your future self will thank you"
      ],
      general: [
        "You have everything within you to succeed. Trust the process 🌟",
        "Small consistent actions create massive results",
        "Today is another opportunity to become legendary"
      ]
    };
    
    const messages = encouragements[context] || encouragements.general;
    const text = messages[Math.floor(Math.random() * messages.length)];
    
    return messagingService.queueMessage({
      text,
      priority: 'low',
      type: 'info',
      duration: 6000,
      source: 'Motivational Coach'
    });
  }
}

/**
 * Utility functions for message management
 */
export class MessageUtils {
  
  // Send a quick test message
  static test(level = 'normal') {
    const testMessages = {
      low: { text: "🧪 Low priority test message", priority: 'low', type: 'info' },
      normal: { text: "🧪 Normal test message", priority: 'normal', type: 'info' },
      high: { text: "🧪 High priority test message", priority: 'high', type: 'warning' },
      urgent: { text: "🧪 URGENT TEST MESSAGE", priority: 'urgent', type: 'alert' }
    };
    
    const message = testMessages[level] || testMessages.normal;
    
    return messagingService.queueMessage({
      ...message,
      duration: 5000,
      source: 'Test System'
    });
  }

  // Schedule a delayed message (simple setTimeout approach)
  static scheduleMessage(messageData, delayMs) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = messagingService.queueMessage(messageData);
        resolve(result);
      }, delayMs);
    });
  }

  // Send a sequence of messages with delays
  static async sendSequence(messages, delayBetween = 3000) {
    const results = [];
    
    for (let i = 0; i < messages.length; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      }
      
      const result = messagingService.queueMessage(messages[i]);
      results.push(result);
    }
    
    return results;
  }

  // Clear and send (replaces any pending message)
  static clearAndSend(messageData) {
    messagingService.clearPendingMessage();
    return messagingService.queueMessage(messageData);
  }

  // Get current status in a human-readable format
  static getStatusSummary() {
    const status = messagingService.getStatus();
    
    if (!status.hasPendingMessage) {
      return "No pending messages";
    }
    
    const msg = status.currentMessage;
    return `Pending: "${msg.preview}" (${msg.priority}/${msg.type}) from ${msg.source}`;
  }
}

// Example integration with your existing services:

/*
// In your Discord bot or scheduler:
import { MessageTemplates } from '../utils/messageHelpers.js';

// Morning routine
MessageTemplates.morningMotivation();

// Workout deadline system
const minutesLeft = calculateMinutesUntilDeadline();
MessageTemplates.workoutDeadline(minutesLeft);

// Achievement system
MessageTemplates.achievement("Perfect Week Completed", 50);

// Weekly review
MessageTemplates.weeklyReview({
  grade: 85,
  workouts: 4,
  violations: 1,
  earnings: 425
});
*/