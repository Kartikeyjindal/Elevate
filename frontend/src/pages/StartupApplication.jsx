import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import {
  Form, Input, InputNumber, Select, Button, Typography, message,
  Space, Tag, Divider, Progress, Card
} from 'antd';
import {
  RiseOutlined, CheckCircleFilled, ClockCircleOutlined,
  FileTextOutlined, DollarOutlined, RocketOutlined,
  LogoutOutlined, SaveOutlined, ArrowRightOutlined, ArrowLeftOutlined,
  GlobalOutlined, TeamOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const C = {
  mint: '#00d09c', mintLight: '#e6fef6', mintDim: '#00b88e',
  dark: '#1a1d2e', textPrimary: '#44475b', textSecondary: '#7c8099',
  border: '#e5e8f0', bg: '#f5f7fb', white: '#ffffff',
  error: '#eb5757', warning: '#f59e0b',
};

const labelStyle = { color: C.textPrimary, fontWeight: 600, fontSize: 13 };
const inputStyle = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary };
const inputNumStyle = { width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 };
const sectionHead = { color: C.dark, fontFamily: 'Outfit', fontWeight: 700, margin: '8px 0 4px' };
const sectionSub = { color: C.textSecondary, fontSize: 13, marginBottom: 20, display: 'block' };

const STEPS = [
  { label: 'BASIC INFO', title: 'Company Overview' },
  { label: 'FINANCIALS', title: 'Financial History & Metrics' },
  { label: 'STRATEGY', title: 'Growth Strategy & Vision' },
];

function StatusSidebar({ savedAt, step, isDarkMode }) {
  return (
    <div style={{
      background: isDarkMode ? '#121620' : C.white, borderRadius: 16, border: isDarkMode ? '1px solid #1f2937' : `1px solid ${C.border}`,
      padding: '28px 24px', position: 'sticky', top: 90, minWidth: 240
    }}>
      <Text style={{ color: C.textSecondary, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
        Application Status
      </Text>
      <Divider style={{ margin: '12px 0 20px' }} />
      <Tag style={{
        background: isDarkMode ? '#1a2235' : '#fffbeb', color: C.warning, border: isDarkMode ? '1px solid #374151' : `1px solid #fde68a`,
        fontWeight: 700, borderRadius: 6, padding: '3px 10px', marginBottom: 12
      }}>DRAFT</Tag>
      <Text style={{ color: C.textSecondary, fontSize: 12, marginBottom: 20, display: 'block' }}>
        {savedAt ? `Last saved: ${savedAt}` : 'Not saved yet'}
      </Text>

      <div style={{ position: 'relative', paddingLeft: 8 }}>
        <div style={{ position: 'absolute', left: 19, top: 16, bottom: 16, width: 2, background: isDarkMode ? '#1f2937' : C.border }} />
        {[
          { label: 'INITIATED', sub: savedAt || 'Draft in progress', active: true },
          { label: 'UNDER REVIEW', sub: 'Pending Submission', active: false },
          { label: 'DECISION', sub: 'Awaiting Review', active: false },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: s.active ? C.mint : (isDarkMode ? '#1f2937' : C.border),
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative'
            }}>
              {s.active
                ? <ArrowRightOutlined style={{ color: C.white, fontSize: 13 }} />
                : i === 1 ? <ClockCircleOutlined style={{ color: C.textSecondary, fontSize: 13 }} />
                : <CheckCircleFilled style={{ color: C.textSecondary, fontSize: 13 }} />}
            </div>
            <div>
              <Text style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: s.active ? (isDarkMode ? '#f1f5f9' : C.dark) : C.textSecondary, display: 'block' }}>
                {s.label}
              </Text>
              <Text style={{ fontSize: 11, color: C.textSecondary }}>{s.sub}</Text>
            </div>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '8px 0 16px' }} />
      <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Completion</Text>
      <Progress percent={Math.round(((step + 1) / 3) * 100)} strokeColor={C.mint} trailColor={isDarkMode ? '#1f2937' : C.border} strokeLinecap="round" style={{ marginTop: 8 }} />
      <Text style={{ color: C.textSecondary, fontSize: 11 }}>Step {step + 1} of 3</Text>
    </div>
  );
}

function StepHeader({ currentStep, isDarkMode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i < currentStep ? C.mint : i === currentStep ? (isDarkMode ? '#f1f5f9' : C.dark) : 'transparent',
              border: `2px solid ${i <= currentStep ? (i < currentStep ? C.mint : (isDarkMode ? '#f1f5f9' : C.dark)) : (isDarkMode ? '#1f2937' : C.border)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 6, transition: 'all 0.3s'
            }}>
              {i < currentStep
                ? <CheckCircleFilled style={{ color: C.white, fontSize: 16 }} />
                : <Text style={{ color: i === currentStep ? (isDarkMode ? '#0c101b' : C.white) : C.textSecondary, fontSize: 14, fontWeight: 700 }}>{i + 1}</Text>}
            </div>
            <Text style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              color: i === currentStep ? C.mint : i < currentStep ? C.mint : C.textSecondary
            }}>{s.label}</Text>
          </div>
          {i < 2 && (
            <div style={{ height: 2, flex: 1, background: i < currentStep ? C.mint : (isDarkMode ? '#1f2937' : C.border), marginBottom: 20, transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Step1() {
  return (
    <div>
      <Title level={3} style={sectionHead}>Company Overview</Title>
      <Text style={sectionSub}>Tell us about your founding team, company identity, and where you operate.</Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Form.Item name="name" label={<span style={labelStyle}>Startup / Company Name *</span>} rules={[{ required: true, message: 'Company name is required' }]}>
          <Input placeholder="e.g. NeuralEdge Technologies" size="large" style={inputStyle} />
        </Form.Item>
        <Form.Item name="founderName" label={<span style={labelStyle}>Founder Name *</span>} rules={[{ required: true, message: 'Founder name is required' }]}>
          <Input placeholder="e.g. Arjun Sharma" size="large" style={inputStyle} />
        </Form.Item>
        <Form.Item name="coFounders" label={<span style={labelStyle}>Co-Founder(s)</span>}>
          <Input placeholder="Comma-separated names (optional)" size="large" style={inputStyle} />
        </Form.Item>
        <Form.Item name="category" label={<span style={labelStyle}>Primary Sector *</span>} rules={[{ required: true, message: 'Sector is required' }]}>
          <Select size="large" placeholder="Select sector" style={{ width: '100%' }}>
            {['AI / ML','FinTech','Ed-Tech','HealthTech','AgriTech','CleanTech','SaaS / B2B','D2C / Consumer','Robotics','IoT','Cybersecurity','Logistics','Real Estate Tech','Other'].map(s => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="stage" label={<span style={labelStyle}>Company Stage *</span>} rules={[{ required: true, message: 'Please select stage' }]}>
          <Select size="large" placeholder="Select stage" style={{ width: '100%' }}>
            {['Idea / Concept','MVP / Prototype','Early Revenue','Growth Stage','Scale / Expansion'].map(s => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="foundedYear" label={<span style={labelStyle}>Founded Year</span>}>
          <Input placeholder="e.g. 2022" size="large" style={inputStyle} prefix={<CalendarOutlined style={{ color: C.textSecondary }} />} />
        </Form.Item>
        <Form.Item name="location" label={<span style={labelStyle}>Location (City, State)</span>}>
          <Input placeholder="e.g. New Delhi, Delhi" size="large" style={inputStyle} />
        </Form.Item>
        <Form.Item name="teamSize" label={<span style={labelStyle}>Team Size</span>}>
          <InputNumber placeholder="Total headcount" size="large" min={1} style={{ ...inputNumStyle, height: 40 }} prefix={<TeamOutlined />} />
        </Form.Item>
        <Form.Item name="website" label={<span style={labelStyle}>Company Website</span>}>
          <Input placeholder="https://yourcompany.com" size="large" style={inputStyle} prefix={<GlobalOutlined style={{ color: C.textSecondary }} />} />
        </Form.Item>
        <Form.Item name="linkedIn" label={<span style={labelStyle}>LinkedIn Profile</span>}>
          <Input placeholder="https://linkedin.com/company/..." size="large" style={inputStyle} />
        </Form.Item>
      </div>
      <Form.Item name="tagline" label={<span style={labelStyle}>Company Tagline *</span>} rules={[{ required: true, message: 'Please enter a short tagline' }]}>
        <Input placeholder="One sentence that describes what you do" size="large" style={inputStyle} maxLength={150} showCount />
      </Form.Item>
      <Form.Item name="description" label={<span style={labelStyle}>Detailed Company Description *</span>} rules={[{ required: true, message: 'Please describe your company' }]}>
        <TextArea rows={5} placeholder="Describe your company, the problem you solve, your solution, and what makes you different..." style={{ ...inputStyle, resize: 'vertical' }} />
      </Form.Item>
    </div>
  );
}

function Step2({ isDarkMode }) {
  const fmt = v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const prs = v => v.replace(/₹\s?|(,*)/g, '');
  return (
    <div>
      <Title level={3} style={sectionHead}>Financial History & Metrics</Title>
      <Text style={sectionSub}>Provide accurate historical data to support your valuation. All amounts in ₹ (INR).</Text>

      <div style={{ 
        background: isDarkMode ? '#1e293b' : C.bg, 
        borderRadius: 10, 
        padding: '12px 20px', 
        marginBottom: 20, 
        border: `1px solid ${isDarkMode ? '#334155' : C.border}` 
      }}>
        <Text style={{ fontWeight: 700, color: isDarkMode ? '#38bdf8' : C.textPrimary, fontSize: 13 }}>Valuation & Fundraising</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Form.Item name="currentValuation" label={<span style={labelStyle}>Current Valuation (₹) *</span>} rules={[{ required: true, message: 'Current valuation required' }]}>
          <InputNumber size="large" min={1} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="e.g. 50,000,000" />
        </Form.Item>
        <Form.Item name="valuationCap" label={<span style={labelStyle}>Valuation Cap (₹)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="e.g. 1,00,000,000" />
        </Form.Item>
        <Form.Item name="targetGoal" label={<span style={labelStyle}>Target Raise Amount (₹) *</span>} rules={[{ required: true, message: 'Target raise required' }]}>
          <InputNumber size="large" min={1} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="Target raise amount" />
        </Form.Item>
        <Form.Item name="maxGoal" label={<span style={labelStyle}>Maximum Raise Goal (₹)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="Maximum fundraise cap" />
        </Form.Item>
        <Form.Item name="minimumInvestment" label={<span style={labelStyle}>Min. Investment / Investor (₹)</span>}>
          <InputNumber size="large" min={1} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="e.g. 10,000" />
        </Form.Item>
        <Form.Item name="pricePerShare" label={<span style={labelStyle}>Price Per Share (₹)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="e.g. 100" />
        </Form.Item>
        <Form.Item name="securityType" label={<span style={labelStyle}>Security Type</span>}>
          <Select size="large" defaultValue="Crowd SAFE" style={{ width: '100%' }}>
            {['Crowd SAFE','Common Stock','Preferred Stock','Convertible Note','Revenue Share'].map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="previousValuations" label={<span style={labelStyle}>Previous Valuations (₹, comma-separated)</span>}>
          <Input placeholder="e.g. 5000000, 15000000, 30000000" size="large" style={inputStyle} />
        </Form.Item>
      </div>

      <Divider style={{ margin: '8px 0 20px' }} />
      <div style={{ 
        background: isDarkMode ? '#1e293b' : C.bg, 
        borderRadius: 10, 
        padding: '12px 20px', 
        marginBottom: 20, 
        border: `1px solid ${isDarkMode ? '#334155' : C.border}` 
      }}>
        <Text style={{ fontWeight: 700, color: isDarkMode ? '#38bdf8' : C.textPrimary, fontSize: 13 }}>Revenue & Operating Metrics</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Form.Item name="trailingRevenue" label={<span style={labelStyle}>Trailing 12M Revenue (₹)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="e.g. 12,500,000" />
        </Form.Item>
        <Form.Item name="ebitdaMargin" label={<span style={labelStyle}>EBITDA Margin (%)</span>}>
          <InputNumber size="large" min={-200} max={100} style={{ ...inputNumStyle, height: 40 }} placeholder="e.g. 15.5" step={0.1} />
        </Form.Item>
        <Form.Item name="burnRate" label={<span style={labelStyle}>Monthly Burn Rate (₹)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} formatter={fmt} parser={prs} placeholder="Monthly cash burn" />
        </Form.Item>
        <Form.Item name="runway" label={<span style={labelStyle}>Runway (months)</span>}>
          <InputNumber size="large" min={0} style={{ ...inputNumStyle, height: 40 }} placeholder="e.g. 18" />
        </Form.Item>
      </div>

      <Divider style={{ margin: '8px 0 20px' }} />
      <div style={{ 
        background: isDarkMode ? '#1e293b' : C.bg, 
        borderRadius: 10, 
        padding: '12px 20px', 
        marginBottom: 20, 
        border: `1px solid ${isDarkMode ? '#334155' : C.border}` 
      }}>
        <Text style={{ fontWeight: 700, color: isDarkMode ? '#38bdf8' : C.textPrimary, fontSize: 13 }}>Marketing & Procurement</Text>
      </div>
      <Form.Item name="marketingMixVariables" label={<span style={labelStyle}>Marketing Mix Variables (4 Ps)</span>}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product: what you offer. Price: your pricing model. Place: distribution channels. Promotion: marketing strategies." />
      </Form.Item>
      <Form.Item name="financialProcurement" label={<span style={labelStyle}>Financial Procurement & Supply Chain</span>}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Capital budgeting strategy, supplier relationships, asset acquisitions, and logistics chain..." />
      </Form.Item>
    </div>
  );
}

function Step3() {
  return (
    <div>
      <Title level={3} style={sectionHead}>Growth Strategy & Vision</Title>
      <Text style={sectionSub}>Outline your future goals, market opportunity, and the next steps your company will take.</Text>
      <Form.Item name="businessModel" label={<span style={labelStyle}>Business Model *</span>} rules={[{ required: true, message: 'Business model is required' }]}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="How do you make money? e.g. SaaS subscription, transaction fees, marketplace commissions, licensing..." />
      </Form.Item>
      <Form.Item name="marketOpportunity" label={<span style={labelStyle}>Market Opportunity (Total Addressable Market)</span>}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the total addressable market size, growth rate, and how large the opportunity is..." />
      </Form.Item>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Form.Item name="competitiveAdvantage" label={<span style={labelStyle}>Competitive Advantage / Moat</span>}>
          <TextArea rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What unique advantages do you have? IP, network effect, data moat, brand, first-mover advantage..." />
        </Form.Item>
        <Form.Item name="goToMarket" label={<span style={labelStyle}>Go-to-Market Strategy</span>}>
          <TextArea rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="How are you reaching customers? Channels, partnerships, sales motion, growth hacks..." />
        </Form.Item>
      </div>
      <Form.Item name="milestones" label={<span style={labelStyle}>Key Milestones – Next 12 Months *</span>} rules={[{ required: true, message: 'Please list upcoming milestones' }]}>
        <TextArea rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Q1: Launch v2.0 and onboard 100 customers. Q2: Expand to 3 cities. Q3: Reach ₹1Cr ARR. Q4: Begin Series A fundraise..." />
      </Form.Item>
      <Form.Item name="useOfFunds" label={<span style={labelStyle}>Use of Funds *</span>} rules={[{ required: true, message: 'Please describe use of funds' }]}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="e.g. 40% Product Development, 30% Sales & Marketing, 20% Operations, 10% Legal & Compliance..." />
      </Form.Item>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Form.Item name="revenueProjections" label={<span style={labelStyle}>Revenue Projections</span>}>
          <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Year 1: ₹50L, Year 2: ₹2Cr, Year 3: ₹8Cr... Include key assumptions." />
        </Form.Item>
        <Form.Item name="exitStrategy" label={<span style={labelStyle}>Exit Strategy</span>}>
          <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="IPO, Strategic Acquisition, Secondary Sale... timeline and target acquirers?" />
        </Form.Item>
      </div>
      <Form.Item name="risks" label={<span style={labelStyle}>Key Risks & Mitigation</span>}>
        <TextArea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Top 3-5 risks and how you're mitigating them: market risk, regulatory, competition, execution risk..." />
      </Form.Item>
    </div>
  );
}

export default function StartupApplication() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/startups/my-startup`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const s = data.startup;
          form.setFieldsValue({
            name: s.name, founderName: s.founderName, coFounders: s.coFounders,
            category: s.category, stage: s.stage, foundedYear: s.foundedYear,
            location: s.location, website: s.website, linkedIn: s.linkedIn,
            tagline: s.tagline, description: s.description,
            teamSize: s.teamSize || undefined,
            currentValuation: s.pastValuations?.[s.pastValuations.length - 1] || undefined,
            valuationCap: s.valuationCap || undefined,
            targetGoal: s.targetGoal || undefined, maxGoal: s.maxGoal || undefined,
            minimumInvestment: s.minimumInvestment || undefined,
            pricePerShare: s.pricePerShare || undefined, securityType: s.securityType || 'Crowd SAFE',
            previousValuations: s.pastValuations?.slice(0, -1).join(', ') || '',
            trailingRevenue: s.trailingRevenue || undefined, ebitdaMargin: s.ebitdaMargin || undefined,
            burnRate: s.burnRate || undefined, runway: s.runway || undefined,
            marketingMixVariables: s.marketingMixVariables, financialProcurement: s.financialProcurement,
            businessModel: s.businessModel, marketOpportunity: s.marketOpportunity,
            competitiveAdvantage: s.competitiveAdvantage, goToMarket: s.goToMarket,
            milestones: s.milestones, useOfFunds: s.useOfFunds,
            revenueProjections: s.revenueProjections, exitStrategy: s.exitStrategy, risks: s.risks,
          });
        } else if (res.status === 404) {
          message.warning('No startup profile found. Please complete the application.');
        }
      } catch (e) {
        message.error('Failed to load startup data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const buildPayload = (values, isComplete = false) => {
    const prevVals = values.previousValuations
      ? values.previousValuations.split(',').map(v => Number(v.trim())).filter(Boolean)
      : [];
    const currentVal = values.currentValuation ? [Number(values.currentValuation)] : [];
    return { ...values, pastValuations: [...prevVals, ...currentVal], applicationComplete: isComplete };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue(true);
      const payload = buildPayload(values, false);
      const res = await fetch(`${API_URL}/api/startups/my-startup/application`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedAt(new Date().toLocaleTimeString());
      message.success('Progress saved!');
    } catch (e) {
      message.error('Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      await handleSave();
      setCurrentStep(prev => Math.min(prev + 1, 2));
    } catch (e) {
      message.warning('Please fill in all required fields before continuing.');
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      const values = form.getFieldsValue(true);
      const payload = buildPayload(values, true);
      const res = await fetch(`${API_URL}/api/startups/my-startup/application`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Submission failed');
      message.success('Application submitted! It is now under review.');
      setTimeout(() => navigate('/company'), 1500);
    } catch (e) {
      message.error(e.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : C.bg }}>
      {/* Navbar */}
      <header style={{
        background: isDarkMode ? '#0c101b' : C.white, borderBottom: isDarkMode ? '1px solid #1f2937' : `1px solid ${C.border}`,
        padding: '0 32px', height: 64, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Space size={10}>
          <div style={{
            background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <RiseOutlined style={{ fontSize: 17, color: C.white }} />
          </div>
          <Title level={4} style={{ margin: 0, color: isDarkMode ? '#f1f5f9' : C.dark, fontFamily: 'Outfit', fontWeight: 800 }}>
            elevate <span style={{ color: isDarkMode ? '#9ca3af' : C.textSecondary, fontWeight: 500, fontSize: 14 }}>Company Portal</span>
          </Title>
        </Space>
        <Space size={12}>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}
            style={{ borderColor: C.mint, color: C.mint, fontWeight: 600, borderRadius: 8 }}>
            Save &amp; Exit
          </Button>
          <Button type="text" onClick={() => navigate('/company')}
            style={{ color: isDarkMode ? '#00d09c' : C.textSecondary, fontWeight: 600 }}>
            ← Dashboard
          </Button>
        </Space>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Main Panel */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <Title level={2} style={{ color: isDarkMode ? '#f1f5f9' : C.dark, fontFamily: 'Outfit', fontWeight: 800, margin: 0 }}>Company Application</Title>
            <Text style={{ color: C.textSecondary, fontSize: 14 }}>
              Complete your startup profile to be listed on the Elevate marketplace.
            </Text>
          </div>

{loading && (
            <Card style={{ textAlign: 'center', padding: 60, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 16, color: C.textSecondary }}>Loading your startup profile...</div>
            </Card>
          )}

          {!loading && (
            <>
              {/* Step Header Card */}
              <div style={{ 
                background: isDarkMode ? '#121620' : C.white, 
                borderRadius: 16, 
                border: isDarkMode ? '1px solid #1f2937' : `1px solid ${C.border}`, 
                padding: '28px 32px', 
                marginBottom: 24 
              }}>
                <StepHeader currentStep={currentStep} isDarkMode={isDarkMode} />
              </div>
 
              {/* Form Card */}
              <div style={{ 
                background: isDarkMode ? '#121620' : C.white, 
                borderRadius: 16, 
                border: isDarkMode ? '1px solid #1f2937' : `1px solid ${C.border}`, 
                padding: '32px' 
              }}>
                <Form form={form} layout="vertical" requiredMark={false}>
                  {currentStep === 0 && <Step1 />}
                  {currentStep === 1 && <Step2 isDarkMode={isDarkMode} />}
                  {currentStep === 2 && <Step3 />}
                </Form>

                {/* Navigation */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}`
                }}>
                  <Button
                    onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
                    disabled={currentStep === 0}
                    icon={<ArrowLeftOutlined />} size="large"
                    style={{ borderRadius: 8, fontWeight: 600, minWidth: 160, height: 44, borderColor: C.border, color: C.textPrimary }}
                  >
                    {currentStep > 0 ? `Back to ${STEPS[currentStep - 1].label}` : ''}
                  </Button>

                  {currentStep < 2 ? (
                    <Button type="primary" onClick={handleNext} loading={saving}
                      size="large" style={{ background: C.dark, borderColor: C.dark, borderRadius: 8, fontWeight: 700, minWidth: 200, height: 44 }}>
                      Continue to {STEPS[currentStep + 1].label} <ArrowRightOutlined />
                    </Button>
                  ) : (
                    <Button type="primary" onClick={handleSubmit} loading={submitting}
                      icon={<CheckCircleFilled />} size="large"
                      style={{ background: C.mint, borderColor: C.mint, borderRadius: 8, fontWeight: 700, minWidth: 220, height: 44 }}>
                      Submit Application
                    </Button>
                  )}
                </div>
              </div>

            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <StatusSidebar savedAt={savedAt} step={currentStep} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}
