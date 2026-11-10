import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPresenceNumber } from './usePresenceCount';

test('formatPresenceNumber formats thousands correctly with commas', () => {
  assert.equal(formatPresenceNumber(18482), '18,482');
  assert.equal(formatPresenceNumber(500), '500');
  assert.equal(formatPresenceNumber(1000000), '1,000,000');
});
