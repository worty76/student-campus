const jwt = require('jsonwebtoken');
require('dotenv').config
const JWT_SECRET = process.env.JWT_SECRET_KEY

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // Lưu thông tin user vào req để dùng ở controller
        next();
    });
};

module.exports = { authenticateToken };