const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dns = require('dns');
const nodemailer = require('nodemailer');

const otpStore = {}; // in-memory store for OTPs: userId -> { otp, expiresAt, email }

const sendOTPEmail = async (email, otp) => {
  const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_smtp_username';
  
  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log(`[MOCK EMAIL SERVICE]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Elevate Equity Login OTP`);
    console.log(`Body: Your One-Time Password for logging in is: ${otp}`);
    console.log('==================================================\n');
    return { mock: true, otp };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: '"Elevate Security" <security@elevateequity.co>',
      to: email,
      subject: 'Elevate Equity Login OTP',
      text: `Your One-Time Password (OTP) for Elevate login is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #00d09c; margin-bottom: 20px;">Elevate Equity Secure Login</h2>
          <p>Hello,</p>
          <p>You requested a secure login OTP for your Elevate Equity account.</p>
          <div style="background: #f8fafc; border: 1px solid #edf2f7; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #7c8099;">This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>
        </div>
      `
    });
    
    console.log(`Real OTP email sent to ${email}. Message ID: ${info.messageId}`);
    return { mock: false };
  } catch (error) {
    console.error(`Failed to send real OTP email to ${email}:`, error);
    console.log('\n==================================================');
    console.log(`[MOCK FALLBACK] OTP for ${email} is: ${otp}`);
    console.log('==================================================\n');
    return { mock: true, error: error.message };
  }
};

const verifyEmailDomain = (emailAddress) => {
  return new Promise((resolve) => {
    if (!emailAddress || !emailAddress.includes('@')) {
      resolve(false);
      return;
    }
    const domain = emailAddress.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          resolve(false);
        } else {
          resolve(true); // Fail-safe on network/timeout
        }
      } else {
        resolve(addresses && addresses.length > 0);
      }
    });
  });
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, role, companyName } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Name, username, email, and password are required' });
    }

    // Verify email domain is gmail.com
    const domain = email.toLowerCase().split('@')[1];
    if (domain !== 'gmail.com') {
      return res.status(400).json({ error: 'Only Gmail addresses (@gmail.com) are allowed.' });
    }

    // Enforce Google Gmail username policy: 6-30 characters, letters, numbers, and periods
    const localPart = email.split('@')[0];
    const cleanLocalPart = localPart.replace(/\./g, '');
    if (cleanLocalPart.length < 6 || cleanLocalPart.length > 30) {
      return res.status(400).json({ error: 'Invalid Gmail' });
    }
    const gmailUsernameRegex = /^[a-z0-9.]+$/i;
    if (!gmailUsernameRegex.test(localPart)) {
      return res.status(400).json({ error: 'Invalid Gmail' });
    }

    // Validate email domain MX records
    const isDomainValid = await verifyEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ error: 'The email domain is invalid or does not exist.' });
    }

    // Validate username format: lowercase letters, numbers, underscores, dots only
    const usernameRegex = /^[a-z0-9_.]{3,20}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({ error: 'Username must be 3–20 characters and can only contain letters, numbers, underscores, or dots.' });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: `The username "@${username}" is already taken. Please choose a different one.` });
    }

    // Check if email is already taken
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: `An account with ${email} already exists. Please sign in or use a different email.` });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let startupId = undefined;
    if (role === 'company') {
      if (!companyName) {
        return res.status(400).json({ error: 'Company / Startup name is required' });
      }

      const Startup = require('../models/startup');
      const newStartup = new Startup({
        name: companyName,
        category: 'General',
        founderName: name,
        status: 'pending',
        raisedAmount: 0,
        applicationComplete: false
      });

      const savedStartup = await newStartup.save();
      startupId = savedStartup._id;
    }

    // Create user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role: ['admin', 'investor', 'company'].includes(role) ? role : 'investor',
      startupId,
      walletBalance: email.toLowerCase() === 'i@gmail.com' ? 0 : 100000
    });

    const savedUser = await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role, name: savedUser.name, username: savedUser.username },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        walletBalance: savedUser.walletBalance,
        portfolio: savedUser.portfolio,
        startupId: savedUser.startupId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if email exists/is registered
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate registration email domain and format
router.post('/validate-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(200).json({ valid: false, reason: 'Please enter a valid email format!' });
  }

  const domain = email.toLowerCase().split('@')[1];
  if (domain !== 'gmail.com') {
    return res.status(200).json({ valid: false, reason: 'Only Gmail addresses (@gmail.com) are allowed.' });
  }

  // Enforce Google Gmail username policy: 6-30 characters, letters, numbers, and periods
  const localPart = email.split('@')[0];
  const cleanLocalPart = localPart.replace(/\./g, '');
  if (cleanLocalPart.length < 6 || cleanLocalPart.length > 30) {
    return res.status(200).json({ valid: false, reason: 'Invalid Gmail' });
  }
  const gmailUsernameRegex = /^[a-z0-9.]+$/i;
  if (!gmailUsernameRegex.test(localPart)) {
    return res.status(200).json({ valid: false, reason: 'Invalid Gmail' });
  }

  const isDomainValid = await verifyEmailDomain(email);
  if (!isDomainValid) {
    return res.status(200).json({ valid: false, reason: 'The email domain does not exist or cannot receive mail.' });
  }

  return res.status(200).json({ valid: true });
});

// Login User (by email OR username)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find user by email or username
    const isEmail = identifier.includes('@');
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
    }

    let user;
    if (isEmail) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ error: 'No account found with that email or username.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.' });
    }

    if (user.email.toLowerCase() === 'i@gmail.com') {
      user.walletBalance = 0;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, username: user.username },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        portfolio: user.portfolio,
        startupId: user.startupId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request OTP for passwordless login
router.post('/request-otp-login', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    const isEmail = identifier.includes('@');
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
    }

    let user;
    if (isEmail) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ error: 'No account found with that email or username.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[user._id] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      email: user.email
    };

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      requireOtp: true,
      userId: user._id,
      message: 'OTP sent to registered email'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP to finalize login
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ error: 'User ID and OTP are required' });
  }

  try {
    const record = otpStore[userId];
    if (!record) {
      return res.status(400).json({ error: 'No active OTP found. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[userId];
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect OTP code. Please verify and try again.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    delete otpStore[userId];

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, username: user.username },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log(`OTP verification successful for user ${user.email}`);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        portfolio: user.portfolio,
        startupId: user.startupId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP Code
router.post('/resend-otp', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[userId] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      email: user.email
    };

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({ message: 'OTP resent successfully to registered email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Live User Profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userObj = JSON.parse(JSON.stringify(user));
    delete userObj.passwordHash;
    res.status(200).json(userObj);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update User Profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { newPassword, address, dob, panCard } = req.body;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (address !== undefined) user.address = address;
    if (dob !== undefined) user.dob = dob;
    if (panCard !== undefined) user.panCard = panCard;

    await user.save();

    const userObj = JSON.parse(JSON.stringify(user));
    delete userObj.passwordHash;
    res.status(200).json(userObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
