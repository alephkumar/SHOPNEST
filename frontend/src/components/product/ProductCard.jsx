import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <Link
      to={`/products/${product.slug || product._id}`}
      className="group card hover:shadow-card-hover overflow-hidden relative flex flex-col h-full"
    >
      {/* Torn price-tag corner fold - signature design element for discounted items */}
      {hasDiscount && (
        <div className="absolute top-0 left-0 z-10 w-16 h-16 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-amber rotate-45 flex items-end justify-center pb-1.5 shadow-sm">
            <span className="text-[10px] font-bold text-white rotate-0 tracking-tight">
              -{discountPercent}%
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
          shadow-sm hover:scale-110 transition-transform"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <FiHeart
          size={15}
          className={isWishlisted ? 'fill-amber text-amber' : 'text-ink/60'}
        />
      </button>

      <div className="aspect-square overflow-hidden bg-ink/5">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.category?.name && (
          <span className="text-[11px] uppercase tracking-wider text-slate-light font-medium mb-1">
            {product.category.name}
          </span>
        )}

        <h3 className="font-medium text-sm text-ink leading-snug mb-1.5 line-clamp-2 flex-1">
          {product.name}
        </h3>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar size={12} className="fill-amber text-amber" />
            <span className="text-xs text-slate">{product.ratings.toFixed(1)}</span>
            <span className="text-xs text-slate-light">({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="price-tabular font-semibold text-ink">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {hasDiscount && (
              <span className="price-tabular text-xs text-slate-light line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center
              hover:bg-amber transition-colors disabled:opacity-30 disabled:pointer-events-none flex-shrink-0"
            aria-label="Add to cart"
          >
            <FiShoppingBag size={14} />
          </button>
        </div>

        {product.stock === 0 && (
          <span className="text-xs text-red-500 font-medium mt-2">Out of stock</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-xs text-amber-dark font-medium mt-2">Only {product.stock} left</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
