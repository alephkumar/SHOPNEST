import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons);
    } catch (err) {
      toast.error('Could not load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const openModal = () => {
    reset({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, usageLimit: 100, expiresAt: '' });
    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    try {
      await api.post('/coupons', formData);
      toast.success('Coupon created');
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error('Could not delete coupon');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Coupons</h1>
        <button onClick={openModal} className="btn-primary flex items-center gap-2 !py-2.5 text-sm">
          <FiPlus size={15} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-slate">Code</th>
              <th className="px-5 py-3 font-medium text-slate">Discount</th>
              <th className="px-5 py-3 font-medium text-slate">Min Order</th>
              <th className="px-5 py-3 font-medium text-slate">Usage</th>
              <th className="px-5 py-3 font-medium text-slate">Expires</th>
              <th className="px-5 py-3 font-medium text-slate text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-light">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-light">No coupons yet.</td></tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-t border-ink/5">
                  <td className="px-5 py-3 font-medium text-ink">{coupon.code}</td>
                  <td className="px-5 py-3 text-slate">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-5 py-3 text-slate">₹{coupon.minOrderValue}</td>
                  <td className="px-5 py-3 text-slate">{coupon.usedCount} / {coupon.usageLimit}</td>
                  <td className="px-5 py-3 text-slate-light">{formatDate(coupon.expiresAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(coupon._id)} className="text-slate-light hover:text-red-500">
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-cream rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">New Coupon</h2>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Code</label>
                <input {...register('code', { required: 'Required' })} className="input-field uppercase" placeholder="SAVE20" />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Type</label>
                  <select {...register('discountType')} className="input-field">
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Value</label>
                  <input type="number" {...register('discountValue', { required: 'Required', min: 0 })} className="input-field" />
                  {errors.discountValue && <p className="text-xs text-red-500 mt-1">{errors.discountValue.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Min Order Value</label>
                  <input type="number" {...register('minOrderValue', { min: 0 })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Usage Limit</label>
                  <input type="number" {...register('usageLimit', { min: 1 })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Expires At</label>
                <input type="date" {...register('expiresAt', { required: 'Required' })} className="input-field" />
                {errors.expiresAt && <p className="text-xs text-red-500 mt-1">{errors.expiresAt.message}</p>}
              </div>
              <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
