export interface AudioRecordingResult {
  blob: Blob;
  duration: number;
}
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + length;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
export async function synthesizeVoiceNote(durationSeconds: number): Promise<Blob> {
  const safeDuration = Math.max(1, Math.min(durationSeconds, 15));
  const sampleRate = 22050;
  const length = Math.floor(sampleRate * safeDuration);
  const AudioContextClass = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!AudioContextClass) {
    return new Blob([], { type: 'audio/wav' });
  }

  const offlineCtx = new AudioContextClass(1, length, sampleRate);
  const osc1 = offlineCtx.createOscillator();
  const osc2 = offlineCtx.createOscillator();
  const gain = offlineCtx.createGain();
  const filter = offlineCtx.createBiquadFilter();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(220, 0);
  osc1.frequency.exponentialRampToValueAtTime(260, safeDuration * 0.4);
  osc1.frequency.exponentialRampToValueAtTime(196, safeDuration);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(110, 0);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, 0);
  filter.Q.setValueAtTime(3.5, 0);
  gain.gain.setValueAtTime(0.01, 0);
  gain.gain.linearRampToValueAtTime(0.25, 0.1);
  gain.gain.setValueAtTime(0.25, safeDuration - 0.2);
  gain.gain.linearRampToValueAtTime(0.001, safeDuration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(offlineCtx.destination);

  osc1.start(0);
  osc2.start(0);
  osc1.stop(safeDuration);
  osc2.stop(safeDuration);

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWav(renderedBuffer);
}