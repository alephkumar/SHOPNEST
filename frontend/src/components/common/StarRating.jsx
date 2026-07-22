import { FiStar } from 'react-icons/fi';

export const StarRating = ({ rating = 0, size = 14, interactive = false, onChange }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          aria-label={interactive ? `Rate ${star} stars` : undefined}
        >
          <FiStar
            size={size}
            className={star <= Math.round(rating) ? 'fill-amber text-amber' : 'text-ink/15'}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
