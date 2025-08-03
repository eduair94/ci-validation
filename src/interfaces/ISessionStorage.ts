/**
 * Session data structure for CI validation service
 */

export interface TaskData {
  proInstId: string;
  proEleInstId: string;
}
export interface SessionData extends TaskData {
  tabId: string;
  tokenId: string;
  cookies: string;
  createdAt?: number;
  lastUsed?: number;
  expiresAt?: number;
  document?: string;
  metadata?: {
    userAgent?: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Interface for session storage implementations
 */
export interface ISessionStorage {
  /**
   * Save session data
   * @param sessionId - Unique identifier for the session
   * @param sessionData - Session data to save
   */
  saveSession(sessionId: string, sessionData: SessionData): Promise<void>;

  /**
   * Load session data
   * @param sessionId - Unique identifier for the session
   * @returns Session data or null if not found
   */
  loadSession(sessionId: string): Promise<SessionData | null>;

  /**
   * Delete session data
   * @param sessionId - Unique identifier for the session
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Check if session exists
   * @param sessionId - Unique identifier for the session
   * @returns True if session exists, false otherwise
   */
  sessionExists(sessionId: string): Promise<boolean>;

  /**
   * Update session's last used timestamp
   * @param sessionId - Unique identifier for the session
   */
  touchSession(sessionId: string): Promise<void>;

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): Promise<void>;
}

/**
 * Options for session storage implementations
 */
export interface SessionStorageOptions {
  /**
   * Session expiration time in milliseconds
   * Default: 24 hours (24 * 60 * 60 * 1000)
   */
  expirationTime?: number;

  /**
   * Whether to automatically cleanup expired sessions
   * Default: true
   */
  autoCleanup?: boolean;

  /**
   * Cleanup interval in milliseconds
   * Default: 1 hour (60 * 60 * 1000)
   */
  cleanupInterval?: number;
}
