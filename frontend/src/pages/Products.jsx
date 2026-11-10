import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
  Boxes
} from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Default org threshold for stock status badge evaluation
  const defaultThreshold = user?.default_low_stock_threshold ?? 5;

  const fetchProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError('');
      const url = searchQuery.trim()
        ? `/products?search=${encodeURIComponent(searchQuery.trim())}`
        : '/products';
      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err.response?.data?.message || 'Failed to load products. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search);
  }, [search]);

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/products/${productToDelete._id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
        setSuccessMessage(`Product "${productToDelete.name}" was successfully deleted.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete product. Please try again.'
      );
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your inventory items, track real-time quantities, and configure stock thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={() => fetchProducts(search)}
            className="text-xs font-semibold text-rose-700 underline hover:no-underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar & Stats Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
          <span>Total:</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Boxes className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {search ? 'No products match your search' : 'No products in catalog yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search
                ? `No inventory items found matching "${search}". Try clearing the search query.`
                : 'Get started by creating your first product to track stock levels.'}
            </p>
            {!search && (
              <div className="mt-5">
                <Link
                  to="/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Product</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <th className="py-3.5 px-6">Product Name</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6 text-center">Quantity</th>
                  <th className="py-3.5 px-6">Stock Status</th>
                  <th className="py-3.5 px-6">Selling Price</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((product) => {
                  // Effective threshold calculation
                  const effectiveThreshold =
                    product.low_stock_threshold !== null &&
                    product.low_stock_threshold !== undefined
                      ? product.low_stock_threshold
                      : defaultThreshold;
                  const isLowStock = product.quantity <= effectiveThreshold;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        {product.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-md">
                          {product.sku}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-extrabold px-2.5 py-1 rounded-lg text-sm border ${
                            isLowStock
                              ? 'text-rose-600 bg-rose-50 border-rose-100'
                              : 'text-slate-800 bg-slate-50 border-slate-200'
                          }`}
                        >
                          {formatNumber(product.quantity)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Low Stock (≤{effectiveThreshold})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {formatCurrency(product.selling_price)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product._id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-800">
                "{productToDelete.name}" (SKU: {productToDelete.sku})
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
