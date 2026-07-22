import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate, statusColors } from '../../utils/format';

const STATUS_OPTIONS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders', { params: filterStatus ? { status: filterStatus } : {} });
      setOrders(data.orders);
    } catch (err) {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [filterStatus]);

  const openStatusModal = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setNote('');
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/orders/${editingOrder._id}/status`, {
        status: newStatus,
        trackingNumber,
        note,
      });
      toast.success('Order status updated');
      setEditingOrder(null);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field !w-auto !py-2 text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-slate">Order #</th>
              <th className="px-5 py-3 font-medium text-slate">Customer</th>
              <th className="px-5 py-3 font-medium text-slate">Date</th>
              <th className="px-5 py-3 font-medium text-slate">Total</th>
              <th className="px-5 py-3 font-medium text-slate">Status</th>
              <th className="px-5 py-3 font-medium text-slate text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-light">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-light">No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t border-ink/5">
                  <td className="px-5 py-3 text-ink font-medium">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-slate">{order.user?.name || 'Unknown'}</td>
                  <td className="px-5 py-3 text-slate-light">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 price-tabular text-ink">{formatPrice(order.totalPrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openStatusModal(order)} className="text-amber font-medium hover:text-amber-dark text-xs">
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setEditingOrder(null)} />
          <div className="relative bg-cream rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">Update Order {editingOrder.orderNumber}</h2>
              <button onClick={() => setEditingOrder(null)}><FiX size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field capitalize">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Tracking Number</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="Optional note for status history" />
              </div>
              <button onClick={handleUpdateStatus} className="btn-primary w-full !py-2.5 text-sm">Save Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
