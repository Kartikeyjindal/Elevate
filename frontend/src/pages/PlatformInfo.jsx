import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Space, Divider, Row, Col } from 'antd';
import { ArrowLeftOutlined, UserOutlined, SettingOutlined, LogoutOutlined, WalletOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const infoTopics = {
  'about-us': {
    title: 'About Elevate Equity',
    category: 'ELEVATE',
    content: 'Elevate Equity is India\'s premier crowdfunding platform connecting accredited retail investors with high-growth startup opportunities. Founded in 2016, our mission is to democratize private market investing and enable everyday wealth creation through curated venture portfolios.'
  },
  'pricing': {
    title: 'Transparent Pricing & Fees',
    category: 'ELEVATE',
    content: 'At Elevate, we believe in complete transparency. We charge a flat 2% facilitation fee on successful investments. There are no hidden brokerages, maintenance charges, or exit loads. Custom custody fees may apply to specialized secondary transactions.'
  },
  'venture-insights': {
    title: 'Venture Insights Desk',
    category: 'ELEVATE',
    content: 'Get expert analysis, startup trends, and macroeconomic insights directly from DTU Labs and our network of angel partners. Stay ahead of market shifts with weekly newsletters and data-backed reports.'
  },
  'media': {
    title: 'Media & Press Desk',
    category: 'ELEVATE',
    content: 'Read about our latest funding rounds, strategic announcements, and regulatory milestones. Elevate has been featured in top financial publications including The Economic Times, YourStory, and TechCrunch.'
  },
  'careers': {
    title: 'Careers at Elevate',
    category: 'ELEVATE',
    content: 'Join a high-performance team of engineers, financial analysts, and designers redefining private markets. We offer competitive pay, stock options, health benefits, and a hybrid remote structure.'
  },
  'help': {
    title: 'Help & Support Center',
    category: 'ELEVATE',
    content: 'Need assistance with your wallet deposits, KYC verification, or pledge cancellations? Our dedicated support team is available 24/7. Reach out via email at support@elevateequity.in.'
  },
  'safety': {
    title: 'Trust & Safety Protocols',
    category: 'ELEVATE',
    content: 'We utilize bank-grade 256-bit encryption for all transactional data. Capital is held in secure ESCROW bank accounts until funding milestones are fully met. All listed startups undergo a rigorous multi-stage vetting process.'
  },
  'investor-relations': {
    title: 'Investor Relations Compliance',
    category: 'ELEVATE',
    content: 'Corporate announcements, financial statements, and compliance filings for Elevate Equity shareholders. Learn about our governance, leadership team, and long-term capital goals.'
  },
  'equity-crowdfunding': {
    title: 'Equity Crowdfunding',
    category: 'PRODUCTS',
    content: 'Direct equity investments in early-stage and growth-stage startups. Invest with as little as ₹1,000 and get actual shares/SAFE notes in vetted startups.'
  },
  'startup-mutual-funds': {
    title: 'Startup Mutual Funds',
    category: 'PRODUCTS',
    content: 'Diversified thematic baskets of startups managed by our investment committee. Spread your risk across multiple ventures in Fintech, SaaS, DeepTech, or CleanTech.'
  },
  'venture-debt': {
    title: 'Venture Debt Options',
    category: 'PRODUCTS',
    content: 'Earn steady fixed returns by lending to revenue-generating startups. Secure your capital with collateralized asset-backed debt structures yielding 12-16% IRR.'
  },
  'secondary-market': {
    title: 'Secondary Share Market',
    category: 'PRODUCTS',
    content: 'Trade shares of pre-IPO companies and late-stage startups. Elevate offers the most liquid secondary trading desk for private equity in India.'
  },
  'elevate-terminal': {
    title: 'Elevate Terminal',
    category: 'PRODUCTS',
    content: 'The ultimate professional platform for venture capital database analysis. Filter startups by ARR, growth rate, retention, cap tables, and funding history.'
  },
  'angel-pools': {
    title: 'Angel Pools & Syndicates',
    category: 'PRODUCTS',
    content: 'Co-invest alongside veteran super angels and VC funds. Benefit from institutional-grade diligence and term sheet negotiations.'
  },
  'commodities': {
    title: 'Carbon Credits & Sustainability',
    category: 'PRODUCTS',
    content: 'Participate in the green transition. Invest directly in sustainability projects and clean tech startups earning high-yield voluntary carbon offsets.'
  },
  'pms-services': {
    title: 'Portfolio Management Services (PMS)',
    category: 'PRODUCTS',
    content: 'High-net-worth individual solutions for custom private portfolios. Get active advisory, bespoke deal flow, and priority allocations.'
  },
  'dtu-labs': {
    title: 'DTU Labs Partner Program',
    category: 'RESOURCES',
    content: 'Elevate is proud to partner with Delhi Technological University (DTU). We support university incubated research projects, lab trials, and tech transfers.'
  },
  'startup-incubator': {
    title: 'Elevate Incubator Program',
    category: 'RESOURCES',
    content: 'A 12-week accelerator program providing early-stage founders with seed capital, cloud credits, legal structure support, and mentor networks.'
  },
  'portfolio-tracker': {
    title: 'Smart Portfolio Tracker',
    category: 'RESOURCES',
    content: 'Track the fair value of your startup shares. Get real-time updates on subsequent funding rounds, valuation revisions, and exit opportunities.'
  },
  'live-activity': {
    title: 'Live Market Activity Ticker',
    category: 'RESOURCES',
    content: 'Real-time platform activity updates showing new pledges, wallet deposits, milestone targets, and regulatory listings as they happen.'
  },
  'valuation-simulator': {
    title: 'Dynamic Valuation Simulator',
    category: 'RESOURCES',
    content: 'An interactive simulator modeling future funding rounds based on expected growth rate and client retention/NRR inputs.'
  },
  'smart-kyc': {
    title: 'Smart KYC Verification',
    category: 'RESOURCES',
    content: 'Instant paperless KYC processing using PAN card API, residential proof checks, and Aadhaar e-sign validation in under 2 minutes.'
  },
  'market-news': {
    title: 'Market News Digest',
    category: 'RESOURCES',
    content: 'A curated summary of key venture capital deals, IPO announcements, startup policy updates, and regulatory changes in the Indian tech ecosystem.'
  },
  'expert-panel': {
    title: 'Expert Q&A Panels',
    category: 'RESOURCES',
    content: 'Live interactive Q&A sessions with venture capitalists, tech founders, and legal counsel. Get answers to critical industry questions.'
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
          icon={<HomeOutlined />} 
          onClick={() => navigate('/investor')}
          style={{ borderRadius: 8, fontWeight: 700 }}
        >
          Go to Dashboard
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 350px)' }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/investor')} 
            style={{ color: '#00d09c', padding: 0, fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>

          <Card style={{ background: bgCard, border: `1px solid ${borderCl}`, borderRadius: 16, padding: '12px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
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
