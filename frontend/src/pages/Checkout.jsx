import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { FiCreditCard, FiSmartphone, FiTruck as FiCod, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchCart, resetCart } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/format';
import api from '../services/api';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: FiCreditCard },
  { id: 'upi', label: 'UPI', icon: FiSmartphone },
  { id: 'cod', label: 'Cash on Delivery', icon: FiCod },
];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (user?.addresses?.length) {
      setSavedAddresses(user.addresses);
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [user]);

  const activeItems = items.filter((i) => !i.savedForLater && i.product);
  const shippingEstimate = subtotal >= 500 ? 0 : 49;
  const taxEstimate = Math.round(subtotal * 0.18);
  const total = subtotal + shippingEstimate + taxEstimate;

  const selectedAddress = savedAddresses.find((a) => a._id === selectedAddressId);

  const onSubmit = async (formData) => {
    if (activeItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const shippingAddress = selectedAddressId
      ? {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
        }
      : formData;

    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress, paymentMethod });
      dispatch(resetCart());

      if (paymentMethod === 'cod') {
        await api.put(`/payments/confirm-cod/${data.order._id}`);
        toast.success('Order placed successfully!');
        navigate(`/order-success/${data.order._id}`);
      } else {
        // In a real deployment this would redirect to Stripe Elements / Checkout
        // using the clientSecret from /api/payments/create-intent.
        toast.success('Order placed! Redirecting to payment...');
        navigate(`/order-success/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Nothing to check out</h1>
        <p className="text-sm text-slate-light mb-6">Add some items to your cart first.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          {/* Shipping address */}
          <section className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-lg text-ink mb-4">Shipping Address</h2>

            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedAddressId === addr._id ? 'border-amber bg-amber/5' : 'border-ink/10'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 accent-amber"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-ink">{addr.fullName} · {addr.label}</p>
                      <p className="text-slate-light">
                        {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedAddressId(null)}
                  className="text-sm text-amber font-medium hover:text-amber-dark"
                >
                  + Use a different address
                </button>
              </div>
            )}

            {!selectedAddressId && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate mb-1.5 block">Full Name</label>
                  <input {...register('fullName', { required: 'Required' })} className="input-field" />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Phone</label>
                  <input {...register('phone', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: '10 digits required' } })} className="input-field" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Postal Code</label>
                  <input {...register('postalCode', { required: 'Required' })} className="input-field" />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate mb-1.5 block">Address Line 1</label>
                  <input {...register('addressLine1', { required: 'Required' })} className="input-field" />
                  {errors.addressLine1 && <p className="text-xs text-red-500 mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate mb-1.5 block">Address Line 2 (optional)</label>
                  <input {...register('addressLine2')} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">City</label>
                  <input {...register('city', { required: 'Required' })} className="input-field" />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">State</label>
                  <input {...register('state', { required: 'Required' })} className="input-field" />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Country</label>
                  <input {...register('country', { required: 'Required' })} defaultValue="India" className="input-field" />
                </div>
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-lg text-ink mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === method.id ? 'border-amber bg-amber/5' : 'border-ink/10'
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-amber"
                  />
                  <method.icon size={18} className="text-slate" />
                  <span className="text-sm font-medium text-ink">{method.label}</span>
                </label>
              ))}
            </div>
            {paymentMethod !== 'cod' && (
              <p className="text-xs text-slate-light mt-3">
                You'll be redirected to complete payment securely after placing your order.
              </p>
            )}
          </section>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-6 shadow-card h-fit sticky top-24">
          <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {activeItems.map((item) => (
              <div key={item._id} className="flex gap-3 text-sm">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
                  <img src={item.product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-ink">{item.product.name}</p>
                  <p className="text-slate-light text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="price-tabular text-ink flex-shrink-0">
                  {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-ink/8 pt-4">
            <div className="flex justify-between text-slate">
              <span>Subtotal</span>
              <span className="price-tabular">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate">
              <span>Shipping</span>
              <span className="price-tabular">{shippingEstimate === 0 ? 'Free' : formatPrice(shippingEstimate)}</span>
            </div>
            <div className="flex justify-between text-slate">
              <span>Tax</span>
              <span className="price-tabular">{formatPrice(taxEstimate)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-ink/8 mt-3 pt-3 mb-6">
            <span className="font-medium text-ink">Total</span>
            <span className="price-tabular font-display text-2xl text-ink">{formatPrice(total)}</span>
          </div>

          <button type="submit" disabled={placing} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiCheck size={16} /> {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
