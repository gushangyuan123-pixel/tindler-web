import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

const variants = {
  default: 'bg-white',
  dark: 'bg-medium-gray/30',
  transparent: 'bg-transparent',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      shadow = true,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-brutalist
          ${variants[variant]}
          ${paddings[padding]}
          ${shadow && variant === 'default' ? 'shadow-brutalist-lg' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
