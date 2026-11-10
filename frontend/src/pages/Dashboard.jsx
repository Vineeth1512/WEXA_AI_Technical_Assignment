import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  Package,
  Boxes,
  AlertTriangle,
  Sliders,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Edit
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError(
        err.response?.data?.message || 'Failed to load dashboard metrics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock tracking and low-inventory alerts for{' '}
            <span className="font-semibold text-slate-700">{user?.organizationName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchSummary}
            className="text-xs font-semibold text-rose-700 underline hover:no-underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-20 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-900">
                {formatNumber(summary?.totalProducts || 0)}
              </h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Catalog items tracked</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600">
            <Link to="/products" className="hover:underline flex items-center gap-1">
              View catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Total Units in Stock */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Units
            </span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-900">
                {formatNumber(summary?.totalQuantity || 0)}
              </h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Available physical inventory</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Aggregated stock level</span>
          </div>
        </div>

        {/* Card 3: Low-Stock Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                summary?.lowStockCount > 0
                  ? 'bg-rose-50 text-rose-600 animate-pulse'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <h3
                  className={`text-3xl font-extrabold ${
                    summary?.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatNumber(summary?.lowStockCount || 0)}
                </h3>
                {summary?.lowStockCount > 0 && (
                  <span className="inline-flex items-center text-xs font-semibold text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">At or below threshold</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            {summary?.lowStockCount > 0 ? (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Requires restocking
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy stock levels
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Default Threshold */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Default Threshold
            </span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-900">
                {summary?.defaultLowStockThreshold ?? 5}{' '}
                <span className="text-sm font-semibold text-slate-400">units</span>
              </h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Organization default level</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600">
            <Link to="/settings" className="hover:underline flex items-center gap-1">
              Configure in settings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Low-Stock Alert Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Critical Low-Stock Items
              </h2>
              <p className="text-xs text-slate-500">
                Products currently equal to or below their alert threshold.
              </p>
            </div>
          </div>

          {!loading && summary?.lowStockProducts && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {summary.lowStockProducts.length}{' '}
              {summary.lowStockProducts.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Content Table or Empty State */}
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : summary?.lowStockProducts?.length === 0 ? (
          /* Empty / Healthy State */
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">All inventory levels are healthy!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No products are currently at or below their low-stock threshold. Great job managing stock!
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <th className="py-3 px-6">Product Name</th>
                  <th className="py-3 px-6">SKU</th>
                  <th className="py-3 px-6 text-center">Units on Hand</th>
                  <th className="py-3 px-6 text-center">Effective Threshold</th>
                  <th className="py-3 px-6">Selling Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {summary.lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {product.sku}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-sm border border-rose-100">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-slate-700 font-medium">
                        {product.effectiveThreshold}
                      </span>
                      {product.hasCustomThreshold ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded ml-1.5">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded ml-1.5">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {formatCurrency(product.selling_price)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        Low Stock
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
