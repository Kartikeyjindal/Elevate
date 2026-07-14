import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Space, Divider } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const infoTopics = {
  'about-us': {
    title: 'About Elevate Equity',
    category: 'ELEVATE',
    content: 'Elevate Equity is India\'s leading digital crowdfunding platform, built on the vision of democratizing private market investments. Founded in 2016 at the intersection of technology and capital, we bridge the gap between high-growth early-stage ventures and accredited retail investors. By lowering the entry barrier from institutional ticket sizes to accessible community investments, we empower everyday wealth creators to support the next generation of industry disrupters.\n\nOur platform operates under a rigid selection process. Only 1% of applicant startups make it onto our marketplace. We partner with Delhi Technological University (DTU) Labs and premier incubation networks to thoroughly audit the tech viability, supply chains, and leadership teams of every listing. Through this diligent approach, we have enabled over 15,000 retail investors to build diversified private portfolios with institutional-level security.'
  },
  'pricing': {
    title: 'Transparent Pricing & Fees',
    category: 'ELEVATE',
    content: 'Elevate maintains a strict policy of transparency with zero hidden charges. We align our success directly with our investors. We charge a flat 2% facilitation fee on successful capital commitments made through our marketplace. This fee is calculated only when a startup successfully meets its funding target and capital is deployed. If a startup campaign does not hit its minimum goal, 100% of your pledged funds are returned to your wallet with zero deduction.\n\nUnlike traditional brokers, we charge ₹0 for account opening, account maintenance (AMC), or portal access. For specialized secondary market transactions, standard custody fees (capped at 0.5% annually) may apply to cover administrative and regulatory overhead. All transactions are subject to standard GST as per current government regulations.'
  },
  'venture-insights': {
    title: 'Venture Insights Desk',
    category: 'ELEVATE',
    content: 'Venture Insights is our specialized research branch, delivering weekly data-backed reports on startup ecosystems, emerging technologies, and venture valuations. We leverage our proprietary database and university relationships to track macro shifts, valuation ranges, and funding trends.\n\nOur subscribers get exclusive access to:\n• Startup Valuation Indexes tracking average multiples across SaaS, DeepTech, and D2C.\n• Technical diligence briefs written by PhD researchers at DTU Labs.\n• Founders Roundtable webinars analyzing funding winters and operational strategies.'
  },
  'media': {
    title: 'Media & Press Desk',
    category: 'ELEVATE',
    content: 'Stay up to date with Elevate\'s official press releases, corporate announcements, and media mentions. We are regularly featured in leading financial publications including The Economic Times, YourStory, LiveMint, and TechCrunch as a pioneer in crowdfunding technology.\n\nFor media inquiries, press kits, or executive interview requests, please contact our public relations desk at press@elevateequity.in.'
  },
  'careers': {
    title: 'Careers at Elevate',
    category: 'ELEVATE',
    content: 'At Elevate, we are building the future of private market infrastructure. We are a team of software engineers, financial analysts, venture auditors, and designers working in a high-performance, hybrid-first environment.\n\nWe offer industry-leading salaries, comprehensive ESOP packages, full family health coverage, and annual learning stipends. Explore our open positions in engineering, compliance, and venture operations to help us build a more open investment ecosystem.'
  },
  'help': {
    title: 'Help & Support Center',
    category: 'ELEVATE',
    content: 'Welcome to the Elevate Support Desk. Whether you have questions about completing your KYC, depositing funds via UPI/NetBanking, or tracking your returns, our dedicated support team is available 24/7.\n\nReach out to us directly through our live chat portal or email us at support@elevateequity.in. Most queries are resolved within 2 hours.'
  },
  'safety': {
    title: 'Trust & Safety Protocols',
    category: 'ELEVATE',
    content: 'Trust is the foundation of Elevate. We protect your account with bank-grade 256-bit encryption. All funds deposited into your wallet are held in segregated ESCROW bank accounts managed by ICICI Bank and Trustees, ensuring your capital is never touched until a pledge is finalized.\n\nFurthermore, all listed startups undergo a rigorous 4-step compliance audit checking corporate registration, financial statements, and litigation history.'
  },
  'investor-relations': {
    title: 'Investor Relations Compliance',
    category: 'ELEVATE',
    content: 'Official disclosures, compliance documentation, and annual reports for Elevate Equity shareholders and board members. We operate under strict corporate governance guidelines with independent audits conducted annually.\n\nAccess our quarterly balance sheets, regulatory filing summaries, and governance statements from this desk.'
  },
  'equity-crowdfunding': {
    title: 'Equity Crowdfunding',
    category: 'PRODUCTS',
    content: 'Direct equity investing enables retail investors to purchase actual shares or SAFE (Simple Agreement for Future Equity) notes in early-stage startups. Choose from a curated marketplace of vetted ventures in Fintech, AgriTech, SaaS, and more.\n\nInvesting is simple: explore the active listings, select a venture, and pledge capital starting from just ₹1,000. Benefit from potential long-term returns as the startup scales and raises subsequent funding rounds.'
  },
  'startup-mutual-funds': {
    title: 'Startup Mutual Funds',
    category: 'PRODUCTS',
    content: 'Mitigate your investment risks with Startup Mutual Funds. Instead of backing a single venture, you can invest in a diversified thematic basket of 5–10 startups vetted and managed by our investment committee.\n\nBaskets are rebalanced quarterly to focus on high-performing sectors like AI/Robotics, Clean Energy, and D2C brands, ensuring your capital is optimized for growth.'
  },
  'venture-debt': {
    title: 'Venture Debt Options',
    category: 'PRODUCTS',
    content: 'Venture Debt offers a low-volatility alternative to equity investing. Earn consistent monthly returns by lending capital to revenue-generating, VC-backed startups with proven business models.\n\nOur venture debt offerings yield a steady 12-16% IRR, backed by corporate collateral and promoter guarantees, giving you stable passive cash flow.'
  },
  'secondary-market': {
    title: 'Secondary Share Market',
    category: 'PRODUCTS',
    content: 'Elevate hosts India\'s most active secondary trading desk for pre-IPO shares and private startup equity. Liquidate your startup holdings or buy shares from early employees and angel investors.\n\nOur secondary portal handles legal share transfers, escrow settlements, and dematerialization compliance automatically.'
  },
  'elevate-terminal': {
    title: 'Elevate Terminal',
    category: 'PRODUCTS',
    content: 'The Elevate Terminal is a professional-grade research console providing institutional-grade data on the private market ecosystem. Analyze startup capitalization tables, revenue models, historical round multiples, and sector comparisons.\n\nUnlock advanced filters, automated valuation alerts, and custom Excel exports for your diligence.'
  },
  'angel-pools': {
    title: 'Angel Pools & Syndicates',
    category: 'PRODUCTS',
    content: 'Co-invest alongside prominent venture capitalists and super angels. Elevate Angel Pools allow you to pool your capital with industry leaders, leveraging their diligence and preferential deal terms.\n\nEnjoy the same class of shares and dilution protections as institutional lead investors.'
  },
  'commodities': {
    title: 'Carbon Credits & Sustainability',
    category: 'PRODUCTS',
    content: 'Participate directly in the green transition. Invest in certified carbon credit programs, sustainable agriculture projects, and green energy farms.\n\nEarn returns from energy yields while generating verified voluntary carbon offsets to hedge your portfolio.'
  },
  'pms-services': {
    title: 'Portfolio Management Services (PMS)',
    category: 'PRODUCTS',
    content: 'Customized Portfolio Management Services (PMS) designed for High-Net-Worth Individuals (HNIs). Get a dedicated portfolio manager, bespoke startup deal flow, tax optimization, and direct access to founder rounds.\n\nMin. ticket size for private PMS is ₹50 Lakhs. Contact pms@elevateequity.in for inquiries.'
  },
  'dtu-labs': {
    title: 'DTU Labs Partner Program',
    category: 'RESOURCES',
    content: 'Our exclusive technical collaboration with Delhi Technological University (DTU) Labs brings academic diligence to venture screening. DTU PhD researchers audit startup codebases, hardware prototypes, and chemical compositions.\n\nThis ensures that every technical claim made by listed startups is verified in professional university laboratories.'
  },
  'startup-incubator': {
    title: 'Elevate Incubator Program',
    category: 'RESOURCES',
    content: 'The Elevate Incubator is a 12-week accelerator program for early-stage founders. We provide ₹25 Lakhs in pre-seed funding, free cloud credits, legal setup assistance, and office space at our Tech Park.\n\nApplications open semi-annually. Founders can pitch directly to our network of 500+ angel investors.'
  },
  'portfolio-tracker': {
    title: 'Smart Portfolio Tracker',
    category: 'RESOURCES',
    content: 'Our state-of-the-art Portfolio Tracker helps you monitor all your startup investments in a single dashboard. Track fair-market valuation updates, IRR progression, next-round dilutions, and exit events.\n\nView custom charts on sector exposure and asset class distribution.'
  },
  'live-activity': {
    title: 'Live Market Activity Ticker',
    category: 'RESOURCES',
    content: 'The Live Market Activity ticker is a real-time feed showcasing capital movements across Elevate. Monitor wallet deposits, venture pledge milestones, and listing approvals as they happen.\n\nThis provides a transparent window into platform liquidity and investor sentiment.'
  },
  'valuation-simulator': {
    title: 'Dynamic Valuation Simulator',
    category: 'RESOURCES',
    content: 'Model future startup valuations using our Dynamic Valuation Simulator. Adjust expected annual growth rates and client retention metrics to project valuation curves over 5 investment rounds.\n\nThe simulator uses industry-standard discounted cash flow (DCF) and revenue multiple models.'
  },
  'smart-kyc': {
    title: 'Smart KYC Verification',
    category: 'RESOURCES',
    content: 'Completing your onboarding is instant with Smart KYC. We integrate with government databases to verify your PAN card, Aadhaar details, and bank account in real-time.\n\nYour data is protected under ISO 27001 security standards and is processed in under 2 minutes.'
  },
  'market-news': {
    title: 'Market News Digest',
    category: 'RESOURCES',
    content: 'A daily newsletter and news feed summarizing venture capital activity, regulatory shifts, and startup policies. Our editorial team summarizes key deals and macroeconomic trends affecting early-stage markets.'
  },
  'expert-panel': {
    title: 'Expert Q&A Panels',
    category: 'RESOURCES',
    content: 'Connect with veteran VCs, startup lawyers, and tax experts through our weekly Q&A panels. Ask questions about equity taxation, cap table legal structures, or diligence best practices.\n\nAll panels are recorded and archived for on-demand streaming.'
  },
  'social-twitter': {
    title: 'Elevate on X (Twitter)',
    category: 'SOCIAL MEDIA',
    content: 'Follow our official channel @ElevateEquity on X (formerly Twitter) for breaking startup updates, live crowdfunding campaign listings, investor poll results, and daily venture capital industry commentary.\n\nJoin our community of over 50,000 founders and investors who debate macro trends and track platform progress in real-time.'
  },
  'social-instagram': {
    title: 'Elevate on Instagram',
    category: 'SOCIAL MEDIA',
    content: 'Behind-the-scenes founder stories, startup office tours, pitch highlights, and visually stunning venture summaries. Follow @ElevateEquity for our curated visual gallery and live video Q&A streams.'
  },
  'social-facebook': {
    title: 'Elevate on Facebook',
    category: 'SOCIAL MEDIA',
    content: 'Connect with our community of retail and angel investors. Join our Facebook groups to exchange diligence insights, ask general onboarding questions, and RSVP to weekly investment masterclasses.'
  },
  'social-linkedin': {
    title: 'Elevate on LinkedIn',
    category: 'SOCIAL MEDIA',
    content: 'Follow Elevate Equity on LinkedIn for professional announcements, strategic corporate updates, senior executive hires, career listings, and DTU Labs research partnership news.'
  },
  'social-youtube': {
    title: 'Elevate on YouTube',
    category: 'SOCIAL MEDIA',
    content: 'Watch detailed startup pitch videos, deep-dive technical diligence webinars, and tutorial guides on how to navigate equity crowdfunding.\n\nSubscribe to our channel to get notifications whenever a new founder interview or cap table masterclass is uploaded.'
  },
  'contact-us': {
    title: 'Contact Elevate Equity Support',
    category: 'SUPPORT',
    content: 'Get in touch with us at corporate headquarters or submit a support query. Our physical office is located at Vaishnavi Tech Park, South Tower, 3rd Floor, Sarjapur Main Road, Bellandur, Bengaluru – 560103, Karnataka, India.\n\nFor support, email us at support@elevateequity.in or call +91-80-ELEVATE.'
  }
};

export default function PlatformInfo() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const topic = infoTopics[topicId] || {
    title: 'Topic Not Found',
    category: 'PLATFORM INFO',
    content: 'The requested information section could not be located on Elevate. Please return to the dashboard.'
  };

  const tc = isDarkMode ? '#f1f5f9' : '#0f172a';
  const tSec = isDarkMode ? '#9ca3af' : '#64748b';
  const borderCl = isDarkMode ? '#1f2937' : '#edf2f7';
  const bgCard = isDarkMode ? '#111827' : '#ffffff';
  const bgMain = isDarkMode ? '#0b0f19' : '#f4f6f9';

  return (
    <Layout style={{ minHeight: '100vh', background: bgMain }}>
      {/* Mini Header */}
      <Header style={{ 
        background: bgCard, 
        borderBottom: `1px solid ${borderCl}`, 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/investor')}>
          <span style={{ fontSize: 24 }}>🚀</span>
          <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#00d09c', letterSpacing: -0.5 }}>ELEVATE</span>
        </div>
        <Button 
          type="primary" 
          onClick={() => navigate('/investor')}
          style={{ borderRadius: 8, fontWeight: 700 }}
        >
          Go to Dashboard
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 250px)' }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/investor')} 
            style={{ color: '#00d09c', padding: 0, fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>

          <Card style={{ background: bgCard, border: `1px solid ${borderCl}`, borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <span style={{ 
              color: '#00d09c', 
              fontWeight: 800, 
              fontSize: 11, 
              letterSpacing: 1.5, 
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8
            }}>
              {topic.category}
            </span>
            <Title level={2} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 20px 0' }}>
              {topic.title}
            </Title>
            <Divider style={{ borderColor: borderCl, margin: '0 0 20px 0' }} />
            <Paragraph style={{ color: tc, fontSize: 15, lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {topic.content}
            </Paragraph>
          </Card>
        </Space>
      </Content>

      <Footer style={{ 
        background: isDarkMode ? '#0b0f19' : '#f9fafb', 
        borderTop: `1px solid ${borderCl}`, 
        padding: '32px 24px', 
        color: tc,
        fontFamily: 'Outfit'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2016-2026 Elevate Equity. All rights reserved.
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Version 1.2.4
          </Text>
        </div>
      </Footer>
    </Layout>
  );
}
