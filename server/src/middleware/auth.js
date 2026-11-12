import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export function requireAuth(req,res,next){const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):null;if(!token)return res.status(401).json({message:'Sign in is required for this action.'});try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}catch{return res.status(401).json({message:'Your session is invalid or expired. Please sign in again.'});}}

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user?.sub).select('role').lean();
      if (!user) {
        return res.status(401).json({ message: 'Please sign in again.' });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action.' });
      }
      req.user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}
