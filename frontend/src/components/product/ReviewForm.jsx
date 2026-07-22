import { useState } from 'react';
import toast from 'react-hot-toast';
import StarRating from '../common/StarRating';
import api from '../../services/api';

const ReviewForm = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment: comment.trim() });
      toast.success('Review submitted, thank you!');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-card mb-8">
      <h3 className="text-sm font-semibold text-ink mb-3">Write a review</h3>
      <div className="mb-4">
        <StarRating rating={rating} size={22} interactive onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think of this product?"
        rows={3}
        maxLength={1000}
        className="input-field resize-none mb-3"
      />
      <button type="submit" disabled={submitting} className="btn-primary !py-2.5 text-sm">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
