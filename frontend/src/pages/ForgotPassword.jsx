import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <FiCheckCircle size={40} className="text-sage-dark mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink mb-2">Check your email</h1>
          <p className="text-sm text-slate-light mb-6">
            If an account exists with that email, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="btn-secondary">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-ink mb-2">Forgot your password?</h1>
          <p className="text-sm text-slate-light">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 shadow-card space-y-4">
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light" size={15} />
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input-field !pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-light mt-6">
          <Link to="/login" className="text-amber font-medium hover:text-amber-dark">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
