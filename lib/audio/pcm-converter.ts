/**
 * Audio conversion utilities for 16-bit PCM Mono audio.
 */

/**
 * Converts Float32Array audio samples (-1.0 to 1.0) into 16-bit signed PCM (Int16Array).
 */
export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

/**
 * Converts an Int16Array into a Base64-encoded string.
 */
export function pcm16ToBase64(pcmData: Int16Array): string {
  const buffer = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
  let binary = "";
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string of 16-bit PCM audio back into Float32Array for Web Audio playback.
 */
export function base64ToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  return float32Array;
}

/**
 * Calculates Root Mean Square (RMS) volume level (0 to 1) from Float32 samples.
 */
export function calculateRMS(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return Math.min(1, rms * 4); // boost factor for visual responsiveness
}
