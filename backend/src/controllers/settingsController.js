const { Organization } = require('../models');

/**
 * @desc    Get organization settings for authenticated user
 * @route   GET /api/settings
 * @access  Private (JWT Protected)
 */
const getSettings = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.user.organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        organizationId: organization._id,
        name: organization.name,
        default_low_stock_threshold: organization.default_low_stock_threshold,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update organization settings (e.g. default_low_stock_threshold, name)
 * @route   PUT /api/settings
 * @access  Private (JWT Protected)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { default_low_stock_threshold, name } = req.body;

    const organization = await Organization.findById(req.user.organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.'
      });
    }

    // 1. Validate default_low_stock_threshold
    if (default_low_stock_threshold !== undefined) {
      const parsedThreshold = Number(default_low_stock_threshold);

      if (
        isNaN(parsedThreshold) ||
        !Number.isInteger(parsedThreshold) ||
        parsedThreshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Default low-stock threshold must be a non-negative integer (0 or greater).'
        });
      }

      organization.default_low_stock_threshold = parsedThreshold;
    }

    // 2. Optional: Update organization name if provided
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Organization name must be at least 2 characters long.'
        });
      }
      organization.name = trimmedName;
    }

    await organization.save();

    return res.status(200).json({
      success: true,
      message: 'Organization settings updated successfully.',
      data: {
        organizationId: organization._id,
        name: organization.name,
        default_low_stock_threshold: organization.default_low_stock_threshold,
        updatedAt: organization.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};

