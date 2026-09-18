import { useState } from 'react';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Store, CheckCircle } from 'lucide-react';

const VendorOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.put('/auth/upgrade-to-vendor');
      setSuccess(true);
      setTimeout(() => {
        // Force reload to update user state and layout
        window.location.href = '/vendor/dashboard';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card className="text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-brand" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-textMain mb-4">Become a Vendor</h1>
        <p className="text-textMuted mb-8 text-lg">
          Start selling your amazing products to our community. It only takes one click to upgrade your account!
        </p>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex flex-col items-center">
            <CheckCircle className="w-8 h-8 mb-2" />
            <span className="font-semibold text-lg">Welcome to the Vendor Program!</span>
            <span className="text-sm mt-1">Redirecting to your dashboard...</span>
          </div>
        ) : (
          <Button 
            size="lg" 
            fullWidth 
            onClick={handleApply} 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upgrade to Vendor Account'}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default VendorOnboarding;
