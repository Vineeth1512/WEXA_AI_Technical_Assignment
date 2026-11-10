import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Package,
  Barcode,
  Boxes,
  DollarSign,
  Sliders,
  FileText,
  AlertCircle,
  Loader2,
  Save,
  Check
} from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const orgDefaultThreshold = user?.default_low_stock_threshold ?? 5;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '0',
    cost_price: '',
    selling_price: '',
    low_stock_threshold: ''
  });

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setInitialLoading(true);
          const res = await api.get(`/products/${id}`);
          if (res.data.success) {
            const p = res.data.data;
            setFormData({
              name: p.name || '',
              sku: p.sku || '',
              description: p.description || '',
              quantity: p.quantity !== undefined ? String(p.quantity) : '0',
              cost_price: p.cost_price !== undefined ? String(p.cost_price) : '',
              selling_price: p.selling_price !== undefined ? String(p.selling_price) : '',
              low_stock_threshold:
                p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
                  ? String(p.low_stock_threshold)
                  : ''
            });
          }
        } catch (err) {
          console.error('Error fetching product for edit:', err);
          setError(
            err.response?.data?.message || 'Unable to load product details for editing.'
          );
        } finally {
          setInitialLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sku' ? value.toUpperCase() : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!formData.sku.trim()) {
      setError('Product SKU is required.');
      return;
    }

    const parsedQty = Number(formData.quantity);
    if (isNaN(parsedQty) || parsedQty < 0 || !Number.isInteger(parsedQty)) {
      setError('Quantity must be a non-negative integer (0 or greater).');
      return;
    }

    if (formData.low_stock_threshold !== '') {
      const parsedThreshold = Number(formData.low_stock_threshold);
      if (
        isNaN(parsedThreshold) ||
        parsedThreshold < 0 ||
        !Number.isInteger(parsedThreshold)
      ) {
        setError('Low-stock threshold must be a non-negative integer or left blank.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description.trim(),
        quantity: parsedQty,
        cost_price: formData.cost_price !== '' ? Number(formData.cost_price) : 0,
        selling_price: formData.selling_price !== '' ? Number(formData.selling_price) : 0,
        low_stock_threshold:
          formData.low_stock_threshold !== ''
            ? Number(formData.low_stock_threshold)
            : null
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      navigate('/products');
    } catch (err) {
      console.error('Product save error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to save product. Please check your inputs and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEditMode
            ? `Update product attributes and inventory levels for SKU "${formData.sku}".`
            : 'Register a new inventory item with custom or default low-stock alerts.'}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Package className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ergonomic Office Chair"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Barcode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. CHAIR-BLK-01"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Unique within your organization</p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quantity on Hand <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Boxes className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock Alert Threshold Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pricing & Inventory Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cost Price ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="cost_price"
                  min="0"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Selling Price ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="selling_price"
                  min="0"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Custom Low Stock Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Custom Alert Threshold
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="low_stock_threshold"
                  min="0"
                  step="1"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  placeholder={`Org default (${orgDefaultThreshold})`}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty to use org default ({orgDefaultThreshold} units)
              </p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Additional Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add product specifications, dimensions, supplier notes, etc."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
