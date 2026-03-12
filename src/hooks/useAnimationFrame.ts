import { useEffect, useRef, useCallback } from 'react';

// Optimized animation frame hook with performance monitoring
export const useAnimationFrame = (callback: (deltaTime: number, timestamp: number) => void) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  // Update callback ref without triggering re-renders
  callbackRef.current = callback;

  const animate = useCallback((timestamp: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = timestamp - previousTimeRef.current;
      callbackRef.current(deltaTime, timestamp);
    }
    previousTimeRef.current = timestamp;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  // Pause/resume controls
  const pause = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
  }, []);

  const resume = useCallback(() => {
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  return { pause, resume };
};