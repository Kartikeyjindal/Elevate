const express = require('express');
const router = express.Router();
const Startup = require('../models/startup');
const { verifyToken } = require('../middleware/auth');

// Get Approved Startups
router.get('/', verifyToken, async (req, res) => {
  try {
    const approvedStartups = await Startup.find({ status: 'approved' });
    res.status(200).json(approvedStartups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const User = require('../models/user');

// GET Company Startup Profile & Investments
router.get('/my-startup', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.startupId) {
      return res.status(404).json({ error: 'No startup associated with this account' });
    }

    const startup = await Startup.findById(user.startupId);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found' });
    }

    // Fetch all investments for this startup
    const Investment = require('../models/investment');
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

// POST add new valuation point (Company only)
router.post('/my-startup/valuation', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Access denied. Company profile required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.startupId) {
      return res.status(404).json({ error: 'No startup associated with this account' });
    }

    const { valuation } = req.body;
    if (!valuation || isNaN(valuation)) {
      return res.status(400).json({ error: 'Valid valuation amount is required' });
    }

    const startup = await Startup.findById(user.startupId);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found' });
    }

    startup.pastValuations.push(Number(valuation));
    const updatedStartup = await startup.save();

    res.status(200).json(updatedStartup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Save full 3-step startup application (Company only)
router.put('/my-startup/application', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Access denied. Company profile required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.startupId) {
      return res.status(404).json({ error: 'No startup associated with this account' });
    }

    const startup = await Startup.findById(user.startupId);
    if (!startup) {
      return res.status(404).json({ error: 'Startup profile not found' });
    }

    // Accept all fields from the 3-step form
    const allowedFields = [
      // Step 1 - Basic Info
      'name','category','founderName','coFounders','stage','foundedYear',
      'location','website','linkedIn','tagline','description','teamSize',
      // Step 2 - Financials
      'pastValuations','valuationCap','targetGoal','maxGoal','minimumInvestment',
      'pricePerShare','securityType','trailingRevenue','ebitdaMargin',
      'burnRate','runway','marketingMixVariables','financialProcurement',
      // Step 3 - Strategy
      'businessModel','marketOpportunity','competitiveAdvantage','goToMarket',
      'milestones','useOfFunds','revenueProjections','risks','exitStrategy',
      'applicationComplete'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        startup[field] = req.body[field];
      }
    });

    if (req.body.applicationComplete === true && startup.status === 'rejected') {
      startup.status = 'pending';
      startup.rejectionReason = '';
    }

    const updatedStartup = await startup.save();
    res.status(200).json(updatedStartup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
