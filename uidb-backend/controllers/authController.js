const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
const register = async (req, res) => {
    try {
      const { username, password, sqlConnectionDetails } = req.body;
  
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Hash the SQL connection password
      const sqlSalt = await bcrypt.genSalt(10);
      const hashedSqlPassword = await bcrypt.hash(sqlConnectionDetails.password, sqlSalt);
  
      user = new User({
        username,
        password: hashedPassword,
        sqlConnectionDetails: {
          ...sqlConnectionDetails,
          // password: hashedSqlPassword
        }
      });
  
      await user.save();
  
      const payload = {
        user: {
          id: user.id
        }
      };
  
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Logout
const logout =  (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}


module.exports = {
    login,
    register,
    logout,
    getUser
};