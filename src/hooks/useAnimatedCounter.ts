import { useState, useEffect } from 'react';

/**
 * useAnimatedCounter hook
 * Animates a numeric value from 0 to target over duration using easeOutCubic
 */
export function useAnimatedCounter(
  target: number,
  duration: number = 1000,
  delay: number = 100
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    let timeoutId: NodeJS.Timeout;

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, delay]);

  return count;
}
