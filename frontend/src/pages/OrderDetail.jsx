import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatPrice, formatDate, statusColors } from '../utils/format';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const loadOrder = () => {
    api.get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrder(); }, [orderId]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }
    try {
      await api.put(`/orders/${orderId}/return`, { reason: returnReason });
      toast.success('Return request submitted');
      setShowReturnForm(false);
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit return request');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-light">Loading order...</div>;
  if (!order) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-light">Order not found.</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="text-sm text-slate-light hover:text-ink mb-4 inline-block">← Back to orders</Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink">Order {order.orderNumber}</h1>
          <p className="text-sm text-slate-light">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[order.status] || 'bg-ink/5 text-slate'}`}>
          {order.status}
        </span>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1 relative">
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-3 h-0.5 w-full -z-10 ${
                      i <= currentStepIndex ? 'bg-amber' : 'bg-ink/10'
                    }`}
                  />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i <= currentStepIndex ? 'bg-amber text-white' : 'bg-ink/10 text-slate-light'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[11px] text-slate-light mt-2 capitalize text-center">{step}</span>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-slate-light mt-4 pt-4 border-t border-ink/8">
              Tracking Number: <span className="font-medium text-ink">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <FiMapPin size={16} className="text-amber" />
            <h3 className="font-semibold text-sm text-ink">Shipping Address</h3>
          </div>
          <p className="text-sm text-slate leading-relaxed">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.addressLine1}<br />
            {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}<br />
            Phone: {order.shippingAddress.phone}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <FiCreditCard size={16} className="text-amber" />
            <h3 className="font-semibold text-sm text-ink">Payment</h3>
          </div>
          <p className="text-sm text-slate capitalize">Method: {order.paymentMethod}</p>
          <p className="text-sm text-slate">Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
        <h3 className="font-semibold text-sm text-ink mb-4">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-ink">{item.name}</p>
                <p className="text-slate-light text-xs">Qty: {item.quantity}</p>
              </div>
              <p className="price-tabular text-ink">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-ink/8 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate"><span>Subtotal</span><span className="price-tabular">{formatPrice(order.itemsPrice)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-sage-dark"><span>Discount</span><span className="price-tabular">−{formatPrice(order.discountAmount)}</span></div>}
          <div className="flex justify-between text-slate"><span>Shipping</span><span className="price-tabular">{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
          <div className="flex justify-between text-slate"><span>Tax</span><span className="price-tabular">{formatPrice(order.taxPrice)}</span></div>
          <div className="flex justify-between font-semibold text-ink pt-1.5 border-t border-ink/8"><span>Total</span><span className="price-tabular">{formatPrice(order.totalPrice)}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {['pending', 'confirmed'].includes(order.status) && (
          <button onClick={handleCancel} className="btn-secondary !border-red-200 !text-red-600 hover:!border-red-400">
            Cancel Order
          </button>
        )}
        {order.status === 'delivered' && !order.returnRequest?.requested && (
          <button onClick={() => setShowReturnForm(!showReturnForm)} className="btn-secondary">
            Request Return
          </button>
        )}
        {order.returnRequest?.requested && (
          <span className="text-sm text-slate-light">
            Return status: <span className="font-medium capitalize">{order.returnRequest.status}</span>
          </span>
        )}
      </div>

      {showReturnForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card mt-4">
          <label className="text-xs font-medium text-slate mb-1.5 block">Reason for return</label>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            rows={3}
            className="input-field resize-none mb-3"
            placeholder="Tell us why you'd like to return this order..."
          />
          <button onClick={handleReturnRequest} className="btn-primary !py-2.5 text-sm">Submit Return Request</button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
