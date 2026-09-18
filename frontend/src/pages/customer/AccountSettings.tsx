import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Package, 
  Save, 
  Store,
  Truck,
  Phone,
  Mail,
  Home as HomeIcon,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

const AccountSettings = () => {
  const { user, token, setAuth } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Form states populated from user
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    // Vendor specific
    storeName: '',
    businessType: '',
    taxId: '',
    businessPhone: '',
    bankAccount: '',
    payoutEmail: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        deliveryAddress: user.deliveryAddress || user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || 'United States',
        storeName: (user as any).storeName || '',
        businessType: (user as any).businessType || '',
        taxId: (user as any).taxId || '',
        businessPhone: (user as any).businessPhone || '',
        bankAccount: (user as any).bankAccount || '',
        payoutEmail: (user as any).payoutEmail || '',
        bio: (user as any).bio || '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await apiClient.put('/auth/profile', profileData);
      if (res.data?.user && token) {
        setAuth(token, res.data.user);
      }
      addToast({
        type: 'success',
        title: 'Profile & Location Updated',
        message: 'Your addresses and personal information have been saved.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Could not update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords Do Not Match',
        message: 'New password and confirmation must match.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      addToast({
        type: 'success',
        title: 'Security Updated',
        message: 'Your account password has been changed successfully.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Password Update Failed',
        message: err.response?.data?.message || 'Current password was incorrect.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-textPrimary">Sign In Required</h2>
        <p className="text-xs font-mono-tag text-textMuted">Please log in to manage your account settings and preferences.</p>
        <Link to="/login">
          <Button className="rounded-full bg-[#D94E34] text-[#FFF8E7] font-mono-tag text-xs uppercase tracking-wider font-bold">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  const isVendor = user?.role === 'vendor';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header Profile Badge (Warm Editorial Style) */}
      <div className="bg-gradient-to-br from-[#FFFBF2] via-[#F8EFE4] to-[#F2E3D0] rounded-3xl border border-[#E5DACB] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D94E34] text-[#FFF8E7] font-serif font-black text-2xl flex items-center justify-center shadow-xs">
            {(user?.name || 'M').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-serif font-black text-[#1C1917] tracking-tight">
                {user?.name || 'Member Account'}
              </h1>
              <span className="px-3 py-1 text-[11px] font-mono-tag font-bold uppercase tracking-wider rounded-full bg-[#FFF4DC] text-[#9E6D08] border border-[#EBD69D]">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs font-mono-tag text-[#786E64] mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/orders" className="flex-1 sm:flex-initial">
            <button className="px-4 py-2.5 rounded-full border border-[#E5DACB] bg-[#FFFDF9] hover:bg-white text-xs font-mono-tag font-bold uppercase tracking-wider text-[#1C1917] transition-all flex items-center justify-center gap-2 shadow-2xs w-full cursor-pointer">
              <Package className="w-4 h-4 text-[#D94E34]" />
              <span>My Orders</span>
            </button>
          </Link>
          {isVendor ? (
            <Link to="/vendor/dashboard" className="flex-1 sm:flex-initial">
              <button className="px-4 py-2.5 rounded-full bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] text-xs font-mono-tag font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs w-full cursor-pointer">
                <Store className="w-4 h-4" />
                <span>Vendor Hub</span>
              </button>
            </Link>
          ) : (
            <Link to="/register" className="flex-1 sm:flex-initial">
              <button className="px-4 py-2.5 rounded-full border border-[#E5DACB] bg-[#FFFDF9] hover:bg-white text-xs font-mono-tag font-bold uppercase tracking-wider text-[#1C1917] transition-all flex items-center justify-center gap-2 shadow-2xs w-full cursor-pointer">
                <Store className="w-4 h-4 text-[#3F5E4D]" />
                <span>Artisan Maker Studio</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 bg-surface rounded-3xl border border-border/80 p-3 shadow-xs space-y-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono-tag uppercase tracking-wider font-bold transition-all cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal & Studio Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono-tag uppercase tracking-wider font-bold transition-all cursor-pointer text-left ${
              activeTab === 'addresses'
                ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery & Home Location</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono-tag uppercase tracking-wider font-bold transition-all cursor-pointer text-left ${
              activeTab === 'security'
                ? 'bg-[#D94E34] text-[#FFF8E7] shadow-xs'
                : 'text-textPrimary hover:bg-surface-muted hover:text-[#D94E34]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-8 bg-surface rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs">
          
          {/* Tab 1: Profile & Contact */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-serif font-black text-xl sm:text-2xl text-textPrimary tracking-tight">
                  Profile & Contact Details
                </h2>
                <p className="text-xs font-mono-tag text-textMuted mt-1">
                  Update your contact phone, name, and public member representation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Full Name / Representative
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 pl-10 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                    <User className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full bg-surface-muted/60 border border-border/60 rounded-2xl px-4 py-3 pl-10 text-xs font-mono-tag text-textMuted cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] font-mono-tag text-textMuted mt-1 block">Account login email cannot be changed directly</span>
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 pl-10 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                    <Phone className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Vendor Extended Details */}
              {isVendor && (
                <div className="pt-6 border-t border-border/60 space-y-4">
                  <h3 className="font-serif font-bold text-lg text-textPrimary flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#D94E34]" />
                    <span>Artisan Maker Studio Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                        Studio / Brand Name
                      </label>
                      <input
                        type="text"
                        value={profileData.storeName}
                        onChange={(e) => setProfileData({ ...profileData, storeName: e.target.value })}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                        Craft Specialization
                      </label>
                      <input
                        type="text"
                        value={profileData.businessType}
                        onChange={(e) => setProfileData({ ...profileData, businessType: e.target.value })}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                        Tax ID / TIN Number
                      </label>
                      <input
                        type="text"
                        value={profileData.taxId}
                        onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                        Payout ACH / Account
                      </label>
                      <input
                        type="text"
                        value={profileData.bankAccount}
                        onChange={(e) => setProfileData({ ...profileData, bankAccount: e.target.value })}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                        Studio Story & Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: Saved Locations & Delivery Address (Editable by Customer) */}
          {activeTab === 'addresses' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-serif font-black text-xl sm:text-2xl text-textPrimary tracking-tight">
                  Home & Delivery Location Settings
                </h2>
                <p className="text-xs font-mono-tag text-textMuted mt-1">
                  Edit and update your residential address and specific delivery courier instructions.
                </p>
              </div>

              {/* Delivery Address & Instructions */}
              <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EBD69D] space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#D94E34]" />
                  <h3 className="font-serif font-bold text-base text-textPrimary">
                    Specific Delivery Address & Instructions
                  </h3>
                </div>
                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Drop-off Location / Gate Code / Porch Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 415 Main Street, Apt 3B (Leave by back patio door behind screen)"
                    value={profileData.deliveryAddress}
                    onChange={(e) => setProfileData({ ...profileData, deliveryAddress: e.target.value })}
                    className="w-full bg-white border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                  <p className="text-[10px] font-mono-tag text-textMuted mt-1">
                    Couriers will use this exact note during dispatches.
                  </p>
                </div>
              </div>

              {/* Standard Residential / Physical Address */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4 text-[#3F5E4D]" />
                  <h3 className="font-serif font-bold text-base text-textPrimary">
                    Residential / Studio Physical Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      Street Address & Apartment / Suite
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 742 Evergreen Terrace, Suite 100"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      City / Town
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. San Francisco"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      State / Region / Province
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CA or California"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 94105"
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. United States"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSaving ? 'Updating...' : 'Save & Update Location'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Tab 3: Security */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave} className="space-y-6">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-serif font-black text-xl sm:text-2xl text-textPrimary tracking-tight">
                  Security & Access Password
                </h2>
                <p className="text-xs font-mono-tag text-textMuted mt-1">
                  Ensure your member account is protected with a strong passphrase.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tag font-bold uppercase tracking-wider text-textMuted mb-1.5">
                    Confirm New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-surface-muted/40 border border-border/80 rounded-2xl px-4 py-3 text-xs font-mono-tag text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[#D94E34]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs flex items-center gap-2"
                >
                  {isUpdatingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isUpdatingPassword ? 'Updating...' : 'Update Security Password'}</span>
                </Button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default AccountSettings;
