import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onChange: (rating: number) => void;
}

export function RatingStars({ rating, onChange }: RatingStarsProps) {
  const colors = [
    "#DC2626", // 1 - red
    "#F5A623", // 2 - orange/gold
    "#8B5CF6", // 3 - purple/lilás
    "#16A34A", // 4 - green light
    "#16A34A", // 5 - green
  ];

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all
            ${rating >= value ? 'scale-110' : 'scale-100 opacity-40'}
          `}
          style={{
            backgroundColor: rating >= value ? colors[value - 1] : '#E5E7EB',
          }}
        >
          <Star
            className="w-6 h-6"
            fill={rating >= value ? 'white' : 'none'}
            stroke={rating >= value ? 'white' : '#9CA3AF'}
          />
        </button>
      ))}
    </div>
  );
}