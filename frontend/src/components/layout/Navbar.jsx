import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiSettings,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { toggleMobileMenu, closeMobileMenu } from '../../redux/slices/uiSlice';

const NAV_LINKS = [
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'Deals', to: '/products?sort=priceLowToHigh' },
  { label: 'About', to: '/about' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const { mobileMenuOpen } = useSelector((state) => state.ui);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const cartCount = cartItems.filter((i) => !i.savedForLater).reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-ink/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-baseline gap-0.5" onClick={() => dispatch(closeMobileMenu())}>
            <span className="font-display text-2xl font-semibold text-ink">Shop</span>
            <span className="font-display text-2xl font-semibold italic text-amber">Nest</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-slate hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-ink/10 bg-white/60 text-sm
                  focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-ink/5 transition-colors"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            <Link
              to="/wishlist"
              className="hidden sm:flex p-2 rounded-full hover:bg-ink/5 transition-colors relative"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
            </Link>

            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-ink/5 transition-colors relative"
              aria-label="Cart"
            >
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber text-white text-[10px] font-semibold
                  w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-full hover:bg-ink/5 transition-colors flex items-center gap-1.5"
                  aria-label="Account menu"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <FiUser size={20} />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card-hover border border-ink/5 py-2 animate-fadeInUp">
                    <div className="px-4 py-2 border-b border-ink/5">
                      <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                      <p className="text-xs text-slate-light truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate hover:bg-ink/5 transition-colors">
                      <FiUser size={15} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate hover:bg-ink/5 transition-colors">
                      <FiPackage size={15} /> My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate hover:bg-ink/5 transition-colors">
                        <FiSettings size={15} /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block ml-2 btn-primary !py-2 !px-5 text-xs">
                Sign In
              </Link>
            )}

            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 rounded-full hover:bg-ink/5 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" size={16} />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-ink/10 bg-white text-sm focus:outline-none focus:border-amber"
              />
            </div>
          </form>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-ink/8 bg-cream animate-fadeInUp">
          <nav className="flex flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => dispatch(closeMobileMenu())}
                className="py-3 text-sm font-medium text-slate hover:text-ink border-b border-ink/5 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => dispatch(closeMobileMenu())}
              className="py-3 text-sm font-medium text-slate hover:text-ink flex items-center gap-2"
            >
              <FiHeart size={16} /> Wishlist
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => dispatch(closeMobileMenu())}
                className="mt-2 btn-primary text-center !py-2.5"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
