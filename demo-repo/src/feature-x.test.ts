import { describe, it, expect, beforeEach } from 'vitest';
import { getUserPreferences, updateUserPreferences, patchUserPreferences } from './feature-x';
import { db } from './db';
import { cache } from './cache';

describe('Feature X - User Preferences', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    // Clear test data
    await db.query('DELETE FROM user_preferences WHERE user_id = $1', [testUserId]);
    await cache.del(`prefs:${testUserId}`);
  });

  describe('getUserPreferences', () => {
    it('should return default preferences for new user', async () => {
      const prefs = await getUserPreferences(testUserId);

      expect(prefs).toEqual({
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
      });
    });

    it('should return cached preferences on second call', async () => {
      const prefs1 = await getUserPreferences(testUserId);
      const prefs2 = await getUserPreferences(testUserId);

      // Second call should hit cache (test via performance)
      expect(prefs1).toEqual(prefs2);
    });

    it('should return custom preferences if set', async () => {
      await updateUserPreferences(testUserId, {
        theme: 'dark',
        language: 'es',
        notifications: { email: false, push: false, sms: false },
        privacy: { analytics: true, personalization: false },
      });

      const prefs = await getUserPreferences(testUserId);

      expect(prefs.theme).toBe('dark');
      expect(prefs.language).toBe('es');
    });
  });

  describe('updateUserPreferences', () => {
    it('should save preferences to database', async () => {
      await updateUserPreferences(testUserId, {
        theme: 'light',
        language: 'fr',
        notifications: { email: true, push: false, sms: true },
        privacy: { analytics: false, personalization: false },
      });

      const prefs = await getUserPreferences(testUserId);
      expect(prefs.theme).toBe('light');
      expect(prefs.language).toBe('fr');
    });

    it('should invalidate cache on update', async () => {
      // Set initial preferences
      await updateUserPreferences(testUserId, {
        theme: 'dark',
        language: 'en',
        notifications: { email: true, push: true, sms: false },
        privacy: { analytics: false, personalization: true },
      });

      // Cache should be set
      await getUserPreferences(testUserId);

      // Update preferences
      await updateUserPreferences(testUserId, {
        theme: 'light',
        language: 'es',
        notifications: { email: false, push: false, sms: false },
        privacy: { analytics: true, personalization: false },
      });

      // Should get updated preferences
      const prefs = await getUserPreferences(testUserId);
      expect(prefs.theme).toBe('light');
    });

    it('should reject invalid preferences', async () => {
      await expect(
        updateUserPreferences(testUserId, {
          theme: 'invalid' as any,
          language: 'en',
          notifications: { email: true, push: true, sms: false },
          privacy: { analytics: false, personalization: true },
        })
      ).rejects.toThrow();
    });
  });

  describe('patchUserPreferences', () => {
    it('should partially update preferences', async () => {
      // Set initial preferences
      await updateUserPreferences(testUserId, {
        theme: 'dark',
        language: 'en',
        notifications: { email: true, push: true, sms: false },
        privacy: { analytics: false, personalization: true },
      });

      // Patch just theme
      await patchUserPreferences(testUserId, { theme: 'light' });

      const prefs = await getUserPreferences(testUserId);
      expect(prefs.theme).toBe('light');
      expect(prefs.language).toBe('en'); // Should remain unchanged
    });
  });
});
