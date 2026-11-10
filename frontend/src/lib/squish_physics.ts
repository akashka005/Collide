export interface PupilOffset {
  x: number;
  y: number;
}
export type CollieMood = 'tracking' | 'happy' | 'squished' | 'hearts' | 'stars' | 'wink' | 'sleepy';
export function calculatePupilOffset(
  pointerX: number,
  pointerY: number,
  mascotCenterX: number,
  mascotCenterY: number,
  maxOffset: number = 8
): PupilOffset {
  const dx = pointerX - mascotCenterX;
  const dy = pointerY - mascotCenterY;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) {
    return { x: 0, y: 0 };
  }
  const factor = Math.min(distance / 250, 1);
  const clampedDist = factor * maxOffset;
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * clampedDist * 1.15;
  const y = Math.sin(angle) * clampedDist * 0.85;
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  };
}
export function calculateSquashStretch(dragX: number, dragY: number, isPressed: boolean) {
  if (isPressed && dragX === 0 && dragY === 0) {
    return {
      scaleX: 1.16,
      scaleY: 0.84,
      rotateZ: 0,
    };
  }

  const dragDistance = Math.hypot(dragX, dragY);
  const maxDrag = 80;
  const clampedDrag = Math.min(dragDistance, maxDrag);
  const stretchRatio = (clampedDrag / maxDrag) * 0.28;
  const scaleMajor = 1 + stretchRatio;
  const scaleMinor = 1 / Math.sqrt(scaleMajor);
  const angleRad = Math.atan2(dragY, dragX);
  const angleDeg = (angleRad * 180) / Math.PI;

  return {
    scaleX: Math.round(scaleMajor * 1000) / 1000,
    scaleY: Math.round(scaleMinor * 1000) / 1000,
    rotateZ: Math.round((angleDeg - 90) * 0.25 * 10) / 10,
  };
}
export function getColliePetReaction(petCount: number): string {
  if (petCount <= 1) return "*squeak!* Hehe, hi!";
  if (petCount === 5) return "Oooh, that's the spot! ♡";
  if (petCount === 10) return "So squishy bruv! Purrr~";
  if (petCount === 25) return "Certified Best Friend unlocked! ★";
  if (petCount === 50) return "Mega Squish Master! ♥(ˆ‿ˆ)♥";
  if (petCount % 10 === 0) return `Boing! ${petCount} pets & counting! ♡`;

  const randomGiggles = [
    "Hehehe tickles! ♡",
    "*bouncy squeak*",
    "Purrrrr~",
    "Collide vibes high! ✨",
    "Soft & squishy! ♡",
    "Boop!",
    "Awww thanks bruv! ♡",
  ];
  return randomGiggles[petCount % randomGiggles.length];
}
