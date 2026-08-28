/**
 * Central tuning values for shutter loading and Polaroid printing.
 * Change these constants to experiment without editing the animation hooks.
 */
export const CAMERA_CAPTURE_TIMING = {
  minimumLoadingDuration: 850,
  loadingRotationDuration: 720,
} as const;

export const POLAROID_PRINT_TIMING = {
  // The header finishes morphing into a slot at roughly 780ms.
  ejectDelay: 820,
  ejectDuration: 1550,
  settleDuration: 620,
  developDelay: 1180,
  developDuration: 1650,
} as const;

export const POLAROID_PRINT_MOTION = {
  ejectProgress: 0.78,
  // The oversized card finishes printing beside the slot at 2, then drops
  // toward the screen center at 138 while shrinking into its resting pose.
  translateY: [-470, 2, 138],
  scale: [0.68, 1.14, 1],
  rotate: ['-5deg', '2.6deg', '-0.8deg'],
} as const;

export const POLAROID_PRINT_LAYOUT = {
  widthRatio: 0.73,
  maxWidth: 390,
} as const;

export const PHOTO_SHAKE_TIMING = {
  requiredDuration: 3000,
  // Sensor and gesture tuning. All movement values are normalized to g.
  sampleInterval: 40,
  activityThreshold: 0.16,
  pulseThreshold: 0.52,
  pulseCooldown: 280,
  activityGracePeriod: 260,
  inactivityResetDelay: 560,
  pulseAnimationDuration: 250,
  revealDuration: 2200,
} as const;
