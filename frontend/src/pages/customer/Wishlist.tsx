import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

const Wishlist = () => {
  const { items, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product._id || product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
      quantity: 1,
      vendorId: product.vendor?._id || 'general',
    });
    addToast({
      type: 'success',
      title: 'Added to Bag',
      message: `"${product.title}" is now in your shopping bag.`,
    });
  };

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      addToCart({
        productId: item._id || item.id || '',
        name: item.title,
        price: item.price,
        imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
        quantity: 1,
        vendorId: item.vendor?._id || 'general',
      });
    });
    addToast({
      type: 'success',
      title: 'All Items Moved',
      message: `Moved ${items.length} items to your shopping bag!`,
    });
  };

  return (
    <div className="min-h-screen bg-bg text-textPrimary py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tag text-[#D94E34] uppercase tracking-widest font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Collection</span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
              Saved Wishlist
            </h1>
            <p className="text-sm text-textMuted mt-1">
              {items.length === 1
                ? '1 handcrafted heirloom saved for later'
                : `${items.length} handcrafted heirlooms saved for later`}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="px-4 py-2.5 rounded-xl bg-[#D94E34] text-[#FFF8E7] hover:bg-[#C03B22] text-xs font-mono-tag uppercase tracking-wider font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Bag</span>
              </button>

              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 rounded-xl border border-border text-textMuted hover:text-red-600 hover:border-red-300 text-xs font-mono-tag uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-surface border border-border/80 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xs space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF7F0] dark:bg-stone-900 border border-[#EBD69D] flex items-center justify-center text-[#D94E34]">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-textPrimary">Your Wishlist is Empty</h3>
              <p className="text-sm text-textMuted leading-relaxed">
                Explore our curated selection of non-toxic heirloom goods, small-batch ceramics, and organic apparel to save your favorites.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/products">
                <Button variant="primary" className="gap-2 mx-auto">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => {
              const prodId = product._id || product.id || '';
              const image = product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';

              return (
                <div
                  key={prodId}
                  className="group bg-surface rounded-2xl border border-border/80 hover:border-[#D94E34]/50 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(prodId)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-900/90 text-textMuted hover:text-red-600 hover:bg-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Product Image */}
                  <Link to={`/products/${prodId}`} className="block relative aspect-square bg-[#F3ECE1] overflow-hidden">
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#1C1917]/80 backdrop-blur-xs text-[#FAF7F0] text-[10px] font-mono-tag uppercase tracking-wider px-2.5 py-1 rounded-full font-bold">
                      {product.category || 'Atelier'}
                    </div>
                  </Link>

                  {/* Details & Cart Action */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-1">
                      <Link to={`/products/${prodId}`}>
                        <h3 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-black text-lg text-textPrimary">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-textMuted line-through">
                              ${Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono-tag text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          In Stock
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 hover:bg-[#D94E34] text-textPrimary hover:text-[#FFF8E7] border border-border hover:border-[#D94E34] text-xs font-mono-tag uppercase tracking-wider font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
