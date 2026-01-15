import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  ringColor?: 'yellow' | 'green' | 'pink';
  badge?: React.ReactNode;
  className?: string;
}

const sizes = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const iconSizes = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 48,
};

const ringColors = {
  yellow: 'ring-acid-yellow',
  green: 'ring-success-green',
  pink: 'ring-hot-pink',
};

export function Avatar({
  src,
  alt = '',
  size = 'md',
  ring = false,
  ringColor = 'yellow',
  badge,
  className = '',
  fallbackId,
  fallbackName,
}: AvatarProps & { fallbackId?: string; fallbackName?: string }) {
  const [imageError, setImageError] = useState(false);

  // Generate a placeholder URL if no src provided or if image failed to load
  const getImageSrc = () => {
    if (src && !imageError) return src;
    if (fallbackName) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=4D4D4D&color=fff&size=200`;
    if (fallbackId) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackId)}&background=4D4D4D&color=fff&size=200`;
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizes[size]} rounded-full overflow-hidden bg-medium-gray
          flex items-center justify-center
          ${ring ? `ring-[3px] ${ringColors[ringColor]}` : ''}
        `}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <User size={iconSizes[size]} className="text-light-gray" />
        )}
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1">
          {badge}
        </div>
      )}
    </div>
  );
}
