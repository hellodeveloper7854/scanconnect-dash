import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '../../lib/api';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { fullName: string; email: string };
  order: { id: string; totalInPaise: number };
}

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ reviews: ReviewRow[] }>('/api/admin/reviews')
      .then((res) => setReviews(res.reviews))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reviews'));
  }, []);

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Reviews</h1>

      {!reviews ? (
        <div className="text-white/60">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-white/60">No reviews yet.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white">{review.user.fullName}</div>
                    <div className="text-white/40 text-xs">{review.user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/70">{review.order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70 max-w-xs truncate">{review.comment || '—'}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
