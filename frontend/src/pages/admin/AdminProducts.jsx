import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get('/products', { params: { limit: 50 } }),
        api.get('/categories'),
        api.get('/brands'),
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
      setBrands(brandRes.data.brands);
    } catch (err) {
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreateModal = () => {
    reset({ name: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '' });
    setEditingProduct(null);
    setImageFiles([]);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      stock: product.stock,
    });
    setEditingProduct(product);
    setImageFiles([]);
    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== '' && val !== undefined) fd.append(key, val);
    });
    imageFiles.forEach((file) => fd.append('images', file));

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 !py-2.5 text-sm">
          <FiPlus size={15} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-slate">Product</th>
              <th className="px-5 py-3 font-medium text-slate">Category</th>
              <th className="px-5 py-3 font-medium text-slate">Price</th>
              <th className="px-5 py-3 font-medium text-slate">Stock</th>
              <th className="px-5 py-3 font-medium text-slate text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-light">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-light">No products yet.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-t border-ink/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-ink/5 flex-shrink-0">
                        <img src={product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-ink line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate">{product.category?.name || '—'}</td>
                  <td className="px-5 py-3 price-tabular text-ink">{formatPrice(product.discountPrice || product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={product.stock <= 5 ? 'text-amber-dark font-medium' : 'text-slate'}>{product.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEditModal(product)} className="text-slate-light hover:text-ink"><FiEdit2 size={15} /></button>
                      <button onClick={() => handleDelete(product._id)} className="text-slate-light hover:text-red-500"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-cream rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Name</label>
                <input {...register('name', { required: 'Required' })} className="input-field" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Description</label>
                <textarea {...register('description', { required: 'Required' })} rows={3} className="input-field resize-none" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Price</label>
                  <input type="number" step="0.01" {...register('price', { required: 'Required', min: 0 })} className="input-field" />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Discount Price</label>
                  <input type="number" step="0.01" {...register('discountPrice', { min: 0 })} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Category</label>
                  <select {...register('category', { required: 'Required' })} className="input-field">
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate mb-1.5 block">Brand</label>
                  <select {...register('brand')} className="input-field">
                    <option value="">None</option>
                    {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">Stock Quantity</label>
                <input type="number" {...register('stock', { required: 'Required', min: 0 })} className="input-field" />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate mb-1.5 block">
                  Images {editingProduct && '(new images will be added to existing ones)'}
                </label>
                <label className="flex items-center gap-2 justify-center border-2 border-dashed border-ink/15 rounded-xl py-6 cursor-pointer hover:border-amber transition-colors">
                  <FiUpload size={16} className="text-slate-light" />
                  <span className="text-sm text-slate-light">
                    {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 !py-2.5 text-sm">
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !py-2.5 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
