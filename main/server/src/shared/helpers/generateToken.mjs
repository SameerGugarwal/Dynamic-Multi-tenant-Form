import jwt from 'jsonwebtoken';
import { env } from '../../config/env.mjs';

/*
// --- User's Original Code ---
export const generateAccessToken = (user) => {
  return jwt.sign({ 
      id: user._id, 
      roleId: user.role,
      organizationId: user.organizationId 
    },
    process.env.JWT_SECRET || 'fallback_super_secret_key',
    { expiresIn: '15m' } // Shorter lifespan for access token
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ 
      id: user._id 
    },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_super_secret_key',
    { expiresIn: '7d' } // Longer lifespan for refresh token
  );
};
// --- End User's Original Code ---
*/

export const generateAccessToken = (user) => {
  return jwt.sign({ 
      id: user._id, 
      roleId: user.role,
      organizationId: user.organizationId 
    },
    env.JWT_SECRET,
    { expiresIn: '15m' } 
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ 
      id: user._id 
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } 
  );
};