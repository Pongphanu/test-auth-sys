// routes/auth.js - Authentication routes
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign-up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }
    
    // Validate password
    const passwordValidation = User.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup'
    });
  }
});

// Sign-in endpoint
router.post('/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if all required fields are provided
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Update last login - ตรวจสอบให้แน่ใจว่าส่วนนี้ทำงานถูกต้อง
      const currentTime = new Date();
      user.lastLogin = currentTime;
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      res.status(200).json({ 
        success: true, 
        message: 'Sign in successful',
        token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during signin'
      });
    }
  });

module.exports = router;