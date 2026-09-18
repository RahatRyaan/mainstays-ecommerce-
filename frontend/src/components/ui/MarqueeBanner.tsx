import React from 'react';

interface MarqueeBannerProps {
  items?: string[];
  className?: string;
  speed?: 'normal' | 'fast';
  variant?: 'terracotta' | 'cream' | 'dark' | 'amber' | 'sage';
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  items = [
    '✨ Handpicked Selection',
    '🌿 100% Quality Assured',
    '⚡ Express Dispatched in 24h',
    '📦 Ethically Sourced Ingredients & Goods',
    '🎯 Curated Everyday Staples',
    '🔒 100% Safe & Secure Checkout',
    '⭐ Over 12,000+ Happy Customers',
  ],
  className = '',
  speed = 'normal',
  variant = 'terracotta',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'cream':
        return 'bg-[#FFF8E7] text-[#1C1917] border-y border-[#E8E0D2] dark:bg-[#1E1C1A] dark:text-[#FAF7F0] dark:border-[#38342F]';
      case 'amber':
        return 'bg-[#E59819] text-[#1C1917] font-semibold border-y border-[#D98A0D]';
      case 'sage':
        return 'bg-[#3F5E4D] text-[#FFF8E7] border-y border-[#344E40]';
      case 'dark':
        return 'bg-[#1C1917] text-[#FAF7F0] border-y border-[#38342F]';
      case 'terracotta':
      default:
        return 'bg-[#D94E34] text-[#FFF8E7] border-y border-[#C23E25]';
    }
  };

  const animClass = speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee';

  return (
    <div className={`overflow-hidden select-none py-2.5 text-xs font-mono-tag tracking-wider uppercase ${getVariantStyles()} ${className}`}>
      <div className={animClass}>
        {/* First repetition */}
        <div className="flex items-center gap-8 px-4 shrink-0">
          {items.map((item, idx) => (
            <span key={`first-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
              <span>{item}</span>
              <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
        {/* Second repetition for seamless infinite loop */}
        <div className="flex items-center gap-8 px-4 shrink-0" aria-hidden="true">
          {items.map((item, idx) => (
            <span key={`second-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
              <span>{item}</span>
              <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeBanner;
