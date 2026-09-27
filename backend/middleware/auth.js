const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_poco_crm_jwt_key_2026_change_me';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : (req.cookies && req.cookies.token);

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      console.warn('⚠️ Invalid or expired JWT token:', err.message);
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decodedUser;
    next();
  });
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
