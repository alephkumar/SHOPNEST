import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { formatPrice, formatDate, statusColors } from '../../utils/format';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent}`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-2xl font-semibold text-ink price-tabular">{value}</p>
    <p className="text-xs text-slate-light mt-0.5">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/revenue-graph?days=30'),
    ])
      .then(([dashRes, revRes]) => {
        setStats(dashRes.data.stats);
        setRecentOrders(dashRes.data.recentOrders);
        setRevenueData(
          revRes.data.data.map((d) => ({
            date: d._id.slice(5),
            revenue: d.revenue,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-light">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={formatPrice(stats.totalRevenue)} accent="bg-sage/15 text-sage-dark" />
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats.totalOrders} accent="bg-amber/15 text-amber-dark" />
        <StatCard icon={FiUsers} label="Customers" value={stats.totalUsers} accent="bg-ink/10 text-ink" />
        <StatCard icon={FiBox} label="Products" value={stats.totalProducts} accent="bg-slate/15 text-slate" />
      </div>

      {stats.lowStockProducts > 0 && (
        <div className="bg-amber/10 border border-amber/30 rounded-2xl p-4 flex items-center gap-3 mb-8">
          <FiAlertTriangle className="text-amber-dark flex-shrink-0" size={18} />
          <p className="text-sm text-amber-dark">
            {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's are' : ' is'} running low on stock.
          </p>
          <Link to="/admin/products" className="text-sm font-medium text-amber-dark hover:underline ml-auto flex-shrink-0">
            Review →
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-sm text-ink mb-4">Revenue (Last 30 Days)</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-slate-light py-12 text-center">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14151A10" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6E78' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6E78' }} />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #14151A10', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#C4622D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-amber font-medium flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/admin/orders`}
                className="flex items-center justify-between text-sm hover:bg-ink/5 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-ink truncate">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-light">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="price-tabular text-ink">{formatPrice(order.totalPrice)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusColors[order.status]}`}>{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
