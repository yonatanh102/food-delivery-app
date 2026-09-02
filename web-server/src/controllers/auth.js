const bcrpyt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/users');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({ error: 'Missing email or password' });
        }
        
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email' });
        }
        const isMatch = await bcrpyt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h'}
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

module.exports = { login };