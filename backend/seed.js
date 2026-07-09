require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Startup = require('./models/startup');
const Investment = require('./models/investment');
const Blog = require('./models/blog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfunding';

async function seedDatabase() {
  try {
    // If called from server.js, mongoose is already connected. If standalone, connect.
    if (mongoose.connection.readyState === 0) {
      console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
      await mongoose.connect(MONGO_URI);
    }

    console.log('Running robust idempotent seed check...');

    // 1. Seed Admin if missing
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        name: 'System Admin',
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        walletBalance: 0
      });
      await adminUser.save();
      console.log('Seeded Admin: admin@example.com / admin123  (username: admin)');
    } else {
      console.log('Admin user already exists. Skipping Admin seed.');
    }

    // 2. Seed Investor if missing (only pre-defined account)
    const investorExists = await User.findOne({ username: 'investor' });
    if (!investorExists) {
      const investorPasswordHash = await bcrypt.hash('investor123', 10);
      const investorUser = new User({
        name: 'Demo Investor',
        username: 'investor',
        email: 'investor@example.com',
        passwordHash: investorPasswordHash,
        role: 'investor',
        walletBalance: 1000000,
        portfolio: []
      });
      await investorUser.save();
      console.log('Seeded Investor: investor@example.com / investor123  (username: investor)');
    } else {
      console.log('Investor user already exists. Skipping Investor seed.');
    }

    // NOTE: Only these 2 accounts exist by default. All other users must register.

    // 3. Seed Startups if missing
    const startupsCount = await Startup.countDocuments();
    if (startupsCount === 0) {
      console.log('No startups found. Seeding default startups...');
      const approvedStartups = [
      {
        name: 'Rentberry India',
        category: 'Real Estate / PropTech',
        founderName: 'Alex Lubinsky',
        status: 'approved',
        marketingMixVariables: 'Product: Next-generation home renting platform with e-lease signing. Price: Service fee on rental transactions. Place: India digital roll-out. Promotion: SEO and real estate agent partnerships.',
        financialProcurement: 'Capital Budgeting: ₹5 Crore for Indian tier-1 city marketing. Supply Chain: Digital AWS hosting.',
        pastValuations: [800000000, 1000000000, 1150000000],
        raisedAmount: 103000000,
        tagline: 'Next-generation home renting platform',
        logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 25000,
        valuationCap: 1150000000,
        targetGoal: 50000000,
        maxGoal: 150000000,
        pricePerShare: 200,
        securityType: 'Crowd SAFE',
        totalInvestors: 8200,
        daysLeft: 15,
        isPrimaryMarket: true
      },
      {
        name: 'Gumroad Creator Hub',
        category: 'SaaS / Creator Economy',
        founderName: 'Sahil Lavingia',
        status: 'approved',
        marketingMixVariables: 'Product: E-commerce platform for digital creators to sell assets. Price: Flat 10% transaction fee. Place: Global web service. Promotion: Twitter, creator newsletters.',
        financialProcurement: 'Capital Budgeting: Hiring software developers, regional gateway integration. Supply Chain: Fully remote logistics.',
        pastValuations: [400000000, 750000000, 830000000],
        raisedAmount: 41000000,
        tagline: 'E-commerce platform for creators',
        logoUrl: 'https://assets.gumroad.com/images/opengraph_image.png',
        minimumInvestment: 1000,
        valuationCap: 830000000,
        targetGoal: 10000000,
        maxGoal: 50000000,
        pricePerShare: 80,
        securityType: 'Crowd SAFE',
        totalInvestors: 8600,
        daysLeft: 10,
        isPrimaryMarket: true
      },
      {
        name: 'The Sports Bra Cafe',
        category: 'Food & Beverage',
        founderName: 'Jenny Nguyen',
        status: 'approved',
        marketingMixVariables: "Product: Casual bar and restaurant showing exclusively women's sports events. Price: Standard menu pricing with merchandise sales. Place: Physical cafe hubs. Promotion: Sports press and local community marketing.",
        financialProcurement: 'Capital Budgeting: Physical kitchen and expansion assets. Supply Chain: Sustainable food and beverage sourcing.',
        pastValuations: [60000000, 80000000, 100000000],
        raisedAmount: 9000000,
        tagline: "The world's first sports bar dedicated to women's sports",
        logoUrl: 'https://thesportsbraofficial.com/cdn/shop/files/Raised_Type_-_White2_sm.png?width=1200',
        minimumInvestment: 20000,
        valuationCap: 100000000,
        targetGoal: 5000000,
        maxGoal: 15000000,
        pricePerShare: 400,
        securityType: 'Crowd SAFE',
        totalInvestors: 1420,
        daysLeft: 24,
        isPrimaryMarket: true
      },
      {
        name: 'Finless Foods Biotech',
        category: 'Biotech / FoodTech',
        founderName: 'Michael Selden',
        status: 'approved',
        marketingMixVariables: 'Product: Cell-cultured tuna meat grown from cells. Price: Premium B2B seafood wholesale pricing. Place: Premium sushi bars and distributors. Promotion: Culinary sponsorship.',
        financialProcurement: 'Capital Budgeting: Lab bioreactor scaling and food safety trials. Supply Chain: Specialized bio-media supply lines.',
        pastValuations: [120000000, 160000000, 200000000],
        raisedAmount: 29000000,
        tagline: 'Cultured seafood from cells, starting with bluefin tuna',
        logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 20000,
        valuationCap: 200000000,
        targetGoal: 20000000,
        maxGoal: 40000000,
        pricePerShare: 1000,
        securityType: 'Preferred Stock',
        totalInvestors: 1100,
        daysLeft: 12,
        isPrimaryMarket: true
      },
      {
        name: 'Happiness Insurance',
        category: 'Insurtech / Fintech',
        founderName: 'Daniel Schreiber',
        status: 'approved',
        marketingMixVariables: 'Product: AI-driven customized health and life insurance policies. Price: Monthly subscription premiums. Place: Mobile app. Promotion: App store optimization, online ads.',
        financialProcurement: 'Capital Budgeting: AI risk-modeling algorithms. Supply Chain: Digital delivery nodes.',
        pastValuations: [150000000, 220000000, 290000000],
        raisedAmount: 10400000,
        tagline: 'AI-driven personalized health and life insurance',
        logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 20000,
        valuationCap: 290000000,
        targetGoal: 10000000,
        maxGoal: 25000000,
        pricePerShare: 650,
        securityType: 'Crowd SAFE',
        totalInvestors: 780,
        daysLeft: 8,
        isPrimaryMarket: true
      },
      {
        name: 'DTU EdTech Accelerators',
        category: 'Education / EdTech',
        founderName: 'Dr. Vivek Kumar',
        status: 'approved',
        marketingMixVariables: 'Product: Virtual reality science labs for schools. Price: Annual school licensing. Place: Cloud platform. Promotion: Direct sales to educational institutions.',
        financialProcurement: 'Capital Budgeting: Content development and 3D modeling. Supply Chain: Digital licensing models.',
        pastValuations: [50000000, 80000000],
        raisedAmount: 12000000,
        tagline: 'Pioneering digital education hubs for technical learning',
        logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 10000,
        valuationCap: 80000000,
        targetGoal: 10000000,
        maxGoal: 30000000,
        pricePerShare: 150,
        securityType: 'Common Stock',
        totalInvestors: 450,
        daysLeft: 30,
        isPrimaryMarket: false
      },
      {
        name: 'Delhi Tech Rover Labs',
        category: 'Hardware / Robotics',
        founderName: 'Neha Verma',
        status: 'approved',
        marketingMixVariables: 'Product: Semi-autonomous industrial rover systems. Price: ₹5 Lakh per unit. Place: Direct sales. Promotion: Expo demonstrations.',
        financialProcurement: 'Capital Budgeting: Hardware labs assembly setup. Supply Chain: Custom local fabricators.',
        pastValuations: [30000000, 50000000],
        raisedAmount: 8500000,
        tagline: 'Semi-autonomous industrial rover systems',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 25000,
        valuationCap: 50000000,
        targetGoal: 5000000,
        maxGoal: 15000000,
        pricePerShare: 500,
        securityType: 'Crowd SAFE',
        totalInvestors: 180,
        daysLeft: 40,
        isPrimaryMarket: false
      },
      {
        name: 'Bharat Krishi SaaS',
        category: 'Agriculture / Agritech',
        founderName: 'Amit Patel',
        status: 'approved',
        marketingMixVariables: 'Product: Soil analysis advisory platform. Price: ₹500/month. Place: Android app. Promotion: Agricultural cooperatives.',
        financialProcurement: 'Capital Budgeting: Servers and database. Supply Chain: Digital advisory logs.',
        pastValuations: [3000000, 8000000],
        raisedAmount: 3500000,
        tagline: 'Soil advisory and smart farmer planning systems',
        logoUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 10000,
        valuationCap: 8000000,
        targetGoal: 2000000,
        maxGoal: 5000000,
        pricePerShare: 100,
        securityType: 'Common Stock',
        totalInvestors: 320,
        daysLeft: 45,
        isPrimaryMarket: false
      },
      {
        name: 'DTU CleanWater Solutions',
        category: 'Clean Energy / Cleantech',
        founderName: 'Sanjay Dutt',
        status: 'approved',
        marketingMixVariables: 'Product: Eco-friendly filtration modules for rural communities. Price: Subscription filter replacement. Place: Micro-distribution. Promotion: Local NGOs.',
        financialProcurement: 'Capital Budgeting: Manufacturing filters and membrane sourcing. Supply Chain: Sustainable plastic components.',
        pastValuations: [15000000, 30000000],
        raisedAmount: 5000000,
        tagline: 'Eco-friendly filtration modules for rural communities',
        logoUrl: 'https://dtu.ac.in/Web/images/ImageLogo.jpg',
        minimumInvestment: 15000,
        valuationCap: 30000000,
        targetGoal: 4000000,
        maxGoal: 10000000,
        pricePerShare: 300,
        securityType: 'Preferred Stock',
        totalInvestors: 190,
        daysLeft: 20,
        isPrimaryMarket: false
      },
      {
        name: 'Delhi Quantum Grid',
        category: 'Deep Tech / Cybersecurity',
        founderName: 'Kunal Sen',
        status: 'approved',
        marketingMixVariables: 'Product: Quantum cryptography and secured data nodes. Price: Monthly cloud server integration. Place: Cloud enterprise dashboard. Promotion: Security symposiums.',
        financialProcurement: 'Capital Budgeting: Quantum computation servers. Supply Chain: Secure optic hardware nodes.',
        pastValuations: [80000000, 150000000],
        raisedAmount: 18000000,
        tagline: 'Quantum cryptography and secured data nodes',
        logoUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 50000,
        valuationCap: 150000000,
        targetGoal: 10000000,
        maxGoal: 30000000,
        pricePerShare: 1500,
        securityType: 'Crowd SAFE',
        totalInvestors: 240,
        daysLeft: 35,
        isPrimaryMarket: false
      },
      // ── 5 companies sourced from StartEngine ──
      {
        name: 'Knightscope',
        category: 'AI / Security Robotics',
        founderName: 'William Santana Li',
        status: 'approved',
        tagline: 'Fully autonomous security robots patrolling the USA 24/7/365',
        description: 'Knightscope designs and builds AI-driven autonomous security robots that patrol hospitals, logistics facilities, manufacturing plants, schools, and corporations. With over 10,000 investors and $40M+ raised, Knightscope is the future of public safety.',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
        marketingMixVariables: 'Product: Autonomous security robot fleet (K1, K3, K5 models). Price: Machine-as-a-Service subscription. Place: Direct enterprise sales across US cities. Promotion: Security trade shows and press coverage.',
        financialProcurement: 'Capital Budgeting: Robot manufacturing and AI R&D labs. Supply Chain: US-based hardware sourcing and assembly.',
        pastValuations: [180000000, 260000000, 340000000],
        raisedAmount: 40000000,
        minimumInvestment: 200,
        valuationCap: 340000000,
        targetGoal: 20000000,
        maxGoal: 75000000,
        pricePerShare: 200,
        securityType: 'Preferred Stock',
        totalInvestors: 10800,
        daysLeft: 18,
        isPrimaryMarket: true
      },
      {
        name: 'Atombeam',
        category: 'AI / Data Communications',
        founderName: 'Charles Yeomans',
        status: 'approved',
        tagline: 'AI that sends 2–4x more data over existing networks with added security',
        description: "AtomBeam's AI software compresses and transmits machine data 2–4× more efficiently over existing networks. It's a force multiplier for IoT, satellite, and edge communications — without replacing any hardware.",
        logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
        marketingMixVariables: 'Product: AI data compression SDK for machine communications. Price: Per-device licensing SaaS model. Place: B2B enterprise and government contracts. Promotion: Defense tech and IoT industry conferences.',
        financialProcurement: 'Capital Budgeting: AI research and SDK development. Supply Chain: Cloud infrastructure and partner integrations.',
        pastValuations: [45000000, 90000000, 130000000],
        raisedAmount: 8700000,
        minimumInvestment: 648,
        valuationCap: 130000000,
        targetGoal: 5000000,
        maxGoal: 20000000,
        pricePerShare: 648,
        securityType: 'Common Stock',
        totalInvestors: 2400,
        daysLeft: 22,
        isPrimaryMarket: true
      },
      {
        name: 'LiquidPiston',
        category: 'Deep Tech / Advanced Engines',
        founderName: 'Alexander Shkolnik',
        status: 'approved',
        tagline: 'Revolutionary rotary engine tech — 10x smaller, lighter, quieter than conventional engines',
        description: 'LiquidPiston has developed the X-Engine, a breakthrough rotary combustion engine that is 10× smaller and lighter than comparable diesel or gasoline engines. Funded by DARPA and the US Army, it targets drones, robotics, generators, and hybrid vehicles.',
        logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
        marketingMixVariables: 'Product: X-Engine rotary combustion engine platform. Price: Government contract and B2B licensing. Place: Defense, aerospace, and robotics OEMs. Promotion: DARPA showcases and engineering publications.',
        financialProcurement: 'Capital Budgeting: Precision manufacturing and engine testing. Supply Chain: Aerospace-grade materials and machining.',
        pastValuations: [60000000, 110000000, 170000000],
        raisedAmount: 12500000,
        minimumInvestment: 250,
        valuationCap: 170000000,
        targetGoal: 10000000,
        maxGoal: 30000000,
        pricePerShare: 500,
        securityType: 'Crowd SAFE',
        totalInvestors: 5600,
        daysLeft: 14,
        isPrimaryMarket: true
      },
      {
        name: 'Fanbase',
        category: 'Social Media / Creator Economy',
        founderName: 'Isaac Hayes III',
        status: 'approved',
        tagline: 'The social media platform where creators actually get paid by their fans',
        description: 'Fanbase is a short-video social platform built for creators and fans of color. Unlike Instagram or TikTok, Fanbase lets fans directly pay creators through subscriptions, tips, and exclusive content — giving creators 100% ownership of their audience.',
        logoUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=400&q=80',
        marketingMixVariables: 'Product: Short-video creator subscription platform. Price: Fan subscription plans from $4.99/mo. Place: iOS and Android apps. Promotion: Influencer partnerships and Black culture media.',
        financialProcurement: 'Capital Budgeting: Platform development and creator acquisition. Supply Chain: AWS cloud infrastructure.',
        pastValuations: [25000000, 50000000, 80000000],
        raisedAmount: 6200000,
        minimumInvestment: 100,
        valuationCap: 80000000,
        targetGoal: 5000000,
        maxGoal: 15000000,
        pricePerShare: 1,
        securityType: 'Common Stock',
        totalInvestors: 3900,
        daysLeft: 31,
        isPrimaryMarket: true
      },
      {
        name: 'Doroni Aerospace',
        category: 'Aerospace / Urban Air Mobility',
        founderName: 'Doron Merdinger',
        status: 'approved',
        tagline: 'Personal flying car for your garage — the H1 eVTOL',
        description: "Doroni Aerospace is building the H1, a personal electric vertical takeoff and landing (eVTOL) aircraft designed to fit in a standard garage. FAA G1 Issue Paper accepted. The H1 seats 2, flies 60mph, and requires only a sport pilot license to operate.",
        logoUrl: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=400&q=80',
        marketingMixVariables: 'Product: H1 personal 2-seat eVTOL aircraft. Price: $195,000 per unit (pre-order). Place: Direct-to-consumer sales in the US. Promotion: Airshow demos and aviation media.',
        financialProcurement: 'Capital Budgeting: FAA certification, prototype manufacturing. Supply Chain: Electric motor and battery pack sourcing.',
        pastValuations: [40000000, 75000000, 120000000],
        raisedAmount: 5800000,
        minimumInvestment: 500,
        valuationCap: 120000000,
        targetGoal: 5000000,
        maxGoal: 20000000,
        pricePerShare: 500,
        securityType: 'Crowd SAFE',
        totalInvestors: 1850,
        daysLeft: 27,
        isPrimaryMarket: true
      },

      // ── 15 more real companies from StartEngine / Wefunder / Republic ──
      {
        name: 'BOXABL',
        category: 'Real Estate / PropTech',
        founderName: 'Galiano Tiramani',
        status: 'approved',
        tagline: 'A house that folds up like a product and ships anywhere in the world',
        marketingMixVariables: 'Product: Casita — a foldable 361 sq ft home. Price: $49,500 per unit. Place: Factory-direct shipping. Promotion: Viral social media and celebrity attention.',
        financialProcurement: 'Capital Budgeting: Factory automation and mass production. Supply Chain: Steel panel manufacturing in Nevada.',
        pastValuations: [500000000, 1200000000, 3500000000],
        raisedAmount: 235000000,
        tagline: 'Foldable, factory-built homes — shipped anywhere in the world',
        logoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 800,
        valuationCap: 3500000000,
        targetGoal: 50000000,
        maxGoal: 75000000,
        pricePerShare: 0.8,
        securityType: 'Common Stock',
        totalInvestors: 62000,
        daysLeft: 9,
        isPrimaryMarket: true
      },
      {
        name: 'Legion M Entertainment',
        category: 'Entertainment / Media',
        founderName: 'Paul Scanlan & Jeff Annison',
        status: 'approved',
        tagline: "The world's first fan-owned entertainment company",
        marketingMixVariables: 'Product: Fan-owned film studio producing movies, comics, and events. Price: Shares from $1. Place: Digital and theatrical distribution. Promotion: Fan community and convention presence.',
        financialProcurement: 'Capital Budgeting: Film development, marketing, and talent. Supply Chain: Studio partnerships and streaming deals.',
        pastValuations: [13500000, 48500000, 92000000],
        raisedAmount: 11000000,
        logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 92000000,
        targetGoal: 5000000,
        maxGoal: 12000000,
        pricePerShare: 1,
        securityType: 'Common Stock',
        totalInvestors: 60000,
        daysLeft: 33,
        isPrimaryMarket: true
      },
      {
        name: 'PSYONIC',
        category: 'Healthcare / Bionics',
        founderName: 'Dr. Aadeel Akhtar',
        status: 'approved',
        tagline: 'The world\'s most advanced touch-sensing bionic arm — available to all',
        marketingMixVariables: 'Product: Ability Hand — multi-grip bionic prosthetic with sense of touch. Price: $25,000 per unit via insurance. Place: Clinics and VA hospitals. Promotion: Shark Tank, NASA, and Meta partnerships.',
        financialProcurement: 'Capital Budgeting: Manufacturing scale-up and FDA clearance. Supply Chain: Robotic components and medical-grade materials.',
        pastValuations: [50000000, 65000000, 95000000],
        raisedAmount: 3100000,
        logoUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 500,
        valuationCap: 95000000,
        targetGoal: 3000000,
        maxGoal: 10000000,
        pricePerShare: 250,
        securityType: 'Common Stock',
        totalInvestors: 4200,
        daysLeft: 19,
        isPrimaryMarket: true
      },
      {
        name: 'Cheers Health',
        category: 'Health & Wellness / CPG',
        founderName: 'Brooks Powell',
        status: 'approved',
        tagline: 'Science-backed supplements to support your liver & gut when you drink',
        marketingMixVariables: 'Product: Restore capsules and Cheers beverages for alcohol-related health. Price: $34.99 per pack. Place: DTC website and Amazon. Promotion: Shark Tank appearance and social influencers.',
        financialProcurement: 'Capital Budgeting: Product development and retail expansion. Supply Chain: FDA-compliant supplement manufacturing.',
        pastValuations: [20000000, 35000000, 49450000],
        raisedAmount: 1764919,
        logoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 49450000,
        targetGoal: 1000000,
        maxGoal: 5000000,
        pricePerShare: 10,
        securityType: 'Common Stock',
        totalInvestors: 1530,
        daysLeft: 42,
        isPrimaryMarket: false
      },
      {
        name: 'Greenfield Robotics',
        category: 'Agriculture / Agritech Robotics',
        founderName: 'Clint Brauer',
        status: 'approved',
        tagline: 'Autonomous weeding robots eliminating herbicides from US farmland',
        marketingMixVariables: 'Product: Robot-as-a-Service fleet for chemical-free weeding. Price: Per-acre subscription. Place: US Midwest farms. Promotion: Chipotle investment and agribusiness partnerships.',
        financialProcurement: 'Capital Budgeting: Fleet expansion and sensor R&D. Supply Chain: Custom robot chassis and precision cutting tools.',
        pastValuations: [15000000, 28000000, 39950000],
        raisedAmount: 16000000,
        logoUrl: 'https://d19j0qt0x55bap.cloudfront.net/production/startups/6997c4a727012e03bbd3b6f6/images/startup_cover/desktop_greenfield_video_hero.jpg',
        minimumInvestment: 250,
        valuationCap: 39950000,
        targetGoal: 2000000,
        maxGoal: 8000000,
        pricePerShare: 125,
        securityType: 'Crowd SAFE',
        totalInvestors: 2600,
        daysLeft: 25,
        isPrimaryMarket: false
      },
      {
        name: 'Virtuix',
        category: 'Gaming / VR Hardware',
        founderName: 'Jan Goetgeluk',
        status: 'approved',
        tagline: 'Walk and run freely inside your VR games with the Omni Arena platform',
        marketingMixVariables: 'Product: Omni One home VR treadmill and Omni Arena commercial pods. Price: $2,995 for Omni One. Place: Home gamers and location-based entertainment. Promotion: E-sports events and gaming conventions.',
        financialProcurement: 'Capital Budgeting: Consumer hardware production. Supply Chain: Precision motion platform components.',
        pastValuations: [40000000, 65000000, 90000000],
        raisedAmount: 17000000,
        logoUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 500,
        valuationCap: 90000000,
        targetGoal: 5000000,
        maxGoal: 20000000,
        pricePerShare: 10,
        securityType: 'Common Stock',
        totalInvestors: 5800,
        daysLeft: 16,
        isPrimaryMarket: true
      },
      {
        name: 'GoSun',
        category: 'Clean Energy / Consumer',
        founderName: 'Patrick Sherwin',
        status: 'approved',
        tagline: 'Solar-powered portable cooking and power solutions for the modern world',
        marketingMixVariables: 'Product: Solar stoves, fridges, and portable power stations. Price: $299–$1,299. Place: Amazon, REI, and direct online. Promotion: Outdoor and sustainability media.',
        financialProcurement: 'Capital Budgeting: Product R&D and supply chain. Supply Chain: Solar cell and vacuum tube sourcing.',
        pastValuations: [18000000, 28000000, 42000000],
        raisedAmount: 4200000,
        logoUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 42000000,
        targetGoal: 2000000,
        maxGoal: 7000000,
        pricePerShare: 5,
        securityType: 'Common Stock',
        totalInvestors: 3100,
        daysLeft: 38,
        isPrimaryMarket: false
      },
      {
        name: 'Fire Department Coffee',
        category: 'Food & Beverage / CPG',
        founderName: 'Luke Schneider',
        status: 'approved',
        tagline: 'Bold, fire-roasted coffee built by firefighters — 10% to first responder charities',
        marketingMixVariables: 'Product: Premium roasted coffee and merchandise. Price: $15–$25 per bag. Place: DTC, Amazon, and 500+ retail stores. Promotion: Veteran and first responder community loyalty.',
        financialProcurement: 'Capital Budgeting: Roasting facility expansion. Supply Chain: Direct-trade green coffee imports.',
        pastValuations: [12000000, 22000000, 38000000],
        raisedAmount: 3800000,
        logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 38000000,
        targetGoal: 2000000,
        maxGoal: 6000000,
        pricePerShare: 8,
        securityType: 'Common Stock',
        totalInvestors: 2200,
        daysLeft: 44,
        isPrimaryMarket: false
      },
      {
        name: 'Flower Turbines',
        category: 'Clean Energy / Wind Tech',
        founderName: 'Dr. Mark Moore',
        status: 'approved',
        tagline: 'Beautiful tulip-shaped wind turbines for urban rooftops and communities',
        marketingMixVariables: 'Product: Compact vertical-axis wind turbines for buildings. Price: $7,000–$25,000 per turbine. Place: Urban and suburban rooftops. Promotion: Clean energy incentive programs and B2B sales.',
        financialProcurement: 'Capital Budgeting: Manufacturing and testing. Supply Chain: Composite materials and motors.',
        pastValuations: [10000000, 20000000, 35000000],
        raisedAmount: 2900000,
        logoUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 250,
        valuationCap: 35000000,
        targetGoal: 1500000,
        maxGoal: 5000000,
        pricePerShare: 5,
        securityType: 'Crowd SAFE',
        totalInvestors: 1700,
        daysLeft: 52,
        isPrimaryMarket: false
      },
      {
        name: 'Piestro',
        category: 'Food Tech / Robotics',
        founderName: 'Massimo Noja De Marco',
        status: 'approved',
        tagline: 'Fully automated pizza kiosk that makes a custom pizza in under 5 minutes',
        marketingMixVariables: 'Product: Robot pizza kiosk (Artisan Pizzeria). Price: Franchise-as-a-Service. Place: Airports, malls, and stadiums. Promotion: Food tech press and operator partnerships.',
        financialProcurement: 'Capital Budgeting: Kiosk manufacturing and software. Supply Chain: Commercial kitchen robotics and ingredients.',
        pastValuations: [20000000, 35000000, 55000000],
        raisedAmount: 5500000,
        logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 500,
        valuationCap: 55000000,
        targetGoal: 3000000,
        maxGoal: 10000000,
        pricePerShare: 100,
        securityType: 'Crowd SAFE',
        totalInvestors: 2900,
        daysLeft: 21,
        isPrimaryMarket: true
      },
      {
        name: 'Trade Algo',
        category: 'Fintech / AI Trading',
        founderName: 'David Bhindi',
        status: 'approved',
        tagline: 'AI-powered institutional-grade trading intelligence for retail investors',
        marketingMixVariables: 'Product: Trade Algo platform — real-time dark pool and institutional flow data. Price: $197/mo subscription. Place: Web and mobile app. Promotion: Social trading community and YouTube.',
        financialProcurement: 'Capital Budgeting: AI model development and data licensing. Supply Chain: Market data feeds and cloud infrastructure.',
        pastValuations: [50000000, 80000000, 120000000],
        raisedAmount: 7600000,
        logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 250,
        valuationCap: 120000000,
        targetGoal: 5000000,
        maxGoal: 15000000,
        pricePerShare: 10,
        securityType: 'Common Stock',
        totalInvestors: 3400,
        daysLeft: 29,
        isPrimaryMarket: true
      },
      {
        name: 'Apis Cor',
        category: 'Construction Tech / 3D Printing',
        founderName: 'Anna Cheniuntai',
        status: 'approved',
        tagline: 'A 3D printer that builds a full house on-site in just 24 hours',
        marketingMixVariables: 'Product: Mobile construction 3D printer and printing services. Price: $50/sq ft printed. Place: US and international government contracts. Promotion: Guinness World Record and NASA partnerships.',
        financialProcurement: 'Capital Budgeting: Printer fleet and material R&D. Supply Chain: Proprietary concrete mix and robotic arm.',
        pastValuations: [30000000, 55000000, 85000000],
        raisedAmount: 6100000,
        logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 85000000,
        targetGoal: 3000000,
        maxGoal: 10000000,
        pricePerShare: 50,
        securityType: 'Crowd SAFE',
        totalInvestors: 3800,
        daysLeft: 36,
        isPrimaryMarket: true
      },
      {
        name: 'Eli Electric Vehicles',
        category: 'Electric Vehicles / Micro-Mobility',
        founderName: 'Giovanni Rubin',
        status: 'approved',
        tagline: 'A tiny neighborhood EV that parks anywhere and costs less than a scooter',
        marketingMixVariables: 'Product: ZERO and ZERO+ micro electric vehicle (no highway). Price: $9,995. Place: DTC online and dealerships. Promotion: Urban lifestyle media and sustainability influencers.',
        financialProcurement: 'Capital Budgeting: Vehicle manufacturing and safety testing. Supply Chain: EV battery cells and lightweight frame production.',
        pastValuations: [25000000, 40000000, 65000000],
        raisedAmount: 5400000,
        logoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 300,
        valuationCap: 65000000,
        targetGoal: 3000000,
        maxGoal: 9000000,
        pricePerShare: 15,
        securityType: 'Common Stock',
        totalInvestors: 2800,
        daysLeft: 47,
        isPrimaryMarket: false
      },
      {
        name: 'Honeybee Burger',
        category: 'Food & Beverage / Fast Casual',
        founderName: 'Sarah Kramer',
        status: 'approved',
        tagline: 'The plant-based burger joint that actually tastes like a real burger',
        marketingMixVariables: 'Product: Plant-based smash burgers, fries, and shakes. Price: $10–$15 per meal. Place: LA and expanding US locations. Promotion: Celebrity chef endorsements and vegan media.',
        financialProcurement: 'Capital Budgeting: Restaurant build-outs and franchising. Supply Chain: Local sustainable produce and plant-based proteins.',
        pastValuations: [8000000, 15000000, 25000000],
        raisedAmount: 2100000,
        logoUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 100,
        valuationCap: 25000000,
        targetGoal: 1000000,
        maxGoal: 4000000,
        pricePerShare: 5,
        securityType: 'Common Stock',
        totalInvestors: 1400,
        daysLeft: 58,
        isPrimaryMarket: false
      },
      {
        name: 'SapientX',
        category: 'AI / Conversational Intelligence',
        founderName: 'Bill Byrne',
        status: 'approved',
        tagline: 'Human-like AI voice agents for kiosks, robots, and smart devices',
        marketingMixVariables: 'Product: Conversational AI SDK for embedded hardware. Price: Enterprise API licensing. Place: Robotics and kiosk OEMs. Promotion: Robotics trade shows and Metaverse developer ecosystem.',
        financialProcurement: 'Capital Budgeting: NLP model training and SDK development. Supply Chain: Cloud API infrastructure and edge deployment.',
        pastValuations: [20000000, 40000000, 70000000],
        raisedAmount: 4800000,
        logoUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 500,
        valuationCap: 70000000,
        targetGoal: 3000000,
        maxGoal: 8000000,
        pricePerShare: 20,
        securityType: 'Crowd SAFE',
        totalInvestors: 1900,
        daysLeft: 41,
        isPrimaryMarket: false
      }
    ];

    for (const item of approvedStartups) {
      // Give random numbers to target progress (avoid 100% target)
      // Set raisedAmount to a random percentage between 10% and 85% of targetGoal
      const randomPercent = 0.10 + Math.random() * 0.75;
      item.raisedAmount = Math.floor((item.targetGoal || 10000000) * randomPercent);
      
      // Scale investors accordingly to keep it realistic
      const minInvest = item.minimumInvestment || 10000;
      item.totalInvestors = Math.max(1, Math.floor((item.raisedAmount / minInvest) * (0.5 + Math.random() * 0.5)));

      const startup = new Startup(item);
      await startup.save();
    }
    console.log('Seeded 30 approved startups with randomized progress and realistic investor counts.');


    // 4. Seed Pending Startups
    const pendingStartups = [
      {
        name: 'AgroDrone India',
        category: 'Agriculture / Agritech',
        founderName: 'Rajesh Koothrapali',
        status: 'pending',
        marketingMixVariables: 'Product: Autonomous crop spraying drones. Price: ₹2 Lakh per unit. Place: Regional sales dealers. Promotion: Farmer demo days.',
        financialProcurement: 'Capital Budgeting: Carbon fiber manufacturing tooling. Supply Chain: Brushless motor sourcing.',
        pastValuations: [10000000, 15000000],
        raisedAmount: 0,
        tagline: 'Autonomous crop spraying drones',
        logoUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 15000,
        valuationCap: 15000000,
        targetGoal: 3000000,
        maxGoal: 6000000,
        pricePerShare: 250,
        securityType: 'Crowd SAFE',
        totalInvestors: 0,
        daysLeft: 55,
        isPrimaryMarket: false
      },
      {
        name: 'CareMed Telehealth',
        category: 'Healthcare / Healthtech',
        founderName: 'Dr. Sonia Sen',
        status: 'pending',
        marketingMixVariables: 'Product: Rural remote healthcare access nodes. Price: Per-consultation pricing models. Place: Digital clinics. Promotion: Health camps.',
        financialProcurement: 'Capital Budgeting: Custom medical hub tablets. Supply Chain: Diagnostic tool integrations.',
        pastValuations: [5000000, 12000000],
        raisedAmount: 0,
        tagline: 'Rural remote healthcare access nodes',
        logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
        minimumInvestment: 10000,
        valuationCap: 12000000,
        targetGoal: 2000000,
        maxGoal: 5000000,
        pricePerShare: 120,
        securityType: 'Preferred Stock',
        totalInvestors: 0,
        daysLeft: 50,
        isPrimaryMarket: false
      }
    ];

      for (const item of pendingStartups) {
        const startup = new Startup(item);
        await startup.save();
      }
      console.log('Seeded 2 pending startups.');
    } else {
      console.log(`Database already has ${startupsCount} startups. Skipping startups seed.`);
    }

    // 5. Seed Expert Analyst Blogs if missing
    const blogsCount = await Blog.countDocuments();
    if (blogsCount === 0) {
      console.log('No blogs found. Seeding expert blogs...');
      const expertBlogs = [
      {
        title: 'Why Early-Stage Crowdfunding Beats Traditional VC for Indian Startups',
        content: 'The venture capital ecosystem in India has long favoured late-stage bets, leaving a massive funding gap for seed and pre-Series A founders. Crowdfunding platforms like Elevate bridge that gap by democratising access to capital and allowing retail investors to participate in high-growth opportunities previously reserved for institutional players.\n\nKey insights: 1) Crowdfunding rounds close 3x faster than traditional VC in India. 2) Retail investor participation increases startup visibility and creates early adopter communities. 3) SEBI\'s new framework for alternative investment funds (AIFs) is making it easier for platforms like Elevate to operate in compliance.',
        author: 'Elevate Research Team',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Top 5 Sectors to Watch in India's Startup Ecosystem — H2 2026",
        content: 'As we enter the second half of 2026, our analysts have identified five sectors poised for explosive growth: AgriTech, CleanEnergy, HealthTech, EdTech, and D2C Consumer Brands.\n\nAgriTech alone is expected to attract over ₹2,000 Crore in investments this year, driven by government procurement digitisation and rising farmer incomes. CleanEnergy startups are benefiting from India\'s ambitious 500GW renewable energy target by 2030.\n\nOur recommendation: diversify your portfolio across at least 3 sectors to hedge sector-specific risk while capitalising on India\'s multi-decade growth story.',
        author: 'Elevate Market Analyst',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Understanding Valuation Caps and SAFE Notes — A Guide for New Investors',
        content: 'If you are new to startup investing, two terms will appear constantly: Valuation Cap and SAFE Notes (Simple Agreement for Future Equity). Understanding them is essential before deploying capital.\n\nA Valuation Cap sets the maximum company valuation at which your investment converts to equity in a future funding round. This protects early investors from excessive dilution.\n\nA SAFE Note is an agreement to receive equity in the future (typically at the next funding round) in exchange for capital today. Unlike convertible notes, SAFEs do not accrue interest or have a maturity date, making them simpler for both parties.\n\nAt Elevate, all listed startups disclose their security type and valuation cap upfront on each deal page.',
        author: 'Elevate Research Team',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Portfolio Diversification 101: How to Build a Resilient Startup Portfolio',
        content: 'Startup investing carries inherent risk — statistically, 9 out of 10 startups fail within their first decade. However, a well-diversified portfolio across sectors, stages, and geographies can significantly improve your risk-adjusted returns.\n\nOur recommended strategy for retail investors: 1) Invest in at least 8-10 startups to achieve meaningful diversification. 2) Limit any single startup to no more than 20% of your total startup allocation. 3) Mix primary market (new rounds) and secondary market (existing shareholders) deals. 4) Re-invest returns from successful exits into new deals.\n\nRemember: startup investing is a long-term game. Expect a 5-7 year horizon for most investments to mature.',
        author: 'Elevate Market Analyst',
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Due Diligence Checklist: What to Review Before Investing in a Startup',
        content: 'Before committing capital to any startup on Elevate, run through this essential due diligence checklist:\n\n✅ Founding Team: Do the founders have relevant domain expertise? Have they built and scaled a business before?\n✅ Market Size: Is the Total Addressable Market (TAM) large enough to support a ₹500Cr+ company?\n✅ Revenue Model: Is the business model proven? Are there existing paying customers?\n✅ Valuation: Is the current valuation justified relative to revenue multiples in the sector?\n✅ Cap Table: Is the cap table clean? Are there any red flags in previous funding rounds?\n✅ Use of Funds: Is the allocation of raised capital clearly defined and realistic?\n\nAt Elevate, all approved startups have passed our internal review process, but thorough personal due diligence is always recommended.',
        author: 'Elevate Research Team',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ];

      for (const blogData of expertBlogs) {
        const blog = new Blog(blogData);
        await blog.save();
      }
      console.log('Seeded 5 expert analyst blogs.');
    } else {
      console.log(`Database already has ${blogsCount} blogs. Skipping blogs seed.`);
    }

    console.log('Seeding completed successfully.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

if (require.main === module) {
  seedDatabase();
} else {
  module.exports = seedDatabase;
}
