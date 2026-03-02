const User = require('../models/User');

// Simple session-based authentication middleware
// Since we're not using tokens, we'll use a simple session ID approach
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required. Please include x-user-id in headers'
      });
    }

    // Verify user exists and is active
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user or user not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = authenticateUser;
