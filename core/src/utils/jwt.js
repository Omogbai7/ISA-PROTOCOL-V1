import jwt from 'jsonwebtoken';

export const generateToken = (payload, secret, expiresIn = '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateApiKey = () => {
  const randomString = Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15);
  return `isa_${randomString}_${Date.now()}`;
};
