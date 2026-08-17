const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;