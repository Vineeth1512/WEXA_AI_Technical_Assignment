const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Authentication & Tenant-Isolation Middleware
 * 
 * 1. Intercepts incoming requests.
 * 2. Extracts and cryptographically verifies the Bearer JWT token.
 * 3. Injects tenant context (req.user = { id, organizationId, email }) into the request.
 * 4. Ensures downstream controllers ALWAYS derive organizationId from the verified token.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for Authorization header starting with "Bearer "
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Reject if no token is supplied
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    // 3. Verify token signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' 
          ? 'Authentication token has expired. Please log in again.' 
          : 'Invalid authentication token.'
      });
    }

    // 4. Verify that the user still exists in the database
    const user = await User.findById(decoded.userId).select('-password_hash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 5. Inject verified identity and tenant context into req.user
    // Any controller handling this request now has authoritative tenant isolation!
    req.user = {
      id: user._id,
      organizationId: user.organization_id,
      email: user.email
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };

