const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'local-development-secret');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in production. Set JWT_SECRET in the Vercel project environment.');
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, is_admin: !!user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Cache for Google's public keys (JWKS)
let googleKeysCache = null;
let googleKeysFetchedAt = 0;
const KEYS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchGoogleKeys() {
  const now = Date.now();
  if (googleKeysCache && now - googleKeysFetchedAt < KEYS_CACHE_TTL) {
    return googleKeysCache;
  }

  const response = await fetch(GOOGLE_JWKS_URI);
  if (!response.ok) {
    throw new Error('Failed to fetch Google public keys');
  }
  const jwks = await response.json();
  googleKeysCache = jwks.keys;
  googleKeysFetchedAt = now;
  return googleKeysCache;
}

async function verifyGoogleIdToken(idToken) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('The Google token is malformed');
  }

  const jwks = await fetchGoogleKeys();
  const key = jwks.find(k => k.kid === decoded.header.kid);
  if (!key) {
    throw new Error('Unable to find a key that matches the Google token');
  }

  const { createPublicKey } = await import('crypto');
  const publicKey = createPublicKey({
    key: {
      kty: key.kty,
      kid: key.kid,
      use: key.use,
      alg: key.alg,
      n: key.n,
      e: key.e
    },
    format: 'jwk',
    type: 'public'
  });

  const payload = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    audience: GOOGLE_CLIENT_ID,
    issuer: ['accounts.google.com', 'https://accounts.google.com'],
    clockTolerance: 300
  });

  if (!payload.email_verified) {
    throw new Error('Google email is not verified');
  }

  return payload;
}

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
  } catch {
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
    try {
      const { id_token: idToken } = req.body;

      if (!idToken) {
        return res.status(422).json({ message: 'Google ID token is required' });
      }

      const payload = await verifyGoogleIdToken(idToken);

      let user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        user = await User.create({
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          password: await bcrypt.hash(Math.random().toString(36).slice(2), 10),
          google_uid: payload.sub,
          email_verified_at: new Date(),
        });
      } else if (!user.google_uid) {
        await user.update({ google_uid: payload.sub });
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
      res.status(401).json({ message: error.message || 'Google login failed' });
    }
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