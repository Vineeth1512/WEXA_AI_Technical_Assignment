const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Product must belong to an organization'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'SKU cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer'
      }
    },
    cost_price: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
      default: 0
    },
    selling_price: {
      type: Number,
      min: [0, 'Selling price cannot be negative'],
      default: 0
    },
    low_stock_threshold: {
      type: Number,
      default: null,
      min: [0, 'Low-stock threshold cannot be negative'],
      validate: {
        validator: function (val) {
          return val === null || Number.isInteger(val);
        },
        message: 'Low-stock threshold must be an integer or null'
      }
    }
  },
  {
    timestamps: true
  }
);

// CRITICAL MULTI-TENANT CONSTRAINT:
// Compound unique index ensuring SKU is unique ONLY within the same organization.
// Organization A and Organization B can both use SKU "ITEM-001" without collision!
productSchema.index({ organization_id: 1, sku: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

