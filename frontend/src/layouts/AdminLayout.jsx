import { Outlet, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiArrowLeft,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 bg-ink text-cream/80 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <span className="font-display text-xl text-cream">Shop<span className="italic text-amber">Nest</span></span>
          <p className="text-xs text-cream/40 mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-amber text-white' : 'hover:bg-cream/5 text-cream/70'
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-cream/10">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/60 hover:bg-cream/5 hover:text-cream transition-colors">
            <FiArrowLeft size={16} /> Back to Store
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#14151A', color: '#FAF9F6', fontSize: '14px', borderRadius: '9999px', padding: '10px 20px' },
        }}
      />
    </div>
  );
};

export default AdminLayout;
