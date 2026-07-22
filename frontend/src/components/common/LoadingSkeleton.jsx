const ProductCardSkeleton = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-square bg-ink/8" />
    <div className="p-4 space-y-2">
      <div className="h-2.5 bg-ink/8 rounded w-1/3" />
      <div className="h-4 bg-ink/8 rounded w-full" />
      <div className="h-4 bg-ink/8 rounded w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-ink/8 rounded w-16" />
        <div className="w-9 h-9 bg-ink/8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductCardSkeleton;
