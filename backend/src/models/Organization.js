const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters long'],
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    default_low_stock_threshold: {
      type: Number,
      required: true,
      default: 5,
      min: [0, 'Default low-stock threshold cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;

