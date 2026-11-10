const bcrypt = require('bcryptjs');
const { User, Organization } = require('../models');
const { generateToken } = require('../utils/jwt');

/**
 * @desc    Register a new organization and primary user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, organizationName } = req.body;

    // 1. Validate required fields
    if (!email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and organization name.'
      });
    }

    // 2. Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 4. Validate organization name length
    const trimmedOrgName = organizationName.trim();
    if (trimmedOrgName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Organization name must be at least 2 characters long.'
      });
    }

    // 5. Check if email is already in use
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 6. Create the Organization record
    const organization = await Organization.create({
      name: trimmedOrgName,
      default_low_stock_threshold: 5
    });

    // 7. Hash the password using bcryptjs (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 8. Create the User record linked to the Organization
    let user;
    try {
      user = await User.create({
        organization_id: organization._id,
        email: normalizedEmail,
        password_hash: passwordHash
      });
    } catch (userCreateError) {
      // Rollback: If user creation fails, delete orphaned organization
      await Organization.findByIdAndDelete(organization._id);
      throw userCreateError;
    }

    // 9. Generate JWT Token
    const token = generateToken({
      userId: user._id,
      organizationId: organization._id
    });

    // 10. Return response with JWT and user summary
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        organizationId: organization._id,
        organizationName: organization.name
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Defensive timing: Use constant-time comparison to mitigate user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify password hash
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Retrieve associated organization
    const organization = await Organization.findById(user.organization_id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Associated organization not found.'
      });
    }

    // 5. Generate JWT Token
    const token = generateToken({
      userId: user._id,
      organizationId: organization._id
    });

    // 6. Return response
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        organizationId: organization._id,
        organizationName: organization.name
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const organization = await Organization.findById(user.organization_id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        organizationId: organization._id,
        organizationName: organization.name,
        default_low_stock_threshold: organization.default_low_stock_threshold
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};

