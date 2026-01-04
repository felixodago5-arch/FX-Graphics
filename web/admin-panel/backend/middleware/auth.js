const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    // Check for token in headers or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token || 
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'Account is not active' });
      }
      
      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin authentication' });
  }
};

module.exports = { auth, adminAuth };
module.exports.default = auth;

