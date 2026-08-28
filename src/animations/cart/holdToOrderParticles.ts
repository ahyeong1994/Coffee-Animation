import {colors} from '../../theme';

export const HOLD_PARTICLES_ENABLED = false;

const particleColors = [colors.white, colors.cream, colors.goldSoft];

/**
 * Deterministic particle positions keep the sparkle field identical per render.
 * Set HOLD_PARTICLES_ENABLED to true when studying the heavier particle version.
 */
export const HOLD_PARTICLES = Array.from({length: 42}, (_, index) => {
  const upperRow = index % 2 === 0;

  return {
    x: ((index * 37 + 9) % 96) / 100,
    y: upperRow ? -4 + ((index * 7) % 17) : 47 + ((index * 11) % 19),
    size: 1 + ((index * 5) % 4),
    driftX: -9 + ((index * 13) % 19),
    travelY: 5 + ((index * 7) % 15),
    delay: (index * 83) % 680,
    duration: 520 + ((index * 47) % 520),
    color: particleColors[index % particleColors.length],
  };
});
