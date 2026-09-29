/**
 * Runtime TTS cache (TASK-134, voice spec §31–32). SERVER ONLY. A byte-bounded LRU in the memory of
 * one server instance, keyed by `hash(version | model | voice | speechText)`, so identical speech is
 * synthesised once per warm instance. Only successful audio is stored (never errors), and only
 * transcripts of the site's own answers ever reach it, so nothing user-specific is cached (§31).
 * Like the rate limiter it is per instance: a cold start is an empty cache.
 */
import { hashText } from "./hash";

export interface CachedAudio {
  audio: Uint8Array;
  mimeType: "audio/wav" | "audio/mpeg";
}

export function speechCacheKey(parts: { version: string; model: string; voice: string; speechText: string }): string {
  return hashText(`${parts.version}|${parts.model}|${parts.voice}|${parts.speechText}`);
}

export class AudioCache {
  private readonly entries = new Map<string, CachedAudio>();
  private bytes = 0;

  constructor(private readonly maxBytes: number) {}

  get(key: string): CachedAudio | undefined {
    const hit = this.entries.get(key);
    if (hit) {
      this.entries.delete(key);
      this.entries.set(key, hit);
    }
    return hit;
  }

  set(key: string, value: CachedAudio): void {
    if (value.audio.byteLength > this.maxBytes) return;
    const previous = this.entries.get(key);
    if (previous) {
      this.bytes -= previous.audio.byteLength;
      this.entries.delete(key);
    }
    this.entries.set(key, value);
    this.bytes += value.audio.byteLength;
    while (this.bytes > this.maxBytes) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.bytes -= this.entries.get(oldest)!.audio.byteLength;
      this.entries.delete(oldest);
    }
  }

  get size(): number {
    return this.entries.size;
  }

  get totalBytes(): number {
    return this.bytes;
  }
}
