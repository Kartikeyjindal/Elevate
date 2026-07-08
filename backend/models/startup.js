const mongoose = require('./mockMongoose');

const startupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  founderName: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
  rejectionReason: { type: String, default: '' },
  marketingMixVariables: { type: String, default: '' },
  financialProcurement: { type: String, default: '' },
  pastValuations: { type: [Number], default: [] },
  raisedAmount: { type: Number, default: 0, required: true },
  tagline: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  minimumInvestment: { type: Number, default: 0 },
  valuationCap: { type: Number, default: 0 },
  targetGoal: { type: Number, default: 0 },
  maxGoal: { type: Number, default: 0 },
  pricePerShare: { type: Number, default: 0 },
  securityType: { type: String, default: 'Crowd SAFE' },
  totalInvestors: { type: Number, default: 0 },
  daysLeft: { type: Number, default: 0 },
  isPrimaryMarket: { type: Boolean, default: false },

  // === STEP 1: BASIC INFO (extended) ===
  coFounders: { type: String, default: '' },
  stage: { type: String, default: '' },        // Idea / MVP / Early Revenue / Growth / Scale
  foundedYear: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  description: { type: String, default: '' },  // detailed description
  teamSize: { type: Number, default: 0 },

  // === STEP 2: FINANCIALS (extended) ===
  trailingRevenue: { type: Number, default: 0 },
  ebitdaMargin: { type: Number, default: 0 },
  burnRate: { type: Number, default: 0 },
  runway: { type: Number, default: 0 },         // months

  // === STEP 3: STRATEGY ===
  businessModel: { type: String, default: '' },
  marketOpportunity: { type: String, default: '' },
  competitiveAdvantage: { type: String, default: '' },
  goToMarket: { type: String, default: '' },
  milestones: { type: String, default: '' },
  useOfFunds: { type: String, default: '' },
  revenueProjections: { type: String, default: '' },
  risks: { type: String, default: '' },
  exitStrategy: { type: String, default: '' },

  // Application completeness tracking
  applicationComplete: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Startup', startupSchema);
