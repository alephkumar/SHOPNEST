import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiCheck, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchProduct, fetchRelatedProducts, clearCurrentProduct } from '../redux/slices/productsSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/product/ProductCard';
import ReviewForm from '../components/product/ReviewForm';
import { formatPrice, formatDate } from '../utils/format';
import api from '../services/api';

const ProductDetail = () => {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, relatedProducts, loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(idOrSlug));
    return () => dispatch(clearCurrentProduct());
  }, [idOrSlug, dispatch, refreshKey]);

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchRelatedProducts(product._id));
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product?._id, dispatch]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-ink/8 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-ink/8 rounded w-2/3" />
            <div className="h-4 bg-ink/8 rounded w-1/3" />
            <div className="h-10 bg-ink/8 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const alreadyReviewed = product.reviews?.some((r) => r.user?._id === user?._id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save items');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/products/${product._id}/reviews/${reviewId}`);
      toast.success('Review deleted');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-light mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-ink">Home</Link> /
        <Link to="/products" className="hover:text-ink">Products</Link>
        {product.category?.name && (
          <>
            /
            <Link to={`/products?category=${product.category._id}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Image gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-ink/5 mb-3">
            <img
              src={product.images?.[activeImage]?.url || 'https://placehold.co/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.public_id || i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    activeImage === i ? 'border-amber' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand?.name && (
            <span className="text-xs uppercase tracking-wider text-amber font-semibold">{product.brand.name}</span>
          )}
          <h1 className="font-display text-3xl text-ink mt-1 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={product.ratings} size={16} />
            <span className="text-sm text-slate-light">
              {product.ratings > 0 ? product.ratings.toFixed(1) : 'No ratings'} ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="price-tabular font-display text-3xl text-ink">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="price-tabular text-lg text-slate-light line-through">{formatPrice(product.price)}</span>
                <span className="bg-amber/10 text-amber-dark text-xs font-semibold px-2 py-1 rounded-full">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-slate leading-relaxed mb-6">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <FiCheck className="text-sage-dark" size={16} />
                <span className="text-sm text-sage-dark font-medium">
                  In Stock {product.stock <= 10 && `(only ${product.stock} left)`}
                </span>
              </>
            ) : (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity + actions */}
          {product.stock > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border border-ink/15 rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-ink/5 rounded-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-ink/5 rounded-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1 justify-center min-w-[160px]">
                <FiShoppingBag size={16} /> Add to Cart
              </button>

              <button
                onClick={handleWishlistToggle}
                className="w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center hover:border-amber transition-colors flex-shrink-0"
                aria-label="Toggle wishlist"
              >
                <FiHeart size={18} className={isWishlisted ? 'fill-amber text-amber' : 'text-ink'} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-light border-t border-ink/8 pt-5">
            <FiTruck size={14} />
            <span>Free shipping on orders over ₹500 · Delivered in 3-5 business days</span>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mt-6 border-t border-ink/8 pt-5">
              <h3 className="text-sm font-semibold text-ink mb-3">Specifications</h3>
              <dl className="space-y-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex text-sm">
                    <dt className="w-32 text-slate-light flex-shrink-0">{spec.key}</dt>
                    <dd className="text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="border-t border-ink/8 pt-10 mb-16">
        <h2 className="font-display text-2xl text-ink mb-6">Customer Reviews</h2>

        {isAuthenticated && !alreadyReviewed && (
          <ReviewForm productId={product._id} onSuccess={() => setRefreshKey((k) => k + 1)} />
        )}

        {product.reviews?.length === 0 ? (
          <p className="text-sm text-slate-light">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          <div className="space-y-6 mt-6">
            {product.reviews?.slice().reverse().map((review) => (
              <div key={review._id} className="border-b border-ink/8 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-ink">{review.name}</span>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-xs text-slate-light mb-2">{formatDate(review.createdAt)}</p>
                  </div>
                  {(review.user?._id === user?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {relatedProducts?.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-ink mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
