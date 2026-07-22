import { useState } from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { statusColors } from '../utils/format';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setTrackingInfo(null);
    try {
      const { data } = await api.get(`/orders/track/${orderNumber.trim()}`);
      setTrackingInfo(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = trackingInfo ? STATUS_STEPS.indexOf(trackingInfo.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <FiPackage size={36} className="text-amber mx-auto mb-4" />
        <h1 className="font-display text-3xl text-ink mb-2">Track Your Order</h1>
        <p className="text-sm text-slate-light">Enter your order number to see its current status.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light" size={16} />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-XXXXX-XXXX"
            className="input-field !pl-10"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex-shrink-0">
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 text-center">{error}</div>
      )}

      {trackingInfo && (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-slate-light">Order Number</p>
              <p className="font-medium text-ink">{trackingInfo.orderNumber}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[trackingInfo.status] || 'bg-ink/5'}`}>
              {trackingInfo.status}
            </span>
          </div>

          {trackingInfo.status !== 'cancelled' && (
            <div className="flex items-center justify-between mb-4">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div className={`absolute right-1/2 top-3 h-0.5 w-full -z-10 ${i <= currentStepIndex ? 'bg-amber' : 'bg-ink/10'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= currentStepIndex ? 'bg-amber text-white' : 'bg-ink/10 text-slate-light'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[11px] text-slate-light mt-2 capitalize text-center">{step}</span>
                </div>
              ))}
            </div>
          )}

          {trackingInfo.trackingNumber && (
            <p className="text-sm text-slate-light border-t border-ink/8 pt-4">
              Tracking Number: <span className="font-medium text-ink">{trackingInfo.trackingNumber}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
