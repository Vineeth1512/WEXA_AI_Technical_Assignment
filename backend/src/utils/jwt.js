const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_super_secret_jwt_dev_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token containing userId and organizationId
 * @param {Object} payload - { userId, organizationId }
 * @returns {string} - Signed JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - Bearer JWT token string
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};

