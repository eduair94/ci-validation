import { ISessionStorage, SessionData, SessionStorageOptions } from "../interfaces/ISessionStorage";

/**
 * Redis-based session storage implementation
 * Compatible with Vercel serverless environment
 */
export class RedisSessionStorage implements ISessionStorage {
  private redis: any;
  private readonly keyPrefix: string;
  private readonly expirationTime: number;
  private readonly autoCleanup: boolean;

  constructor(
    options: SessionStorageOptions & {
      redisUrl?: string;
      keyPrefix?: string;
    } = {}
  ) {
    this.keyPrefix = options.keyPrefix || "ci-validation:session:";
    this.expirationTime = options.expirationTime || 24 * 60 * 60 * 1000; // 24 hours
    this.autoCleanup = options.autoCleanup !== false;

    // Initialize Redis connection
    this.initializeRedis(options.redisUrl);
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(redisUrl?: string): Promise<void> {
    try {
      // Dynamically import Redis to avoid issues in environments where it's not available
      const Redis = await import("ioredis");

      const connectionUrl = redisUrl || process.env.REDIS_URL || process.env.KV_URL || "redis://localhost:6379";

      this.redis = new Redis.default(connectionUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        family: 4, // Use IPv4
      });

      // Test connection
      await this.redis.ping();
      console.log("✅ Redis connection established");
    } catch (error) {
      console.error("❌ Redis connection failed:", error);
      throw new Error(`Redis connection failed: ${error}`);
    }
  }

  /**
   * Get the Redis key for a session
   */
  private getSessionKey(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  /**
   * Save session data to Redis
   */
  async saveSession(sessionId: string, sessionData: SessionData): Promise<void> {
    try {
      const now = Date.now();
      const enrichedSessionData: SessionData = {
        ...sessionData,
        createdAt: sessionData.createdAt || now,
        lastUsed: now,
        expiresAt: now + this.expirationTime,
      };

      const key = this.getSessionKey(sessionId);
      const serializedData = JSON.stringify(enrichedSessionData);

      // Set with TTL (Time To Live) in seconds
      const ttlSeconds = Math.floor(this.expirationTime / 1000);
      await this.redis.setex(key, ttlSeconds, serializedData);

      console.log(`✅ Session saved to Redis: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Error saving session to Redis ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Load session data from Redis
   */
  async loadSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = this.getSessionKey(sessionId);
      const sessionData = await this.redis.get(key);

      if (!sessionData) {
        console.log(`ℹ️ Session not found in Redis: ${sessionId}`);
        return null;
      }

      const parsedSession: SessionData = JSON.parse(sessionData);

      // Check if session is expired (additional check)
      if (parsedSession.expiresAt && Date.now() > parsedSession.expiresAt) {
        console.log(`⏰ Session ${sessionId} has expired, removing...`);
        await this.deleteSession(sessionId);
        return null;
      }

      // Update last used timestamp
      await this.touchSession(sessionId);

      console.log(`✅ Session loaded from Redis: ${sessionId}`);
      return parsedSession;
    } catch (error) {
      console.error(`❌ Error loading session from Redis ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete session from Redis
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = this.getSessionKey(sessionId);
      const result = await this.redis.del(key);

      if (result === 1) {
        console.log(`🗑️ Session deleted from Redis: ${sessionId}`);
      } else {
        console.log(`ℹ️ Session already deleted from Redis: ${sessionId}`);
      }
    } catch (error) {
      console.error(`❌ Error deleting session from Redis ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Check if session exists in Redis
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId);
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`❌ Error checking session existence in Redis ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Update session's last used timestamp
   */
  async touchSession(sessionId: string): Promise<void> {
    try {
      const key = this.getSessionKey(sessionId);
      const sessionData = await this.redis.get(key);

      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);
        session.lastUsed = Date.now();

        // Update with same TTL
        const ttl = await this.redis.ttl(key);
        if (ttl > 0) {
          await this.redis.setex(key, ttl, JSON.stringify(session));
        } else {
          // If TTL is -1 (no expiration) or -2 (key doesn't exist), use default
          const ttlSeconds = Math.floor(this.expirationTime / 1000);
          await this.redis.setex(key, ttlSeconds, JSON.stringify(session));
        }
      }
    } catch (error) {
      console.error(`❌ Error touching session in Redis ${sessionId}:`, error);
    }
  }

  /**
   * Clean up expired sessions (Redis handles this automatically with TTL)
   * This method is provided for interface compliance but isn't necessary for Redis
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Redis automatically handles TTL expiration, but we can scan for manual cleanup if needed
      if (this.autoCleanup) {
        const pattern = `${this.keyPrefix}*`;
        const keys = await this.redis.keys(pattern);
        let cleanedCount = 0;

        for (const key of keys) {
          const sessionData = await this.redis.get(key);
          if (sessionData) {
            const session: SessionData = JSON.parse(sessionData);
            if (session.expiresAt && Date.now() > session.expiresAt) {
              await this.redis.del(key);
              cleanedCount++;
            }
          }
        }

        if (cleanedCount > 0) {
          console.log(`🧹 Manually cleaned up ${cleanedCount} expired sessions from Redis`);
        }
      }
    } catch (error) {
      console.error("❌ Error during Redis session cleanup:", error);
    }
  }

  /**
   * Get session statistics (useful for debugging)
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    memoryUsage?: string;
  }> {
    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);

      // Get memory usage if available
      let memoryUsage: string | undefined;
      try {
        const info = await this.redis.info("memory");
        const match = info.match(/used_memory_human:(.+)/);
        if (match) {
          memoryUsage = match[1].trim();
        }
      } catch {
        // Memory info not available
      }

      return {
        totalSessions: keys.length,
        memoryUsage,
      };
    } catch (error) {
      console.error("❌ Error getting session stats:", error);
      return { totalSessions: 0 };
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.redis) {
      this.redis.disconnect();
      console.log("✅ Redis connection closed");
    }
  }
}
