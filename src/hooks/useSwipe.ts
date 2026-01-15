import { useState, useCallback, useRef } from 'react';

export interface SwipeState {
  x: number;
  y: number;
  rotation: number;
  isDragging: boolean;
  direction: 'left' | 'right' | null;
}

interface UseSwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  rotationFactor?: number;
}

const DEFAULT_THRESHOLD = 100;
const DEFAULT_ROTATION_FACTOR = 20;

export function useSwipe({
  threshold = DEFAULT_THRESHOLD,
  onSwipeLeft,
  onSwipeRight,
  rotationFactor = DEFAULT_ROTATION_FACTOR,
}: UseSwipeOptions = {}) {
  const [state, setState] = useState<SwipeState>({
    x: 0,
    y: 0,
    rotation: 0,
    isDragging: false,
    direction: null,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const containerWidth = useRef(375);

  const getDirection = useCallback(
    (offsetX: number): 'left' | 'right' | null => {
      if (offsetX > threshold) return 'right';
      if (offsetX < -threshold) return 'left';
      return null;
    },
    [threshold]
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number, width: number) => {
      startPos.current = { x: clientX, y: clientY };
      containerWidth.current = width;
      setState((prev) => ({ ...prev, isDragging: true }));
    },
    []
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const deltaX = clientX - startPos.current.x;
      const deltaY = clientY - startPos.current.y;
      const rotation = (deltaX / containerWidth.current) * rotationFactor;
      const direction = getDirection(deltaX);

      setState({
        x: deltaX,
        y: deltaY,
        rotation,
        isDragging: true,
        direction,
      });
    },
    [rotationFactor, getDirection]
  );

  const handleEnd = useCallback(() => {
    const { x, direction } = state;

    if (direction === 'right' && onSwipeRight) {
      onSwipeRight();
    } else if (direction === 'left' && onSwipeLeft) {
      onSwipeLeft();
    }

    // Reset state
    setState({
      x: 0,
      y: 0,
      rotation: 0,
      isDragging: false,
      direction: null,
    });
  }, [state, onSwipeLeft, onSwipeRight]);

  // Mouse event handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      handleStart(e.clientX, e.clientY, rect.width);
    },
    [handleStart]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!state.isDragging) return;
      handleMove(e.clientX, e.clientY);
    },
    [state.isDragging, handleMove]
  );

  const onMouseUp = useCallback(() => {
    if (!state.isDragging) return;
    handleEnd();
  }, [state.isDragging, handleEnd]);

  const onMouseLeave = useCallback(() => {
    if (!state.isDragging) return;
    handleEnd();
  }, [state.isDragging, handleEnd]);

  // Touch event handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      handleStart(touch.clientX, touch.clientY, rect.width);
    },
    [handleStart]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!state.isDragging) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [state.isDragging, handleMove]
  );

  const onTouchEnd = useCallback(() => {
    if (!state.isDragging) return;
    handleEnd();
  }, [state.isDragging, handleEnd]);

  // Programmatic swipe
  const swipeLeft = useCallback(() => {
    if (onSwipeLeft) onSwipeLeft();
  }, [onSwipeLeft]);

  const swipeRight = useCallback(() => {
    if (onSwipeRight) onSwipeRight();
  }, [onSwipeRight]);

  return {
    state,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    swipeLeft,
    swipeRight,
  };
}
