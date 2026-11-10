import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePupilOffset,
  calculateSquashStretch,
  getColliePetReaction,
} from './squish_physics.js';

test('calculatePupilOffset clamps within maximum bounds and handles center correctly', () => {
  const center = calculatePupilOffset(200, 200, 200, 200, 10);
  assert.equal(center.x, 0);
  assert.equal(center.y, 0);
  const farRight = calculatePupilOffset(1000, 200, 200, 200, 10);
  assert.ok(farRight.x > 0);
  assert.ok(farRight.x <= 12);
  assert.equal(farRight.y, 0);
  const farTopLeft = calculatePupilOffset(0, 0, 200, 200, 10);
  assert.ok(farTopLeft.x < 0);
  assert.ok(farTopLeft.y < 0);
});

test('calculateSquashStretch produces volume-preserving squash on press and stretch on drag', () => {
  const press = calculateSquashStretch(0, 0, true);
  assert.ok(press.scaleX > 1.0);
  assert.ok(press.scaleY < 1.0);
  const dragDown = calculateSquashStretch(0, 50, true);
  assert.ok(dragDown.scaleX > 1.0);
  assert.ok(dragDown.scaleY < 1.0);
});

test('getColliePetReaction generates special milestones and fun quips', () => {
  assert.equal(getColliePetReaction(1), '*squeak!* Hehe, hi!');
  assert.equal(getColliePetReaction(5), "Oooh, that's the spot! ♡");
  assert.equal(getColliePetReaction(10), 'So squishy bruv! Purrr~');
  assert.equal(getColliePetReaction(25), 'Certified Best Friend unlocked! ★');
  assert.ok(getColliePetReaction(7).length > 0);
});