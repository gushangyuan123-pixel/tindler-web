import React from 'react';

interface InterestTagProps {
  interest: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function InterestTag({ interest, active = true, onClick, size = 'md' }: InterestTagProps) {
  const baseClasses = `
    inline-block whitespace-nowrap rounded-full font-mono
    transition-colors duration-150
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-[10px]'
    : 'px-3 py-1.5 text-xs';

  const colorClasses = active
    ? 'bg-acid-yellow text-black'
    : 'bg-medium-gray/50 text-white';

  return (
    <span
      className={`${baseClasses} ${sizeClasses} ${colorClasses}`}
      onClick={onClick}
    >
      {interest}
    </span>
  );
}

interface InterestListProps {
  interests: string[];
  selectedInterests?: Set<string>;
  onToggle?: (interest: string) => void;
  wrap?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function InterestList({
  interests,
  selectedInterests,
  onToggle,
  wrap = false,
  size = 'md',
  className = '',
}: InterestListProps) {
  const containerClasses = wrap
    ? 'flex flex-wrap gap-2'
    : 'flex gap-2 overflow-x-auto hide-scrollbar';

  return (
    <div className={`${containerClasses} ${className}`}>
      {interests.map((interest) => (
        <InterestTag
          key={interest}
          interest={interest}
          active={selectedInterests ? selectedInterests.has(interest) : true}
          onClick={onToggle ? () => onToggle(interest) : undefined}
          size={size}
        />
      ))}
    </div>
  );
}
