import cron from 'node-cron';
import { UserPreferencesModel } from '../models/UserPreferences.js';
import { generateDailyDigest, generateWeeklyDigest } from './digestService.js';

let dailyDigestJob: cron.ScheduledTask | null = null;
let weeklyDigestJob: cron.ScheduledTask | null = null;

/**
 * Parse time string (HH:MM) to cron format
 * @param timeString - Time in HH:MM format
 * @returns Cron time expression
 */
function parseTimeToCron(timeString: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.warn(`Invalid time format: ${timeString}, using default 09:00`);
    return { hour: 9, minute: 0 };
  }

  return { hour, minute };
}

/**
 * Schedule daily digest generation
 * @param time - Time in HH:MM format
 */
function scheduleDailyDigest(time: string) {
  // Stop existing job if any
  if (dailyDigestJob) {
    dailyDigestJob.stop();
    dailyDigestJob = null;
  }

  const { hour, minute } = parseTimeToCron(time);

  // Create cron expression: "minute hour * * *" (every day at specified time)
  const cronExpression = `${minute} ${hour} * * *`;

  console.log(`📅 Scheduling daily digest at ${hour}:${minute.toString().padStart(2, '0')}`);

  dailyDigestJob = cron.schedule(cronExpression, async () => {
    console.log('🎃 Generating scheduled daily digest...');
    try {
      const digest = await generateDailyDigest();
      console.log(`✅ Daily digest generated: ${digest.id}`);
    } catch (error: any) {
      console.error('❌ Error generating daily digest:', error.message);
    }
  });
}

/**
 * Schedule weekly digest generation
 * @param time - Time in HH:MM format
 */
function scheduleWeeklyDigest(time: string) {
  // Stop existing job if any
  if (weeklyDigestJob) {
    weeklyDigestJob.stop();
    weeklyDigestJob = null;
  }

  const { hour, minute } = parseTimeToCron(time);

  // Create cron expression: "minute hour * * 0" (every Sunday at specified time)
  const cronExpression = `${minute} ${hour} * * 0`;

  console.log(
    `📅 Scheduling weekly digest at ${hour}:${minute.toString().padStart(2, '0')} every Sunday`
  );

  weeklyDigestJob = cron.schedule(cronExpression, async () => {
    console.log('🎃 Generating scheduled weekly digest...');
    try {
      const digest = await generateWeeklyDigest();
      console.log(`✅ Weekly digest generated: ${digest.id}`);
    } catch (error: any) {
      console.error('❌ Error generating weekly digest:', error.message);
    }
  });
}

/**
 * Initialize digest scheduler based on user preferences
 */
export function initializeDigestScheduler() {
  try {
    const preferences = UserPreferencesModel.get();
    const { digestFrequency, digestTime } = preferences;

    console.log(
      `🎃 Initializing digest scheduler (frequency: ${digestFrequency}, time: ${digestTime})`
    );

    // Stop all existing jobs
    if (dailyDigestJob) {
      dailyDigestJob.stop();
      dailyDigestJob = null;
    }
    if (weeklyDigestJob) {
      weeklyDigestJob.stop();
      weeklyDigestJob = null;
    }

    // Schedule based on frequency
    if (digestFrequency === 'daily') {
      scheduleDailyDigest(digestTime);
    } else if (digestFrequency === 'weekly') {
      scheduleWeeklyDigest(digestTime);
    } else if (digestFrequency === 'off') {
      console.log('📅 Digest generation is turned off');
    }

    console.log('✅ Digest scheduler initialized');
  } catch (error: any) {
    console.error('❌ Error initializing digest scheduler:', error.message);
  }
}

/**
 * Update digest schedule based on new preferences
 * Call this when user preferences are updated
 */
export function updateDigestSchedule() {
  console.log('🔄 Updating digest schedule...');
  initializeDigestScheduler();
}

/**
 * Stop all digest scheduled jobs
 */
export function stopDigestScheduler() {
  console.log('🛑 Stopping digest scheduler...');

  if (dailyDigestJob) {
    dailyDigestJob.stop();
    dailyDigestJob = null;
  }

  if (weeklyDigestJob) {
    weeklyDigestJob.stop();
    weeklyDigestJob = null;
  }

  console.log('✅ Digest scheduler stopped');
}
