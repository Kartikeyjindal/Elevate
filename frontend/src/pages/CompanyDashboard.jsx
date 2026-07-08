import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import { 
  Layout, Card, Row, Col, Statistic, Button, 
  Form, InputNumber, Table, Tag, Space, Typography, Progress, message, Alert,
  Dropdown, Avatar, Modal, Divider
} from 'antd';
import { 
  WalletOutlined, RiseOutlined, PieChartOutlined, 
  LogoutOutlined, DollarOutlined,
  CalendarOutlined, BuildOutlined, ArrowUpOutlined, UserOutlined, EditOutlined,
  SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Custom Interactive SVG Valuation Curve Graph for Company
function ValuationGraph({ data }) {
  if (!data || data.length < 2) return null;
  const width = 380;
  const height = 150;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 30) - 15;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  const gradId = `company-spark-grad-${Math.floor(Math.random() * 1000000)}`;
  const strokeColor = '#00d09c'; // Groww Green
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L ${width},${height} L 0,${height} Z`}
        fill={`url(#${gradId})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 30) - 15;
        return (
          <g key={idx}>
            <circle
              cx={x}
              cy={y}
              r="4.5"
              fill={strokeColor}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={x}
              y={y - 12}
              textAnchor="middle"
              fill="#7c8099"
              fontSize="10"
              fontWeight="600"
            >
              ${(val / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [startup, setStartup] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [updatingValuation, setUpdatingValuation] = useState(false);

  // Theme Toggler state
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



  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('themeChanged'));
  };

  const tc = isDarkMode ? '#f1f5f9' : '#44475b';
  const tSec = isDarkMode ? '#9ca3af' : '#7c8099';
  const bgCard = isDarkMode ? '#121620' : '#ffffff';
  const borderCl = isDarkMode ? '#1f2937' : '#edf2f7';
  const bgInner = isDarkMode ? '#1a2235' : '#f8fafc';

  const [newValuation, setNewValuation] = useState(250000);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/startups/my-startup`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load company profile');
      }
      
      const data = await res.json();
      setStartup(data.startup);
      setInvestments(data.investments.map(inv => ({ ...inv, key: inv._id })));

      const savedUser = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(savedUser);
    } catch (err) {
      message.error(err.message || 'Failed to load dashboard data');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Logged out successfully');
    navigate('/login');
  };

  const profileMenu = {
    items: [
      {
        key: 'profile',
        label: 'My Startup Profile',
        icon: <UserOutlined />,
        onClick: () => setProfileModalVisible(true)
      },
      {
        key: 'theme',
        label: isDarkMode ? 'Bright Mode' : 'Dark Mode',
        icon: isDarkMode ? <SunOutlined style={{ color: '#eab308' }} /> : <MoonOutlined style={{ color: '#4b5563' }} />,
        onClick: toggleTheme
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout
      }
    ]
  };

  const handleUpdateValuation = async () => {
    if (!newValuation || newValuation <= 0) {
      message.error('Please enter a valid valuation amount');
      return;
    }

    setUpdatingValuation(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/startups/my-startup/valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valuation: newValuation })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update valuation');
      }

      message.success('Valuation timeline updated successfully!');
      setNewValuation(0);
      fetchData();
    } catch (err) {
      message.error(err.message);
    } finally {
      setUpdatingValuation(false);
    }
  };

  const backersColumns = [
    {
      title: 'Investor Name',
      dataIndex: 'investorName',
      key: 'investorName',
      render: (text) => <Text style={{ color: tc, fontWeight: 600 }}><UserOutlined style={{ marginRight: 6, color: '#9ca3af' }} />{text}</Text>
    },
    {
      title: 'Investor Email',
      dataIndex: 'investorEmail',
      key: 'investorEmail',
      render: (email) => <Text style={{ color: '#7c8099' }}>{email}</Text>
    },
    {
      title: 'Capital Pledged',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{amount.toLocaleString()}</Text>
    },
    {
      title: 'Pledge Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => <Text style={{ color: '#7c8099' }}><CalendarOutlined style={{ marginRight: 6 }} />{new Date(date).toLocaleDateString()}</Text>
    }
  ];

  if (!startup) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0b0f19' : '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ maxWidth: 450, width: '100%', textAlign: 'center', padding: 24 }}>
          <Title level={4} style={{ color: '#eb5757', fontFamily: 'Outfit' }}>Profile Pending Setup</Title>
          <Paragraph style={{ color: '#7c8099' }}>
            We could not locate an associated startup. If you registered recently, make sure your company application was submitted.
          </Paragraph>
          <Button type="primary" onClick={handleLogout}>Log Out</Button>
        </Card>
      </Layout>
    );
  }

  const latestValuation = startup.pastValuations?.[startup.pastValuations.length - 1] || 0;
  const initialValuation = startup.pastValuations?.[0] || 1;
  const growthMultiplier = Math.round(((latestValuation - initialValuation) / initialValuation) * 100);

  const statusColor = startup.status === 'approved' ? 'success' : startup.status === 'rejected' ? 'error' : 'warning';

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0b0f19' : '#f4f6f9' }}>
      {/* Navigation Header */}
      <Header style={{ 
        background: isDarkMode ? '#0c101b' : '#ffffff', 
        borderBottom: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 70
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8
          }}>
            <RiseOutlined style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#44475b', margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>elevate company</Title>
        </div>

        <Space size="large">
          <Tag color={statusColor} style={{ border: 'none', padding: '4px 12px', borderRadius: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            {startup.status}
          </Tag>
          <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
            <Avatar 
              size="default" 
              style={{ 
                backgroundColor: '#00d09c', 
                cursor: 'pointer', 
                verticalAlign: 'middle',
                border: '2px solid #00d09c',
                boxShadow: '0 2px 8px rgba(0,208,156,0.2)'
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </Space>
      </Header>

      <Content className="fade-in-section" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Application Incomplete Banner */}
        {!startup.applicationComplete && (
          <Alert
            style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #fde68a' }}
            type="warning"
            showIcon
            message={
              <span style={{ fontWeight: 700, color: '#92400e' }}>
                Your startup application is incomplete
              </span>
            }
            description="Complete the 3-step application form (Basic Info → Financials → Strategy) to get listed on the Elevate marketplace."
            action={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate('/company/apply')}
                style={{ background: '#1a1d2e', borderColor: '#1a1d2e', fontWeight: 700, borderRadius: 8 }}
              >
                Complete Application
              </Button>
            }
          />
        )}

        {/* Application Rejected Banner */}
        {startup.status === 'rejected' && (
          <Alert
            style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #fecaca' }}
            type="error"
            showIcon
            message={
              <span style={{ fontWeight: 700, color: '#991b1b' }}>
                Your startup application was rejected
              </span>
            }
            description={
              <div>
                <Text style={{ display: 'block', marginBottom: 8, color: '#7f1d1d' }}>
                  <strong>Basis for Rejection:</strong> {startup.rejectionReason || 'No reason specified by admin.'}
                </Text>
                <Text style={{ fontSize: 13, color: '#7f1d1d' }}>
                  Please edit and update your application details to address the feedback and submit again.
                </Text>
              </div>
            }
            action={
              <Button
                type="primary"
                danger
                icon={<EditOutlined />}
                onClick={() => navigate('/company/apply')}
                style={{ fontWeight: 700, borderRadius: 8 }}
              >
                Edit Application
              </Button>
            }
          />
        )}

        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: tc, margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
            {startup.name} Dashboard
          </Title>
          <Paragraph style={{ color: '#7c8099', fontSize: '15px' }}>
            Monitor your campaign crowdfunding, update corporate valuation metrics, and trace backer commitments.
          </Paragraph>
        </div>

        {/* Stats Row */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic 
                title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Latest Valuation</span>} 
                value={`₹${latestValuation.toLocaleString()}`} 
                valueStyle={{ color: tc, fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                suffix={growthMultiplier > 0 ? (
                  <span style={{ color: '#00d09c', fontSize: 13, fontWeight: 700, marginLeft: 8 }}>
                    <ArrowUpOutlined /> +{growthMultiplier}%
                  </span>
                ) : null}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic 
                title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Funding Secured</span>} 
                value={`₹${(startup.raisedAmount || 0).toLocaleString()}`} 
                valueStyle={{ color: '#00d09c', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic 
                title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Backer Pledges</span>} 
                value={investments.length} 
                valueStyle={{ color: tc, fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Main Info & Chart */}
          <Col xs={24} lg={16}>
            <Card style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: tc, marginBottom: 20, fontFamily: 'Outfit', fontWeight: 700 }}>Valuation Progress Chart</Title>
              <div style={{ padding: '16px 8px', background: bgInner, borderRadius: 12, border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', marginBottom: 12 }}>
                <ValuationGraph data={startup.pastValuations} />
              </div>
              <Text type="secondary" style={{ fontSize: 12, color: '#7c8099' }}>
                * This graph plots the history of your corporate valuations submitted over time.
              </Text>
            </Card>

            <Card>
              <Title level={4} style={{ color: tc, marginBottom: 20, fontFamily: 'Outfit', fontWeight: 700 }}>Pledged Capital Ledger</Title>
              <Table 
                dataSource={investments} 
                columns={backersColumns} 
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: <span style={{ color: '#7c8099' }}>No investment pledges received yet.</span> }}
                style={{ background: 'transparent' }}
              />
            </Card>
          </Col>

          {/* Controls Panel */}
          <Col xs={24} lg={8}>
            <Card style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: tc, marginBottom: 16, fontFamily: 'Outfit', fontWeight: 700 }}>Update Valuation</Title>
              <Paragraph style={{ color: '#7c8099', fontSize: 13 }}>
                Declare a new round valuation point to represent your startup's latest financial valuation.
              </Paragraph>
              <Form layout="vertical" onFinish={handleUpdateValuation}>
                <Form.Item label={<span style={{ color: tc, fontWeight: 600 }}>New Valuation (INR)</span>}>
                  <InputNumber
                    min={1}
                    value={newValuation}
                    onChange={setNewValuation}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                    style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: isDarkMode ? '1px solid #1f2937' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
                  />
                </Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={updatingValuation}
                  block
                  style={{
                    backgroundColor: '#00d09c',
                    borderColor: '#00d09c',
                    color: '#fff',
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 700
                  }}
                >
                  Publish Valuation
                </Button>
              </Form>
            </Card>

            <Card>
              <Title level={4} style={{ color: tc, marginBottom: 16, fontFamily: 'Outfit', fontWeight: 700 }}>Venture Details</Title>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: '#7c8099', fontWeight: 700, fontSize: 11, display: 'block', marginBottom: 4 }}>MARKETING MIX VARIABLES (4 Ps)</Text>
                <Paragraph style={{ color: tc, fontSize: 13, lineHeight: '1.5' }}>{startup.marketingMixVariables}</Paragraph>
              </div>
              <div>
                <Text style={{ color: '#7c8099', fontWeight: 700, fontSize: 11, display: 'block', marginBottom: 4 }}>FINANCIAL PROCUREMENT & CHAIN</Text>
                <Paragraph style={{ color: tc, fontSize: 13, lineHeight: '1.5' }}>{startup.financialProcurement}</Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      {/* ── My Startup Profile Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: tc }}>
            <UserOutlined style={{ color: '#00d09c' }} />
            <span>My Startup Profile</span>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={[
          <Button key="close" type="primary" style={{ backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 8 }} onClick={() => setProfileModalVisible(false)}>
            Close
          </Button>
        ]}
        style={{ borderRadius: 16 }}
      >
        <div style={{ padding: '8px 0' }}>
          {startup && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
              <Avatar 
                size={70} 
                style={{ 
                  backgroundColor: '#00d09c', 
                  marginBottom: 10,
                  border: '3px solid #00d09c',
                  boxShadow: '0 4px 10px rgba(0,208,156,0.15)'
                }}
                icon={<BuildOutlined style={{ fontSize: 32 }} />}
              />
              <Title level={4} style={{ color: tc, margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
                {startup.name}
              </Title>
              <Tag color={statusColor} style={{ border: 'none', padding: '2px 10px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 6 }}>
                Status: {startup.status}
              </Tag>
            </div>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ background: bgInner, padding: 14, borderRadius: 12, border: `1px solid ${borderCl}` }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: tSec, fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Founder / Representative</Text>
              <Text style={{ color: tc, fontSize: 14, fontWeight: 600 }}>{startup?.founderName}</Text>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ color: tSec, fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Venture Classification</Text>
              <Text style={{ color: tc, fontSize: 14, fontWeight: 600 }}>{startup?.category}</Text>
            </div>
            <div>
              <Text style={{ color: tSec, fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Funding Campaign Target</Text>
              <Text style={{ color: '#00d09c', fontSize: 15, fontWeight: 800 }}>
                ₹{(startup?.fundingGoal || 10000000).toLocaleString()}
              </Text>
            </div>
          </div>
        </div>
      </Modal>
      </Content>
    </Layout>
  );
}
