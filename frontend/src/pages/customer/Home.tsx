import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  Copy, 
  Star, 
  Truck, 
  RotateCcw, 
  Award,
  Leaf,
  ShieldCheck,
  Heart,
  Smile
} from 'lucide-react';
import { ProductCard, type ProductItem } from '../../components/ProductCard';
import { useToastStore } from '../../store/toastStore';
import { useProductStore } from '../../store/productStore';
import MarqueeBanner from '../../components/ui/MarqueeBanner';

interface Colorway {
  id: string;
  name: string;
  color: string;
  accentClass: string;
  image: string;
  desc: string;
}

const featuredColorways: Colorway[] = [
  {
    id: 'terracotta',
    name: 'Tuscan Terracotta',
    color: '#D94E34',
    accentClass: 'text-[#D94E34] border-[#D94E34]/30 bg-[#D94E34]/10',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    desc: 'Warm ceramic glazed finish crafted with natural earthen clay minerals.',
  },
  {
    id: 'olive',
    name: 'Heritage Olive',
    color: '#3F5E4D',
    accentClass: 'text-[#3F5E4D] border-[#3F5E4D]/30 bg-[#3F5E4D]/10',
    image: 'https://images.unsplash.com/photo-1570831739427-440a0224d081?w=800&auto=format&fit=crop&q=80',
    desc: 'Matte botanical green finish inspired by Mediterranean wild olives.',
  },
  {
    id: 'amber',
    name: 'Ochre Amber',
    color: '#E59819',
    accentClass: 'text-[#E59819] border-[#E59819]/30 bg-[#E59819]/10',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    desc: 'Sun-drenched golden warmth designed to brighten any kitchen counter.',
  },
  {
    id: 'charcoal',
    name: 'Deep Charcoal',
    color: '#1C1917',
    accentClass: 'text-[#1C1917] border-[#1C1917]/30 bg-[#1C1917]/10 dark:text-[#FAF7F0]',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    desc: 'Minimalist volcanic slate with soft-touch non-slip grip.',
  },
];

// Exact sequence: All Shops -> Electronics -> Fashion & Wear -> Home & Living -> Skin Care -> Kids & Play
const departmentPills = [
  { name: 'All Shops', path: '/products', icon: '🏪' },
  { name: 'Electronics', path: '/products?category=Electronics', icon: '🎧' },
  { name: 'Fashion & Wear', path: '/products?category=Fashion', icon: '👕' },
  { name: 'Home & Living', path: '/products?category=Home', icon: '🏡' },
  { name: 'Skin Care', path: '/products?category=Beauty', icon: '🌿' },
  { name: 'Kids & Play', path: '#kids-section', icon: '🧸', special: true },
];

const categories = [
  {
    name: 'All Catalog Goods',
    slug: '',
    tagline: 'Discover the complete small-batch archive',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    count: '22+ items',
    badge: 'Curated',
  },
  {
    name: 'Electronics & Audio',
    slug: 'Electronics',
    tagline: 'Acoustic fidelity & tactile aluminum hardware',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    count: '6 items',
    badge: 'Popular',
  },
  {
    name: 'Everyday Apparel',
    slug: 'Fashion',
    tagline: 'Organic cottons & timeless silhouettes',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    count: '5 items',
    badge: 'Trending',
  },
  {
    name: 'Home & Living',
    slug: 'Home',
    tagline: 'Handmade ceramics & French washed linen',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=80',
    count: '5 items',
    badge: 'Essential',
  },
  {
    name: 'Skin Care & Care',
    slug: 'Beauty',
    tagline: 'Cold-pressed botanical extracts & pure balms',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    count: '4 items',
    badge: 'Artisanal',
  },
  {
    name: 'Kids & Nursery',
    slug: 'Kids',
    tagline: 'Montessori wooden toys & organic cotton knits',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
    count: '6 items',
    badge: 'New Capsule',
  },
];

// Rich Kids Curated Sub-Categories
const kidsSubCategories = [
  {
    id: 'montessori',
    title: 'Montessori & Wooden Toys',
    subtitle: 'Hand-sanded solid European beechwood, sensory rainbow stackers & balance rockers.',
    badge: 'Ages 1 - 6',
    ageTag: 'toddler',
    color: 'bg-[#FFF7E8] text-[#9E6D08] border-[#EBD69D]',
    accent: '#E59819',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    specs: ['100% Non-Toxic Stains', 'FSC Beechwood', 'Open-Ended Play'],
  },
  {
    id: 'apparel',
    title: 'Organic Baby & Toddler Rompers',
    subtitle: 'GOTS certified unbleached waffle cotton, coconut shell buttons & cozy ribbed bonnets.',
    badge: 'Ages 0 - 3',
    ageTag: 'infant',
    color: 'bg-[#EDF5F1] text-[#2F5844] border-[#BCD9CB]',
    accent: '#3F5E4D',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
    specs: ['GOTS Certified', 'Pure Organic Muslin', 'Hypoallergenic'],
  },
  {
    id: 'nursery',
    title: 'Plush Nursery & Animal Rugs',
    subtitle: 'Hand-tufted 100% New Zealand wool friendly bear rugs & soft muslin snuggle blankets.',
    badge: 'Nursery Decor',
    ageTag: 'infant',
    color: 'bg-[#FCEFEF] text-[#B83226] border-[#F2C7C4]',
    accent: '#D94E34',
    image: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80',
    specs: ['High-Pile Wool', 'Handmade by Artisans', 'Natural Warmth'],
  },
  {
    id: 'crafts',
    title: 'Beeswax Crafts & Storybooks',
    subtitle: 'Pure local beeswax modeling clay, plant-pigment crayons & heirloom picture books.',
    badge: 'Ages 3 - 10',
    ageTag: 'junior',
    color: 'bg-[#F4F1FA] text-[#5C457D] border-[#D9CEEB]',
    accent: '#6E5296',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
    specs: ['Pure Beeswax', 'Petroleum-Free', 'Botanical Colors'],
  },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [kidsProducts, setKidsProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [selectedColorway, setSelectedColorway] = useState<Colorway>(featuredColorways[0]);
  const [selectedKidAge, setSelectedKidAge] = useState<'all' | 'infant' | 'toddler' | 'junior'>('all');
  const addToast = useToastStore((state) => state.addToast);

  const fetchProductsWithCache = useProductStore((state) => state.fetchProductsWithCache);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const result = await fetchProductsWithCache({ limit: 40 });
        const list = result.products;
        setFeaturedProducts(list);
        setKidsProducts(list.filter((p) => p.category === 'Kids'));
      } catch (error) {
        console.error('Failed to fetch home products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopiedCoupon(true);
    addToast({
      type: 'success',
      title: 'Coupon Copied!',
      message: 'Code WELCOME10 copied to clipboard. Enjoy 10% off at checkout.',
    });
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const filteredKidsCategories = selectedKidAge === 'all' 
    ? kidsSubCategories 
    : kidsSubCategories.filter(c => c.ageTag === selectedKidAge);

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. HERO SECTION (Mainstays Editorial Hero) */}
      <section className="relative pt-6 sm:pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Stamp Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] dark:bg-[#2C2719] dark:text-[#E8C564] dark:border-[#4F4422] text-xs font-mono-tag font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E59819]" />
              <span>Small-Batch Artisan Living & Little Makers</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif font-black text-4xl sm:text-6xl xl:text-7xl text-textPrimary leading-[1.08] tracking-tight">
              Curated goods for your daily ritual.
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-base sm:text-lg text-textMuted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover thoughtfully crafted home goods, honest wardrobe staples, and non-toxic heirloom toys for little makers — built for longevity and warmth.
            </p>

            {/* Hero CTA Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="px-7 py-3.5 rounded-full bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] font-mono-tag font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore The Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={handleCopyCoupon}
                className="px-5 py-3.5 rounded-full border border-border/80 hover:border-textPrimary bg-surface text-textPrimary font-mono-tag text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                {copiedCoupon ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>Copied WELCOME10</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D94E34]" />
                    <span>Copy Code: WELCOME10</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono-tag text-textMuted">
              <div className="flex items-center gap-1.5">
                <div className="flex text-[#E59819]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-textPrimary">4.9/5</span>
                <span>(12k+ reviews)</span>
              </div>
              <span className="opacity-30">•</span>
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#D94E34]" />
                <span>Free Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#1C1917]/10 dark:border-[#38342F] bg-surface shadow-editorial p-3">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F3ECE1] dark:bg-[#1E1C1A]">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop&q=80"
                    alt="Curated Homewares"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Stamp Label */}
                  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl px-3.5 py-2 shadow-sm">
                    <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block">
                      Staff Selection
                    </span>
                    <span className="font-serif font-bold text-sm text-textPrimary">
                      Handmade Stoneware & Linen
                    </span>
                  </div>

                  {/* Floating Guarantee Stamp */}
                  <div className="absolute bottom-4 right-4 bg-[#1C1917] text-[#FAF7F0] rounded-2xl px-3.5 py-2 shadow-editorial flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#E59819]" />
                    <div className="text-left">
                      <div className="text-[10px] font-mono-tag uppercase tracking-widest text-[#E59819] font-bold">100% Organic</div>
                      <div className="text-xs font-serif font-bold">Small-Batch Made</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Accent Stamp */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#D94E34] text-[#FFF8E7] p-2 flex flex-col items-center justify-center text-center font-mono-tag shadow-stamp rotate-12">
                <span className="text-[9px] font-bold uppercase">Original</span>
                <span className="text-xs font-bold leading-none">Est. 2026</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PROMINENT CATEGORY & BRAND NAVIGATION PILLS (User specified sequence: Brand -> All Shops -> Electronics -> Fashion -> Kids -> Home -> Beauty) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-3 bg-surface border border-border/80 rounded-3xl shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-mono-tag uppercase tracking-wider text-textMuted px-3 font-bold shrink-0 hidden md:inline-block">
              Jump To:
            </span>
            {departmentPills.map((pill) => {
              const isAnchor = pill.path.startsWith('#');
              const Component = isAnchor ? 'a' : Link;
              const linkProps = isAnchor ? { href: pill.path } : { to: pill.path };

              return (
                <Component
                  key={pill.name}
                  {...(linkProps as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono-tag uppercase tracking-wider font-bold shrink-0 transition-all border shadow-2xs ${
                    pill.special
                      ? 'bg-[#FFF4DC] text-[#9E6D08] border-[#EBD69D] hover:bg-[#FFEEC4]'
                      : 'bg-surface-muted/60 hover:bg-surface-muted text-textPrimary border-border/70 hover:border-[#D94E34]'
                  }`}
                >
                  <span className="text-sm">{pill.icon}</span>
                  <span>{pill.name}</span>
                </Component>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CONTINUOUS SCROLLING MARQUEE BANNER */}
      <MarqueeBanner 
        variant="terracotta"
        items={[
          '✨ Small-Batch Artisan Craftsmanship',
          '🧸 Non-Toxic Heirloom Wooden Toys & Organic Kids Rompers',
          '🌿 100% GOTS Certified Organic Cotton & Belgian Linens',
          '⚡ Complimentary Express Delivery Over $50',
          '📦 Plastic-Free Recyclable Dispatches',
          '⭐ Over 12,000 Verified 5-Star Member Reviews',
        ]}
      />

      {/* 4. DEDICATED KIDS & LITTLE MAKERS SECTION (Crafted specifically for Kids) */}
      <section id="kids-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        {/* Playful Header */}
        <div className="bg-gradient-to-br from-[#FFFBF2] via-[#FDF5E8] to-[#F5ECE1] dark:from-[#24201A] dark:via-[#2A251E] dark:to-[#1E1B17] border border-[#EBD69D] dark:border-[#4F4422] rounded-[36px] p-8 sm:p-12 relative overflow-hidden shadow-xs">
          
          {/* Top Stamp Tag */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEEC4] text-[#873523] border border-[#EBD69D] text-xs font-mono-tag font-bold uppercase tracking-wider shadow-2xs">
                <Smile className="w-4 h-4 text-[#D94E34]" />
                <span>The Little Makers & Kids Atelier</span>
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1C1917] dark:text-[#FAF7F0] tracking-tight leading-tight">
                Play, grow & dream naturally.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#786E64] dark:text-[#C7BFB5] max-w-2xl leading-relaxed">
                Nurture young imaginations with tactile European beechwood toys, certified organic breathable cottons, and wholesome botanical art supplies — zero plastic, zero toxic finishes.
              </p>
            </div>

            {/* Age Filter Switcher */}
            <div className="flex items-center gap-1.5 bg-[#FFFDF9] dark:bg-[#1C1917] p-1.5 rounded-2xl border border-[#EBD69D] dark:border-[#38342F] shrink-0 self-start md:self-end">
              {[
                { label: 'All Kids Goods', value: 'all' },
                { label: '0-2 Yrs (Infant)', value: 'infant' },
                { label: '3-5 Yrs (Toddler)', value: 'toddler' },
                { label: '6+ Yrs (Junior)', value: 'junior' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedKidAge(tab.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-tag uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    selectedKidAge === tab.value
                      ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                      : 'text-[#786E64] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FAF7F0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kids Categories Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {filteredKidsCategories.map((card) => (
              <div
                key={card.id}
                className="bg-[#FFFDF9] dark:bg-[#1C1917] border border-[#EBD69D]/80 dark:border-[#38342F] rounded-3xl overflow-hidden shadow-xs hover:shadow-editorial-hover transition-all flex flex-col group"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF7F0] relative">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono-tag font-bold uppercase tracking-wider border shadow-2xs ${card.color}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-textPrimary group-hover:text-[#D94E34] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-sans text-textMuted mt-1 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex flex-wrap gap-1.5">
                      {card.specs.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md bg-surface-muted text-[10px] font-mono-tag text-textMuted font-medium"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>

                    <Link
                      to="/products?category=Kids"
                      className="inline-flex items-center gap-1 text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] hover:underline"
                    >
                      <span>Shop Category</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Kids Safety & Quality Guarantee Strip */}
          <div className="mt-8 pt-6 border-t border-[#EBD69D]/60 dark:border-[#38342F] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#FFFDF9]/80 dark:bg-[#1C1917]/80">
              <ShieldCheck className="w-5 h-5 text-[#3F5E4D]" />
              <span className="font-serif font-bold text-xs text-textPrimary">100% Non-Toxic</span>
              <span className="text-[10px] font-mono-tag text-textMuted">Food-safe waterborne stains</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#FFFDF9]/80 dark:bg-[#1C1917]/80">
              <Leaf className="w-5 h-5 text-[#3F5E4D]" />
              <span className="font-serif font-bold text-xs text-textPrimary">GOTS Organic Cotton</span>
              <span className="text-[10px] font-mono-tag text-textMuted">Pure unbleached waffle knits</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#FFFDF9]/80 dark:bg-[#1C1917]/80">
              <Award className="w-5 h-5 text-[#E59819]" />
              <span className="font-serif font-bold text-xs text-textPrimary">FSC Certified Beech</span>
              <span className="text-[10px] font-mono-tag text-textMuted">Sustainably forested wood</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#FFFDF9]/80 dark:bg-[#1C1917]/80">
              <Heart className="w-5 h-5 text-[#D94E34]" />
              <span className="font-serif font-bold text-xs text-textPrimary">Heirloom Longevity</span>
              <span className="text-[10px] font-mono-tag text-textMuted">Passed from sibling to sibling</span>
            </div>
          </div>

        </div>

        {/* Real Live Kids Products Carousel / Grid */}
        {kidsProducts.length > 0 && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block">
                  Kids Essentials Shelf
                </span>
                <h3 className="font-serif font-black text-2xl text-textPrimary tracking-tight">
                  Handcrafted for Joy & Discovery
                </h3>
              </div>
              <Link
                to="/products?category=Kids"
                className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] hover:underline flex items-center gap-1"
              >
                <span>Browse All {kidsProducts.length} Kids Pieces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {kidsProducts.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

      </section>

      {/* 5. CURATED DEPARTMENTS / CATEGORIES (Mainstays Catalog) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
              Explore by department
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:text-[#D94E34] flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.slug ? `/products?category=${cat.slug}` : '/products'}
              className="group relative rounded-3xl overflow-hidden bg-surface border border-border/80 hover:border-textPrimary/30 shadow-xs hover:shadow-editorial-hover transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3ECE1] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-textPrimary text-[9px] font-mono-tag font-bold uppercase tracking-wider border border-border/60">
                  {cat.badge}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-textPrimary group-hover:text-[#D94E34] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-sans text-textMuted mt-1 line-clamp-2">
                    {cat.tagline}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono-tag text-textMuted">
                  <span>{cat.count}</span>
                  <span className="font-bold text-[#D94E34] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. FEATURED BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block mb-1">
              Most Loved
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
              Everyday Mainstays
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:text-[#D94E34] flex items-center gap-1.5 transition-colors group"
          >
            <span>See All Products ({featuredProducts.length || '22+'})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-surface-muted/60 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-3xl border border-border p-8">
            <p className="font-serif text-lg text-textMuted">No products found. Add products in the admin console.</p>
          </div>
        )}
      </section>

      {/* 7. DEDICATED BRAND STORY SECTION (Anchor: #brand-story) */}
      <section id="brand-story" className="bg-[#1C1917] text-[#FAF7F0] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272421] border border-[#3E3933] text-[#E59819] text-xs font-mono-tag font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Brand Philosophy & Origin</span>
            </div>

            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#FAF7F0] tracking-tight leading-tight">
              Honest craft for intentional spaces.
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#C7BFB5] leading-relaxed">
              Mainstays was founded on a simple conviction: the objects we invite into our homes should be made with respect for the earth, reverence for traditional craftsmanship, and built to outlive fleeting seasonal trends.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="border-l-2 border-[#D94E34] pl-4 space-y-1">
                <span className="font-serif font-bold text-lg text-[#FAF7F0]">Direct Artisan Guild</span>
                <p className="text-xs font-mono-tag text-[#A8A29E]">We partner directly with independent family-owned studios worldwide.</p>
              </div>
              <div className="border-l-2 border-[#E59819] pl-4 space-y-1">
                <span className="font-serif font-bold text-lg text-[#FAF7F0]">Zero Plastic Pledge</span>
                <p className="text-xs font-mono-tag text-[#A8A29E]">100% recyclable, compostable, and plastic-free packaging on every order.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-full bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] text-xs font-mono-tag font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                Explore The Full Atelier &rarr;
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-full bg-[#272421] hover:bg-[#38342F] text-[#FAF7F0] border border-[#3E3933] text-xs font-mono-tag font-bold uppercase tracking-wider transition-all"
              >
                Become an Artisan Vendor
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#38342F] bg-[#272421] p-3 shadow-2xl">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#1E1C1A] relative">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80"
                  alt="Artisan Crafting Process"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#1C1917]/90 backdrop-blur-md border border-[#38342F]">
                  <div className="font-serif font-bold text-sm text-[#FAF7F0]">
                    "Every vessel tells the story of the hands that shaped it."
                  </div>
                  <div className="text-[11px] font-mono-tag text-[#E59819] uppercase tracking-wider mt-1">
                    — The Mainstays Guild Manifesto
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. MATERIAL PALETTE SPOTLIGHT */}
      <section className="bg-[#F3ECE1] dark:bg-[#1E1C1A] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#E8E0D2] dark:border-[#38342F] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visual Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden bg-surface border-2 border-[#1C1917]/10 dark:border-[#38342F] shadow-editorial p-3">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8E0D2] relative">
                  <img
                    src={selectedColorway.image}
                    alt={selectedColorway.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#1C1917] text-[#FAF7F0] px-3 py-1 rounded-full text-[10px] font-mono-tag font-bold uppercase tracking-wider">
                    {selectedColorway.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Spotlight Details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="px-3 py-1 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[10px] font-mono-tag font-bold uppercase tracking-wider inline-block">
                Material Spotlight
              </span>

              <h2 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight leading-tight">
                Crafted for durability, built for life.
              </h2>

              <p className="font-sans text-sm sm:text-base text-textMuted leading-relaxed">
                {selectedColorway.desc} We partner with master artisans and responsible producers to ensure each item is free of harmful coatings and built with heirloom longevity.
              </p>

              {/* Colorway Switcher */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted block">
                  Select Colorway Palette:
                </span>
                <div className="flex flex-wrap gap-3">
                  {featuredColorways.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColorway(c)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-mono-tag font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedColorway.id === c.id
                          ? 'bg-surface text-textPrimary border-textPrimary shadow-xs scale-105'
                          : 'bg-surface/50 text-textMuted border-border/80 hover:bg-surface'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/products"
                  className="px-6 py-3 rounded-full bg-[#D94E34] text-[#FFF8E7] hover:bg-[#C03B22] text-xs font-mono-tag font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Shop This Finish &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. THE MAINSTAYS 4 VALUE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono-tag font-bold uppercase tracking-wider text-[#D94E34]">
            Our Sourcing Philosophy
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
            The Mainstays Standard
          </h2>
          <p className="text-xs font-sans text-textMuted">
            Every product on our shelves meets rigorous criteria for ethics, longevity, and purity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] text-[#9E6D08] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-textPrimary">Small-Batch Made</h3>
            <p className="text-xs font-sans text-textMuted leading-relaxed">
              Crafted in limited runs by verified independent makers dedicated to authentic craftsmanship.
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF5F1] dark:bg-[#1C2822] text-[#2F5844] flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-textPrimary">100% Honest Materials</h3>
            <p className="text-xs font-sans text-textMuted leading-relaxed">
              Zero synthetic fillers, microplastics, or harmful toxins. Clean ingredients and honest raw materials.
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FCEFEF] dark:bg-[#2E1D1D] text-[#B83226] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-textPrimary">Carbon-Neutral Shipping</h3>
            <p className="text-xs font-sans text-textMuted leading-relaxed">
              Dispatched with 100% recyclable, plastic-free packaging directly to your doorstep.
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3E3] dark:bg-[#2A231D] text-[#A85A14] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-textPrimary">30-Day Guarantee</h3>
            <p className="text-xs font-sans text-textMuted leading-relaxed">
              Love it or return it within 30 days. No questions asked, instant return label generation.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
