import {useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import {PHOTO_SHAKE_TIMING} from './photoPrintConfig';

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type Options = {
  active: boolean;
  onActivityStart: () => void;
  onActivityReset: () => void;
  onShakePulse: () => void;
  onComplete: () => void;
};

const EARTH_GRAVITY = 9.80665;

/**
 * Converts both native implementations to roughly the same `g` unit.
 * Core Motion reports iOS acceleration in g, while Android SensorManager
 * reports m/s². Comparing adjacent samples also removes stationary gravity.
 */
const normalizeAcceleration = ({x, y, z}: Vector3): Vector3 => {
  const divisor = Platform.OS === 'android' ? EARTH_GRAVITY : 1;
  return {x: x / divisor, y: y / divisor, z: z / divisor};
};

const distanceBetween = (current: Vector3, previous: Vector3) =>
  Math.sqrt(
    (current.x - previous.x) ** 2 +
      (current.y - previous.y) ** 2 +
      (current.z - previous.z) ** 2,
  );

/**
 * Continuously samples the accelerometer instead of relying on the platform's
 * one-off "shake ended" gesture. Progress advances only while real movement is
 * arriving and resets when the user stops long enough.
 *
 * `onShakePulse` represents one distinct physical swing. Keep the visual card
 * animation one-shot so one phone swing produces one card wobble.
 */
export const useContinuousShakeDetection = ({
  active,
  onActivityStart,
  onActivityReset,
  onShakePulse,
  onComplete,
}: Options) => {
  const [progress, setProgress] = useState(0);

  // Callback refs prevent a render from restarting the native sensor stream.
  const callbacks = useRef({
    onActivityStart,
    onActivityReset,
    onShakePulse,
    onComplete,
  });
  callbacks.current = {
    onActivityStart,
    onActivityReset,
    onShakePulse,
    onComplete,
  };

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    let previousSample: Vector3 | null = null;
    let previousSampleAt = Date.now();
    let lastActivityAt = 0;
    let lastPulseAt = 0;
    let accumulatedActiveMs = 0;
    let activityStarted = false;
    let completed = false;
    let lastRenderedProgress = -1;

    setUpdateIntervalForType(
      SensorTypes.accelerometer,
      PHOTO_SHAKE_TIMING.sampleInterval,
    );

    const subscription = accelerometer.subscribe({
      next: rawSample => {
        if (completed) {
          return;
        }

        const now = Date.now();
        const sample = normalizeAcceleration(rawSample);
        const elapsedSinceSample = Math.min(
          now - previousSampleAt,
          PHOTO_SHAKE_TIMING.sampleInterval * 2.5,
        );
        previousSampleAt = now;

        if (!previousSample) {
          previousSample = sample;
          return;
        }

        const movement = distanceBetween(sample, previousSample);
        previousSample = sample;

        if (movement >= PHOTO_SHAKE_TIMING.activityThreshold) {
          lastActivityAt = now;

          if (!activityStarted) {
            activityStarted = true;
            callbacks.current.onActivityStart();
          }

          // A cooldown turns a noisy accelerometer peak into one physical swing.
          if (
            movement >= PHOTO_SHAKE_TIMING.pulseThreshold &&
            now - lastPulseAt >= PHOTO_SHAKE_TIMING.pulseCooldown
          ) {
            lastPulseAt = now;
            callbacks.current.onShakePulse();
          }
        }

        const isActivelyShaking =
          lastActivityAt > 0 &&
          now - lastActivityAt <= PHOTO_SHAKE_TIMING.activityGracePeriod;

        if (isActivelyShaking) {
          accumulatedActiveMs += elapsedSinceSample;
        } else if (
          activityStarted &&
          now - lastActivityAt >= PHOTO_SHAKE_TIMING.inactivityResetDelay
        ) {
          // The user must produce one continuous three-second shake. A short gap
          // is tolerated while the hand naturally changes direction.
          activityStarted = false;
          accumulatedActiveMs = 0;
          lastRenderedProgress = 0;
          setProgress(0);
          callbacks.current.onActivityReset();
        }

        const nextProgress = Math.min(
          1,
          accumulatedActiveMs / PHOTO_SHAKE_TIMING.requiredDuration,
        );
        const roundedProgress = Math.round(nextProgress * 100) / 100;

        if (roundedProgress !== lastRenderedProgress) {
          lastRenderedProgress = roundedProgress;
          setProgress(roundedProgress);
        }

        if (nextProgress >= 1) {
          completed = true;
          callbacks.current.onComplete();
        }
      },
      error: error => {
        // Keep this warning outside the hot sample path; per-frame logs can make
        // sensor-driven animations stutter badly on a physical device.
        if (__DEV__) {
          console.warn('Accelerometer is unavailable:', error);
        }
      },
    });

    return () => subscription.unsubscribe();
  }, [active]);

  return progress;
};
