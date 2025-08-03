import dotenv from "dotenv";
import { ISessionStorage, SessionStorageOptions } from "../interfaces/ISessionStorage";
import { FileSessionStorage } from "./FileSessionStorage";
dotenv.config();
/**
 * Session storage factory that creates the appropriate storage implementation
 * based on the environment and configuration
 */
export class SessionStorageFactory {
  /**
   * Create a session storage instance based on environment and options
   */
  static async createStorage(
    options: SessionStorageOptions & {
      storageType?: "file" | "redis" | "auto";
      redisUrl?: string;
      sessionDir?: string;
      keyPrefix?: string;
    } = {}
  ): Promise<ISessionStorage> {
    const storageType = options.storageType || "auto";

    // Auto-detect storage type based on environment
    if (storageType === "auto") {
      // Use Redis if we're on Vercel or if Redis URL is provided
      if (process.env.VERCEL || process.env.REDIS_URL || process.env.KV_URL) {
        try {
          const { RedisSessionStorage } = await import("./RedisSessionStorage");
          return new RedisSessionStorage(options);
        } catch (error) {
          console.warn("⚠️ Redis not available, falling back to file storage:", error);
          return new FileSessionStorage(options);
        }
      } else {
        // Use file storage for local development
        return new FileSessionStorage(options);
      }
    }

    // Explicit storage type selection
    if (storageType === "redis") {
      try {
        const { RedisSessionStorage } = await import("./RedisSessionStorage");
        return new RedisSessionStorage(options);
      } catch (error) {
        console.error("❌ Redis storage requested but not available:", error);
        throw new Error("Redis storage is not available. Install 'ioredis' package or use file storage.");
      }
    }

    if (storageType === "file") {
      return new FileSessionStorage(options);
    }

    throw new Error(`Unknown storage type: ${storageType}`);
  }

  /**
   * Get recommended storage type for current environment
   */
  static getRecommendedStorageType(): "file" | "redis" {
    if (process.env.VERCEL || process.env.REDIS_URL || process.env.KV_URL) {
      return "redis";
    }
    return "file";
  }

  /**
   * Get environment information for debugging
   */
  static getEnvironmentInfo(): {
    isVercel: boolean;
    hasRedisUrl: boolean;
    recommendedStorage: "file" | "redis";
    nodeEnv: string;
  } {
    return {
      isVercel: !!process.env.VERCEL,
      hasRedisUrl: !!(process.env.REDIS_URL || process.env.KV_URL),
      recommendedStorage: this.getRecommendedStorageType(),
      nodeEnv: process.env.NODE_ENV || "development",
    };
  }
}
