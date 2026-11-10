const { Product, Organization } = require('../models');

/**
 * @desc    Get dashboard metrics & low-stock products for authenticated organization
 * @route   GET /api/dashboard/summary
 * @access  Private (JWT Protected)
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;

    // 1. Fetch Organization settings to get the default_low_stock_threshold
    const organization = await Organization.findById(organizationId);
    const orgDefaultThreshold = organization ? organization.default_low_stock_threshold : 5;

    // 2. Fetch all products belonging to this tenant
    const products = await Product.find({ organization_id: organizationId }).sort({ quantity: 1 });

    // 3. Compute KPI metrics
    const totalProducts = products.length;
    let totalQuantity = 0;
    const lowStockProducts = [];

    for (const product of products) {
      totalQuantity += product.quantity;

      // Effective threshold calculation:
      // Product-specific threshold if set; otherwise organization default threshold
      const hasCustomThreshold = 
        product.low_stock_threshold !== null && 
        product.low_stock_threshold !== undefined;

      const effectiveThreshold = hasCustomThreshold 
        ? product.low_stock_threshold 
        : orgDefaultThreshold;

      // Product is low-stock when: quantity <= effectiveThreshold
      if (product.quantity <= effectiveThreshold) {
        lowStockProducts.push({
          id: product._id,
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          selling_price: product.selling_price,
          low_stock_threshold: product.low_stock_threshold,
          effectiveThreshold,
          hasCustomThreshold
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalQuantity,
        lowStockCount: lowStockProducts.length,
        defaultLowStockThreshold: orgDefaultThreshold,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};

