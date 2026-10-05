/**
 * WAV helpers (TASK-134, voice spec §34–35). Gemini TTS audio is 24 kHz mono 16-bit PCM: the legacy
 * `generateContent` path returns it raw (`audio/L16`), and the 3.8 Interactions path returns it
 * already inside a RIFF/WAV header. `toWav()` wraps raw PCM in a 44-byte header and passes a WAV
 * through untouched, so no ffmpeg and no transcoding is ever needed. Pure; works in Node and browsers.
 */
export interface PcmFormat {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

const ascii = (view: DataView, offset: number, text: string) => {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
};

export function isWav(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WAVE";
}

/** Wrap raw little-endian PCM in a canonical 44-byte WAV header. */
export function pcmToWav(pcm: Uint8Array, format: PcmFormat): Uint8Array {
  const { sampleRate, channels, bitsPerSample } = format;
  const blockAlign = (channels * bitsPerSample) / 8;
  const out = new Uint8Array(44 + pcm.length);
  const view = new DataView(out.buffer);
  ascii(view, 0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  ascii(view, 8, "WAVE");
  ascii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  ascii(view, 36, "data");
  view.setUint32(40, pcm.length, true);
  out.set(pcm, 44);
  return out;
}

/** WAV bytes as they are, or raw PCM wrapped in a header. */
export function toWav(bytes: Uint8Array, format: PcmFormat): Uint8Array {
  return isWav(bytes) ? bytes : pcmToWav(bytes, format);
}

/** Sample rate parsed from a MIME type such as `audio/L16;codec=pcm;rate=24000`, if present. */
export function rateFromMime(mime: string | undefined): number | undefined {
  const m = /rate=(\d{4,6})/i.exec(mime ?? "");
  return m ? Number(m[1]) : undefined;
}

/** Duration of a PCM WAV in milliseconds (reads the fmt byte rate and the data chunk size). */
export function wavDurationMs(bytes: Uint8Array): number | undefined {
  if (!isWav(bytes)) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let byteRate = 0;
  while (offset + 8 <= bytes.length) {
    const id = String.fromCharCode(...bytes.subarray(offset, offset + 4));
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt ") byteRate = view.getUint32(offset + 16, true);
    if (id === "data" && byteRate > 0) return Math.round((Math.min(size, bytes.length - offset - 8) / byteRate) * 1000);
    offset += 8 + size + (size % 2);
  }
  return undefined;
}
