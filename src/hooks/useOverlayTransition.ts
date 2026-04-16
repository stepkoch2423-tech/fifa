import { startTransition, useCallback, useEffect, useRef, useState } from "react";

interface OverlayState {
  visible: boolean;
  label: string;
}

const MIN_VISIBLE_MS = 120;

export function useOverlayTransition(defaultLabel: string) {
  const [overlay, setOverlay] = useState<OverlayState>({
    visible: false,
    label: defaultLabel,
  });
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runWithOverlay = useCallback(
    (action: () => void, label = defaultLabel) => {
      clearTimers();
      setOverlay({ visible: true, label });
      startTransition(() => {
        action();
      });

      const hideTimer = window.setTimeout(() => {
        setOverlay((current) => ({ ...current, visible: false }));
      }, MIN_VISIBLE_MS);

      timersRef.current.push(hideTimer);
    },
    [clearTimers, defaultLabel],
  );

  return { overlay, runWithOverlay };
}
