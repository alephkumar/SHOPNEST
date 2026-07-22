import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { fetchProducts } from '../redux/slices/productsSlice';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ sort: 'newest', limit: 8 }));
    api.get('/categories').then((res) => setCategories(res.data.categories.slice(0, 6))).catch(() => {});
  }, [dispatch]);

  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const latest = products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-block text-xs uppercase tracking-widest text-amber font-semibold mb-4">
              New Season Arrivals
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-cream leading-[1.05] mb-6">
              Things worth <em className="italic text-amber">keeping</em>.
            </h1>
            <p className="text-cream/60 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              A carefully edited shop of goods that last — electronics, fashion,
              home, and more. No clutter, just what's good.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary !bg-amber hover:!bg-amber-dark inline-flex items-center gap-2">
                Shop All <FiArrowRight size={15} />
              </Link>
              <Link to="/categories" className="btn-secondary !border-cream/25 !text-cream hover:!border-cream">
                Browse Categories
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden"
          >
            <img
              src="https://picsum.photos/seed/heroshop/900/700"
              alt="Featured collection"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-ink/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {[
            { icon: FiTruck, title: 'Free shipping', desc: 'On orders over ₹500' },
            { icon: FiRefreshCw, title: 'Easy returns', desc: '7-day return window' },
            { icon: FiShield, title: 'Secure checkout', desc: 'Encrypted payments' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 justify-center sm:justify-start">
              <item.icon size={20} className="text-amber flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="text-xs text-slate-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-2xl sm:text-3xl text-ink">Shop by category</h2>
            <Link to="/categories" className="text-sm font-medium text-amber hover:text-amber-dark flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white transition-colors"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-ink/5 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image?.url || `https://picsum.photos/seed/${cat.slug}/200/200`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-center text-slate group-hover:text-ink">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-8">Featured this week</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl text-ink">Just landed</h2>
          <Link to="/products?sort=newest" className="text-sm font-medium text-amber hover:text-amber-dark flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
