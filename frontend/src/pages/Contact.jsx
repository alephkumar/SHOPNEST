import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    // No backend contact endpoint exists yet in this build - this simulates submission.
    // Wire this up to a real /api/contact route + email service before going to production.
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Message sent! We'll get back to you soon.");
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl text-ink mb-3">Get in Touch</h1>
      <p className="text-sm text-slate-light mb-10">Questions, feedback, or just want to say hi? We'd love to hear from you.</p>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <FiMail size={18} className="text-amber mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">Email</p>
              <p className="text-sm text-slate-light">support@shopnest.example</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiPhone size={18} className="text-amber mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">Phone</p>
              <p className="text-sm text-slate-light">+91 00000 00000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiMapPin size={18} className="text-amber mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">Address</p>
              <p className="text-sm text-slate-light">123 Market Street, Hyderabad, Telangana, India</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Name</label>
            <input {...register('name', { required: 'Required' })} className="input-field" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Email</label>
            <input type="email" {...register('email', { required: 'Required' })} className="input-field" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate mb-1.5 block">Message</label>
            <textarea {...register('message', { required: 'Required' })} rows={4} className="input-field resize-none" />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary !py-2.5 text-sm">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
