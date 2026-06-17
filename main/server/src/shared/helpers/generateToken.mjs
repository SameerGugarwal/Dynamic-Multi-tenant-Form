import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign({ 
      id: user._id, 
      roleId: user.role,
      organizationId: user.organizationId 
    },
    process.env.JWT_SECRET || 'fallback_super_secret_key',
    { expiresIn: '1d' }
  );
};