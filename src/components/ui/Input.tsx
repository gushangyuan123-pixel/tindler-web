import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono text-light-gray mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-4 bg-dark-gray border-2 border-medium-gray rounded-brutalist
            text-white text-base placeholder:text-light-gray/50
            focus:border-acid-yellow focus:outline-none transition-colors
            ${error ? 'border-hot-pink' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs text-hot-pink">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono text-light-gray mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-4 bg-dark-gray border-2 border-medium-gray rounded-brutalist
            text-white text-base placeholder:text-light-gray/50 resize-none
            focus:border-acid-yellow focus:outline-none transition-colors
            ${error ? 'border-hot-pink' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs text-hot-pink">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
