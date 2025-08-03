import { promises as fs } from "fs";
import path from "path";
import { ISessionStorage, SessionData, SessionStorageOptions } from "../interfaces/ISessionStorage";

/**
 * File-based session storage implementation
 * Stores sessions as JSON files in the filesystem
 */
export class FileSessionStorage implements ISessionStorage {
  private readonly sessionDir: string;
  private readonly expirationTime: number;
  private readonly autoCleanup: boolean;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: SessionStorageOptions & { sessionDir?: string } = {}) {
    this.sessionDir = options.sessionDir || (process.env.VERCEL ? "/tmp/sessions" : path.join(process.cwd(), "sessions"));
    this.expirationTime = options.expirationTime || 24 * 60 * 60 * 1000; // 24 hours
    this.autoCleanup = options.autoCleanup !== false;

    // Initialize session directory
    this.ensureSessionDirectory();

    // Start cleanup timer if auto cleanup is enabled
    if (this.autoCleanup) {
      const cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 1 hour
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredSessions().catch(console.error);
      }, cleanupInterval);
    }
  }

  /**
   * Ensures the session directory exists
   */
  private async ensureSessionDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.sessionDir, { recursive: true });
    } catch (error) {
      console.error("Error creating session directory:", error);
    }
  }

  /**
   * Gets the file path for a session
   */
  private getSessionFilePath(sessionId: string): string {
    return path.join(this.sessionDir, `${sessionId}.json`);
  }

  /**
   * Save session data to file
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

      const filePath = this.getSessionFilePath(sessionId);
      await fs.writeFile(filePath, JSON.stringify(enrichedSessionData, null, 2), "utf-8");

      console.log(`✅ Session saved to file: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Error saving session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Load session data from file
   */
  async loadSession(sessionId: string): Promise<SessionData | null> {
    try {
      const filePath = this.getSessionFilePath(sessionId);
      const sessionData = await fs.readFile(filePath, "utf-8");
      const parsedSession: SessionData = JSON.parse(sessionData);

      // Check if session is expired
      if (parsedSession.expiresAt && Date.now() > parsedSession.expiresAt) {
        console.log(`⏰ Session ${sessionId} has expired, removing...`);
        await this.deleteSession(sessionId);
        return null;
      }

      // Update last used timestamp
      await this.touchSession(sessionId);

      console.log(`✅ Session loaded from file: ${sessionId}`);
      return parsedSession;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        console.log(`ℹ️ Session file not found: ${sessionId}`);
        return null;
      }
      console.error(`❌ Error loading session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete session file
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const filePath = this.getSessionFilePath(sessionId);
      await fs.unlink(filePath);
      console.log(`🗑️ Session deleted: ${sessionId}`);
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        console.log(`ℹ️ Session file already deleted: ${sessionId}`);
        return;
      }
      console.error(`❌ Error deleting session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Check if session file exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const filePath = this.getSessionFilePath(sessionId);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update session's last used timestamp
   */
  async touchSession(sessionId: string): Promise<void> {
    try {
      const session = await this.loadSessionRaw(sessionId);
      if (session) {
        session.lastUsed = Date.now();
        const filePath = this.getSessionFilePath(sessionId);
        await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");
      }
    } catch (error) {
      console.error(`❌ Error touching session ${sessionId}:`, error);
    }
  }

  /**
   * Load session data without updating last used timestamp
   */
  private async loadSessionRaw(sessionId: string): Promise<SessionData | null> {
    try {
      const filePath = this.getSessionFilePath(sessionId);
      const sessionData = await fs.readFile(filePath, "utf-8");
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  /**
   * Clean up expired session files
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.sessionDir);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith(".json")) {
          const sessionId = file.replace(".json", "");
          const session = await this.loadSessionRaw(sessionId);

          if (session && session.expiresAt && now > session.expiresAt) {
            await this.deleteSession(sessionId);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      }
    } catch (error) {
      console.error("❌ Error during session cleanup:", error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}
