const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// GET /api/startups/:id/updates — get all updates and Q&As for a startup
router.get('/:id/updates', verifyToken, async (req, res) => {
  try {
    const StartupUpdate = require('../models/startupUpdate');
    const updates = await StartupUpdate.find({ startupId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/startups/:id/updates — founder/admin posts an update
router.post('/:id/updates', verifyToken, async (req, res) => {
  try {
    const StartupUpdate = require('../models/startupUpdate');
    const { content, authorName } = req.body;
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: 'Update content must be at least 10 characters.' });
    }
    const update = new StartupUpdate({
      startupId: req.params.id,
      type: 'update',
      authorName: authorName || req.user.name || 'Founder',
      authorRole: req.user.role === 'admin' ? 'admin' : 'founder',
      content: content.trim(),
      userId: req.user.id
    });
    await update.save();
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/startups/:id/questions — investor posts a question
router.post('/:id/questions', verifyToken, async (req, res) => {
  try {
    const StartupUpdate = require('../models/startupUpdate');
    const { content } = req.body;
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ error: 'Question must be at least 5 characters.' });
    }
    const question = new StartupUpdate({
      startupId: req.params.id,
      type: 'question',
      authorName: req.user.name || req.user.username || 'Investor',
      authorRole: 'investor',
      content: content.trim(),
      userId: req.user.id,
      answer: ''
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/startups/:id/questions/:qid/answer — founder/admin answers a question
router.patch('/:id/questions/:qid/answer', verifyToken, async (req, res) => {
  try {
    const StartupUpdate = require('../models/startupUpdate');
    const { answer } = req.body;
    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({ error: 'Answer must be at least 5 characters.' });
    }
    const question = await StartupUpdate.findById(req.params.qid);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    question.answer = answer.trim();
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
