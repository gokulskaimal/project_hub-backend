import { injectable } from "inversify";
import { ICacheService } from "../interface/services/ICacheService";
import Redis from "ioredis";

@injectable()
export class RedisCacheService implements ICacheService {
  private client: Redis;

  constructor() {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    // Prevent unhandled error events from crashing the process
    this.client.on("error", () => {
      // Intentionally swallow to keep app running if Redis is unavailable
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, value, "EX", ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // ignore
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(key, ttlSeconds);
    } catch {
      // ignore
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch {
      return -2; // key does not exist
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // ignore
    }
  }
}
