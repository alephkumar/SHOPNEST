import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import { formatPrice, formatDate, statusColors } from '../utils/format';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-light">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <FiPackage size={40} className="text-ink/20 mx-auto mb-4" />
        <h1 className="font-display text-2xl text-ink mb-3">No orders yet</h1>
        <p className="text-sm text-slate-light mb-6">When you place an order, it'll show up here.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-light mb-0.5">Order {order.orderNumber}</p>
                <p className="text-sm text-slate">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[order.status] || 'bg-ink/5 text-slate'}`}>
                  {order.status}
                </span>
                <span className="price-tabular font-semibold text-ink">{formatPrice(order.totalPrice)}</span>
                <FiChevronRight className="text-slate-light" size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
