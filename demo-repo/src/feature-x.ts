import { z } from 'zod';
import { db } from './db';
import { cache } from './cache';
import { pubsub } from './pubsub';

// Preference schema validation
const PreferenceSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.enum(['en', 'es', 'fr', 'de']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  privacy: z.object({
    analytics: z.boolean(),
    personalization: z.boolean(),
  }),
});

export type UserPreferences = z.infer<typeof PreferenceSchema>;

/**
 * Get user preferences (with caching)
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  // Check cache first
  const cached = await cache.get(`prefs:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const prefs = await db.query(
    'SELECT preferences FROM user_preferences WHERE user_id = $1',
    [userId]
  );

  if (!prefs.rows[0]) {
    // Return defaults
    return getDefaultPreferences();
  }

  const preferences = prefs.rows[0].preferences;

  // Cache for 5 minutes
  await cache.set(`prefs:${userId}`, JSON.stringify(preferences), 300);

  return preferences;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<void> {
  // Validate schema
  const validated = PreferenceSchema.parse(preferences);

  // Update database
  await db.query(
    `INSERT INTO user_preferences (user_id, preferences, last_modified)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET preferences = $2, last_modified = NOW()`,
    [userId, validated]
  );

  // Invalidate cache
  await cache.del(`prefs:${userId}`);

  // Publish update for real-time sync
  await pubsub.publish('preference-update', {
    userId,
    preferences: validated,
  });
}

/**
 * Get default preferences
 */
function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'auto',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      analytics: false,
      personalization: true,
    },
  };
}

/**
 * Partial update of preferences
 */
export async function patchUserPreferences(
  userId: string,
  partialPreferences: Partial<UserPreferences>
): Promise<void> {
  const current = await getUserPreferences(userId);
  const merged = { ...current, ...partialPreferences };

  await updateUserPreferences(userId, merged);
}
