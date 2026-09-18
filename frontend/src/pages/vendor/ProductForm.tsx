import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    images: '' // comma separated
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        images: formData.images.split(',').map(url => url.trim()).filter(Boolean)
      };

      await apiClient.post('/products', payload);
      navigate('/vendor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textMain">Add New Product</h1>
        <p className="text-textMuted">Create a new listing for your store</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-danger/10 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input 
            label="Product Name" 
            required 
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Wireless Earbuds"
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textPrimary">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-base text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow disabled:opacity-50 disabled:bg-gray-50 min-h-[120px]"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Price ($)" 
              type="number"
              step="0.01"
              min="0"
              required 
              value={formData.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price: e.target.value})}
            />
            <Input 
              label="Stock Quantity" 
              type="number"
              min="0"
              required 
              value={formData.stockQuantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, stockQuantity: e.target.value})}
            />
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textPrimary">Category</label>
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-4 text-base text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Beauty">Beauty</option>
            </select>
          </div>

          <Input 
            label="Image URLs (comma separated)" 
            value={formData.images}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, images: e.target.value})}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />

          <div className="flex justify-end pt-4 border-t border-borderMain">
            <Button 
              type="button" 
              variant="ghost" 
              className="mr-3"
              onClick={() => navigate('/vendor/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm;
