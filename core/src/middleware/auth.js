import { verifyToken } from '../utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = verifyToken(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  // Verify API key against environment variable
  const validApiKey = process.env.API_KEY;

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
};

export const requireOwner = (req, res, next) => {
  if (!req.user || !req.user.isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Owner permission required'
    });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin && !req.user.isOwner)) {
    return res.status(403).json({
      success: false,
      message: 'Admin permission required'
    });
  }
  next();
};
