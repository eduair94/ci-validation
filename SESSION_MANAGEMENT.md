# Session Management System

This document explains the new session management system implemented for the CI validation service.

## Overview

The new session management system provides a unified interface for handling session persistence across different deployment environments:

- **File-based storage**: For local development
- **Redis-based storage**: For Vercel serverless deployment
- **Automatic selection**: Based on environment detection

## Architecture

### Interfaces

#### `SessionData`
```typescript
interface SessionData {
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
```

#### `ISessionStorage`
```typescript
interface ISessionStorage {
  saveSession(sessionId: string, sessionData: SessionData): Promise<void>;
  loadSession(sessionId: string): Promise<SessionData | null>;
  deleteSession(sessionId: string): Promise<void>;
  sessionExists(sessionId: string): Promise<boolean>;
  touchSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  destroy(): void;
}
```

### Implementations

#### `FileSessionStorage`
- Stores sessions as JSON files in the filesystem
- Uses `/tmp/sessions` directory on Vercel, `./sessions` locally
- Automatic cleanup of expired sessions
- Suitable for local development

#### `RedisSessionStorage`
- Stores sessions in Redis database
- Compatible with Vercel KV storage
- Automatic TTL (Time To Live) expiration
- Suitable for production deployment

#### `SessionStorageFactory`
- Auto-detects environment and creates appropriate storage
- Falls back to file storage if Redis is unavailable
- Environment detection based on:
  - `process.env.VERCEL` presence
  - `process.env.REDIS_URL` or `process.env.KV_URL` availability

## Environment Configuration

### Local Development
```bash
# No additional configuration needed
# Will automatically use FileSessionStorage
```

### Vercel Deployment with Redis
```bash
# Set in Vercel environment variables
REDIS_URL=redis://your-redis-instance
# OR
KV_URL=your-vercel-kv-url
```

## Usage

### Automatic Initialization
```typescript
const service = new NewCiService();
// Session storage is automatically initialized in constructor
```

### Manual Storage Creation
```typescript
import { SessionStorageFactory } from '../storage';

// Auto-detect environment
const storage = await SessionStorageFactory.createStorage();

// Force specific storage type
const fileStorage = await SessionStorageFactory.createStorage({ 
  storageType: 'file' 
});

const redisStorage = await SessionStorageFactory.createStorage({ 
  storageType: 'redis',
  redisUrl: 'redis://localhost:6379'
});
```

## Session Lifecycle

### Session Creation
1. Document validation request received
2. Unique session ID generated: `ci-session-{document}-{timestamp}`
3. Session data saved with expiration time (24 hours default)
4. Session persisted in chosen storage backend

### Session Retrieval
1. Check if session exists for document
2. Load session data if available and not expired
3. Update last used timestamp
4. Return session data or null if expired/not found

### Session Cleanup
1. **Automatic**: Expired sessions cleaned up periodically
2. **Manual**: Failed validations trigger session deletion
3. **TTL-based**: Redis automatically expires sessions

## Migration from Legacy System

### Before (Static JSON File)
```typescript
// Old approach - static session.json file
NewCiService.session = { tabId, tokenId, cookies };
await fs.writeFile("session.json", JSON.stringify(NewCiService.session));
```

### After (New Storage System)
```typescript
// New approach - flexible storage backend
const sessionId = this.generateSessionId(document);
await this.saveSession(sessionId, tabId, tokenId, cookies);
```

## Benefits

### Scalability
- Redis support enables horizontal scaling in serverless environments
- Session data shared across multiple function instances

### Reliability
- Automatic session expiration prevents stale data
- Graceful fallbacks when storage is unavailable
- Error handling and recovery mechanisms

### Security
- Session data includes metadata for auditing
- Configurable expiration times
- Proper cleanup of sensitive data

### Observability
- Detailed logging of session operations
- Environment detection reporting
- Storage type selection transparency

## Error Handling

### Storage Initialization Failures
- Falls back to file storage if Redis unavailable
- Continues with legacy static session if all storage fails
- Logs warnings but doesn't break functionality

### Session Operation Failures
- Save failures: Log error but continue processing
- Load failures: Return null and create new session
- Delete failures: Log error but don't throw

### Environment Compatibility
- Vercel serverless: Uses Redis or falls back to `/tmp` storage
- Express server: Uses file storage in project directory
- Missing dependencies: Graceful degradation to basic functionality

## Performance Considerations

### File Storage
- I/O operations are asynchronous
- Periodic cleanup prevents disk space issues
- Suitable for low-medium traffic

### Redis Storage
- Network latency for each operation
- Memory-based for fast access
- TTL handles cleanup automatically
- Suitable for high traffic and serverless

## Future Enhancements

### Planned Features
- Session compression for large payloads
- Encryption for sensitive session data
- Session replication across multiple Redis instances
- Metrics and monitoring integration

### Configuration Options
- Custom session ID formats
- Configurable cleanup intervals
- Storage-specific optimization settings
- Session data validation schemas
