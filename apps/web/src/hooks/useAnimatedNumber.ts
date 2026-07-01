// ============================================================
// STAR — useAnimatedNumber Hook
// Eases a number from previous value to target over a specified duration
// ============================================================
import { useState, useEffect, useRef } from "react";

export function useAnimatedNumber(
  targetValue: number,
  durationMs: number = 2000,
  startDelayMs: number = 0,
  inView: boolean = true
) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);

  // When targetValue changes, we want to animate from current to target
  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    let animationFrame: number;
    let delayTimeout: NodeJS.Timeout;

    const initialValue = startValueRef.current;
    const difference = targetValue - initialValue;
    
    if (difference === 0) {
      setCurrentValue(targetValue);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setCurrentValue(initialValue + difference * ease);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
        startValueRef.current = targetValue;
      }
    };

    delayTimeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, startDelayMs);

    return () => {
      clearTimeout(delayTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, durationMs, startDelayMs, inView]);

  return currentValue;
}
