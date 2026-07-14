import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

// Anonymous user cache to avoid DB lookup on every request
let anonymousUser = null;

const getOrCreateAnonymousUser = async () => {
  if (anonymousUser) return anonymousUser;

  const ANON_EMAIL = 'anonymous@buildhub.ai';
  let user = await User.findOne({ email: ANON_EMAIL });

  if (!user) {
    user = await User.create({
      name: 'User',
      email: ANON_EMAIL,
      password: 'anon_not_a_real_password_123456'
    });
    logger.info('Created anonymous user for public access');
  }

  anonymousUser = user;
  return anonymousUser;
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_fallback_123456');
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user) {
        return next();
      }
    } catch (error) {
      logger.error('JWT Verification Error: %O', error);
      // Fall through to anonymous user instead of blocking
    }
  }

  // No valid token — use anonymous user for public access
  try {
    req.user = await getOrCreateAnonymousUser();
    next();
  } catch (error) {
    logger.error('Failed to create anonymous user: %O', error);
    res.status(500).json({ success: false, message: 'Server error initializing session' });
  }
};
