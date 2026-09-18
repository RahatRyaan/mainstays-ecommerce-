import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Gift, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  CheckCircle2,
  Store,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  CreditCard,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

const Register = () => {
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  
  // Basic Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address & Delivery
  const [address, setAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Vendor Exclusive Fields
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Handmade Ceramics & Tableware');
  const [taxId, setTaxId] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [payoutEmail, setPayoutEmail] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const payload: any = {
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
    };

    if (role === 'customer') {
      if (deliveryAddress) payload.deliveryAddress = deliveryAddress;
    } else {
      payload.storeName = storeName || `${name}'s Studio`;
      payload.businessType = businessType;
      payload.taxId = taxId || `TIN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      payload.businessPhone = businessPhone || phone;
      payload.bankAccount = bankAccount;
      payload.payoutEmail = payoutEmail || email;
      payload.bio = bio;
    }

    try {
      const response = await apiClient.post('/auth/register', payload);
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);

      addToast({
        type: 'success',
        title: role === 'vendor' ? 'Maker Account Registered!' : 'Account Created!',
        message: role === 'vendor' 
          ? `Welcome ${user.name}! Your Artisan Vendor Hub is ready.` 
          : `Welcome to The Mainstays, ${user.name}! Enjoy 10% off with WELCOME10.`,
      });
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    
    if (role === 'customer') {
      setName(`Alex Johnson ${randomSuffix}`);
      setEmail(`shopper${randomSuffix}@mainstays.com`);
      setPhone('+1 (555) 234-8901');
      setAddress('742 Evergreen Terrace, Apt 4B');
      setDeliveryAddress('742 Evergreen Terrace (Leave with doorman)');
      setCity('Denver');
      setState('CO');
      setZipCode('80202');
      setCountry('United States');
      setPassword('password123');
      setConfirmPassword('password123');
      setError('');
      addToast({
        type: 'info',
        title: 'Shopper Profile Populated',
        message: 'Comprehensive customer address and phone info loaded. Click Complete Registration.',
      });
    } else {
      setName(`Elena Rostova ${randomSuffix}`);
      setEmail(`artisan${randomSuffix}@mainstays.com`);
      setPhone('+1 (555) 891-2304');
      setStoreName(`Rostova Heritage Ceramics`);
      setBusinessType('Hand-Turned Stoneware & Porcelain');
      setTaxId(`US-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setBusinessPhone('+1 (555) 891-2300');
      setAddress('108 Artisan Alley, Studio 3');
      setCity('Portland');
      setState('OR');
      setZipCode('97201');
      setCountry('United States');
      setBankAccount(`US-CHASE-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setPayoutEmail(`payouts.artisan${randomSuffix}@mainstays.com`);
      setBio('Creating heirloom wood-fired ceramic tableware with locally sourced clays.');
      setPassword('password123');
      setConfirmPassword('password123');
      setError('');
      addToast({
        type: 'info',
        title: 'Artisan Maker Profile Populated',
        message: 'Full merchant tax ID, studio address, and banking info loaded.',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-surface border border-border/80 rounded-3xl sm:rounded-[36px] shadow-editorial overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        
        {/* Left Column: Visual Atmosphere & Member Perks */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFBF2] via-[#F8EFE4] to-[#F2E3D0] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E5DACB]">
          
          {/* Top Brand Tag */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D94E34] text-[#FFF8E7] flex items-center justify-center font-serif font-black text-2xl shadow-xs">
                M
              </div>
              <span className="font-serif font-black text-2xl text-[#1C1917] tracking-tight">
                Mainstays
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4DC] text-[#9E6D08] border border-[#EBD69D] text-[11px] font-mono-tag font-bold uppercase tracking-wider shadow-2xs">
              <Gift className="w-3.5 h-3.5 text-[#D94E34]" />
              <span className="text-[#873523] font-black">
                {role === 'vendor' ? 'Artisan Maker Network' : 'Complimentary Membership'}
              </span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1C1917] tracking-tight leading-snug">
              {role === 'vendor' 
                ? 'Join our vetted network of heritage craft makers.'
                : 'Join our table & unlock curated perks.'}
            </h2>
            <p className="text-xs font-mono-tag text-[#786E64] leading-relaxed">
              {role === 'vendor'
                ? 'Open your small-batch studio storefront, manage customer dispatches, and receive direct ACH payouts.'
                : 'Create an account to receive 10% off your first haul, express tracked dispatch, and private drop access.'}
            </p>
          </div>

          {/* Member Benefits List Card */}
          <div className="my-6 p-5 rounded-3xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E5DACB] shadow-2xs space-y-3 relative z-10">
            <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34]">
              {role === 'vendor' ? 'Maker Privileges' : 'Member Privileges'}
            </div>

            <div className="space-y-2.5 text-xs font-mono-tag text-[#1C1917]">
              {role === 'vendor' ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                    <span>0% Listing Fees on First 10 Small-Batch Products</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-[#D94E34] shrink-0" />
                    <span>Dedicated Artisan Merchant Portal & Analytics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#E59819] shrink-0" />
                    <span>Automated Fast Payouts (Direct Bank ACH / Stripe)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                    <span>Fair-Trade Maker Sourcing Protection</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                    <span>10% Welcome Voucher (Code: WELCOME10)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#D94E34] shrink-0" />
                    <span>Complimentary Express Shipping over $50</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#E59819] shrink-0" />
                    <span>Early Access to Small-Batch Seasonal Drops</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#3F5E4D] shrink-0" />
                    <span>Hassle-Free 30-Day Trial & Returns</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Guarantee Footer */}
          <div className="text-[10px] font-mono-tag text-[#8A8175] uppercase tracking-wider flex items-center gap-2 relative z-10 font-semibold">
            <span>🔒 100% Privacy Protected • Zero Spam Guarantee</span>
          </div>

        </div>

        {/* Right Column: Editorial Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-surface">
          
          <div className="space-y-6">
            
            {/* Header & Role Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono-tag font-bold uppercase tracking-wider text-[#D94E34] block mb-1">
                  New Registration
                </span>
                <h1 className="font-serif font-black text-3xl sm:text-4xl text-textPrimary tracking-tight">
                  Create your account
                </h1>
              </div>

              <button
                type="button"
                onClick={handleDemoFill}
                className="px-3.5 py-1.5 rounded-full bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] text-[10px] font-mono-tag font-bold uppercase tracking-wider hover:bg-[#FBEFC7] transition-colors cursor-pointer self-start"
              >
                ⚡ 1-Click Auto Fill
              </button>
            </div>

            {/* Account Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-muted/60 border border-border/80">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2.5 px-3 rounded-xl font-mono-tag text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Shopper Account</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`py-2.5 px-3 rounded-xl font-mono-tag text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'vendor'
                    ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Artisan Maker (Vendor)</span>
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#FCEFEF] dark:bg-[#2E1D1D] border border-[#F2C7C4] text-[#B83226] text-xs font-mono-tag">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 1: Identity & Contact */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <UserCheck className="w-3.5 h-3.5 text-[#D94E34]" />
                  <span>1. Contact & Identity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      {role === 'vendor' ? 'Representative Name *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#D94E34]" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 234-8901"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  {role === 'vendor' && (
                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#E59819]" /> Merchant Support Line
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +1 (555) 891-2300"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Vendor Exclusive Business Profile */}
              {role === 'vendor' && (
                <div className="space-y-3 p-4 rounded-2xl bg-surface-muted/30 border border-border/80">
                  <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5 pb-1 border-b border-border/60">
                    <Store className="w-3.5 h-3.5 text-[#D94E34]" />
                    <span>2. Maker Brand & Merchant Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                        Studio / Store Name *
                      </label>
                      <input
                        type="text"
                        required={role === 'vendor'}
                        placeholder="e.g. Rostova Heritage Ceramics"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                        Craft Specialization / Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Woodcraft, Ceramics, Linen, Apothecary"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#E59819]" /> Tax ID / TIN Number *
                      </label>
                      <input
                        type="text"
                        required={role === 'vendor'}
                        placeholder="e.g. US-938201948"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-[#3F5E4D]" /> Bank Payout Account / ACH
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. US-CHASE-9381029481"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      Studio Bio & Sourcing Story
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your craft processes, workshop location, and materials..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-surface border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>
                </div>
              )}

              {/* Section 3: Address & Location Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <MapPin className="w-3.5 h-3.5 text-[#D94E34]" />
                  <span>{role === 'vendor' ? '3. Workshop & Studio Location' : '2. Residential & Delivery Location'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={role === 'customer' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      {role === 'vendor' ? 'Workshop Street Address *' : 'Home / Street Address *'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  {role === 'customer' && (
                    <div>
                      <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                        Specific Delivery Address / Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leave at rear porch behind gate"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Denver"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CO"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      ZIP / Postal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 80202"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Security Credentials */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3F5E4D]" />
                  <span>{role === 'vendor' ? '4. Security Password' : '3. Security Password'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      Password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-textMuted hover:text-textPrimary cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-2.5 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isLoading}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider py-4 font-bold bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account...' : role === 'vendor' ? 'Register Artisan Merchant Account' : 'Complete Shopper Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-xs font-mono-tag text-textMuted pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-[#D94E34] font-bold hover:underline">
                Sign into your table &rarr;
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 text-center text-[11px] font-mono-tag text-textMuted">
            By registering, you agree to our Terms of Sourcing & Fair Trade Merchant Policies.
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default Register;
