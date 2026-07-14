const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Startup = require('../models/startup');
const Investment = require('../models/investment');
const { verifyToken } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
const isRazorpayMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder');

let razorpayInstance = null;
if (!isRazorpayMock) {
  try {
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay instance:', err);
  }
}

router.post('/invest', verifyToken, async (req, res) => {
  const { startupId, amount } = req.body;
  const userId = req.user.id;

  if (!startupId || !amount) {
    return res.status(400).json({ error: 'Startup ID and amount are required' });
  }

  const investAmount = Number(amount);

  try {
    const startupToCheck = await Startup.findById(startupId);
    if (!startupToCheck) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    const minRequired = startupToCheck.minimumInvestment || 10000;
    if (investAmount < minRequired) {
      return res.status(400).json({ error: `Minimum investment amount is ₹${minRequired.toLocaleString()}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
    console.warn('MongoDB Transaction Session could not start (likely standalone local DB). Falling back to non-transactional flow.');
  }

  try {
    if (session) {
      // 1. Fetch user and verify balance
      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.walletBalance < investAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }

      // 2. Fetch startup and verify it exists and is approved
      const startup = await Startup.findById(startupId).session(session);
      if (!startup) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Startup not found' });
      }

      if (startup.status !== 'approved') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Startup is not approved for investment' });
      }

      // 3. Deduct from user wallet
      user.walletBalance -= investAmount;

      // 4. Create investment document
      const newInvestment = new Investment({
        userId,
        startupId,
        amount: investAmount
      });
      const savedInvestment = await newInvestment.save({ session });

      // 5. Add investment to user portfolio
      user.portfolio.push(savedInvestment._id);
      await user.save({ session });

      // Log wallet transaction
      const WalletTransaction = require('../models/walletTransaction');
      const tx = new WalletTransaction({
        userId,
        type: 'investment',
        amount: investAmount,
        status: 'completed',
        referenceId: savedInvestment._id.toString(),
        description: `Pledged capital to startup`
      });
      await tx.save({ session });

      // 6. Add raisedAmount to startup
      startup.raisedAmount += investAmount;
      await startup.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: 'Investment executed successfully (Transactional)',
        investment: savedInvestment,
        updatedWalletBalance: user.walletBalance
      });
    } else {
      // Fallback: Non-transactional execution for standalone local MongoDB instances
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.walletBalance < investAmount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }

      const startup = await Startup.findById(startupId);
      if (!startup) {
        return res.status(404).json({ error: 'Startup not found' });
      }

      if (startup.status !== 'approved') {
        return res.status(400).json({ error: 'Startup is not approved for investment' });
      }

      // Perform updates
      user.walletBalance -= investAmount;
      const newInvestment = new Investment({
        userId,
        startupId,
        amount: investAmount
      });
      const savedInvestment = await newInvestment.save();

      user.portfolio.push(savedInvestment._id);
      await user.save();

      // Log wallet transaction
      const WalletTransaction = require('../models/walletTransaction');
      const tx = new WalletTransaction({
        userId,
        type: 'investment',
        amount: investAmount,
        status: 'completed',
        referenceId: savedInvestment._id.toString(),
        description: `Pledged capital to startup`
      });
      await tx.save();

      startup.raisedAmount += investAmount;
      await startup.save();

      return res.status(201).json({
        message: 'Investment executed successfully (Sequential Fallback)',
        investment: savedInvestment,
        updatedWalletBalance: user.walletBalance
      });
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ error: error.message });
  }
});

// Get My Investments
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const investments = await Investment.find({ userId }).populate('startupId').lean();
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sell Investment
router.post('/sell', verifyToken, async (req, res) => {
  const { investmentId } = req.body;
  const userId = req.user.id;

  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID is required' });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
  }

  try {
    if (session) {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Investment not found' });
      }

      if (investment.userId.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: 'Not authorized to sell this investment' });
      }

      const user = await User.findById(userId).session(session);
      user.walletBalance += investment.amount;
      user.portfolio = user.portfolio.filter(id => id.toString() !== investmentId);
      await user.save({ session });

      // Log wallet transaction
      const WalletTransaction = require('../models/walletTransaction');
      const tx = new WalletTransaction({
        userId,
        type: 'sell_return',
        amount: investment.amount,
        status: 'completed',
        referenceId: investmentId,
        description: `Sold shares (refunded to wallet)`
      });
      await tx.save({ session });

      const startup = await Startup.findById(investment.startupId).session(session);
      if (startup) {
        startup.raisedAmount = Math.max(0, startup.raisedAmount - investment.amount);
        await startup.save({ session });
      }

      await Investment.findByIdAndDelete(investmentId).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Shares sold successfully',
        updatedWalletBalance: user.walletBalance
      });
    } else {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      if (investment.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to sell this investment' });
      }

      const user = await User.findById(userId);
      user.walletBalance += investment.amount;
      user.portfolio = user.portfolio.filter(id => id.toString() !== investmentId);
      await user.save();

      // Log wallet transaction
      const WalletTransaction = require('../models/walletTransaction');
      const tx = new WalletTransaction({
        userId,
        type: 'sell_return',
        amount: investment.amount,
        status: 'completed',
        referenceId: investmentId,
        description: `Sold shares (refunded to wallet)`
      });
      await tx.save();

      const startup = await Startup.findById(investment.startupId);
      if (startup) {
        startup.raisedAmount = Math.max(0, startup.raisedAmount - investment.amount);
        await startup.save();
      }

      await Investment.findByIdAndDelete(investmentId);

      return res.status(200).json({
        message: 'Shares sold successfully',
        updatedWalletBalance: user.walletBalance
      });
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ error: error.message });
  }
});

// Deposit into wallet (direct fallback)
router.post('/wallet/deposit', verifyToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid deposit amount is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();

    // Log wallet transaction
    const WalletTransaction = require('../models/walletTransaction');
    const tx = new WalletTransaction({
      userId,
      type: 'deposit',
      amount: Number(amount),
      status: 'completed',
      description: `Deposited funds directly to wallet`
    });
    await tx.save();

    return res.status(200).json({
      message: 'Deposit successful',
      updatedWalletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Razorpay Order
router.post('/wallet/deposit/order', verifyToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid deposit amount is required' });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  if (isRazorpayMock || !razorpayInstance) {
    console.log(`Razorpay in Mock Mode: Creating mock order for ₹${amount}`);
    return res.status(200).json({
      isMock: true,
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amountInPaise,
      currency: 'INR',
      key_id: razorpayKeyId
    });
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_dep_${Date.now()}`
    };
    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json({
      isMock: false,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId
    });
  } catch (error) {
    console.error('Razorpay order creation failed, falling back to mock:', error);
    return res.status(200).json({
      isMock: true,
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amountInPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
      error: error.message
    });
  }
});

// Verify Razorpay Payment Signature and Credit Wallet
router.post('/wallet/deposit/verify', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, isMock } = req.body;
  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMockOrder = isMock || razorpay_order_id.startsWith('order_mock_');

    if (!isMockOrder) {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment signature verification failed' });
      }
    }

    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    user.walletBalance = (user.walletBalance || 0) + creditAmount;
    await user.save();

    // Log wallet transaction
    const WalletTransaction = require('../models/walletTransaction');
    const tx = new WalletTransaction({
      userId,
      type: 'deposit',
      amount: creditAmount,
      status: 'completed',
      referenceId: razorpay_payment_id,
      description: `Deposited funds via Razorpay (Order: ${razorpay_order_id})`
    });
    await tx.save();

    console.log(`Successfully credited user ${user.email} with ₹${creditAmount} via Razorpay (Mock: ${isMockOrder})`);

    return res.status(200).json({
      message: 'Deposit verified and updated successfully',
      updatedWalletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Withdraw from wallet
router.post('/wallet/withdraw', verifyToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid withdrawal amount is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
    }

    user.walletBalance = (user.walletBalance || 0) - Number(amount);
    await user.save();

    // Log wallet transaction
    const WalletTransaction = require('../models/walletTransaction');
    const tx = new WalletTransaction({
      userId,
      type: 'withdrawal',
      amount: Number(amount),
      status: 'completed',
      description: `Withdrew funds from wallet`
    });
    await tx.save();

    return res.status(200).json({
      message: 'Withdrawal successful',
      updatedWalletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch wallet transactions history
router.get('/wallet/transactions', verifyToken, async (req, res) => {
  try {
    const WalletTransaction = require('../models/walletTransaction');
    const txs = await WalletTransaction.find({ userId: req.user.id });
    // Sort transactions by date descending
    txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

