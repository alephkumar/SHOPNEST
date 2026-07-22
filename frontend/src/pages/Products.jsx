import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiX } from 'react-icons/fi';
import { fetchProducts } from '../redux/slices/productsSlice';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import Pagination from '../components/common/Pagination';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'priceLowToHigh', label: 'Price: Low to High' },
  { value: 'priceHighToLow', label: 'Price: High to Low' },
  { value: 'ratingHighToLow', label: 'Top Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, total, page, pages, loading } = useSelector((state) => state.products);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [localFilters, setLocalFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
    api.get('/brands').then((res) => setBrands(res.data.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    dispatch(fetchProducts(params));
    setLocalFilters((prev) => ({ ...prev, ...params }));
  }, [searchParams, dispatch]);

  const applyFilters = (overrides = {}) => {
    const merged = { ...localFilters, ...overrides };
    const params = {};
    Object.entries(merged).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({ keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest' });
    setSearchParams({});
  };

  const activeFilterCount = ['category', 'brand', 'minPrice', 'maxPrice', 'rating'].filter(
    (key) => localFilters[key]
  ).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={localFilters.category === cat._id}
                onChange={() => setLocalFilters((f) => ({ ...f, category: cat._id }))}
                className="accent-amber"
              />
              <span className="text-sm text-slate group-hover:text-ink transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand._id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                checked={localFilters.brand === brand._id}
                onChange={() => setLocalFilters((f) => ({ ...f, brand: brand._id }))}
                className="accent-amber"
              />
              <span className="text-sm text-slate group-hover:text-ink transition-colors">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) => setLocalFilters((f) => ({ ...f, minPrice: e.target.value }))}
            className="input-field !py-2 text-sm"
          />
          <span className="text-slate-light">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) => setLocalFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className="input-field !py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={localFilters.rating === String(r)}
                onChange={() => setLocalFilters((f) => ({ ...f, rating: String(r) }))}
                className="accent-amber"
              />
              <span className="text-sm text-slate group-hover:text-ink transition-colors">{r}+ stars</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => applyFilters()} className="btn-primary flex-1 !py-2.5 text-sm">Apply Filters</button>
        <button onClick={clearFilters} className="btn-secondary !py-2.5 text-sm">Clear</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {localFilters.keyword ? `Results for "${localFilters.keyword}"` : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-slate-light mt-1">{total} product{total !== 1 ? 's' : ''} found</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <FiFilter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <select
            value={localFilters.sort}
            onChange={(e) => applyFilters({ sort: e.target.value })}
            className="input-field !py-2 text-sm !w-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <FilterPanel />
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <FiX size={22} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div>
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-ink mb-2">No products found</p>
              <p className="text-sm text-slate-light mb-6">Try adjusting your filters or search term.</p>
              <button onClick={clearFilters} className="btn-primary">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={pages}
                onPageChange={(p) => applyFilters({ page: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
