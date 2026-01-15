import React from 'react';
import { Check } from 'lucide-react';

interface BadgeProps {
  variant?: 'default' | 'verified' | 'count' | 'new';
  children?: React.ReactNode;
  count?: number;
  className?: string;
}

export function Badge({ variant = 'default', children, count, className = '' }: BadgeProps) {
  if (variant === 'verified') {
    return (
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-1
          bg-acid-yellow/20 text-acid-yellow
          text-[10px] font-mono uppercase tracking-wider
          rounded-sm
          ${className}
        `}
      >
        <Check size={10} strokeWidth={3} />
        {children || 'BMOE 2026'}
      </span>
    );
  }

  if (variant === 'count') {
    return (
      <span
        className={`
          inline-flex items-center justify-center
          min-w-[20px] h-5 px-1.5
          bg-acid-yellow text-black
          text-[10px] font-bold
          rounded-full
          ${className}
        `}
      >
        {count}
      </span>
    );
  }

  if (variant === 'new') {
    return (
      <span
        className={`
          inline-block w-2.5 h-2.5
          bg-acid-yellow rounded-full
          ${className}
        `}
      />
    );
  }

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        bg-medium-gray text-light-gray
        text-[10px] font-mono uppercase
        rounded-sm
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        bg-acid-yellow text-black
        text-[10px] font-mono uppercase tracking-wider
        rounded-sm
        ${className}
      `}
    >
      VERIFIED MEMBER
    </span>
  );
}
