import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

interface Product {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
  variants: Array<{
    sku: string;
    stock: number;
    attributes: Record<string, string>;
  }>;
  createdAt: string;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'electronics':
      return 'bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
    case 'fashion':
      return 'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
    case 'home':
      return 'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    case 'beauty':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
  }
};

const VendorProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const addToast = useToastStore((state) => state.addToast);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/payouts/vendor/products', {
        params: {
          search: search || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined
        }
      });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Failed to load products', error);
      // Fallback
      try {
        const fallback = await apiClient.get('/products');
        setProducts(fallback.data?.data?.products || []);
      } catch (err) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const updatedStatus = !product.isActive;
      await apiClient.patch(`/payouts/vendor/products/${product._id}`, {
        isActive: updatedStatus
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: updatedStatus } : p))
      );

      addToast({
        type: 'success',
        title: updatedStatus ? 'Product Activated' : 'Product Hidden',
        message: `${product.name} is now ${updatedStatus ? 'visible to customers' : 'hidden from storefront'}.`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Failed to toggle product status.'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/payouts/vendor/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setDeleteModalId(null);
      addToast({
        type: 'success',
        title: 'Product Removed',
        message: 'The product was successfully deleted from your catalog.'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.message || 'Failed to delete product.'
      });
    }
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Manage your store inventory, stock tiers, variants, and product visibility.
          </p>
        </div>

        <Link to="/vendor/products/new">
          <Button size="md" className="rounded-xl shadow-md font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-textMuted whitespace-nowrap">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-brand"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home & Living</option>
            <option value="Beauty">Beauty</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchProducts} className="rounded-xl text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-textMuted">Loading your catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-lg text-textPrimary">No Products Found</h3>
              <p className="text-xs text-textMuted mt-1">Get started by creating your first product listing.</p>
            </div>
            <Link to="/vendor/products/new">
              <Button size="sm" className="rounded-xl">Create Product</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-textMuted text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const totalStock = getTotalStock(p);
                  const isLowStock = totalStock > 0 && totalStock <= 5;
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                          />
                          <div className="max-w-xs">
                            <Link
                              to={`/products/${p._id}`}
                              className="font-sora font-bold text-textPrimary hover:text-brand transition-colors line-clamp-1 flex items-center gap-1.5"
                            >
                              <span>{p.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                            </Link>
                            <span className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5">
                              <Layers className="w-3 h-3" />
                              {p.variants?.length || 1} Variant(s)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider ${getCategoryBadgeClass(p.category)}`}>
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-sora font-bold text-textPrimary">
                          ${p.basePrice?.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" /> {totalStock} units left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> {totalStock} in stock
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            p.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{p.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteModalId(p._id)}
                            className="p-2 text-textMuted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-editorial animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEFEF] text-[#D94E34] border border-[#F2C7C4] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-textPrimary">Delete Product?</h3>
              <p className="text-xs font-mono-tag text-textMuted mt-1">
                Are you sure you want to permanently remove this product from your store? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setDeleteModalId(null)}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => handleDelete(deleteModalId)}
                className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorProducts;
