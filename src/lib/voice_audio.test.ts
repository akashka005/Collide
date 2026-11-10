import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { audioBufferToWav } from './voice_audio.js';

describe('voice_audio utilities', () => {
  it('encodes mock AudioBuffer to standard WAV Blob format', () => {
    const mockChannelData = new Float32Array([0, 0.5, -0.5, 0.25, -0.25]);
    const mockBuffer = {
      numberOfChannels: 1,
      sampleRate: 44100,
      length: mockChannelData.length,
      getChannelData: () => mockChannelData,
    } as unknown as AudioBuffer;

    const blob = audioBufferToWav(mockBuffer);
    assert.ok(blob instanceof Blob);
    assert.equal(blob.type, 'audio/wav');
    assert.equal(blob.size, 54);
  });
});
