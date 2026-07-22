import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus, FiTrash2, FiBookmark, FiTag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  toggleSaveForLater,
} from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/format';
import api from '../services/api';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  const activeItems = items.filter((i) => !i.savedForLater && i.product);
  const savedItems = items.filter((i) => i.savedForLater && i.product);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await api.post('/cart/apply-coupon', { code: couponCode.trim() });
      setCouponResult(data);
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponResult(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Sign in to view your cart</h1>
        <p className="text-sm text-slate-light mb-6">Your cart items are saved to your account.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (!loading && activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Your cart is empty</h1>
        <p className="text-sm text-slate-light mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const shippingEstimate = subtotal >= 500 ? 0 : 49;
  const taxEstimate = Math.round((couponResult ? couponResult.total : subtotal) * 0.18);
  const finalTotal = (couponResult ? couponResult.total : subtotal) + shippingEstimate + taxEstimate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div>
          {/* Active items */}
          <div className="space-y-4">
            {activeItems.map((item) => (
              <div key={item._id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-card">
                <Link to={`/products/${item.product.slug || item.product._id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-ink/5 flex-shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || 'https://placehold.co/200x200'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug || item.product._id}`} className="font-medium text-sm text-ink hover:text-amber transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="price-tabular text-sm font-semibold text-ink mt-1">
                    {formatPrice(item.product.discountPrice || item.product.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-ink/15 rounded-full">
                      <button
                        onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-ink/5 rounded-full"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: Math.min(item.product.stock, item.quantity + 1) }))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-ink/5 rounded-full"
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch(toggleSaveForLater(item._id))}
                        className="text-slate-light hover:text-ink transition-colors"
                        aria-label="Save for later"
                        title="Save for later"
                      >
                        <FiBookmark size={15} />
                      </button>
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="text-slate-light hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved for later */}
          {savedItems.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl text-ink mb-4">Saved for Later ({savedItems.length})</h2>
              <div className="space-y-4">
                {savedItems.map((item) => (
                  <div key={item._id} className="flex gap-4 bg-white/60 rounded-2xl p-4 border border-dashed border-ink/15">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-ink/5 flex-shrink-0">
                      <img src={item.product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink line-clamp-1">{item.product.name}</p>
                      <p className="price-tabular text-sm text-slate mt-1">{formatPrice(item.product.discountPrice || item.product.price)}</p>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => dispatch(toggleSaveForLater(item._id))}
                          className="text-xs font-medium text-amber hover:text-amber-dark"
                        >
                          Move to cart
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-xs font-medium text-slate-light hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        {activeItems.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-card h-fit sticky top-24">
            <h2 className="font-display text-xl text-ink mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" size={14} />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="input-field !pl-9 !py-2.5 text-sm"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={applyingCoupon}
                className="btn-secondary !py-2.5 !px-4 text-sm flex-shrink-0"
              >
                Apply
              </button>
            </div>

            <div className="space-y-3 text-sm border-t border-ink/8 pt-4">
              <div className="flex justify-between text-slate">
                <span>Subtotal</span>
                <span className="price-tabular">{formatPrice(subtotal)}</span>
              </div>
              {couponResult && (
                <div className="flex justify-between text-sage-dark">
                  <span>Discount</span>
                  <span className="price-tabular">−{formatPrice(couponResult.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate">
                <span>Shipping</span>
                <span className="price-tabular">{shippingEstimate === 0 ? 'Free' : formatPrice(shippingEstimate)}</span>
              </div>
              <div className="flex justify-between text-slate">
                <span>Estimated Tax</span>
                <span className="price-tabular">{formatPrice(taxEstimate)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline border-t border-ink/8 mt-4 pt-4 mb-6">
              <span className="font-medium text-ink">Total</span>
              <span className="price-tabular font-display text-2xl text-ink">{formatPrice(finalTotal)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout <FiArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
