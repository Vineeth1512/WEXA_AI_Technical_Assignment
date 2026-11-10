import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Sliders,
  Mail,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.organizationName || '',
    default_low_stock_threshold: '5'
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch current organization settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        const res = await api.get('/settings');
        if (res.data.success) {
          const s = res.data.data;
          setFormData({
            name: s.name || '',
            default_low_stock_threshold: String(s.default_low_stock_threshold ?? 5)
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(
          err.response?.data?.message || 'Failed to load organization settings.'
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Organization Name
    if (!formData.name.trim()) {
      setError('Organization name cannot be empty.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Organization name must be at least 2 characters long.');
      return;
    }

    // 2. Validation: Default Low Stock Threshold
    const parsedThreshold = Number(formData.default_low_stock_threshold);
    if (
      isNaN(parsedThreshold) ||
      !Number.isInteger(parsedThreshold) ||
      parsedThreshold < 0
    ) {
      setError('Default low-stock threshold must be a non-negative integer (0 or greater).');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const res = await api.put('/settings', {
        name: formData.name.trim(),
        default_low_stock_threshold: parsedThreshold
      });

      if (res.data.success) {
        setSuccessMessage('Organization settings updated successfully.');

        // Update local session state in AuthContext so UI updates globally
        updateUser({
          organizationName: res.data.data.name,
          default_low_stock_threshold: res.data.data.default_low_stock_threshold
        });

        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Settings update error:', err);
      setError(
        err.response?.data?.message || 'Failed to update settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure organization profile attributes and global inventory alerting thresholds.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Organization Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Organization Profile</h2>
              <p className="text-xs text-slate-500">Business identification and contact details</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Admin Email (Read-Only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Primary Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Linked user account for technical assessment (1 admin per organization).
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Low-Stock Inventory Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventory Alerting Rules</h2>
              <p className="text-xs text-slate-500">Configure automated low-stock detection</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Default Low-Stock Threshold (Units) <span className="text-rose-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="default_low_stock_threshold"
                  required
                  min="0"
                  step="1"
                  value={formData.default_low_stock_threshold}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Explanatory Info Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>How this threshold is used</span>
              </div>
              <p>
                When a product in your catalog does not have its own custom alert threshold specified,
                StockFlow automatically applies this organization default.
              </p>
              <p className="font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/50">
                💡 <span className="font-semibold">Example:</span> If set to{' '}
                <span className="font-bold text-indigo-600">{formData.default_low_stock_threshold || '5'}</span>, any item with{' '}
                <span className="font-bold text-rose-600">
                  {formData.default_low_stock_threshold || '5'} or fewer units
                </span>{' '}
                will trigger an alert on your Dashboard and display a red "Low Stock" badge.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
