import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMapPin, FiCamera, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { fetchCurrentUser } from '../redux/slices/authSlice';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const onSubmitProfile = async (formData) => {
    try {
      await api.put('/users/profile', formData);
      dispatch(fetchCurrentUser());
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(fetchCurrentUser());
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">My Account</h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-ink/10">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser size={28} className="text-ink/30" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-amber transition-colors"
            aria-label="Change avatar"
          >
            <FiCamera size={12} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div>
          <p className="font-medium text-ink">{user?.name}</p>
          <p className="text-sm text-slate-light">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink/8 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-amber text-ink' : 'border-transparent text-slate-light hover:text-slate'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white rounded-2xl p-6 shadow-card space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Full Name</label>
            <input {...register('name', { required: 'Name is required' })} className="input-field" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Email</label>
            <input value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Phone</label>
            <input
              {...register('phone', { pattern: { value: /^[0-9]{10}$/, message: '10 digits required' } })}
              className="input-field"
              placeholder="10-digit phone number"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <button type="submit" className="btn-primary !py-2.5 text-sm">Save Changes</button>
        </form>
      )}

      {activeTab === 'addresses' && <AddressManager user={user} />}
    </div>
  );
};

const AddressManager = ({ user }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const addresses = user?.addresses || [];

  const openNewForm = () => {
    reset({ label: 'Home', country: 'India' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    reset(addr);
    setEditingId(addr._id);
    setShowForm(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (editingId) {
        await api.put(`/users/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/users/addresses', formData);
        toast.success('Address added');
      }
      dispatch(fetchCurrentUser());
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${addressId}`);
      dispatch(fetchCurrentUser());
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Could not delete address');
    }
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <div key={addr._id} className="bg-white rounded-2xl p-5 shadow-card flex justify-between items-start">
            <div>
              <p className="font-medium text-sm text-ink">{addr.fullName} · {addr.label} {addr.isDefault && <span className="text-xs text-amber ml-1">(Default)</span>}</p>
              <p className="text-sm text-slate-light mt-1">
                {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p className="text-sm text-slate-light">Phone: {addr.phone}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEditForm(addr)} className="text-slate-light hover:text-ink"><FiEdit2 size={15} /></button>
              <button onClick={() => handleDelete(addr._id)} className="text-slate-light hover:text-red-500"><FiTrash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {!showForm && (
        <button onClick={openNewForm} className="btn-secondary flex items-center gap-2 text-sm">
          <FiPlus size={14} /> Add New Address
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-card mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Label</label>
            <input {...register('label')} placeholder="Home, Work..." className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Full Name</label>
            <input {...register('fullName', { required: 'Required' })} className="input-field" />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Phone</label>
            <input {...register('phone', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: '10 digits' } })} className="input-field" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Postal Code</label>
            <input {...register('postalCode', { required: 'Required' })} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate mb-1.5 block">Address Line 1</label>
            <input {...register('addressLine1', { required: 'Required' })} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate mb-1.5 block">Address Line 2</label>
            <input {...register('addressLine2')} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">City</label>
            <input {...register('city', { required: 'Required' })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">State</label>
            <input {...register('state', { required: 'Required' })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Country</label>
            <input {...register('country', { required: 'Required' })} className="input-field" />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" {...register('isDefault')} className="accent-amber" />
            <span className="text-sm text-slate">Set as default address</span>
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary !py-2.5 text-sm">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
