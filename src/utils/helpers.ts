// Time formatting
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return formatTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// String helpers
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Array helpers
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Validation
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isBerkeleyEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@berkeley.edu');
}

// Swipe helpers
export const SWIPE_THRESHOLD = 100;
export const SWIPE_VELOCITY_THRESHOLD = 500;

export function calculateRotation(offsetX: number, containerWidth: number): number {
  return (offsetX / containerWidth) * 20;
}

export function getSwipeDirection(offsetX: number): 'left' | 'right' | null {
  if (offsetX > SWIPE_THRESHOLD) return 'right';
  if (offsetX < -SWIPE_THRESHOLD) return 'left';
  return null;
}
