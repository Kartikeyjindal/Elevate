const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// GET /api/watchlist — get investor's watchlist
router.get('/', verifyToken, async (req, res) => {
  try {
    const User = require('../models/user');
    const user = await User.findById(req.user.id).populate('watchlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.watchlist || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/watchlist/:startupId — toggle watchlist (add if not present, remove if present)
router.post('/:startupId', verifyToken, async (req, res) => {
  try {
    const User = require('../models/user');
    const { startupId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const idx = user.watchlist.findIndex(id => id.toString() === startupId);
    let action;
    if (idx === -1) {
      user.watchlist.push(startupId);
      action = 'added';
    } else {
      user.watchlist.splice(idx, 1);
      action = 'removed';
    }
    await user.save();
    res.json({ action, watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
