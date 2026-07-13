/**
 * update_logos.js
 * Run with: node backend/scripts/update_logos.js
 * Updates all startup logoUrl fields to use locally-hosted brand banners.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Startup = require('../models/Startup');

const logoMap = {
  'Rentberry India':          '/images/rentberry_banner.png',
  'Gumroad Creator Hub':      '/images/gumroad_banner.png',
  'The Sports Bra Cafe':      '/images/sportsbra_banner.png',
  'Finless Foods Biotech':    '/images/finless_banner.png',
  'Happiness Insurance':      '/images/happiness_banner.png',
  'DTU EdTech Accelerators':  '/images/edtech_banner.png',
  'Delhi Tech Rover Labs':    '/images/rover_banner.png',
  'Bharat Krishi SaaS':       '/images/bharat_krishi_banner.png',
  'DTU CleanWater Solutions': '/images/cleanwater_banner.png',
  'Delhi Quantum Grid':       '/images/quantum_grid_banner.png',
  'Knightscope':              '/images/knightscope_banner.png',
  'Atombeam':                 '/images/atombeam_banner.png',
  'LiquidPiston':             '/images/liquidpiston_banner.png',
  'Fanbase':                  '/images/fanbase_banner.png',
  'Doroni Aerospace':         '/images/doroni_banner.png',
  'BOXABL':                   '/images/boxabl_banner.png',
  'Legion M Entertainment':   '/images/legionm_banner.png',
  'PSYONIC':                  '/images/knightscope_banner.png',
  'Cheers Health':            '/images/happiness_banner.png',
  'Greenfield Robotics':      '/images/bharat_krishi_banner.png',
  'Virtuix':                  '/images/edtech_banner.png',
  'GoSun':                    '/images/cleanwater_banner.png',
  'Fire Department Coffee':   '/images/gumroad_banner.png',
  'Flower Turbines':          '/images/quantum_grid_banner.png',
  'Piestro':                  '/images/sportsbra_banner.png',
  'Trade Algo':               '/images/atombeam_banner.png',
  'Apis Cor':                 '/images/rover_banner.png',
  'Eli Electric Vehicles':    '/images/doroni_banner.png',
  'Honeybee Burger':          '/images/finless_banner.png',
  'SapientX':                 '/images/liquidpiston_banner.png',
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elevate');
  console.log('Connected to MongoDB');

  let updated = 0;
  for (const [name, logoUrl] of Object.entries(logoMap)) {
    const result = await Startup.updateMany({ name }, { $set: { logoUrl } });
    if (result.modifiedCount > 0) {
      console.log(`✅ ${name} → ${logoUrl}`);
      updated += result.modifiedCount;
    } else {
      console.log(`⚠️  No match for: ${name}`);
    }
  }

  console.log(`\nDone. Updated ${updated} startup(s).`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
