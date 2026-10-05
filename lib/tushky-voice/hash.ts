/**
 * A small, synchronous, dependency-free text hash (cyrb53) shared by the browser, the speech route
 * and the FAQ-audio script (TASK-134). It identifies TEXT, it does not protect anything: the client
 * sends the hash of the answer it shows so the server can refuse to speak a different answer, and
 * FAQ audio records the hash of the transcript it was made from so a changed answer never reuses old
 * audio (voice spec §30). 53 bits, printed as 14 hex characters.
 */
export function hashText(text: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const value = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return value.toString(16).padStart(14, "0");
}

export const HASH_PATTERN = /^[0-9a-f]{14}$/;
