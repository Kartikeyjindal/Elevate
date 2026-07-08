const express = require('express');
const router = express.Router();
const Startup = require('../models/startup');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET Pending Startups
router.get('/startups/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const pendingStartups = await Startup.find({ status: 'pending' });
    res.status(200).json(pendingStartups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH Approve or Reject Startup
router.patch('/startups/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({ error: 'A rejection reason is required' });
    }

    const updateObj = { status };
    if (status === 'rejected') {
      updateObj.rejectionReason = rejectionReason;
    } else {
      updateObj.rejectionReason = '';
    }

    const updatedStartup = await Startup.findByIdAndUpdate(
      id,
      updateObj,
      { new: true, runValidators: true }
    );

    if (!updatedStartup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Log the vetting action
    const AuditLog = require('../models/auditLog');
    const newAudit = new AuditLog({
      action: `Startup ${status.toUpperCase()} (Vetting)${status === 'rejected' ? ` - Reason: ${rejectionReason}` : ''}`,
      startupName: updatedStartup.name,
      adminName: req.user.name || 'System Admin',
      timestamp: new Date()
    });
    await newAudit.save();

    res.status(200).json(updatedStartup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Vetting Audit Logs (Admin only)
router.get('/audit-logs', verifyToken, isAdmin, async (req, res) => {
  try {
    const AuditLog = require('../models/auditLog');
    const logs = await AuditLog.find({});
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json(sortedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Startup complete details (Admin only)
router.get('/startups/:id/details', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Fetch all investments for this startup
    const Investment = require('../models/investment');
    const User = require('../models/user');
    const investments = await Investment.find({ startupId: startup._id });

    // Lookup investor names
    const populatedInvestments = await Promise.all(
      investments.map(async (inv) => {
        const investor = await User.findById(inv.userId);
        return {
          _id: inv._id,
          amount: inv.amount,
          timestamp: inv.timestamp,
          investorName: investor ? investor.name : 'Unknown Investor',
          investorEmail: investor ? investor.email : 'N/A'
        };
      })
    );

    res.status(200).json({
      startup,
      investments: populatedInvestments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET User details by username or email (Admin only)
router.get('/users/lookup', verifyToken, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const User = require('../models/user');
    const Investment = require('../models/investment');
    const Startup = require('../models/startup');

    // Fetch all users and filter in JS (mock DB doesn't support $or/$regex)
    const q = query.trim().toLowerCase();
    const allUsers = await User.find({});
    const user = allUsers.find(u =>
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all investments made by this user (match by userId string)
    const allInvestments = await Investment.find({});
    const userInvestments = allInvestments.filter(inv =>
      inv.userId && inv.userId.toString() === user._id.toString()
    );

    // Populate startup names
    const enriched = await Promise.all(userInvestments.map(async (inv) => {
      const startup = inv.startupId ? await Startup.findById(inv.startupId) : null;
      return {
        _id: inv._id,
        amount: inv.amount,
        timestamp: inv.timestamp,
        startupName: startup ? startup.name : 'Unknown Startup',
        startupCategory: startup ? startup.category : 'N/A'
      };
    }));

    const details = {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance || 0,
        createdAt: user.createdAt
      },
      investments: enriched
    };

    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Company/Startup details by name (Admin only)
router.get('/companies/lookup', verifyToken, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Company name search query is required' });
    }

    const Startup = require('../models/startup');
    const Investment = require('../models/investment');
    const User = require('../models/user');

    // Fetch all startups and filter in JS (mock DB doesn't support $regex)
    const q = query.trim().toLowerCase();
    const allStartups = await Startup.find({});
    const startup = allStartups.find(s => s.name && s.name.toLowerCase().includes(q));

    if (!startup) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Fetch investments for this startup (match by startupId string)
    const allInvestments = await Investment.find({});
    const startupInvestments = allInvestments.filter(inv =>
      inv.startupId && inv.startupId.toString() === startup._id.toString()
    );

    const populatedInvestments = await Promise.all(
      startupInvestments.map(async (inv) => {
        const investor = inv.userId ? await User.findById(inv.userId) : null;
        return {
          _id: inv._id,
          amount: inv.amount,
          timestamp: inv.timestamp,
          investorName: investor ? investor.name : 'Unknown Investor',
          investorEmail: investor ? investor.email : 'N/A',
          investorUsername: investor ? investor.username : 'N/A'
        };
      })
    );

    res.status(200).json({
      company: startup,
      investments: populatedInvestments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
