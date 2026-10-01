import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number; // 0 to 5
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  totalRatings?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
  totalRatings,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(activeValue);

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverValue(starNumber)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              className={`p-0.5 transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-125 focus:outline-none'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 fill-transparent'
                } transition-colors duration-150`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 ml-1">
          <span>{value > 0 ? value.toFixed(1) : 'No ratings'}</span>
          {totalRatings !== undefined && (
            <span className="text-xs font-normal text-slate-500">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
