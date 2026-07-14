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
  'PSYONIC':                  '/images/psyonic_banner.svg',
  'Cheers Health':            '/images/cheers_banner.svg',
  'Greenfield Robotics':      '/images/greenfield_rob_banner.svg',
  'Virtuix':                  '/images/virtuix_banner.svg',
  'GoSun':                    '/images/gosun_banner.svg',
  'Fire Department Coffee':   '/images/firedept_banner.svg',
  'Flower Turbines':          '/images/flower_turbines_banner.svg',
  'Piestro':                  '/images/piestro_banner.svg',
  'Trade Algo':               '/images/tradealgo_banner.svg',
  'Apis Cor':                 '/images/apiscor_banner.svg',
  'Eli Electric Vehicles':    '/images/eliev_banner.svg',
  'Honeybee Burger':          '/images/honeybee_banner.svg',
  'SapientX':                 '/images/sapientx_banner.svg',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crowdfunding');
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
