const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../frontend/public/images');

const startups = [
  {
    filename: 'psyonic_banner.svg',
    name: 'PSYONIC',
    category: 'Biotech / Robotics',
    tagline: 'Bionic limbs for the next generation.',
    colors: ['#0f172a', '#4338ca'],
    icon: `
      <!-- Stylized Robotic Arm / Hand -->
      <g stroke="#60a5fa" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M40 70 h20 l10 -15 h15" />
        <path d="M40 85 h25 l12 -10 h15" />
        <path d="M40 100 h20 l10 15 h15" />
        <rect x="25" y="60" width="15" height="50" rx="3" fill="#60a5fa" opacity="0.2" />
        <circle cx="32" cy="85" r="4" fill="#60a5fa" />
      </g>
    `
  },
  {
    filename: 'cheers_banner.svg',
    name: 'Cheers Health',
    category: 'Health & Wellness / CPG',
    tagline: 'Science-backed supplements for liver & gut.',
    colors: ['#064e3b', '#059669'],
    icon: `
      <!-- Shield and Healing Cross -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M45 40 C65 40 75 48 75 65 C75 90 55 105 45 110 C35 105 15 90 15 65 C15 48 25 40 45 40 Z" fill="#34d399" opacity="0.2" stroke="#34d399" stroke-width="4" />
        <path d="M45 55 v20 M35 65 h20" stroke="#34d399" stroke-width="6" />
      </g>
    `
  },
  {
    filename: 'greenfield_rob_banner.svg',
    name: 'Greenfield Robotics',
    category: 'Agriculture / Agritech Robotics',
    tagline: 'Autonomous weeding robots eliminating herbicides.',
    colors: ['#1c1917', '#78716c'],
    icon: `
      <!-- Robot Tractor and Plant leaf -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Robot chassis -->
        <rect x="20" y="60" width="50" height="30" rx="5" stroke="#a8a29e" stroke-width="4" fill="#a8a29e" opacity="0.2" />
        <!-- Wheels -->
        <circle cx="32" cy="95" r="10" stroke="#a8a29e" stroke-width="4" />
        <circle cx="58" cy="95" r="10" stroke="#a8a29e" stroke-width="4" />
        <!-- Leaf sprouting -->
        <path d="M45 40 C55 40 60 50 45 60 C35 50 40 40 45 40 Z" fill="#86efac" />
        <path d="M45 50 v10" stroke="#86efac" stroke-width="2" />
      </g>
    `
  },
  {
    filename: 'virtuix_banner.svg',
    name: 'Virtuix',
    category: 'Gaming / VR Hardware',
    tagline: 'Walk and run freely inside your VR games.',
    colors: ['#1e1b4b', '#d946ef'],
    icon: `
      <!-- VR Headset / Running Man -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="20" y="55" width="50" height="26" rx="6" stroke="#f472b6" stroke-width="4" fill="#f472b6" opacity="0.2" />
        <path d="M30 68 h30 M20 68 h5 M65 68 h5" stroke="#f472b6" stroke-width="3" />
        <!-- Glowing VR band -->
        <path d="M25 55 C25 45 65 45 65 55" stroke="#f472b6" stroke-width="2" stroke-dasharray="4 2" />
        <circle cx="35" cy="68" r="3" fill="#f472b6" />
        <circle cx="55" cy="68" r="3" fill="#f472b6" />
      </g>
    `
  },
  {
    filename: 'gosun_banner.svg',
    name: 'GoSun',
    category: 'Clean Energy / Consumer',
    tagline: 'Solar-powered portable cooking and power.',
    colors: ['#7c2d12', '#ea580c'],
    icon: `
      <!-- Sun and Solar Ray -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="45" cy="65" r="18" stroke="#fbbf24" stroke-width="4" fill="#fbbf24" opacity="0.2" />
        <!-- Rays -->
        <path d="M45 35 v8 M45 87 v8 M15 65 h8 M77 65 h8 M24 44 l6 6 M66 86 l6 6 M24 86 l6 -6 M66 44 l6 -6" stroke="#fbbf24" stroke-width="3" />
      </g>
    `
  },
  {
    filename: 'firedept_banner.svg',
    name: 'Fire Department Coffee',
    category: 'Food & Beverage / Coffee',
    tagline: 'Freshly roasted coffee run by firefighters.',
    colors: ['#450a0a', '#b91c1c'],
    icon: `
      <!-- Flame and Coffee Mug -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M25 75 C25 85 35 90 45 90 C55 90 65 85 65 75 V50 H25 Z" stroke="#f87171" stroke-width="4" fill="#f87171" opacity="0.2" />
        <path d="M65 58 C72 58 75 62 75 67 C75 72 72 75 65 75" stroke="#f87171" stroke-width="4" />
        <!-- Fire Flame rising from mug -->
        <path d="M45 45 C48 35 43 25 45 15 C41 25 36 35 45 45 Z" fill="#f87171" />
      </g>
    `
  },
  {
    filename: 'flower_turbines_banner.svg',
    name: 'Flower Turbines',
    category: 'Clean Energy / Wind',
    tagline: 'Beautiful and quiet vertical-axis wind turbines.',
    colors: ['#0c4a6e', '#0284c7'],
    icon: `
      <!-- Tulip Wind Turbine / Flower Blades -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M45 90 V25" stroke="#38bdf8" stroke-width="4" />
        <!-- Blades resembling a tulip flower -->
        <path d="M45 35 C30 45 30 75 45 85 C60 75 60 45 45 35 Z" fill="#38bdf8" opacity="0.2" stroke="#38bdf8" stroke-width="3" />
        <path d="M45 35 C38 45 38 65 45 75" stroke="#38bdf8" stroke-width="2" />
        <path d="M45 35 C52 45 52 65 45 75" stroke="#38bdf8" stroke-width="2" />
      </g>
    `
  },
  {
    filename: 'piestro_banner.svg',
    name: 'Piestro',
    category: 'FoodTech / Automation',
    tagline: 'Automated artisanal pizza maker.',
    colors: ['#7c2d12', '#d97706'],
    icon: `
      <!-- Pizza and Gears -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="45" cy="65" r="22" stroke="#fbbf24" stroke-width="4" fill="#fbbf24" opacity="0.1" />
        <path d="M45 65 L45 43 M45 65 L60 80 M45 65 L27 75" stroke="#fbbf24" stroke-width="3" />
        <!-- Pizza crust edge segment -->
        <path d="M23 65 C23 45 40 28 60 30" stroke="#f87171" stroke-width="4" />
        <!-- Pepperoni dots -->
        <circle cx="35" cy="53" r="3" fill="#f87171" />
        <circle cx="55" cy="58" r="3" fill="#f87171" />
        <circle cx="48" cy="75" r="3" fill="#f87171" />
      </g>
    `
  },
  {
    filename: 'tradealgo_banner.svg',
    name: 'Trade Algo',
    category: 'FinTech / AI Trading',
    tagline: 'AI-driven stock and options trading.',
    colors: ['#0f172a', '#2563eb'],
    icon: `
      <!-- Stock chart line and Sparkles -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 85 L40 60 L55 70 L75 35" stroke="#60a5fa" stroke-width="4" />
        <polyline points="65 35 75 35 75 45" stroke="#60a5fa" stroke-width="4" />
        <circle cx="75" cy="35" r="4" fill="#60a5fa" />
        <path d="M20 90 h60" stroke="#334155" stroke-width="2" />
        <circle cx="40" cy="60" r="3" fill="#60a5fa" />
        <circle cx="55" cy="70" r="3" fill="#60a5fa" />
      </g>
    `
  },
  {
    filename: 'apiscor_banner.svg',
    name: 'Apis Cor',
    category: 'Construction / 3D Printing',
    tagline: '3D printing the future of housing.',
    colors: ['#334155', '#ea580c'],
    icon: `
      <!-- House and 3D printing nozzle -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 90 V55 L45 35 L70 55 V90 Z" stroke="#fb923c" stroke-width="4" fill="#fb923c" opacity="0.2" />
        <path d="M35 90 V70 h20 v20" stroke="#fb923c" stroke-width="3" />
        <!-- Layer printing nozzle path -->
        <path d="M15 30 h25 L45 22 L49 30 h15" stroke="#a1a1aa" stroke-width="2" />
        <circle cx="45" cy="22" r="3" fill="#fb923c" />
      </g>
    `
  },
  {
    filename: 'eliev_banner.svg',
    name: 'Eli Electric Vehicles',
    category: 'Automotive / EV',
    tagline: 'Next-gen personal micro-mobility.',
    colors: ['#1e293b', '#059669'],
    icon: `
      <!-- Compact EV car profile / Lightning Bolt -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 80 h10 c2 -8 10 -8 12 0 h26 c2 -8 10 -8 12 0 h10 V65 C75 58 60 50 45 50 H25 C20 50 15 58 15 65 Z" stroke="#34d399" stroke-width="4" fill="#34d399" opacity="0.2" />
        <circle cx="31" cy="80" r="7" stroke="#34d399" stroke-width="3" />
        <circle cx="63" cy="80" r="7" stroke="#34d399" stroke-width="3" />
        <!-- Lightning bolt -->
        <path d="M43 35 L35 48 h10 L38 60" stroke="#6ee7b7" stroke-width="3" />
      </g>
    `
  },
  {
    filename: 'honeybee_banner.svg',
    name: 'Honeybee Burger',
    category: 'FoodTech / Plant-based',
    tagline: 'Delicious plant-based burgers.',
    colors: ['#78350f', '#84cc16'],
    icon: `
      <!-- Bee and Burger leaf -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Bee shape -->
        <circle cx="35" cy="55" r="10" stroke="#eab308" stroke-width="3" fill="#eab308" opacity="0.3" />
        <path d="M35 45 C35 38 42 38 42 45 M35 55 h10 M35 50 h8 M35 60 h8" stroke="#78350f" stroke-width="2" />
        <circle cx="45" cy="50" r="3" fill="#78350f" />
        <!-- Green leaf for plant-based -->
        <path d="M50 70 C60 70 65 60 55 55 C45 60 45 70 50 70 Z" fill="#86efac" stroke="#4ade80" stroke-width="2" />
      </g>
    `
  },
  {
    filename: 'sapientx_banner.svg',
    name: 'SapientX',
    category: 'AI / Voice Avatars',
    tagline: 'Conversational AI for systems and vehicles.',
    colors: ['#111827', '#0891b2'],
    icon: `
      <!-- Speech bubble and audio wave -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="20" y="35" width="50" height="35" rx="8" stroke="#22d3ee" stroke-width="4" fill="#22d3ee" opacity="0.2" />
        <path d="M35 70 l-10 10 v-10" stroke="#22d3ee" stroke-width="4" />
        <!-- Audio wave bars -->
        <path d="M32 52 v0 M38 48 v8 M44 42 v20 M50 48 v8 M56 52 v0" stroke="#22d3ee" stroke-width="3" />
      </g>
    `
  }
];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

startups.forEach(startup => {
  const cleanCategory = startup.category.toUpperCase().replace(/&/g, '&amp;');
  const cleanTagline = startup.tagline.replace(/&/g, '&amp;');

  const svg = `<svg width="800" height="320" viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad_${startup.name.replace(/[^a-zA-Z0-9]/g, '_')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${startup.colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${startup.colors[1]};stop-opacity:1" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="320" rx="16" fill="url(#grad_${startup.name.replace(/[^a-zA-Z0-9]/g, '_')})" />

  <!-- Decorative Abstract Circles -->
  <circle cx="750" cy="80" r="160" fill="#ffffff" opacity="0.04" />
  <circle cx="50" cy="280" r="120" fill="#ffffff" opacity="0.03" />
  <path d="M-50 160 C100 80 200 240 350 160 C500 80 650 240 850 160" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.04" />

  <!-- Category Badge -->
  <g transform="translate(60, 65)">
    <rect width="260" height="28" rx="14" fill="#ffffff" opacity="0.12" />
    <text x="12" y="18" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-size="11" font-weight="700" letter-spacing="1" opacity="0.95">${cleanCategory}</text>
  </g>

  <!-- Branding Text -->
  <text x="60" y="160" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-size="52" font-weight="900" letter-spacing="-1.5" filter="url(#glow)">${startup.name}</text>
  <text x="60" y="215" fill="#ffffff" font-family="'Outfit', 'Inter', sans-serif" font-size="20" font-weight="500" opacity="0.85">${cleanTagline}</text>

  <!-- Stylized Icon Container -->
  <g transform="translate(640, 90) scale(1.4)">
    <circle cx="45" cy="65" r="40" fill="#ffffff" opacity="0.08" />
    ${startup.icon}
  </g>
</svg>
`;

  const filePath = path.join(targetDir, startup.filename);
  fs.writeFileSync(filePath, svg);
  console.log('Generated SVG: ' + startup.filename);
});

console.log('All missing SVG banners generated successfully!');
