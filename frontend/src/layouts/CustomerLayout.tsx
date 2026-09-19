import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Package, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Store, 
  Sparkles, 
  Search,
  Heart,
  Home,
  Compass,
  User
} from 'lucide-react';
import { ToastContainer } from '../components/ui/ToastContainer';
import ThemeToggle from '../components/ThemeToggle';
import WavyDivider from '../components/ui/WavyDivider';
import { useWishlistStore } from '../store/wishlistStore';

const CustomerLayout = () => {
  const { token, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const prefetchCatalog = useProductStore((state) => state.prefetchCatalog);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Warm up catalog cache in background for instant 0ms tab navigation
  useEffect(() => {
    prefetchCatalog();
  }, [prefetchCatalog]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  const navLinks = [
    { name: 'All Shops', path: '/products' },
    { name: 'Electronics', path: '/products?category=Electronics' },
    { name: 'Fashion & Wear', path: '/products?category=Fashion' },
    { name: 'Home & Living', path: '/products?category=Home' },
    { name: 'Skin Care', path: '/products?category=Beauty' },
    { name: 'Kids & Play', path: '/products?category=Kids' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-textPrimary selection:bg-[#D94E34]/20 selection:text-[#D94E34] w-full max-w-full overflow-x-hidden relative">
      <ToastContainer />

      {/* Top Ticker / Promo Bar */}
      <div className="bg-[#D94E34] text-[#FFF8E7] text-xs py-2 px-4 font-mono-tag tracking-wider flex items-center justify-center gap-2 border-b border-[#C03B22]">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#FFF8E7]" />
        <span className="text-center text-[11px] sm:text-xs">
          COMPLIMENTARY SHIPPING OVER $50 • USE CODE <strong className="underline font-bold decoration-[#FFF8E7]/60">WELCOME10</strong> FOR 10% OFF
        </span>
      </div>

      {/* Main Header (Logo on Left -> Category Nav Links -> Actions on Right) */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Left: Brand Emblem & Wordmark */}
            <div className="flex items-center gap-8 shrink-0">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-[#D94E34] text-[#FFF8E7] flex items-center justify-center font-serif font-black text-xl shadow-xs group-hover:scale-105 transition-all">
                  M
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif font-black text-xl sm:text-2xl text-textPrimary tracking-tight group-hover:text-[#D94E34] transition-colors leading-none">
                    Mainstays
                  </span>
                  <span className="font-mono-tag text-[9px] uppercase tracking-widest text-[#D94E34] font-bold mt-1">
                    Atelier & Provisions
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links (In exact requested order: All Shops -> Electronics -> Fashion -> Home -> Skin Care -> Kids) */}
              <nav className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname + location.search === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono-tag uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#D94E34] text-[#FFF8E7] font-bold shadow-2xs'
                          : 'text-textPrimary hover:text-[#D94E34] hover:bg-[#F3ECE1] dark:hover:bg-[#272522]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Desktop Nav & Actions */}
            <div className="flex items-center gap-3">
              <nav className="hidden lg:flex xl:hidden items-center gap-1 mr-2">
                {navLinks.slice(0, 4).map((link) => {
                  const isActive = location.pathname + location.search === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-tag uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#D94E34] text-[#FFF8E7] font-bold'
                          : 'text-textPrimary hover:text-[#D94E34]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-44 lg:w-52">
                <input
                  type="text"
                  placeholder="Search 22+ goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-muted/60 border border-border/80 rounded-full pl-8 pr-3 py-1.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]/30 focus:border-[#D94E34] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-2.5 pointer-events-none" />
              </form>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-full border border-border/80 hover:border-textPrimary bg-surface-muted/40 hover:bg-surface-muted text-textPrimary transition-all group flex items-center gap-1.5"
                aria-label="Saved Wishlist"
              >
                <Heart className="w-4 h-4 text-textPrimary group-hover:text-[#D94E34] transition-colors" />
                <span className="hidden sm:inline-block text-xs font-mono-tag font-bold uppercase tracking-wider">Saved</span>
                {wishlistCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#9E6D08] text-[#FFF8E7] text-[10px] font-mono-tag font-bold shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full border border-border/80 hover:border-textPrimary bg-surface-muted/40 hover:bg-surface-muted text-textPrimary transition-all group flex items-center gap-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-textPrimary group-hover:text-[#D94E34] transition-colors" />
                <span className="hidden sm:inline-block text-xs font-mono-tag font-bold uppercase tracking-wider">Bag</span>
                {itemCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[10px] font-mono-tag font-bold shadow-xs">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              {token && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-full border border-border/80 hover:border-textPrimary bg-surface hover:bg-surface-muted transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] flex items-center justify-center font-mono-tag font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-mono-tag uppercase tracking-wider font-semibold text-textPrimary max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-surface border border-border/80 rounded-2xl shadow-editorial p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-border/60 mb-1">
                        <div className="text-xs font-serif font-bold text-textPrimary truncate">{user.name}</div>
                        <div className="text-[11px] font-mono-tag text-textMuted truncate">{user.email}</div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-mono-tag font-bold uppercase tracking-wider bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] rounded-full">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Saved Wishlist ({wishlistCount})</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Order History</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Account Settings</span>
                      </Link>

                      {user.role === 'vendor' && (
                        <Link
                          to="/vendor/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Vendor Portal</span>
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tag rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1 border-t border-border/40 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-full border border-border/80 hover:border-textPrimary text-xs font-mono-tag uppercase tracking-wider font-semibold text-textPrimary hover:bg-surface-muted transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 lg:hidden rounded-full border border-border text-textPrimary hover:bg-surface-muted transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Flyout Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search 22+ goods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-muted border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
              />
              <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-xs font-mono-tag uppercase tracking-wider rounded-xl text-textPrimary hover:bg-surface-muted hover:text-[#D94E34] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-mono-tag uppercase tracking-wider rounded-xl bg-surface-muted text-textPrimary"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Shopping Bag</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[10px] font-bold">
                  {itemCount}
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Signature Wavy Scallop Divider Edge under Header */}
        <WavyDivider height={10} fillColor="fill-bg" strokeColor="stroke-border/60" />
      </header>

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Editorial Refined Footer (Clean Light Surface on Light Mode, Sleek Dark on Dark Mode) */}
      <footer className="bg-[#F5F1E8] text-[#2C2825] dark:bg-[#181614] dark:text-[#FAF7F0] border-t border-[#E5DDD0] dark:border-[#38342F] relative mt-16 overflow-hidden">
        
        {/* Newsletter Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-[#E5DDD0] dark:border-[#38342F]">
          <div className="bg-surface border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 text-center lg:text-left max-w-lg">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[10px] font-mono-tag uppercase tracking-wider font-bold">
                The Mainstays Dispatch
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-textPrimary tracking-tight">
                Join our table & get 10% off your first haul
              </h3>
              <p className="text-xs font-mono-tag text-textMuted">
                Get early access to weekly small-batch drops, maker stories, and secret sales.
              </p>
            </div>

            <form onSubmit={handleNewsletter} className="flex w-full lg:w-auto items-center max-w-md gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full sm:w-72 bg-surface-muted border border-border/80 rounded-xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] font-mono-tag font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Balanced 4-Column Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* Column 1: Brand Wordmark & Ethos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D94E34] text-[#FFF8E7] flex items-center justify-center font-serif font-black text-base shadow-xs">
                  M
                </div>
                <span className="font-serif font-black text-xl text-textPrimary tracking-tight">
                  Mainstays
                </span>
              </div>
              <p className="text-xs font-sans text-textMuted leading-relaxed max-w-xs">
                Thoughtfully-sourced goods and curated essentials designed to elevate daily rituals.
              </p>
              
              <div className="pt-2 space-y-1.5">
                <div className="text-[10px] font-mono-tag uppercase tracking-wider text-textMuted font-bold">Secure Checkout</div>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-tag text-textPrimary">
                  <span className="px-2 py-0.5 bg-surface border border-border/80 rounded-md">💳 Visa</span>
                  <span className="px-2 py-0.5 bg-surface border border-border/80 rounded-md">💳 Mastercard</span>
                  <span className="px-2 py-0.5 bg-surface border border-border/80 rounded-md">⚡ Stripe</span>
                  <span className="px-2 py-0.5 bg-surface border border-border/80 rounded-md">🍎 Apple Pay</span>
                </div>
              </div>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h4 className="font-mono-tag font-bold text-xs text-textPrimary uppercase tracking-wider mb-3">Curated Shops</h4>
              <ul className="space-y-2 text-xs font-mono-tag text-textMuted">
                <li><Link to="/products?category=Electronics" className="hover:text-[#D94E34] transition-colors">Electronics & Sound</Link></li>
                <li><Link to="/products?category=Fashion" className="hover:text-[#D94E34] transition-colors">Everyday Apparel</Link></li>
                <li><Link to="/products?category=Kids" className="hover:text-[#D94E34] transition-colors flex items-center gap-1.5"><span className="text-[#E59819]">🧸</span> Kids & Nursery</Link></li>
                <li><Link to="/products?category=Home" className="hover:text-[#D94E34] transition-colors">Home & Living</Link></li>
                <li><Link to="/products?category=Beauty" className="hover:text-[#D94E34] transition-colors">Skin Care & Self-Care</Link></li>
                <li><Link to="/products" className="hover:text-[#D94E34] text-[#D94E34] font-bold transition-colors">Browse Full Catalog &rarr;</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
              <h4 className="font-mono-tag font-bold text-xs text-textPrimary uppercase tracking-wider mb-3">Customer Care</h4>
              <ul className="space-y-2 text-xs font-mono-tag text-textMuted">
                <li><Link to="/orders" className="hover:text-[#D94E34] transition-colors">Track Your Order</Link></li>
                <li><Link to="/cart" className="hover:text-[#D94E34] transition-colors">Review Shopping Bag</Link></li>
                <li><Link to="/settings" className="hover:text-[#D94E34] transition-colors">Account Settings</Link></li>
                <li><Link to="/login" className="hover:text-[#D94E34] transition-colors">Member Sign In</Link></li>
                <li><Link to="/register" className="hover:text-[#D94E34] transition-colors">Join The Club</Link></li>
              </ul>
            </div>

            {/* Column 4: Portals & Makers */}
            <div>
              <h4 className="font-mono-tag font-bold text-xs text-textPrimary uppercase tracking-wider mb-3">Maker Portals</h4>
              <ul className="space-y-2 text-xs font-mono-tag text-textMuted">
                <li><Link to="/vendor/apply" className="hover:text-[#D94E34] transition-colors">Become a Verified Maker</Link></li>
                <li><Link to="/vendor/dashboard" className="hover:text-[#D94E34] transition-colors">Maker Dashboard</Link></li>
                <li><Link to="/vendor/products" className="hover:text-[#D94E34] transition-colors">Product Inventory</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-[#D94E34] transition-colors">Admin Console</Link></li>
                <li><a href="/api-docs" target="_blank" rel="noreferrer" className="hover:text-[#D94E34] transition-colors">API Documentation</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Guarantee */}
          <div className="mt-10 pt-6 border-t border-[#E5DDD0] dark:border-[#38342F] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono-tag text-textMuted gap-4">
            <p>&copy; {new Date().getFullYear()} Mainstays Marketplace Inc. Crafted with Care.</p>
            <div className="flex flex-wrap items-center gap-5">
              <span className="hover:text-textPrimary transition-colors cursor-pointer">Privacy Terms</span>
              <span className="hover:text-textPrimary transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-textPrimary transition-colors cursor-pointer">Ethical Sourcing</span>
              <span className="hover:text-textPrimary transition-colors cursor-pointer">Status: 100% Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sleek Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-border/80 px-2 py-2 flex items-center justify-around shadow-2xl transition-all">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono-tag uppercase tracking-wider transition-colors ${
            location.pathname === '/' ? 'text-[#D94E34] font-bold' : 'text-textMuted hover:text-textPrimary'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono-tag uppercase tracking-wider transition-colors ${
            location.pathname.startsWith('/products') ? 'text-[#D94E34] font-bold' : 'text-textMuted hover:text-textPrimary'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Shop</span>
        </Link>

        <Link
          to="/wishlist"
          className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono-tag uppercase tracking-wider transition-colors ${
            location.pathname === '/wishlist' ? 'text-[#D94E34] font-bold' : 'text-textMuted hover:text-textPrimary'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Saved</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono-tag uppercase tracking-wider transition-colors ${
            location.pathname === '/cart' ? 'text-[#D94E34] font-bold' : 'text-textMuted hover:text-textPrimary'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#D94E34] text-[#FFF8E7] text-[9px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span>Bag</span>
        </Link>

        <Link
          to={token ? '/account/settings' : '/login'}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono-tag uppercase tracking-wider transition-colors ${
            location.pathname.startsWith('/account') || location.pathname === '/login' ? 'text-[#D94E34] font-bold' : 'text-textMuted hover:text-textPrimary'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{token ? 'Account' : 'Sign In'}</span>
        </Link>
      </nav>
    </div>
  );
};

export default CustomerLayout;
