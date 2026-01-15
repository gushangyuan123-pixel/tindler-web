import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-acid-yellow text-black shadow-brutalist hover:shadow-brutalist-sm active:shadow-none active:translate-x-1 active:translate-y-1',
  outline: 'bg-white text-black border-[3px] border-black shadow-brutalist hover:shadow-brutalist-sm active:shadow-none active:translate-x-1 active:translate-y-1',
  danger: 'bg-hot-pink text-white shadow-brutalist hover:shadow-brutalist-sm active:shadow-none active:translate-x-1 active:translate-y-1',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon,
      iconPosition = 'right',
      isLoading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2 font-bold rounded-brutalist
          transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
