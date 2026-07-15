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

// Helper to execute investment non-transactionally on standalone databases
async function executeSequentialInvestment(userId, startupId, investAmount, res) {
  const User = require('../models/user');
  const Startup = require('../models/startup');
  const Investment = require('../models/investment');

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
    const isLocalOrStandalone = process.env.MONGO_URI && 
                                (process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1')) && 
                                !process.env.MONGO_URI.includes('replicaSet');
                                
    if (isLocalOrStandalone) {
      return await executeSequentialInvestment(userId, startupId, investAmount, res);
    }

    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
    console.warn('MongoDB Transaction Session could not start. Falling back to non-transactional flow.');
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
      return await executeSequentialInvestment(userId, startupId, investAmount, res);
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_) {}
      session.endSession();
    }

    const isReplicaSetError = error.message.includes('Transaction numbers') || 
                              error.message.includes('replica set') || 
                              error.message.includes('replicaSet');
    if (isReplicaSetError) {
      console.warn('MongoDB instance does not support transactions (standalone). Falling back to non-transactional execution.');
      try {
        return await executeSequentialInvestment(userId, startupId, investAmount, res);
      } catch (fallbackErr) {
        return res.status(500).json({ error: fallbackErr.message });
      }
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

// Helper to execute sell non-transactionally on standalone databases
async function executeSequentialSell(userId, investmentId, res) {
  const User = require('../models/user');
  const Startup = require('../models/startup');
  const Investment = require('../models/investment');

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
    message: 'Shares sold successfully (Sequential Fallback)',
    updatedWalletBalance: user.walletBalance
  });
}

// Sell Investment
router.post('/sell', verifyToken, async (req, res) => {
  const { investmentId } = req.body;
  const userId = req.user.id;

  if (!investmentId) {
    return res.status(400).json({ error: 'Investment ID is required' });
  }

  let session;
  try {
    const isLocalOrStandalone = process.env.MONGO_URI && 
                                (process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1')) && 
                                !process.env.MONGO_URI.includes('replicaSet');
                                
    if (isLocalOrStandalone) {
      return await executeSequentialSell(userId, investmentId, res);
    }

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
      return await executeSequentialSell(userId, investmentId, res);
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_) {}
      session.endSession();
    }

    const isReplicaSetError = error.message.includes('Transaction numbers') || 
                              error.message.includes('replica set') || 
                              error.message.includes('replicaSet');
    if (isReplicaSetError) {
      console.warn('MongoDB instance does not support transactions (standalone). Falling back to non-transactional execution.');
      try {
        return await executeSequentialSell(userId, investmentId, res);
      } catch (fallbackErr) {
        return res.status(500).json({ error: fallbackErr.message });
      }
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
    const allTxs = await WalletTransaction.find({});
    const userIdStr = String(req.user.id);
    const txs = allTxs.filter(tx => String(tx.userId) === userIdStr);
    txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(`[wallet/transactions] userId=${userIdStr}, total=${allTxs.length}, filtered=${txs.length}`);
    res.json(txs);
  } catch (err) {
    console.error('[wallet/transactions] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Pre-defined Startup Baskets
const PREDEFINED_BASKETS = [
  {
    id: 'ai-deeptech',
    name: 'AI & DeepTech Basket',
    tagline: 'Invest in the frontier of artificial intelligence, quantum computing, and advanced robotics.',
    description: 'A curated selection of high-growth ventures building foundation models, edge AI, and next-generation deep tech infrastructure.',
    icon: 'RobotOutlined',
    constituents: [
      { name: 'Trade Algo', weight: 30 },
      { name: 'SapientX', weight: 25 },
      { name: 'Delhi Quantum Grid', weight: 25 },
      { name: 'PSYONIC', weight: 20 }
    ]
  },
  {
    id: 'd2c-consumer',
    name: 'D2C & Consumer Brands Basket',
    tagline: 'Capitalize on shifting consumer habits and rapidly scaling plant-based, EV, and beverage brands.',
    description: 'High-margin consumer goods, food & beverage, and lifestyle brands showing strong early-market product-market fit.',
    icon: 'ShoppingOutlined',
    constituents: [
      { name: 'Honeybee Burger', weight: 30 },
      { name: 'Fire Department Coffee', weight: 30 },
      { name: 'Cheers Health', weight: 20 },
      { name: 'The Sports Bra Cafe', weight: 20 }
    ]
  },
  {
    id: 'fintech-creator',
    name: 'Fintech & Insurtech Giants Basket',
    tagline: 'Fuel the digital finance revolution with creators, automated underwriting, and micro-leasing SaaS.',
    description: 'Leading platforms digitizing real estate, creator payments, and traditional auto insurance markets.',
    icon: 'TransactionOutlined',
    constituents: [
      { name: 'Trade Algo', weight: 30 },
      { name: 'Happiness Insurance', weight: 30 },
      { name: 'Rentberry India', weight: 20 },
      { name: 'Gumroad Creator Hub', weight: 20 }
    ]
  },
  {
    id: 'green-mobility',
    name: 'Green Tech & Clean Energy Basket',
    tagline: 'Accelerate the global transition to renewable grid solutions and zero-emission vehicles.',
    description: 'Focused on sustainable agriculture robotics, urban micro-EV transit, solar battery cells, and wind turbines.',
    icon: 'EcoOutlined',
    constituents: [
      { name: 'Eli Electric Vehicles', weight: 30 },
      { name: 'Doroni Aerospace', weight: 30 },
      { name: 'Greenfield Robotics', weight: 20 },
      { name: 'GoSun', weight: 20 }
    ]
  }
];

// GET All Startup Baskets
router.get('/baskets', verifyToken, async (req, res) => {
  try {
    const Startup = require('../models/startup');
    const allStartups = await Startup.find({ status: 'approved' });
    
    // Map constituents to actual startup objects from DB
    const populatedBaskets = PREDEFINED_BASKETS.map(basket => {
      const activeConstituents = [];
      basket.constituents.forEach(item => {
        const match = allStartups.find(s => s.name.toLowerCase() === item.name.toLowerCase());
        if (match) {
          activeConstituents.push({
            startupId: match._id,
            name: match.name,
            tagline: match.tagline,
            logoUrl: match.logoUrl,
            valuationCap: match.valuationCap,
            pricePerShare: match.pricePerShare,
            weight: item.weight
          });
        }
      });
      return {
        ...basket,
        constituents: activeConstituents
      };
    }).filter(b => b.constituents.length > 0);
    
    res.status(200).json(populatedBaskets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Invest in a Basket
router.post('/baskets/invest', verifyToken, async (req, res) => {
  const { basketId, totalAmount } = req.body;
  const userId = req.user.id;
  
  if (!basketId || !totalAmount || totalAmount < 5000) {
    return res.status(400).json({ error: 'Invalid investment amount. Minimum investment is ₹5,000 for a basket.' });
  }
  
  const User = require('../models/user');
  const Startup = require('../models/startup');
  const Investment = require('../models/investment');
  const WalletTransaction = require('../models/walletTransaction');
  
  const basket = PREDEFINED_BASKETS.find(b => b.id === basketId);
  if (!basket) {
    return res.status(404).json({ error: 'Basket not found' });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    
    const allStartups = await Startup.find({ status: 'approved' });
    const constituentsToInvest = [];
    let totalWeight = 0;
    
    basket.constituents.forEach(item => {
      const match = allStartups.find(s => s.name.toLowerCase() === item.name.toLowerCase());
      if (match) {
        const constituentsToInvest.push({
          startup: match,
          weight: item.weight
        });
        totalWeight += item.weight;
      }
    });
    
    if (constituentsToInvest.length === 0) {
      return res.status(400).json({ error: 'No active constituents found in this basket for investment' });
    }
    
    const investmentsCreated = [];
    let spentAmount = 0;
    
    for (let i = 0; i < constituentsToInvest.length; i++) {
      const { startup, weight } = constituentsToInvest[i];
      const isLast = i === constituentsToInvest.length - 1;
      const startupAmount = isLast 
        ? (totalAmount - spentAmount) 
        : Math.round(totalAmount * (weight / totalWeight));
      
      spentAmount += startupAmount;
      
      if (startupAmount > 0) {
        const investment = new Investment({
          userId: user._id,
          startupId: startup._id,
          amount: startupAmount,
          timestamp: new Date()
        });
        await investment.save();
        
        startup.raisedAmount = (startup.raisedAmount || 0) + startupAmount;
        startup.totalInvestors = (startup.totalInvestors || 0) + 1;
        await startup.save();
        
        investmentsCreated.push({
          startupName: startup.name,
          amount: startupAmount,
          investmentId: investment._id
        });
      }
    }
    
    user.walletBalance -= totalAmount;
    await user.save();
    
    const walletTx = new WalletTransaction({
      userId: user._id,
      amount: totalAmount,
      type: 'debit',
      description: `Invested in ${basket.name}`,
      timestamp: new Date()
    });
    await walletTx.save();
    
    res.status(200).json({
      message: `Successfully invested ₹${totalAmount.toLocaleString()} in ${basket.name}`,
      walletBalance: user.walletBalance,
      investments: investmentsCreated
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;



