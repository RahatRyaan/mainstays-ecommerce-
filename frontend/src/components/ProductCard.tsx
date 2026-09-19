import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useWishlistStore } from '../store/wishlistStore';

export interface ProductItem {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  basePrice: number;
  category: string;
  images: string[];
  vendor?: { _id: string; name: string } | string;
  averageRating?: number;
  reviewCount?: number;
  variants?: Array<{
    _id?: string;
    sku: string;
    attributes?: Record<string, string>;
    priceAdjustment?: number;
    stock: number;
  }>;
}

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'electronics':
      return 'bg-[#FFF3E3] text-[#A85A14] border-[#E8D0B3] dark:bg-[#2A231D] dark:text-[#F3B87A] dark:border-[#4D3A2C]';
    case 'fashion':
      return 'bg-[#FCEFEF] text-[#B83226] border-[#F2C7C4] dark:bg-[#2E1D1D] dark:text-[#F48F87] dark:border-[#522929]';
    case 'home':
      return 'bg-[#FFF8E7] text-[#9E6D08] border-[#EBD69D] dark:bg-[#2C2719] dark:text-[#E8C564] dark:border-[#4F4422]';
    case 'beauty':
      return 'bg-[#EDF5F1] text-[#2F5844] border-[#C8E0D4] dark:bg-[#1C2822] dark:text-[#88C6A5] dark:border-[#2C4A3A]';
    default:
      return 'bg-[#F4F1EA] text-[#4F4A45] border-[#DED7CA] dark:bg-[#23211F] dark:text-[#C5BEB5] dark:border-[#3D3A36]';
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const addToast = useToastStore((state) => state.addToast);
  const [added, setAdded] = React.useState(false);

  const vendorName = typeof product.vendor === 'object' && product.vendor ? product.vendor.name : 'Curated Maker';
  const vendorId = typeof product.vendor === 'object' && product.vendor ? product.vendor._id : (product.vendor || 'general');
  
  const mainImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 10;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isSaved = isInWishlist(product._id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      _id: product._id,
      title: product.name,
      price: product.basePrice,
      images: product.images || [mainImage],
      category: product.category,
      inventory: totalStock,
      vendor: typeof product.vendor === 'object' && product.vendor ? { name: product.vendor.name } : undefined,
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      productId: product._id,
      variantId: defaultVariant?._id?.toString(),
      variantSku: defaultVariant?.sku,
      variantAttributes: defaultVariant?.attributes,
      name: product.name,
      price: (product.basePrice || 0) + (defaultVariant?.priceAdjustment || 0),
      quantity: 1,
      imageUrl: mainImage,
      vendorId: vendorId,
    });

    setAdded(true);
    addToast({
      type: 'success',
      title: 'Added to Bag',
      message: `${product.name} is now in your cart.`,
    });

    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group relative bg-surface border border-border/80 hover:border-textPrimary/25 dark:hover:border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-editorial-hover transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <Link to={`/products/${product._id}`} className="block">
        {/* Image Container with Warm Backdrop */}
        <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-[#F5EFEB] dark:bg-[#1A1816] flex items-center justify-center">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Category Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className={`px-2.5 py-0.5 text-[11px] font-mono-tag font-bold rounded-full border shadow-2xs uppercase tracking-wider backdrop-blur-md ${getCategoryBadgeClass(product.category)}`}>
              {product.category}
            </span>
          </div>

          {/* Stock Badges & Wishlist Button */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="px-2.5 py-0.5 text-[11px] font-mono-tag font-bold rounded-full bg-[#FCEFEF] text-[#B83226] border border-[#F2C7C4] dark:bg-[#2E1D1D] dark:text-[#F48F87] dark:border-[#522929]">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="px-2.5 py-0.5 text-[11px] font-mono-tag font-bold rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] dark:bg-[#2C2719] dark:text-[#E8C564] dark:border-[#4F4422] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E59819]" /> Few Left
              </span>
            ) : null}

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={handleWishlistClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border shadow-2xs transition-all duration-200 cursor-pointer ${
                isSaved
                  ? 'bg-[#D94E34] text-[#FFF8E7] border-[#D94E34] scale-105'
                  : 'bg-white/85 dark:bg-stone-900/85 text-textPrimary hover:text-[#D94E34] hover:bg-white border-white/60 dark:border-stone-800'
              }`}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-[#FFF8E7]' : 'stroke-[1.8]'}`} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-5 flex flex-col flex-1">
          <div className="text-[9px] sm:text-[11px] font-mono-tag text-textMuted uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
            {vendorName}
          </div>

          <h3 className="font-serif font-bold text-textPrimary text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-brand transition-colors mb-1.5 sm:mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            <div className="flex items-center text-[#E59819]">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="font-bold text-textPrimary">
              {product.averageRating ? product.averageRating.toFixed(1) : '4.9'}
            </span>
            <span className="text-textMuted">
              ({product.reviewCount || 18})
            </span>
          </div>
        </div>
      </Link>

      {/* Price & Quick Add Action Row */}
      <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between mt-auto border-t border-border/40 pt-2 sm:pt-3">
        <div>
          <span className="text-[8px] sm:text-[10px] font-mono-tag uppercase tracking-wider text-textMuted block">Price</span>
          <div className="text-xs sm:text-lg font-mono-tag font-bold text-textPrimary tracking-tight">
            ${product.basePrice.toFixed(2)}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl font-mono-tag font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
              : added
              ? 'bg-[#3F5E4D] text-[#FFF8E7]'
              : 'bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] shadow-xs'
          }`}
          title={isOutOfStock ? 'Item is out of stock' : 'Quick add to bag'}
        >
          {added ? (
            <>
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
