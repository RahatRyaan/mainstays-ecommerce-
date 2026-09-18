import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Store
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ToastContainer } from '../components/ui/ToastContainer';
import ThemeToggle from '../components/ThemeToggle';

const VendorLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Maker Inventory', path: '/vendor/products', icon: Package },
    { name: 'Craft New Staple', path: '/vendor/products/new', icon: PlusCircle },
    { name: 'Earnings & Payouts', path: '/vendor/payouts', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-bg text-textPrimary flex flex-col md:flex-row">
      <ToastContainer />

      {/* Mobile Top Header */}
      <header className="md:hidden h-16 border-b border-border/80 bg-surface px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/vendor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] flex items-center justify-center font-serif font-black text-sm">
            M
          </div>
          <span className="font-serif font-bold text-base text-textPrimary">Maker Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-textMuted hover:text-textPrimary rounded-full border border-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-surface z-50 p-6 flex flex-col justify-between border-b border-border shadow-2xl animate-fade-in">
          <div className="space-y-2">
            <div className="p-4 bg-[#FFF8E7] dark:bg-[#2C2719] border border-[#EBD69D] dark:border-[#4F4422] rounded-2xl mb-4 flex items-center gap-3">
              <Store className="w-5 h-5 text-[#9E6D08] dark:text-[#E8C564]" />
              <div>
                <p className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#9E6D08] dark:text-[#E8C564]">Verified Maker Shop</p>
                <p className="text-sm font-serif font-bold text-textPrimary">{user?.name || 'Vendor'}</p>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] font-bold shadow-xs' 
                      : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:bg-surface-muted"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900 text-xs font-mono-tag font-bold uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-surface border-r border-border/80 flex-col justify-between p-6 sticky top-0 h-screen shadow-xs">
        <div className="space-y-6">
          {/* Logo */}
          <Link to="/vendor/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] flex items-center justify-center font-serif font-black text-xl shadow-xs group-hover:bg-[#D94E34] transition-colors">
              M
            </div>
            <div>
              <span className="font-serif font-black text-xl text-textPrimary tracking-tight group-hover:text-[#D94E34] transition-colors block leading-none">
                Mainstays
              </span>
              <span className="text-[10px] font-mono-tag text-textMuted tracking-widest uppercase">
                Maker Hub
              </span>
            </div>
          </Link>

          {/* Maker Shop Card */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8E7] dark:bg-[#2C2719] border border-[#EBD69D] dark:border-[#4F4422] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] flex items-center justify-center font-serif font-bold text-sm">
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-serif font-bold text-textPrimary truncate">{user?.name || 'Verified Maker'}</div>
              <div className="text-[10px] font-mono-tag text-[#9E6D08] dark:text-[#E8C564] font-bold uppercase tracking-wider">Independent Maker</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-mono-tag uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#1C1917] text-[#FAF7F0] dark:bg-[#FAF7F0] dark:text-[#1C1917] font-bold shadow-xs'
                      : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-mono-tag text-textMuted uppercase">Appearance</span>
            <ThemeToggle />
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/80 hover:border-textPrimary text-xs font-mono-tag font-bold uppercase tracking-wider text-textPrimary hover:bg-surface-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900 text-xs font-mono-tag font-bold uppercase tracking-wider hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Routed Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
