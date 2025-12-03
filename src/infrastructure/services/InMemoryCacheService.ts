import { injectable } from "inversify";
import { ICacheService } from "../interface/services/ICacheService";

interface Entry {
  value: string;
  expiresAt?: number;
}

@injectable()
export class InMemoryCacheService implements ICacheService {
  private store = new Map<string, Entry>();

  private isExpired(key: string): boolean {
    const e = this.store.get(key);
    if (!e) return true;
    if (e.expiresAt && Date.now() > e.expiresAt) {
      this.store.delete(key);
      return true;
    }
    return false;
  }

  async get(key: string): Promise<string | null> {
    if (this.isExpired(key)) return null;
    return this.store.get(key)!.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const entry: Entry = { value };
    if (ttlSeconds && ttlSeconds > 0) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    this.store.set(key, entry);
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const next = (current ? parseInt(current, 10) || 0 : 0) + 1;
    await this.set(key, String(next));
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const current = this.store.get(key);
    if (!current) return;
    current.expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, current);
  }

  async ttl(key: string): Promise<number> {
    const e = this.store.get(key);
    if (!e) return -2; // key does not exist
    if (!e.expiresAt) return -1; // no expiry
    const remainingMs = e.expiresAt - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : -2;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
