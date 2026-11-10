const mongoose = require('mongoose');
const { Product } = require('../models');

/**
 * @desc    Create a new product scoped to the authenticated organization
 * @route   POST /api/products
 * @access  Private (JWT Protected)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold
    } = req.body;

    // 1. Mandatory input validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.'
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'SKU is required.'
      });
    }

    const normalizedSku = sku.trim().toUpperCase();

    // 2. Strict Tenant Scoping: Use req.user.organizationId directly!
    const organizationId = req.user.organizationId;

    // 3. Check for SKU collision strictly within this organization
    const existingProduct = await Product.findOne({
      organization_id: organizationId,
      sku: normalizedSku
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${normalizedSku}" already exists in your organization.`
      });
    }

    // 4. Validate numeric constraints
    const parsedQuantity = quantity !== undefined ? Number(quantity) : 0;
    if (isNaN(parsedQuantity) || parsedQuantity < 0 || !Number.isInteger(parsedQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative integer.'
      });
    }

    let parsedThreshold = null;
    if (low_stock_threshold !== undefined && low_stock_threshold !== '' && low_stock_threshold !== null) {
      parsedThreshold = Number(low_stock_threshold);
      if (isNaN(parsedThreshold) || parsedThreshold < 0 || !Number.isInteger(parsedThreshold)) {
        return res.status(400).json({
          success: false,
          message: 'Low-stock threshold must be a non-negative integer or empty.'
        });
      }
    }

    // 5. Create the product record
    const product = await Product.create({
      organization_id: organizationId, // Explicitly assigned from authenticated user
      name: name.trim(),
      sku: normalizedSku,
      description: description ? description.trim() : '',
      quantity: parsedQuantity,
      cost_price: cost_price ? Math.max(0, Number(cost_price)) : 0,
      selling_price: selling_price ? Math.max(0, Number(selling_price)) : 0,
      low_stock_threshold: parsedThreshold
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products for the authenticated organization (with optional search)
 * @route   GET /api/products
 * @access  Private (JWT Protected)
 */
const getProducts = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;
    const { search } = req.query;

    // Build query scoped strictly to authenticated tenant
    const query = { organization_id: organizationId };

    // If search term provided, filter case-insensitively across name or sku
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { sku: regex }];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID (guaranteed tenant isolated)
 * @route   GET /api/products/:id
 * @access  Private (JWT Protected)
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.'
      });
    }

    // Must match both the product ID AND the authenticated organization_id
    const product = await Product.findOne({
      _id: id,
      organization_id: req.user.organizationId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product (guaranteed tenant isolated)
 * @route   PUT /api/products/:id
 * @access  Private (JWT Protected)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.'
      });
    }

    // 1. Locate product belonging strictly to this tenant
    const product = await Product.findOne({
      _id: id,
      organization_id: organizationId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const {
      name,
      sku,
      description,
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold
    } = req.body;

    // 2. If SKU is being updated, verify it is not taken by ANOTHER product in this organization
    if (sku && sku.trim()) {
      const normalizedSku = sku.trim().toUpperCase();
      if (normalizedSku !== product.sku) {
        const skuInUse = await Product.findOne({
          organization_id: organizationId,
          sku: normalizedSku,
          _id: { $ne: id }
        });

        if (skuInUse) {
          return res.status(409).json({
            success: false,
            message: `A product with SKU "${normalizedSku}" already exists in your organization.`
          });
        }
        product.sku = normalizedSku;
      }
    }

    // 3. Update fields
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty.'
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0 || !Number.isInteger(parsedQuantity)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a non-negative integer.'
        });
      }
      product.quantity = parsedQuantity;
    }

    if (cost_price !== undefined) {
      const parsedCost = Number(cost_price);
      if (isNaN(parsedCost) || parsedCost < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cost price cannot be negative.'
        });
      }
      product.cost_price = parsedCost;
    }

    if (selling_price !== undefined) {
      const parsedSelling = Number(selling_price);
      if (isNaN(parsedSelling) || parsedSelling < 0) {
        return res.status(400).json({
          success: false,
          message: 'Selling price cannot be negative.'
        });
      }
      product.selling_price = parsedSelling;
    }

    if (low_stock_threshold !== undefined) {
      if (low_stock_threshold === '' || low_stock_threshold === null) {
        product.low_stock_threshold = null;
      } else {
        const parsedThreshold = Number(low_stock_threshold);
        if (isNaN(parsedThreshold) || parsedThreshold < 0 || !Number.isInteger(parsedThreshold)) {
          return res.status(400).json({
            success: false,
            message: 'Low-stock threshold must be a non-negative integer or null.'
          });
        }
        product.low_stock_threshold = parsedThreshold;
      }
    }

    // Note: organization_id is NEVER updated, preserving tenant security

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product (guaranteed tenant isolated)
 * @route   DELETE /api/products/:id
 * @access  Private (JWT Protected)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.'
      });
    }

    // Scoped delete: If product exists but belongs to another organization,
    // findOneAndDelete matches 0 rows and returns null -> 404 Not Found!
    const product = await Product.findOneAndDelete({
      _id: id,
      organization_id: req.user.organizationId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      data: { id: product._id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
