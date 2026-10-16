const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '1d' });
};

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach decoded user info
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthenticated.' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, phone, address } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(422).json({ message: 'Validation failed' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(422).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
      });

      const token = generateToken(user);

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(422).json({ message: 'Validation failed' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(422).json({ message: 'The provided credentials are incorrect.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(422).json({ message: 'The provided credentials are incorrect.' });
      }

      const token = generateToken(user);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async googleLogin(req, res) {
    // For simplicity, we'll treat Google login as regular login with a dummy password.
    // In a real app, you would verify the id_token with Google and find/create user.
    // Since we don't have GoogleAuthService, we'll just return error.
    res.status(501).json({ message: 'Google login not implemented' });
  }

  async logout(req, res) {
    // Since we are using stateless JWT, logout is just client removing token.
    res.json({ message: 'Logged out' });
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'remember_token'] }
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { AuthController: new AuthController(), authMiddleware, adminMiddleware };