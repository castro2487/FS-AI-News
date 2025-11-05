/**
 * Notification Service
 * Mock implementation for AWS SES/SNS integration
 * Currently logs to console, can be replaced with actual AWS SDK calls
 */

export class NotificationService {
  /**
   * Send notification (async, non-blocking)
   */
  async sendNotification(message: string): Promise<void> {
    // Simulate async operation
    return new Promise((resolve) => {
      setImmediate(() => {
        console.log(`[NOTIFICATION] ${message}`);
        resolve();
      });
    });
  }

  /**
   * Log event action (for status transitions)
   */
  logEvent(message: string): void {
    console.log(`[EVENT_LOG] ${message}`);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
