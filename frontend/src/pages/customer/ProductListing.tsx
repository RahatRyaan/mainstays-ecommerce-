import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import { ProductCard, type ProductItem } from '../../components/ProductCard';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL params changes
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || 'newest';
    const urlPrice = searchParams.get('priceRange') || '';
    
    setCategory(urlCategory);
    setSearch(urlSearch);
    setSort(urlSort);
    setPriceRange(urlPrice);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'All') params.append('category', category);
      if (sort) params.append('sort', sort);

      if (priceRange) {
        if (priceRange === 'under-50') {
          params.append('maxPrice', '50');
        } else if (priceRange === '50-150') {
          params.append('minPrice', '50');
          params.append('maxPrice', '150');
        } else if (priceRange === '150-300') {
          params.append('minPrice', '150');
          params.append('maxPrice', '300');
        } else if (priceRange === '300-plus') {
          params.append('minPrice', '300');
        }
      }

      params.append('limit', '40');

      const response = await apiClient.get('/products', { params });
      const list = response.data?.data?.products || response.data?.products || [];
      setProducts(list);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, priceRange, sort]);

  const updateFilters = (newParams: Record<string, string>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange('');
    setSort('newest');
    setSearchParams({});
  };

  const categoryOptions = [
    { label: 'All Catalog Goods', value: '' },
    { label: 'Electronics & Audio', value: 'Electronics' },
    { label: 'Everyday Apparel & Fashion', value: 'Fashion' },
    { label: 'Kids & Nursery', value: 'Kids' },
    { label: 'Home & Living', value: 'Home' },
    { label: 'Apothecary & Care', value: 'Beauty' },
  ];

  const priceOptions = [
    { label: 'All Prices', value: '' },
    { label: 'Under $50', value: 'under-50' },
    { label: '$50 to $150', value: '50-150' },
    { label: '$150 to $300', value: '150-300' },
    { label: '$300 & Above', value: '300-plus' },
  ];

  const sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
  ];

  const hasActiveFilters = Boolean(search || category || priceRange);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] dark:bg-[#2C2719] dark:text-[#E8C564] dark:border-[#4F4422] text-[10px] font-mono-tag font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#E59819]" />
            <span>Curated Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-textPrimary tracking-tight">
            {category ? `${category} Collection` : 'All Mainstays Goods'}
          </h1>
          <p className="text-xs font-mono-tag text-textMuted mt-1">
            {loading ? 'Consulting our inventory...' : `Showing ${products.length} handpicked items`}
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search staples, materials, keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                updateFilters({ search: e.target.value });
              }}
              className="w-full bg-surface border border-border/80 rounded-full pl-9 pr-9 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]/30 focus:border-[#D94E34] transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-3 pointer-events-none" />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  updateFilters({ search: '' });
                }}
                className="absolute right-3 top-2.5 text-textMuted hover:text-textPrimary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/80 rounded-full text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:bg-surface-muted"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D94E34]" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6 bg-surface border border-border/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 font-serif font-bold text-textPrimary text-base">
              <SlidersHorizontal className="w-4 h-4 text-[#D94E34]" />
              <span>Departments</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-mono-tag text-[#D94E34] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-3">
              Department
            </label>
            <div className="space-y-1.5">
              {categoryOptions.map((opt) => {
                const isSelected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCategory(opt.value);
                      updateFilters({ category: opt.value });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#D94E34] text-[#FFF8E7] font-bold shadow-xs'
                        : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#FFF8E7]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-border/60">
            <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-3">
              Price Range
            </label>
            <div className="space-y-1.5">
              {priceOptions.map((opt) => {
                const isSelected = priceRange === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPriceRange(opt.value);
                      updateFilters({ priceRange: opt.value });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#D94E34] text-[#FFF8E7] font-bold shadow-xs'
                        : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promo Callout Stamp (Warm Butter Cream & Amber Tone) */}
          <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#EBD69D] space-y-1.5 shadow-2xs">
            <div className="text-xs font-mono-tag font-bold text-[#873523] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D94E34]" /> 10% Off Your Order
            </div>
            <div className="text-[11px] font-mono-tag text-[#5C554D] leading-relaxed">
              Use promo code <strong className="text-[#873523] font-bold underline decoration-[#D94E34]">WELCOME10</strong> at checkout!
            </div>
          </div>
        </aside>

        {/* Main Product Grid Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Sorting & Active Filters Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border/80 p-4 rounded-3xl shadow-xs">
            {/* Active Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono-tag text-textMuted">Applied:</span>
              {category ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[11px] font-mono-tag font-bold shadow-2xs">
                  {category}
                  <button onClick={() => { setCategory(''); updateFilters({ category: '' }); }} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-[#FFF8E7]/80" />
                  </button>
                </span>
              ) : null}
              {priceRange ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[11px] font-mono-tag font-bold">
                  {priceOptions.find(p => p.value === priceRange)?.label}
                  <button onClick={() => { setPriceRange(''); updateFilters({ priceRange: '' }); }} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              ) : null}
              {search ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted text-textPrimary border border-border text-[11px] font-mono-tag font-bold">
                  "{search}"
                  <button onClick={() => { setSearch(''); updateFilters({ search: '' }); }} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-[#D94E34]" />
                  </button>
                </span>
              ) : null}
              {!hasActiveFilters && (
                <span className="text-xs font-mono-tag text-textMuted italic">All categories selected</span>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-mono-tag text-textMuted whitespace-nowrap">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    updateFilters({ sort: e.target.value });
                  }}
                  className="appearance-none bg-surface-muted border border-border/80 rounded-full pl-3 pr-8 py-1.5 text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34] cursor-pointer"
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface border border-border/60 rounded-3xl p-4 animate-pulse space-y-4">
                  <div className="aspect-square bg-surface-muted rounded-2xl"></div>
                  <div className="h-4 bg-surface-muted rounded w-3/4"></div>
                  <div className="h-4 bg-surface-muted rounded w-1/2"></div>
                  <div className="h-8 bg-surface-muted rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-border/80 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF8E7] dark:bg-[#2C2719] flex items-center justify-center mx-auto text-[#9E6D08]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-black text-textPrimary">
                No matching staples found
              </h3>
              <p className="text-xs font-mono-tag text-textMuted max-w-md mx-auto">
                We couldn't find any products matching your current filters. Try changing your search query or reset the filters.
              </p>
              <Button onClick={handleResetFilters} variant="primary" className="rounded-full mt-2 font-mono-tag text-xs uppercase tracking-wider">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-[#1C1917]/30 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-surface h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-serif font-bold text-lg text-textPrimary">Filter Goods</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-textMuted hover:text-textPrimary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-2">
                  Department
                </label>
                <div className="space-y-1">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setCategory(opt.value);
                        updateFilters({ category: opt.value });
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-colors ${
                        category === opt.value 
                          ? 'bg-[#1C1917] text-[#FAF7F0] font-bold shadow-xs' 
                          : 'text-textPrimary hover:bg-surface-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-4 border-t border-border">
                <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-2">
                  Price Range
                </label>
                <div className="space-y-1">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPriceRange(opt.value);
                        updateFilters({ priceRange: opt.value });
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-colors ${
                        priceRange === opt.value 
                          ? 'bg-[#D94E34] text-[#FFF8E7] font-bold shadow-xs' 
                          : 'text-textPrimary hover:bg-surface-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6 space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider"
              >
                Apply Filters
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  handleResetFilters();
                  setMobileFiltersOpen(false);
                }}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider"
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductListing;
