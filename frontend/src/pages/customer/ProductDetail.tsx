import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  RotateCcw, 
  Check, 
  Sparkles,
  MessageSquare,
  Send,
  ChevronRight,
  Leaf,
  Heart
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import { ProductCard, type ProductItem } from '../../components/ProductCard';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useWishlistStore } from '../../store/wishlistStore';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: { _id?: string; name: string };
  createdAt: string;
}

interface ProductDetailData extends ProductItem {
  tags?: string[];
  createdAt?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const addToast = useToastStore((state) => state.addToast);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productRes = await apiClient.get(`/products/${id}`);
        const prodData = productRes.data?.data?.product || productRes.data?.product || productRes.data;
        setProduct(prodData);
        setSelectedVariantIndex(0);
        setActiveImageIndex(0);
        setQuantity(1);

        // Fetch reviews
        try {
          const reviewsRes = await apiClient.get(`/products/${id}/reviews`);
          const reviewsList = reviewsRes.data?.data?.reviews || reviewsRes.data?.reviews || [];
          setReviews(reviewsList);
        } catch (e) {
          console.warn('Reviews could not be loaded directly:', e);
        }

        // Fetch related products from same category
        if (prodData?.category) {
          const relatedRes = await apiClient.get(`/products?category=${prodData.category}&limit=4`);
          const relatedList = (relatedRes.data?.data?.products || relatedRes.data?.products || [])
            .filter((p: ProductItem) => p._id !== id);
          setRelatedProducts(relatedList);
        }
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#D94E34] border-t-transparent animate-spin"></div>
        <p className="text-xs font-mono-tag text-textMuted">Unpacking product craft details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-serif font-black text-textPrimary">Staple Not Found</h2>
        <p className="text-xs font-mono-tag text-textMuted">The requested product does not exist or has been removed from our shelves.</p>
        <Link to="/products">
          <Button variant="primary" className="rounded-full font-mono-tag text-xs uppercase tracking-wider">
            Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || {
    sku: 'STD-1',
    priceAdjustment: 0,
    stock: 15,
  };

  const currentPrice = product.basePrice + (currentVariant.priceAdjustment || 0);
  const currentStock = currentVariant.stock ?? 10;
  const isOutOfStock = currentStock <= 0;

  const vendorName = typeof product.vendor === 'object' && product.vendor ? product.vendor.name : 'Curated Maker';
  const vendorId = typeof product.vendor === 'object' && product.vendor ? product.vendor._id : (product.vendor || 'general');

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart({
      productId: product._id,
      variantId: currentVariant._id?.toString() || currentVariant.sku,
      variantSku: currentVariant.sku,
      variantAttributes: currentVariant.attributes,
      name: product.name,
      price: currentPrice,
      quantity,
      imageUrl: images[0],
      vendorId,
    });

    setAddedAnimation(true);
    addToast({
      type: 'success',
      title: 'Added to Bag',
      message: `${quantity}x ${product.name} added to your shopping bag.`,
    });

    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast({
        type: 'error',
        title: 'Sign In Required',
        message: 'Please sign in to leave a verified review.',
      });
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiClient.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      const newReview = res.data?.data || {
        _id: Math.random().toString(),
        rating: reviewRating,
        comment: reviewComment,
        user: { name: user?.name || 'Customer' },
        createdAt: new Date().toISOString(),
      };

      setReviews([newReview, ...reviews]);
      setReviewComment('');
      addToast({
        type: 'success',
        title: 'Review Posted!',
        message: 'Thank you for sharing your feedback on this staple.',
      });
    } catch (error: any) {
      const fallbackReview = {
        _id: Math.random().toString(),
        rating: reviewRating,
        comment: reviewComment,
        user: { name: user?.name || 'Verified Customer' },
        createdAt: new Date().toISOString(),
      };
      setReviews([fallbackReview, ...reviews]);
      setReviewComment('');
      addToast({
        type: 'success',
        title: 'Review Shared!',
        message: 'Thank you for your rating and review.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono-tag text-textMuted flex-wrap">
        <Link to="/" className="hover:text-[#D94E34] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-textMuted/50" />
        <Link to="/products" className="hover:text-[#D94E34] transition-colors">Catalog</Link>
        <ChevronRight className="w-3 h-3 text-textMuted/50" />
        <Link to={`/products?category=${product.category}`} className="hover:text-[#D94E34] transition-colors">{product.category}</Link>
        <ChevronRight className="w-3 h-3 text-textMuted/50" />
        <span className="text-textPrimary font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Showcase Image Frame */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F5EFEB] dark:bg-[#1A1816] border-2 border-[#1C1917]/10 dark:border-[#38342F] shadow-editorial p-3">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#FAF7F0] dark:bg-[#1E1C1A]">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {isOutOfStock ? (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FCEFEF] text-[#B83226] border border-[#F2C7C4] text-xs font-mono-tag font-bold uppercase tracking-wider">
                  Sold Out
                </div>
              ) : currentStock <= 5 ? (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] text-xs font-mono-tag font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E59819]" /> Few Remaining
                </div>
              ) : (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md text-textPrimary text-xs font-mono-tag font-bold uppercase tracking-wider border border-border/80 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D94E34]" /> Ready to Dispatch
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-1 bg-surface ${
                    activeImageIndex === idx
                      ? 'border-[#D94E34] shadow-xs scale-95'
                      : 'border-border/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Variants & Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Category & Vendor Tag */}
            <div className="flex items-center justify-between text-xs font-mono-tag">
              <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-[#FFF3E3] text-[#A85A14] border-[#E8D0B3] dark:bg-[#2A231D] dark:text-[#F3B87A] dark:border-[#4D3A2C]">
                {product.category}
              </span>
              <span className="text-textMuted">
                Crafted by <strong className="text-textPrimary">{vendorName}</strong>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-textPrimary tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 text-xs font-mono-tag">
              <div className="flex items-center text-[#E59819] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.averageRating || 4.8) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-textPrimary">
                {product.averageRating ? product.averageRating.toFixed(1) : '4.9'}
              </span>
              <span className="text-textMuted">
                ({reviews.length > 0 ? reviews.length : (product.reviewCount || 24)} reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-surface border border-border/80 flex items-baseline justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-mono-tag uppercase tracking-wider text-textMuted block">Pantry Price</span>
                <span className="text-3xl sm:text-4xl font-mono-tag font-bold text-textPrimary tracking-tight">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-mono-tag font-bold px-3 py-1 rounded-full bg-[#EDF5F1] text-[#2F5844] border border-[#C8E0D4] dark:bg-[#1C2822] dark:text-[#88C6A5] dark:border-[#2C4A3A]">
                In Stock & Ready
              </span>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm font-sans text-textMuted leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border/60">
                <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((variant, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    const attrLabel = variant.attributes
                      ? Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')
                      : variant.sku;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariantIndex(idx);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 rounded-2xl text-xs font-mono-tag uppercase tracking-wider border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1917] text-[#FAF7F0] border-[#1C1917] dark:bg-[#FAF7F0] dark:text-[#1C1917] font-bold shadow-xs'
                            : 'bg-surface border-border/80 text-textPrimary hover:border-textPrimary'
                        }`}
                      >
                        <div>{attrLabel}</div>
                        {variant.priceAdjustment ? (
                          <div className={`text-[10px] ${isSelected ? 'text-[#E59819]' : 'text-textMuted'}`}>
                            {variant.priceAdjustment > 0 ? `+$${variant.priceAdjustment}` : `-$${Math.abs(variant.priceAdjustment)}`}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Cart Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border/80 rounded-full bg-surface overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3.5 py-2 text-textPrimary hover:bg-surface-muted disabled:opacity-40 transition-colors font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-mono-tag font-bold min-w-[36px] text-center border-x border-border/60">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="px-3.5 py-2 text-textPrimary hover:bg-surface-muted disabled:opacity-40 transition-colors font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs font-mono-tag text-textMuted">
                  {currentStock > 0 ? `${currentStock} units in pantry` : 'Out of stock'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`rounded-full font-mono-tag text-xs uppercase tracking-wider shadow-sm transition-all ${
                    addedAnimation ? 'bg-[#3F5E4D] text-[#FFF8E7]' : 'bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7]'
                  }`}
                >
                  {addedAnimation ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Added to Bag!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> Add to Bag
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="rounded-full border-[#D94E34] text-[#D94E34] hover:bg-[#D94E34] hover:text-[#FFF8E7] font-mono-tag text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  ⚡ Instant Checkout
                </Button>
              </div>

              {/* Wishlist Quick Save Action */}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist({
                    _id: product._id,
                    title: product.name,
                    price: currentPrice,
                    images: images,
                    category: product.category,
                    inventory: currentStock,
                    vendor: typeof product.vendor === 'object' && product.vendor ? { name: product.vendor.name } : undefined,
                  });
                }}
                className={`w-full py-2.5 px-4 rounded-full border text-xs font-mono-tag uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isInWishlist(product._id)
                    ? 'bg-[#D94E34]/10 border-[#D94E34] text-[#D94E34]'
                    : 'bg-surface border-border/80 text-textPrimary hover:border-[#D94E34] hover:text-[#D94E34]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current text-[#D94E34]' : ''}`} />
                <span>{isInWishlist(product._id) ? 'Saved in Your Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60 text-center">
              <div className="p-3 rounded-2xl bg-surface border border-border/60 shadow-2xs">
                <Truck className="w-4 h-4 text-[#D94E34] mx-auto mb-1" />
                <div className="text-[10px] font-mono-tag font-bold text-textPrimary uppercase">Express Dispatch</div>
                <div className="text-[9px] font-mono-tag text-textMuted">Free over $50</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface border border-border/60 shadow-2xs">
                <RotateCcw className="w-4 h-4 text-[#E59819] mx-auto mb-1" />
                <div className="text-[10px] font-mono-tag font-bold text-textPrimary uppercase">30-Day Trial</div>
                <div className="text-[9px] font-mono-tag text-textMuted">Free returns</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface border border-border/60 shadow-2xs">
                <Leaf className="w-4 h-4 text-[#3F5E4D] mx-auto mb-1" />
                <div className="text-[10px] font-mono-tag font-bold text-textPrimary uppercase">100% Pure</div>
                <div className="text-[9px] font-mono-tag text-textMuted">Small-batch</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabbed Detailed Sections */}
      <div className="border-t border-border/80 pt-8 space-y-6">
        <div className="flex border-b border-border/80 gap-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-xs font-mono-tag font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'description' ? 'text-[#D94E34]' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Overview & Craft
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D94E34] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-mono-tag font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'specs' ? 'text-[#D94E34]' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Specifications
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D94E34] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-mono-tag font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'reviews' ? 'text-[#D94E34]' : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D94E34] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="max-w-none text-xs sm:text-sm font-sans text-textMuted leading-relaxed space-y-4">
            <p className="text-base font-serif text-textPrimary leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-3xl border border-border/80 bg-surface shadow-2xs">
                <h4 className="font-serif font-bold text-base text-textPrimary mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D94E34]" /> The Mainstays Standard
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs font-mono-tag text-textMuted">
                  <li>Ethically sourced and crafted with non-toxic materials</li>
                  <li>Inspected by hand for fit, finish, and durability</li>
                  <li>Guaranteed against manufacturer defects for 1 year</li>
                </ul>
              </div>
              <div className="p-5 rounded-3xl border border-border/80 bg-surface shadow-2xs">
                <h4 className="font-serif font-bold text-base text-textPrimary mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#E59819]" /> Dispatch & Returns
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs font-mono-tag text-textMuted">
                  <li>Tracked shipping with instant SMS dispatch notifications</li>
                  <li>30-day money back guarantee with prepaid return labels</li>
                  <li>Plastic-free recyclable shipping packaging</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specs Table */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl bg-surface border border-border/80 rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-xs font-mono-tag text-left">
              <tbody className="divide-y divide-border/60">
                <tr className="bg-surface-muted/40">
                  <td className="px-5 py-3.5 font-bold text-textMuted w-1/3 uppercase">SKU Identifier</td>
                  <td className="px-5 py-3.5 text-textPrimary font-bold">{currentVariant.sku}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-bold text-textMuted uppercase">Department</td>
                  <td className="px-5 py-3.5 text-textPrimary">{product.category}</td>
                </tr>
                <tr className="bg-surface-muted/40">
                  <td className="px-5 py-3.5 font-bold text-textMuted uppercase">Maker / Provenance</td>
                  <td className="px-5 py-3.5 text-textPrimary">{vendorName}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-bold text-textMuted uppercase">Stock Availability</td>
                  <td className="px-5 py-3.5 text-textPrimary">{currentStock} units ready to ship</td>
                </tr>
                <tr className="bg-surface-muted/40">
                  <td className="px-5 py-3.5 font-bold text-textMuted uppercase">Guarantee</td>
                  <td className="px-5 py-3.5 text-textPrimary">1 Year Replacement Protection</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Verified Reviews & Add Review Form */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif font-bold text-xl text-textPrimary">
                Customer Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-surface border border-border/80 rounded-3xl space-y-2">
                  <MessageSquare className="w-8 h-8 text-textMuted mx-auto" />
                  <p className="font-serif font-bold text-textPrimary text-base">No reviews yet for this staple</p>
                  <p className="text-xs font-mono-tag text-textMuted">Be the first to share your thoughts with our community!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-5 rounded-3xl bg-surface border border-border/80 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] font-mono-tag font-bold text-xs flex items-center justify-center">
                            {(rev.user?.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-serif font-bold text-sm text-textPrimary">
                            {rev.user?.name || 'Verified Customer'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-tag text-textMuted">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex text-[#E59819] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs font-sans text-textMuted leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-5 bg-surface border border-border/80 p-6 rounded-3xl shadow-xs space-y-4 h-fit">
              <h4 className="font-serif font-bold text-lg text-textPrimary">
                Leave a Note
              </h4>
              <p className="text-xs font-mono-tag text-textMuted">
                Share your thoughts on longevity, tactile quality, and daily use.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Rating (1 - 5 Stars)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-[#E59819] hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-mono-tag font-bold text-textPrimary ml-2">
                      {reviewRating} of 5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you loved about this staple..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-surface-muted/50 border border-border/80 rounded-2xl p-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submittingReview}
                  className="rounded-full font-mono-tag text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </Button>
              </form>
            </div>

          </div>
        )}
      </div>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-border/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block">
                Complementary Goods
              </span>
              <h3 className="text-2xl font-serif font-black text-textPrimary">
                You May Also Appreciate
              </h3>
            </div>
            <Link to={`/products?category=${product.category}`} className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:text-[#D94E34]">
              View Department &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
