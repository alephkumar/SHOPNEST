import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatPrice } from '../utils/format';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.order)).catch(() => {});
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <FiCheckCircle size={56} className="text-sage-dark mx-auto mb-6" />
      </motion.div>
      <h1 className="font-display text-3xl text-ink mb-2">Order Confirmed!</h1>
      <p className="text-sm text-slate-light mb-8">
        Thank you for your purchase. A confirmation has been sent to your email.
      </p>

      {order && (
        <div className="bg-white rounded-2xl p-6 shadow-card text-left mb-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-ink/8">
            <div>
              <p className="text-xs text-slate-light">Order Number</p>
              <p className="font-medium text-ink">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-light">Total</p>
              <p className="price-tabular font-semibold text-ink">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate">{item.name} × {item.quantity}</span>
                <span className="price-tabular text-ink">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/orders" className="btn-primary flex items-center gap-2">
          <FiPackage size={16} /> View My Orders
        </Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
