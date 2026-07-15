import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import { smoothToggleTheme } from '../utils/themeUtils';
import { 
  Layout, Card, Row, Col, Statistic, Button, Modal, 
  Form, Input, InputNumber, Table, Tabs, Tag, Space, Typography, Progress, message,
  Slider, Select, Radio, Divider, Alert, Spin, Result, Steps, Checkbox, Dropdown, Avatar, Badge, Tooltip
} from 'antd';
import { 
  WalletOutlined, RiseOutlined, PieChartOutlined, 
  FileAddOutlined, LogoutOutlined, DollarOutlined, FundOutlined,
  SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined, BookOutlined,
  CreditCardOutlined, BankOutlined, QrcodeOutlined, CheckCircleOutlined, LoadingOutlined,
  SafetyCertificateOutlined, SwapOutlined, KeyOutlined, TransactionOutlined,
  SunOutlined, MoonOutlined, UserOutlined, SettingOutlined, ClockCircleOutlined,
  RobotOutlined, ShoppingOutlined, ThunderboltOutlined, BulbOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import useIdleTimeout, { getIdleTimeoutMinutes, setIdleTimeoutMinutes } from '../hooks/useIdleTimeout';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;


// Helper for basket icons mapping
const getBasketIcon = (iconName) => {
  switch (iconName) {
    case 'RobotOutlined': return <RobotOutlined style={{ fontSize: 24, color: '#3b82f6' }} />;
    case 'ShoppingOutlined': return <ShoppingOutlined style={{ fontSize: 24, color: '#ec4899' }} />;
    case 'TransactionOutlined': return <TransactionOutlined style={{ fontSize: 24, color: '#fbbf24' }} />;
    case 'EcoOutlined': return <BulbOutlined style={{ fontSize: 24, color: '#10b981' }} />;
    default: return <FundOutlined style={{ fontSize: 24, color: '#00d09c' }} />;
  }
};

// Groww-style Mint Green Sparkline Component
function Sparkline({ data }) {
  if (!data || data.length < 2) return null;
  const width = 110;
  const height = 45;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  const gradId = `spark-grad-${Math.floor(Math.random() * 1000000)}`;
  
  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = isUp ? '#00d09c' : '#eb5757'; // Mint Green vs Coral Red
  
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
        r="3.5"
        fill={strokeColor}
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Groww-style Mint Green Valuation Sparkline Component
function ValuationSparkline({ data, projectionCount = 0 }) {
  if (!data || data.length < 2) return null;
  const width = 600;
  const height = 150;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 30) - 15;
    return { x, y, val };
  });

  const historicalPoints = points.slice(0, points.length - projectionCount);
  const projectedPoints = points.slice(points.length - projectionCount - 1);

  const historicalPath = historicalPoints.length > 0 ? `M ${historicalPoints.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
  const projectedPath = projectedPoints.length > 0 ? `M ${projectedPoints.map(p => `${p.x},${p.y}`).join(' L ')}` : '';

  const gradId = `valuation-spark-grad-${Math.floor(Math.random() * 1000000)}`;
  const strokeColor = '#00d09c'; // Groww Green
  const projectedColor = '#ea580c'; // Warm Orange

  const formatCurrencyShort = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Full area fill under line */}
        {points.length > 0 && (
          <path
            d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${width},${height} L 0,${height} Z`}
            fill={`url(#${gradId})`}
          />
        )}

        {/* Historical Line */}
        {historicalPath && (
          <path
            d={historicalPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Projected Line */}
        {projectedPath && projectionCount > 0 && (
          <path
            d={projectedPath}
            fill="none"
            stroke={projectedColor}
            strokeWidth="3"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points and Labels */}
        {points.map((pt, idx) => {
          const isProjected = idx >= data.length - projectionCount;
          const color = isProjected ? projectedColor : strokeColor;
          return (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isProjected ? "5" : "4.5"}
                fill={color}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fill={isProjected ? projectedColor : "#7c8099"}
                fontSize="10"
                fontWeight={isProjected ? "700" : "600"}
              >
                {formatCurrencyShort(pt.val)}
              </text>
              <text
                x={pt.x}
                y={height - 2}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="8"
                fontWeight="500"
              >
                {isProjected ? `Round +${idx - (data.length - projectionCount - 1)}` : `Round ${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
      {projectionCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 11 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7c8099' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: strokeColor }}></span>
            Historical
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7c8099' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: projectedColor }}></span>
            Projected
          </span>
        </div>
      )}
    </div>
  );
}

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [myInvestments, setMyInvestments] = useState([]);
  const [investModalVisible, setInvestModalVisible] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [companyDetailsVisible, setCompanyDetailsVisible] = useState(false);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);
  const [companyDetailsData, setCompanyDetailsData] = useState(null);
  const [currentCompanyHoldings, setCurrentCompanyHoldings] = useState([]);
  const [investAmount, setInvestAmount] = useState(10000);
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  const [expandedStartupId, setExpandedStartupId] = useState(null);
  const [startupForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [blogs, setBlogs] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [allocationView, setAllocationView] = useState('chart');
  const [baskets, setBaskets] = useState([]);
  const [basketsLoading, setBasketsLoading] = useState(false);
  const [basketModalVisible, setBasketModalVisible] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [basketInvestAmount, setBasketInvestAmount] = useState(10000);
  const [submittingBasketInvest, setSubmittingBasketInvest] = useState(false);
  const [basketPaymentType, setBasketPaymentType] = useState('onetime'); // 'onetime' | 'sip'
  const [sipDuration, setSipDuration] = useState(12); // months

  // Feature 3: Watchlist
  const [watchlist, setWatchlist] = useState([]); // array of startup IDs
  const [togglingWatchlist, setTogglingWatchlist] = useState(new Set());
  const [marketplaceSubTab, setMarketplaceSubTab] = useState('all'); // 'all' | 'watchlist'

  // Feature 5: Investment Timeline
  const [timelineFilter, setTimelineFilter] = useState('all'); // 'all' | 'investments' | 'deposits' | 'withdrawals'

  // Feature 10: Founder Q&A / Updates
  const [companyUpdates, setCompanyUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [companyModalTab, setCompanyModalTab] = useState('overview'); // 'overview' | 'updates'
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // States for Dynamic Valuation Sliders & Live Activity Feed
  const [projectionGrowth, setProjectionGrowth] = useState(25);
  const [projectionRetention, setProjectionRetention] = useState(85);
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, title: 'Investment', message: 'Rohan K. invested ₹20,000 in BOXABL', time: '1m ago', color: '#00d09c' },
    { id: 2, title: 'Milestone', message: 'Greenfield Robotics hit 70% of funding target', time: '3m ago', color: '#fbbf24' },
    { id: 3, title: 'Listing Approved', message: 'SapientX approved for retail investment', time: '5m ago', color: '#3b82f6' },
    { id: 4, title: 'Deposit', message: 'Aanya S. deposited ₹1,00,000 to wallet', time: '8m ago', color: '#10b981' },
    { id: 5, title: 'Valuation Update', message: 'Trade Algo valuation increased to ₹120 Cr', time: '12m ago', color: '#8b5cf6' }
  ]);

  // Hook for simulating live activity feed ticker
  useEffect(() => {
    if (!startups || startups.length === 0) return;
    const mockFirstNames = ['Aditya', 'Neha', 'Sanjay', 'Priya', 'Kunal', 'Deepak', 'Siddharth', 'Ananya', 'Rohan', 'Aarav'];
    const mockLastNames = ['Sharma', 'Verma', 'Patel', 'Goel', 'Kapoor', 'Mehta', 'Kumar', 'Sen', 'Dutt', 'Singh'];
    const mockAmounts = [5000, 10000, 15000, 25000, 50000, 100000];
    
    const interval = setInterval(() => {
      const randomStartup = startups[Math.floor(Math.random() * startups.length)];
      const randomName = `${mockFirstNames[Math.floor(Math.random() * mockFirstNames.length)]} ${mockLastNames[Math.floor(Math.random() * mockLastNames.length)].charAt(0)}.`;
      const randomAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];
      
      const eventTypes = [
        {
          title: 'Investment',
          message: `${randomName} invested ₹${randomAmount.toLocaleString()} in ${randomStartup.name}`,
          color: '#00d09c'
        },
        {
          title: 'Wallet Deposit',
          message: `${randomName} deposited ₹${randomAmount.toLocaleString()} to wallet`,
          color: '#10b981'
        },
        {
          title: 'Goal Progress',
          message: `${randomStartup.name} is now at ${Math.min(99, Math.floor(50 + Math.random() * 45))}% of their target`,
          color: '#fbbf24'
        }
      ];
      
      const selectedEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      setActivityFeed(prev => [
        {
          id: Date.now(),
          title: selectedEvent.title,
          message: selectedEvent.message,
          time: 'Just now',
          color: selectedEvent.color
        },
        ...prev.slice(0, 7)
      ]);
    }, 15000);
    return () => clearInterval(interval);
  }, [startups]);

  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Hook for rotating the active ticker activity every 8 seconds
  useEffect(() => {
    if (activityFeed.length === 0) return;
    const interval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % activityFeed.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activityFeed]);

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
    smoothToggleTheme(isDarkMode, (nextTheme) => {
      localStorage.setItem('theme', nextTheme);
      window.dispatchEvent(new Event('themeChanged'));
    });
  };

  const tc = isDarkMode ? '#f1f5f9' : '#44475b';
  const tSec = isDarkMode ? '#9ca3af' : '#7c8099';
  const bgCard = isDarkMode ? '#121620' : '#ffffff';
  const bgInner = isDarkMode ? '#1a2235' : '#f8fafc';
  const borderCl = isDarkMode ? '#1f2937' : '#edf2f7';
  const bgBtnCancel = isDarkMode ? '#1f2937' : '#f3f4f6';

  const [saveCard, setSaveCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('saved_cards') || '[]');
    setSavedCards(loaded);
  }, []);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profile_photo') || '');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [profileAddress, setProfileAddress] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profilePan, setProfilePan] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (profileModalVisible && currentUser) {
      setProfileAddress(currentUser.address || '');
      setProfileDob(currentUser.dob || '');
      setProfilePan(currentUser.panCard || '');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [profileModalVisible, currentUser]);



  // Wallet / Payment Gateway States
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [walletAction, setWalletAction] = useState('deposit'); // 'deposit' or 'withdraw'
  const [walletAmount, setWalletAmount] = useState(5000);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bankDetails, setBankDetails] = useState({ accountNo: '', ifsc: '', holderName: '', bankName: 'HDFC Bank' });
  const [processingWallet, setProcessingWallet] = useState(false);
  const [walletStep, setWalletStep] = useState(0); // 0 = input, 1 = processing, 2 = success
  const [countdown, setCountdown] = useState(300); // 5 mins for UPI QR Code
  const [showQrCode, setShowQrCode] = useState(false);

  // Razorpay Specific States
  const [mockRazorpayVisible, setMockRazorpayVisible] = useState(false);
  const [razorpayOrderInfo, setRazorpayOrderInfo] = useState(null);
  const [mockRazorpayLoading, setMockRazorpayLoading] = useState(false);

  // Exit Simulator & Transactions States
  const [exitMultiple, setExitMultiple] = useState(5);
  const [exitTimeframe, setExitTimeframe] = useState(3);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleMockRazorpayPayment = async (status) => {
    if (status === 'fail') {
      setMockRazorpayVisible(false);
      message.error('Payment failed: Transaction declined by bank (Simulated)');
      return;
    }
    
    setMockRazorpayLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const verifyRes = await fetch(`${API_URL}/api/wallet/deposit/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderInfo?.id || 'order_mock_dummy',
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature_abc123',
          amount: walletAmount,
          isMock: true
        })
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Mock verification failed');
      }
      
      setMockRazorpayVisible(false);
      setWalletStep(2);
      
      const updatedUser = { ...currentUser, walletBalance: verifyData.updatedWalletBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      message.success('Simulated test payment successful!');
      fetchData();
    } catch (err) {
      message.error(`Simulated Payment Failed: ${err.message}`);
    } finally {
      setMockRazorpayLoading(false);
    }
  };

  // Timer for QR code expiry
  useEffect(() => {
    let timer;
    if (showQrCode && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowQrCode(false);
      setCountdown(300);
    }
    return () => clearInterval(timer);
  }, [showQrCode, countdown]);

  const handleDownloadStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Failed to open export window. Please allow popups.');
      return;
    }

    const txRows = walletTransactions.map(tx => {
      const isCredit = ['deposit', 'sell_return', 'refund'].includes(tx.type);
      return `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px; font-size: 13px; color: #2d3748;">${new Date(tx.createdAt).toLocaleString()}</td>
          <td style="padding: 12px; font-size: 13px;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: ${isCredit ? '#e6fffa' : '#fff5f5'}; color: ${isCredit ? '#319795' : '#e53e3e'};">
              ${tx.type.replace('_', ' ').toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; font-size: 13px; font-weight: 700; text-align: right; color: ${isCredit ? '#38a169' : '#e53e3e'};">
            ${isCredit ? '+' : '-'}₹${tx.amount.toLocaleString()}
          </td>
          <td style="padding: 12px; font-size: 13px; color: #4a5568;">${tx.description || 'Wallet transaction'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Elevate Equity - Account Statement</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; margin: 0; padding: 40px; color: #2d3748; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #00d09c; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 800; text-align: right; }
          .metadata { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; color: #718096; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .th { padding: 12px; background: #f7fafc; border-bottom: 2px solid #edf2f7; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #718096; }
          .footer { text-align: center; border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 11px; color: #a0aec0; margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🚀 ELEVATE EQUITY</div>
          <div class="title">ACCOUNT STATEMENT</div>
        </div>
        <div class="metadata">
          <div>
            <strong>Investor Name:</strong> ${currentUser ? currentUser.name : 'Platform Investor'}<br/>
            <strong>Email:</strong> ${currentUser ? currentUser.email : ''}
          </div>
          <div style="text-align: right;">
            <strong>Statement Date:</strong> ${new Date().toLocaleDateString()}<br/>
            <strong>Current Balance:</strong> ₹${currentUser ? currentUser.walletBalance.toLocaleString() : '0'}
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th class="th" style="width: 25%;">Timestamp</th>
              <th class="th" style="width: 15%;">Transaction Type</th>
              <th class="th" style="width: 20%; text-align: right;">Amount (INR)</th>
              <th class="th" style="width: 40%;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${txRows}
          </tbody>
        </table>
        <div class="footer">
          © 2016-2026 Elevate Equity. Vaishnavi Tech Park, South Tower, Bangalore, Karnataka. This is a computer-generated document and requires no signature.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleWalletTransaction = async () => {
    if (!walletAmount || walletAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }

    if (walletAction === 'withdraw' && currentUser.walletBalance < walletAmount) {
      message.error('Insufficient funds in wallet');
      return;
    }

    if (walletAction === 'deposit') {
      if (paymentMethod === 'upi' && !showQrCode && !upiId.includes('@')) {
        message.error('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
      if (paymentMethod === 'card') {
        const cleanCard = cardDetails.number.replace(/\s/g, '');
        if (cleanCard.length < 16) {
          message.error('Please enter a valid 16-digit card number');
          return;
        }
        if (!cardDetails.expiry || !cardDetails.expiry.includes('/') || cardDetails.cvv.length < 3) {
          message.error('Please fill in valid card expiry (MM/YY) and CVV');
          return;
        }
        if (!cardDetails.name) {
          message.error('Please enter the Cardholder name');
          return;
        }
      }
    } else {
      if (!bankDetails.accountNo || bankDetails.accountNo.length < 9) {
        message.error('Please enter a valid Bank Account Number');
        return;
      }
      if (!bankDetails.ifsc || bankDetails.ifsc.length !== 11) {
        message.error('Please enter a valid 11-character IFSC Code');
        return;
      }
      if (!bankDetails.holderName) {
        message.error('Please enter the Account Holder name');
        return;
      }
    }

    const token = localStorage.getItem('token');

    if (walletAction === 'deposit') {
      setProcessingWallet(true);
      setWalletStep(1);
      try {
        const orderRes = await fetch(`${API_URL}/api/wallet/deposit/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: walletAmount })
        });
        
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Failed to initialize payment order');
        }
        
        const isLoaded = await loadRazorpayScript();
        
        if (orderData.isMock || !isLoaded) {
          setRazorpayOrderInfo(orderData);
          setProcessingWallet(false);
          setWalletStep(0);
          setMockRazorpayVisible(true);
          return;
        }
        
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Elevate Equity',
          description: `Deposit ₹${walletAmount} to Wallet`,
          order_id: orderData.id,
          handler: async function (response) {
            setProcessingWallet(true);
            setWalletStep(1);
            try {
              const verifyRes = await fetch(`${API_URL}/api/wallet/deposit/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: walletAmount,
                  isMock: false
                })
              });
              
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Signature verification failed');
              }
              
              setWalletStep(2);
              const updatedUser = { ...currentUser, walletBalance: verifyData.updatedWalletBalance };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setCurrentUser(updatedUser);
              message.success('Payment authorized and wallet credited successfully!');
              fetchData();
            } catch (err) {
              message.error(`Verification Failed: ${err.message}`);
              setWalletStep(0);
            } finally {
              setProcessingWallet(false);
            }
          },
          prefill: {
            name: currentUser?.name || currentUser?.username || 'Elevate User',
            email: currentUser?.email || 'user@example.com'
          },
          notes: {
            userId: currentUser?._id
          },
          theme: {
            color: '#00d09c'
          },
          modal: {
            ondismiss: function() {
              setProcessingWallet(false);
              setWalletStep(0);
              message.warning('Payment cancelled by user');
            }
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        message.error(`Payment Initiation Failed: ${err.message}`);
        setProcessingWallet(false);
        setWalletStep(0);
      }
      return;
    }

    // Withdrawal Flow
    setWalletStep(1); // Show processing screen
    setProcessingWallet(true);
    try {
      // Simulate real-world transaction authorization/validation steps
      await new Promise(resolve => setTimeout(resolve, 3000));

      const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: walletAmount })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      // Success
      setWalletStep(2);
      
      if (paymentMethod === 'card' && saveCard) {
        const cleanCard = cardDetails.number.replace(/\s/g, '');
        const last4 = cleanCard.slice(-4);
        const cardType = cleanCard.startsWith('4') ? 'Visa' : 'Mastercard';
        
        // Prevent duplicate card additions
        const exists = savedCards.some(c => c.number.replace(/\s/g, '') === cleanCard);
        if (!exists) {
          const newCard = {
            id: Date.now(),
            number: cardDetails.number,
            expiry: cardDetails.expiry,
            name: cardDetails.name,
            last4,
            cardType
          };
          const updatedCards = [...savedCards, newCard];
          setSavedCards(updatedCards);
          localStorage.setItem('saved_cards', JSON.stringify(updatedCards));
        }
        setSaveCard(false);
      }

      const updatedUser = { ...currentUser, walletBalance: data.updatedWalletBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Clean form inputs
      setUpiId('');
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      setBankDetails({ accountNo: '', ifsc: '', holderName: '', bankName: 'HDFC Bank' });
      setShowQrCode(false);

      // Refresh list
      fetchData();
    } catch (err) {
      message.error(err.message);
      setWalletStep(0); // return to inputs
    } finally {
      setProcessingWallet(false);
    }
  };


  // Fetch approved deals
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const startupRes = await fetch(`${API_URL}/api/startups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (startupRes.status === 401) {
        handleLogout();
        return;
      }
      const startupData = await startupRes.json();
      setStartups(startupData);

      // Fetch live user info
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        localStorage.setItem('user', JSON.stringify(meData));
        setCurrentUser(meData);
      }

      // Fetch live user investments
      const myInvestmentsRes = await fetch(`${API_URL}/api/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (myInvestmentsRes.ok) {
        const myInvestmentsData = await myInvestmentsRes.json();
        const mappedInvestments = myInvestmentsData.map(inv => ({
          key: inv._id,
          startupId: inv.startupId?._id,
          startupName: inv.startupId?.name || 'Unknown Startup',
          amount: inv.amount,
          timestamp: new Date(inv.timestamp || inv.createdAt).toLocaleString(),
          rawDate: new Date(inv.timestamp || inv.createdAt),
          startupObj: inv.startupId
        }));
        setMyInvestments(mappedInvestments);
      }

      // Fetch blogs/tips
      const blogsRes = await fetch(`${API_URL}/api/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
      }

      // Fetch live market news
      setNewsLoading(true);
      const newsRes = await fetch(`${API_URL}/api/blogs/market-news`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setMarketNews(newsData);
      }
      setNewsLoading(false);

      // Fetch baskets
      setBasketsLoading(true);
      try {
        const basketsRes = await fetch(`${API_URL}/api/baskets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (basketsRes.ok) {
          const basketsData = await basketsRes.json();
          setBaskets(basketsData);
        }
      } catch (err) {
        console.error('Failed to load baskets:', err);
      }
      setBasketsLoading(false);

      // Fetch wallet transactions
      setLoadingTransactions(true);
      try {
        const txsRes = await fetch(`${API_URL}/api/wallet/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const txsCt = txsRes.headers.get('content-type') || '';
        if (txsRes.ok && txsCt.includes('application/json')) {
          const txsData = await txsRes.json();
          setWalletTransactions(Array.isArray(txsData) ? txsData : []);
        }
      } catch (_) {
        // Silently fail - transactions just won't show
      }
      setLoadingTransactions(false);

      // Fetch watchlist
      try {
        const wlRes = await fetch(`${API_URL}/api/watchlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (wlRes.ok) {
          const wlData = await wlRes.json();
          setWatchlist(wlData.map(s => s._id || s));
        }
      } catch (err) {
        console.error('Failed to load watchlist:', err);
      }
    } catch (err) {
      message.error('Failed to load dashboard data');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.info('Session ended. You have been logged out.');
    navigate('/login');
  }, [navigate]);

  // ── Idle Timeout ──────────────────────────────────────────────
  const { warningVisible, secondsLeft, resetTimer } = useIdleTimeout(handleLogout);
  const [selectedTimeout, setSelectedTimeout] = useState(getIdleTimeoutMinutes());
  const TIMEOUT_OPTIONS = [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
  ];
  const saveIdleSetting = () => {
    setIdleTimeoutMinutes(selectedTimeout);
    resetTimer();
    message.success(`Auto-logout set to ${selectedTimeout} minute${selectedTimeout > 1 ? 's' : ''}`);
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    setUpdatingProfile(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: newPassword || undefined,
          address: profileAddress,
          dob: profileDob,
          panCard: profilePan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile details');
      }

      message.success('Investor profile updated successfully!');
      
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      setNewPassword('');
      setConfirmPassword('');
      setProfileModalVisible(false);
    } catch (err) {
      message.error(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const profileMenu = {
    items: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />,
        onClick: () => setProfileModalVisible(true)
      },
      {
        key: 'funds',
        label: 'Funds Manager',
        icon: <WalletOutlined />,
        onClick: () => {
          setWalletAction('deposit');
          setWalletStep(0);
          setWalletAmount(5000);
          setWalletModalVisible(true);
        }
      },
      {
        key: 'setting',
        label: 'Settings',
        icon: <SettingOutlined />,
        onClick: () => setSettingsModalVisible(true)
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

  // Feature 3: Toggle watchlist
  const handleToggleWatchlist = async (startupId) => {
    const token = localStorage.getItem('token');
    setTogglingWatchlist(prev => new Set([...prev, startupId]));
    try {
      const res = await fetch(`${API_URL}/api/watchlist/${startupId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist);
        message.success(data.action === 'added' ? '🔖 Added to Watchlist' : '✓ Removed from Watchlist', 2);
      }
    } catch (err) {
      message.error('Failed to update watchlist');
    } finally {
      setTogglingWatchlist(prev => { const s = new Set(prev); s.delete(startupId); return s; });
    }
  };

  const handleOpenCompanyDetails = async (startup, holdingTransactions = []) => {
    setCompanyDetailsVisible(true);
    setCompanyDetailsLoading(true);
    setCompanyDetailsData(null);
    setCurrentCompanyHoldings(holdingTransactions);
    setProjectionGrowth(25);
    setProjectionRetention(85);
    setCompanyModalTab('overview');
    setCompanyUpdates([]);
    setQuestionText('');
    try {
      const token = localStorage.getItem('token');
      const [detailsRes, updatesRes] = await Promise.all([
        fetch(`${API_URL}/api/startups/${startup._id}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/startups/${startup._id}/updates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (detailsRes.ok) {
        const data = await detailsRes.json();
        setCompanyDetailsData(data);
      } else {
        message.error('Failed to load company details.');
      }
      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        setCompanyUpdates(updatesData);
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching company details.');
    } finally {
      setCompanyDetailsLoading(false);
    }
  };

  // Feature 7: Helper to get index for Milestone step
  const getMilestoneStepIndex = (milestoneStage) => {
    const mapping = {
      'idea': 0,
      'mvp': 1,
      'revenue': 2,
      'growth': 3,
      'scale': 4
    };
    return mapping[milestoneStage?.toLowerCase()] ?? 1; // Default to MVP
  };

  // Feature 10: Post question in Updates & Q&A
  const handlePostQuestion = async () => {
    if (!questionText || questionText.trim().length < 5) {
      message.error("Question must be at least 5 characters long.");
      return;
    }
    setSubmittingQuestion(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/startups/${companyDetailsData?.startup?._id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: questionText.trim() })
      });
      if (res.ok) {
        const newQuestion = await res.json();
        setCompanyUpdates(prev => [newQuestion, ...prev]);
        setQuestionText('');
        message.success('Question posted successfully!');
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Failed to post question.');
      }
    } catch (err) {
      console.error(err);
      message.error('An error occurred while posting your question.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleOpenBasketInvestModal = (basket) => {
    setSelectedBasket(basket);
    setBasketInvestAmount(5000); // Default minimum
    setBasketModalVisible(true);
  };

  const handleConfirmBasketInvestment = async () => {
    if (basketInvestAmount < 5000) {
      message.error("Minimum investment in a basket is ₹5,000");
      return;
    }

    if (currentUser.walletBalance < basketInvestAmount) {
      message.error("Insufficient wallet balance");
      return;
    }

    setSubmittingBasketInvest(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/baskets/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          basketId: selectedBasket.id,
          totalAmount: basketInvestAmount,
          paymentType: basketPaymentType,
          sipDuration: basketPaymentType === 'sip' ? sipDuration : undefined
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const successMsg = basketPaymentType === 'sip'
          ? `🟣 SIP started! ₹${basketInvestAmount.toLocaleString()}/month for ${sipDuration} months. First instalment deducted.`
          : `✅ Invested ₹${basketInvestAmount.toLocaleString()} in ${selectedBasket.name}!`;
        message.success(data.message || successMsg, 4);
        setBasketModalVisible(false);
        setBasketPaymentType('onetime');
        setSipDuration(12);
        // Refresh dashboard data to reflect wallet and investments
        fetchData();
      } else {
        const data = await res.json();
        message.error(data.error || "Failed to complete basket investment");
      }
    } catch (err) {
      console.error(err);
      message.error("An error occurred during basket investment");
    } finally {
      setSubmittingBasketInvest(false);
    }
  };

  const handleOpenInvestModal = (startup) => {
    setSelectedStartup(startup);
    setInvestAmount(startup.minimumInvestment || 10000);
    setInvestModalVisible(true);
  };

  const handleConfirmInvestment = async () => {
    const minRequired = selectedStartup?.minimumInvestment || 10000;
    if (investAmount < minRequired) {
      message.error(`Minimum investment amount is ₹${minRequired.toLocaleString()}`);
      return;
    }

    if (currentUser.walletBalance < investAmount) {
      message.error('Insufficient wallet balance');
      return;
    }

    setSubmittingInvestment(true);
    const token = localStorage.getItem('token');

    // --- OPTIMISTIC UPDATE: Close modal & update UI instantly ---
    const tempId = `temp_${Date.now()}`;
    const optimisticInvestment = {
      key: tempId,
      startupId: selectedStartup._id,
      startupName: selectedStartup.name,
      amount: investAmount,
      timestamp: new Date().toLocaleString(),
      rawDate: new Date(),
      startupObj: selectedStartup
    };
    const prevUser = { ...currentUser };
    const optimisticUser = { ...currentUser, walletBalance: currentUser.walletBalance - investAmount };
    const prevInvestments = myInvestments;

    setMyInvestments(prev => [optimisticInvestment, ...prev]);
    setCurrentUser(optimisticUser);
    localStorage.setItem('user', JSON.stringify(optimisticUser));
    setStartups(prev => prev.map(s =>
      s._id === selectedStartup._id ? { ...s, raisedAmount: (s.raisedAmount || 0) + investAmount } : s
    ));
    setInvestModalVisible(false);
    setActivityFeed(prev => [
      {
        id: Date.now(),
        title: 'Your Investment',
        message: `You invested ₹${investAmount.toLocaleString()} in ${selectedStartup.name}!`,
        time: 'Just now',
        color: '#ec4899'
      },
      ...prev
    ]);

    try {
      const res = await fetch(`${API_URL}/api/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startupId: selectedStartup._id,
          amount: investAmount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback optimistic update on failure
        setMyInvestments(prevInvestments);
        setCurrentUser(prevUser);
        localStorage.setItem('user', JSON.stringify(prevUser));
        setStartups(prev => prev.map(s =>
          s._id === selectedStartup._id ? { ...s, raisedAmount: Math.max(0, (s.raisedAmount || 0) - investAmount) } : s
        ));
        throw new Error(data.error || 'Investment failed');
      }

      // Replace temp id with real id from server
      setMyInvestments(prev => prev.map(inv =>
        inv.key === tempId
          ? { ...inv, key: data.investment._id }
          : inv
      ));
      const confirmedUser = { ...optimisticUser, walletBalance: data.updatedWalletBalance };
      setCurrentUser(confirmedUser);
      localStorage.setItem('user', JSON.stringify(confirmedUser));
      message.success('✅ Investment confirmed!');
      fetchData();
    } catch (err) {
      message.error(err.message);
    } finally {
      setSubmittingInvestment(false);
    }
  };

  const handleSellInvestment = async (investmentId) => {
    const token = localStorage.getItem('token');

    // Find the investment to sell for optimistic rollback
    const investmentToSell = myInvestments.find(inv => inv.key === investmentId);
    if (!investmentToSell) return;

    // --- OPTIMISTIC UPDATE: Remove from list and refund wallet instantly ---
    const prevInvestments = myInvestments;
    const prevUser = { ...currentUser };
    const refundAmount = investmentToSell.amount;

    setMyInvestments(prev => prev.filter(inv => inv.key !== investmentId));
    const optimisticUser = { ...currentUser, walletBalance: (currentUser.walletBalance || 0) + refundAmount };
    setCurrentUser(optimisticUser);
    localStorage.setItem('user', JSON.stringify(optimisticUser));
    setStartups(prev => prev.map(s =>
      s._id === investmentToSell.startupId ? { ...s, raisedAmount: Math.max(0, (s.raisedAmount || 0) - refundAmount) } : s
    ));

    try {
      const res = await fetch(`${API_URL}/api/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ investmentId })
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback optimistic update on failure
        setMyInvestments(prevInvestments);
        setCurrentUser(prevUser);
        localStorage.setItem('user', JSON.stringify(prevUser));
        setStartups(prev => prev.map(s =>
          s._id === investmentToSell.startupId ? { ...s, raisedAmount: (s.raisedAmount || 0) + refundAmount } : s
        ));
        throw new Error(data.error || 'Failed to sell investment');
      }

      // Sync confirmed wallet balance from server
      const confirmedUser = { ...optimisticUser, walletBalance: data.updatedWalletBalance };
      setCurrentUser(confirmedUser);
      localStorage.setItem('user', JSON.stringify(confirmedUser));
      message.success('✅ Shares sold and balance refunded!');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const onSubmitStartup = async (values) => {
    const token = localStorage.getItem('token');
    try {
      const valuationsArray = values.pastValuations
        .split(',')
        .map(v => Number(v.trim()))
        .filter(v => !isNaN(v));

      const payload = {
        ...values,
        pastValuations: valuationsArray
      };

      const res = await fetch(`${API_URL}/api/startups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit startup');
      }

      message.success('Startup submitted! Undergoing review.');
      startupForm.resetFields();
      setActiveTab('1');
      fetchData();
    } catch (err) {
      message.error(err.message);
    }
  };

  const toggleExpandStartup = (id) => {
    setExpandedStartupId(expandedStartupId === id ? null : id);
  };

  // Filter startups based on search query and watchlist tab selection
  const filteredStartups = startups.filter(startup => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      startup.name.toLowerCase().includes(query) ||
      startup.category.toLowerCase().includes(query) ||
      startup.marketingMixVariables.toLowerCase().includes(query) ||
      (startup.tagline && startup.tagline.toLowerCase().includes(query))
    );
    if (!matchesSearch) return false;

    if (marketplaceSubTab === 'watchlist') {
      return watchlist.includes(startup._id);
    }
    return true;
  });

  const portfolioColumns = [
    {
      title: 'Venture Name',
      dataIndex: 'startupName',
      key: 'startupName',
      render: (text, record) => (
        <span 
          onClick={() => {
            if (record.startupObj) {
              handleOpenCompanyDetails(record.startupObj, record.transactions);
            }
          }}
          style={{ 
            color: tc, 
            fontWeight: 600, 
            cursor: record.startupObj ? 'pointer' : 'default',
            textDecoration: record.startupObj ? 'underline' : 'none'
          }}
          onMouseEnter={(e) => {
            if (record.startupObj) e.target.style.color = '#00d09c';
          }}
          onMouseLeave={(e) => {
            if (record.startupObj) e.target.style.color = tc;
          }}
        >
          {text}
        </span>
      )
    },
    {
      title: 'Amount Invested',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{amount.toLocaleString()}</Text>
    },
    {
      title: 'Valuation History',
      key: 'valuationHistory',
      render: (_, record) => {
        const valuations = record.startupObj?.pastValuations;
        if (!valuations || valuations.length < 2) {
          return <Text style={{ color: '#7c8099', fontSize: 12 }}>No history</Text>;
        }
        const latest = valuations[valuations.length - 1];
        const first = valuations[0];
        const pct = first > 0 ? (((latest - first) / first) * 100).toFixed(1) : 0;
        const isUp = latest >= first;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkline data={valuations} />
            <div>
              <Text style={{ color: isUp ? '#00d09c' : '#eb5757', fontWeight: 700, fontSize: 12 }}>
                {isUp ? '▲' : '▼'} {Math.abs(pct)}%
              </Text>
              <br />
              <Text style={{ color: '#7c8099', fontSize: 11 }}>₹{(latest / 10000000).toFixed(2)}Cr</Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Investment Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => <Text style={{ color: '#7c8099' }}>{date}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small"
            icon={<ArrowUpOutlined />}
            onClick={() => {
              if (record.startupObj) {
                handleOpenInvestModal(record.startupObj);
              } else {
                message.error("Cannot buy shares of this startup.");
              }
            }}
            style={{ backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 4, fontSize: 12, fontWeight: 700 }}
          >
            Buy
          </Button>
          <Button 
            type="primary" 
            danger 
            size="small"
            icon={<ArrowDownOutlined />}
            onClick={() => {
              if (record.transactions && record.transactions.length > 1) {
                handleOpenCompanyDetails(record.startupObj, record.transactions);
                message.info("Select a specific transaction to sell from the list below.");
              } else if (record.transactions && record.transactions.length === 1) {
                handleSellInvestment(record.transactions[0].key);
              } else {
                handleSellInvestment(record.key);
              }
            }}
            style={{ borderRadius: 4, fontSize: 12, fontWeight: 700 }}
          >
            Sell
          </Button>
        </Space>
      )
    }
  ];

  const totalRaisedPlatform = startups.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0);
  const avgValuation = startups.length 
    ? Math.round(startups.reduce((acc, curr) => {
        const val = curr.valuationCap || (curr.pastValuations?.[curr.pastValuations.length - 1] || 0);
        return acc + val;
      }, 0) / startups.length)
    : 0;

  const totalInvestedMyPortfolio = myInvestments.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate Sector Exposure
  const getSectorExposureData = () => {
    const allocations = {};
    myInvestments.forEach(inv => {
      const startup = startups.find(s => s._id === inv.startupId || s.name === inv.startupName);
      const cat = startup ? startup.category : 'General';
      allocations[cat] = (allocations[cat] || 0) + inv.amount;
    });

    const total = Object.values(allocations).reduce((a, b) => a + b, 0);
    const data = Object.entries(allocations).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));
    if (data.length === 0) {
      return [];
    }
    const colors = ['#ec4899', '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6', '#06b6d4'];
    let cumulativePercent = 0;
    return data.map((d, index) => {
      const percentage = d.percentage;
      const strokeDash = `${percentage} ${100 - percentage}`;
      const strokeOffset = 100 - cumulativePercent + 25;
      cumulativePercent += percentage;
      return {
        ...d,
        strokeDash,
        strokeOffset,
        color: colors[index % colors.length]
      };
    });
  };

  const sectorSegments = getSectorExposureData();

  // Calculate Sector Heatmap metrics (including ROI per sector)
  const sectorHeatmapData = React.useMemo(() => {
    if (!myInvestments || myInvestments.length === 0) return [];
    
    const categories = {};
    myInvestments.forEach(inv => {
      const startup = startups.find(s => s._id === inv.startupId || s.name === inv.startupName);
      const cat = startup ? startup.category : 'General';
      if (!categories[cat]) {
        categories[cat] = {
          category: cat,
          capital: 0,
          currentValuation: 0,
        };
      }
      categories[cat].capital += inv.amount;
      
      // Calculate current valuation of this investment
      const valuations = [...(startup?.pastValuations || [])];
      if (valuations.length === 0 || valuations[valuations.length - 1] !== startup?.valuationCap) {
        if (startup?.valuationCap) {
          valuations.push(startup.valuationCap);
        }
      }
      let currentVal = inv.amount;
      if (valuations.length > 1) {
        const startVal = valuations[0] || 1;
        const endVal = valuations[valuations.length - 1] || 1;
        currentVal = inv.amount * (endVal / startVal);
      }
      categories[cat].currentValuation += currentVal;
    });

    return Object.values(categories).map(c => {
      const roi = c.capital > 0 ? ((c.currentValuation - c.capital) / c.capital) * 100 : 0;
      return {
        ...c,
        roi
      };
    }).sort((a, b) => b.currentValuation - a.currentValuation);
  }, [myInvestments, startups]);

  // Calculate Portfolio Trajectory dynamically
  const trajectoryData = React.useMemo(() => {
    if (!myInvestments || myInvestments.length === 0) {
      return { months: [], values: [], roi: 0 };
    }

    const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const last5Months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last5Months.push({
        name: mNames[d.getMonth()],
        month: d.getMonth(),
        year: d.getFullYear(),
        endOfMonthTimestamp: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime()
      });
    }

    // For each month, calculate the portfolio value
    const values = last5Months.map((m, idx) => {
      let totalValueForMonth = 0;
      let totalInvestedForMonth = 0;

      myInvestments.forEach(inv => {
        let invTimestamp = 0;
        if (inv.rawDate) {
          invTimestamp = inv.rawDate.getTime();
        } else if (inv.timestamp) {
          invTimestamp = new Date(inv.timestamp).getTime();
        } else if (inv.createdAt) {
          invTimestamp = new Date(inv.createdAt).getTime();
        }

        // Only include if the investment happened on or before the end of this month
        if (invTimestamp <= m.endOfMonthTimestamp) {
          const startup = inv.startupObj;
          if (startup) {
            const valuations = [...(startup.pastValuations || [])];
            if (valuations.length === 0 || valuations[valuations.length - 1] !== startup.valuationCap) {
              if (startup.valuationCap) {
                valuations.push(startup.valuationCap);
              }
            }
            
            const K = valuations.length;
            if (K > 0) {
              const initialValuation = valuations[0] || 1;
              const valIdx = Math.min(K - 1, Math.floor(idx * (K - 1) / 4));
              const currentValuationForMonth = valuations[valIdx];
              const ratio = currentValuationForMonth / initialValuation;
              totalValueForMonth += inv.amount * ratio;
            } else {
              totalValueForMonth += inv.amount;
            }
          } else {
            totalValueForMonth += inv.amount;
          }
          totalInvestedForMonth += inv.amount;
        }
      });

      return {
        value: totalValueForMonth,
        invested: totalInvestedForMonth
      };
    });

    const latestVal = values[values.length - 1] || { value: 0, invested: 0 };
    const totalInvested = latestVal.invested;
    const finalValue = latestVal.value;
    const roi = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      months: last5Months.map(m => m.name),
      values: values.map(v => v.value),
      roi: roi
    };
  }, [myInvestments]);

  const svgPoints = React.useMemo(() => {
    if (!trajectoryData || trajectoryData.values.length === 0) return [];
    const maxVal = Math.max(...trajectoryData.values);
    const minVal = Math.min(...trajectoryData.values);
    return trajectoryData.values.map((v, i) => {
      const x = 10 + 70 * i;
      const y = maxVal - minVal === 0 ? 50 : 80 - ((v - minVal) / (maxVal - minVal)) * (80 - 20);
      return { x, y, value: v };
    });
  }, [trajectoryData]);

  const linePath = React.useMemo(() => {
    if (svgPoints.length === 0) return '';
    return "M " + svgPoints.map(p => `${p.x} ${p.y}`).join(" L ");
  }, [svgPoints]);

  const areaPath = React.useMemo(() => {
    if (svgPoints.length === 0) return '';
    return `M 10 90 L ${svgPoints.map(p => `${p.x} ${p.y}`).join(" L ")} L 290 90 Z`;
  }, [svgPoints]);

  // Feature 5: Merged chronological timeline events
  const timelineEvents = React.useMemo(() => {
    const events = [];

    // 1. Process investments
    if (Array.isArray(myInvestments)) {
      // We will loop through the original myInvestments array to show actual raw transaction events
      myInvestments.forEach(inv => {
        const isSip = inv.note && inv.note.includes('SIP');
        events.push({
          id: `inv-${inv._id || Math.random()}`,
          type: isSip ? 'sip' : 'investment',
          title: isSip ? `SIP Instalment` : `Direct Investment`,
          startupName: inv.startupId?.name || inv.startupName || 'Venture',
          amount: inv.amount,
          date: new Date(inv.timestamp || inv.createdAt),
          description: isSip ? inv.note : `Pledged capital to ${inv.startupId?.name || inv.startupName || 'Venture'}`
        });
      });
    }

    // 2. Process wallet transactions
    if (Array.isArray(walletTransactions)) {
      walletTransactions.forEach(tx => {
        // Skip investment type transactions since we already processed them directly from myInvestments to avoid duplicate display
        if (tx.type === 'investment') return;
        
        events.push({
          id: `tx-${tx._id || Math.random()}`,
          type: tx.type, // 'deposit' or 'withdraw'
          title: tx.type === 'deposit' ? 'Wallet Deposit' : 'Wallet Withdrawal',
          startupName: null,
          amount: tx.amount,
          date: new Date(tx.timestamp || tx.createdAt),
          description: tx.description || (tx.type === 'deposit' ? 'Funds added to account' : 'Funds withdrawn from account')
        });
      });
    }

    // Sort descending by date
    return events.sort((a, b) => b.date - a.date);
  }, [myInvestments, walletTransactions]);

  // Group investments by company to combine duplicates
  const groupedHoldings = React.useMemo(() => {
    if (!myInvestments || myInvestments.length === 0) return [];
    
    const groups = {};
    myInvestments.forEach(inv => {
      const key = inv.startupId || inv.startupName;
      if (!groups[key]) {
        groups[key] = {
          startupId: inv.startupId,
          startupName: inv.startupName,
          startupObj: inv.startupObj,
          amount: 0,
          transactions: [],
          latestTimestamp: null
        };
      }
      groups[key].amount += inv.amount;
      groups[key].transactions.push(inv);
      
      const invDate = inv.rawDate || new Date(inv.timestamp || inv.createdAt);
      if (!groups[key].latestTimestamp || invDate > groups[key].latestTimestamp) {
        groups[key].latestTimestamp = invDate;
      }
    });

    return Object.values(groups).map(g => ({
      key: g.startupId || g.startupName,
      startupId: g.startupId,
      startupName: g.startupName,
      startupObj: g.startupObj,
      amount: g.amount,
      transactions: g.transactions.sort((a, b) => {
        const da = a.rawDate || new Date(a.timestamp || a.createdAt);
        const db = b.rawDate || new Date(b.timestamp || b.createdAt);
        return db - da; // newest first
      }),
      timestamp: g.transactions.length > 1 
        ? `Multiple (${g.transactions.length})` 
        : (g.latestTimestamp ? g.latestTimestamp.toLocaleString() : '')
    }));
  }, [myInvestments]);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0b0f19' : '#f4f6f9' }}>
      {/* Groww-style Navigation Header */}
      <Header style={{ 
        background: isDarkMode ? '#111827' : '#ffffff', 
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
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
          <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#44475b', margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>elevate</Title>
        </div>

        {/* Groww-style search bar */}
        <div className="search-container" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, margin: '0 40px' }}>
          <Input 
            prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
            placeholder="Search startups, categories, DTU labs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              backgroundColor: isDarkMode ? '#1f2937' : '#f4f6f9', 
              border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '24px',
              height: '42px',
              paddingLeft: '16px',
              color: isDarkMode ? '#f1f5f9' : '#44475b'
            }}
          />
        </div>

        <Space size="large" style={{ flexShrink: 0 }}>
          {currentUser && (
            <div 
              onClick={() => {
                setWalletAction('deposit');
                setWalletStep(0);
                setWalletAmount(5000);
                setWalletModalVisible(true);
              }}
              style={{ 
                background: isDarkMode ? '#132c25' : '#f0fdf4', 
                padding: '6px 16px', 
                borderRadius: '20px', 
                border: isDarkMode ? '1px solid #064e3b' : '1px solid #dcfce7',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,208,156,0.08)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDarkMode ? '#1a3a30' : '#e6fffa'; e.currentTarget.style.borderColor = '#00d09c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDarkMode ? '#132c25' : '#f0fdf4'; e.currentTarget.style.borderColor = isDarkMode ? '#064e3b' : '#dcfce7'; }}
            >
              <WalletOutlined style={{ color: '#00d09c' }} />
              <Text style={{ color: '#44475b', fontSize: '13px', fontWeight: 600 }}>
                Balance: <span style={{ color: '#00d09c', fontWeight: 800 }}>₹{currentUser.walletBalance?.toLocaleString()}</span>
              </Text>
            </div>
          )}

          <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
            <Avatar 
              size="default" 
              src={profilePhoto || undefined}
              style={{ 
                backgroundColor: '#00d09c', 
                cursor: 'pointer', 
                verticalAlign: 'middle',
                border: '2px solid #00d09c',
                boxShadow: '0 2px 8px rgba(0,208,156,0.2)'
              }}
              icon={!profilePhoto && <UserOutlined />}
            />
          </Dropdown>
        </Space>
      </Header>

      <Content className="fade-in-section" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Horizontal Ticker Banner at the top */}
        {activityFeed.length > 0 && (
          <div style={{
            background: isDarkMode ? '#111827' : '#ffffff',
            border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '24px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            height: '42px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            position: 'relative'
          }}>
            <div style={{ 
              fontWeight: 700, 
              color: '#00d09c', 
              marginRight: '16px', 
              fontSize: '13px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRight: `1px solid ${isDarkMode ? '#1f2937' : '#edf2f7'}`,
              paddingRight: '16px',
              zIndex: 2,
              background: isDarkMode ? '#111827' : '#ffffff'
            }}>
              <ClockCircleOutlined /> LIVE ACTIVITY
            </div>
            <div style={{ overflow: 'hidden', width: '100%', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              {activityFeed.map((act, idx) => {
                if (idx !== currentActivityIndex) return null;
                return (
                  <div 
                    key={act.id} 
                    className="ticker-message"
                    style={{
                      fontSize: '13px',
                      color: tc,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'slideLeftToRight 8s linear forwards',
                      whiteSpace: 'nowrap',
                      position: 'absolute',
                      left: 0
                    }}
                  >
                    <Tag color={act.color || 'green'} style={{ margin: 0, fontSize: '10px', fontWeight: 700 }}>
                      {act.title.toUpperCase()}
                    </Tag>
                    <span style={{ fontWeight: 600 }}>{act.message}</span>
                    <span style={{ fontSize: '11px', color: tSec }}>({act.time})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span style={{ fontSize: 15, padding: '4px 8px', fontWeight: 600, color: activeTab === '1' ? '#00d09c' : '#7c8099' }}>
                  <FundOutlined /> EXPLORE DEALS
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  {/* Stats overview */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                    <Col xs={24} md={8}>
                      <Card style={{ padding: '4px 8px', background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Accredited Listings</span>} 
                          value={filteredStartups.length} 
                          valueStyle={{ color: isDarkMode ? '#f1f5f9' : '#44475b', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card style={{ padding: '4px 8px', background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Aggregate Investment</span>} 
                          value={`₹${totalRaisedPlatform.toLocaleString()}`} 
                          valueStyle={{ color: '#00d09c', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card style={{ padding: '4px 8px', background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Avg Valuation</span>} 
                          value={`₹${avgValuation.toLocaleString()}`} 
                          valueStyle={{ color: isDarkMode ? '#f1f5f9' : '#44475b', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Curated Startup Mutual Funds (Baskets) */}
                  {baskets && baskets.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                      <Title level={4} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 800, marginBottom: 4 }}>
                        📦 Curated Startup Mutual Funds (Baskets)
                      </Title>
                      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 20 }}>
                        Diversify your portfolio with a single click. Invest in themed baskets automatically distributed across top-performing, vetted startups.
                      </Paragraph>
                      <Row gutter={[20, 20]}>
                        {baskets.map((basket) => (
                          <Col xs={24} md={12} key={basket.id}>
                            <Card 
                              style={{ 
                                background: bgInner, 
                                border: `1px solid ${borderCl}`, 
                                borderRadius: 12, 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                              bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                  <div style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 8, 
                                    background: isDarkMode ? '#1e293b' : '#f1f5f9', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                  }}>
                                    {getBasketIcon(basket.icon)}
                                  </div>
                                  <div>
                                    <Text style={{ fontSize: 15, fontWeight: 800, color: tc, display: 'block' }}>
                                      {basket.name}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: '#7c8099', fontWeight: 600 }}>
                                      {basket.constituents.length} Startup Constituents
                                    </Text>
                                  </div>
                                </div>
                                <Paragraph style={{ fontSize: 12, color: isDarkMode ? '#cbd5e1' : '#4b5563', minHeight: 40, lineHeight: 1.5 }}>
                                  {basket.tagline}
                                </Paragraph>
                                
                                <div style={{ 
                                  background: isDarkMode ? '#121824' : '#f8fafc', 
                                  borderRadius: 8, 
                                  padding: 10, 
                                  marginBottom: 16,
                                  border: `1px dashed ${borderCl}`
                                }}>
                                  <Text style={{ fontSize: 11, fontWeight: 700, color: tc, display: 'block', marginBottom: 6 }}>
                                    Basket Weights & Allocations:
                                  </Text>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {basket.constituents.map((item, idx) => (
                                      <Tag 
                                        key={idx} 
                                        color={isDarkMode ? 'blue' : 'processing'} 
                                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}
                                      >
                                        {item.name}: <strong style={{ color: '#00d09c' }}>{item.weight}%</strong>
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>MINIMUM INVESTMENT</Text>
                                  <Text style={{ fontSize: 16, fontWeight: 800, color: '#00d09c' }}>₹5,000</Text>
                                </div>
                                <Button 
                                  type="primary" 
                                  icon={<DollarOutlined />}
                                  onClick={() => handleOpenBasketInvestModal(basket)}
                                  style={{ 
                                    backgroundColor: '#00d09c', 
                                    borderColor: '#00d09c', 
                                    borderRadius: 6, 
                                    fontWeight: 700 
                                  }}
                                >
                                  Invest in Basket
                                </Button>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                      <Divider style={{ margin: '32px 0' }} />
                    </div>
                  )}

                  {/* Watchlist Sub-Tab Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Radio.Group 
                        value={marketplaceSubTab} 
                        onChange={(e) => setMarketplaceSubTab(e.target.value)}
                        buttonStyle="solid"
                        size="middle"
                      >
                        <Radio.Button value="all" style={{ fontWeight: 600 }}>
                          🌐 All Deals
                        </Radio.Button>
                        <Radio.Button value="watchlist" style={{ fontWeight: 600 }}>
                          ⭐ My Watchlist ({watchlist.length})
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                    {marketplaceSubTab === 'watchlist' && watchlist.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Showing {filteredStartups.length} watchlisted venture{filteredStartups.length === 1 ? '' : 's'}.
                      </Text>
                    )}
                  </div>

                  {/* Startup Marketplace Grid */}
                  <Row gutter={[20, 20]}>
                    {filteredStartups.length === 0 ? (
                      <Col span={24}>
                        <Card style={{ textAlign: 'center', padding: 48 }}>
                          <Text style={{ color: '#7c8099', fontSize: 15 }}>No matching startups found. Try another query.</Text>
                        </Card>
                      </Col>
                    ) : (
                      filteredStartups.map(startup => {
                        const targetFunding = startup.targetGoal || 10000000;
                        const raisedProgress = Math.min(100, Math.round(((startup.raisedAmount || 0) / targetFunding) * 100));
                        
                        return (
                          <Col xs={24} md={12} lg={8} key={startup._id}>
                            <Card 
                              cover={
                                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                                  <img 
                                    alt={startup.name} 
                                    src={startup.logoUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80"} 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: startup.logoUrl && (startup.logoUrl.includes('Logo') || startup.logoUrl.includes('logo') || startup.logoUrl.includes('Raised_Type')) ? 'contain' : 'cover',
                                      background: startup.logoUrl && (startup.logoUrl.includes('Logo') || startup.logoUrl.includes('logo') || startup.logoUrl.includes('Raised_Type')) 
                                        ? (startup.logoUrl.includes('Raised_Type') ? '#0f172a' : (isDarkMode ? '#1e293b' : '#f8fafc')) 
                                        : 'transparent',
                                      padding: startup.logoUrl && (startup.logoUrl.includes('Logo') || startup.logoUrl.includes('logo') || startup.logoUrl.includes('Raised_Type')) ? '12px' : '0px'
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    background: 'rgba(0, 0, 0, 0.65)',
                                    backdropFilter: 'blur(4px)',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: 11
                                  }}>
                                    {startup.category}
                                  </div>
                                  {startup.daysLeft === 0 && (
                                    <div style={{
                                      position: 'absolute',
                                      top: 12,
                                      right: 12,
                                      background: '#10b981',
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      color: '#fff',
                                      fontWeight: 700,
                                      fontSize: 11,
                                      textTransform: 'uppercase'
                                    }}>
                                      Funded
                                    </div>
                                  )}
                                </div>
                              }
                              style={{ overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', background: isDarkMode ? '#111827' : '#ffffff', height: '100%' }}
                              bodyStyle={{ padding: 20 }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, width: '100%' }}>
                                    <Title 
                                      level={4} 
                                      style={{ 
                                        color: isDarkMode ? '#f1f5f9' : '#1e293b', 
                                        margin: 0, 
                                        fontFamily: 'Outfit', 
                                        fontWeight: 800, 
                                        fontSize: 18,
                                        cursor: 'pointer',
                                        flex: 1
                                      }}
                                      onClick={() => handleOpenCompanyDetails(startup)}
                                    >
                                      {startup.name}
                                    </Title>
                                    <Button
                                      type="text"
                                      icon={watchlist.includes(startup._id) ? <BookOutlined style={{ color: '#00d09c', fontSize: 18 }} /> : <BookOutlined style={{ color: '#7c8099', fontSize: 18 }} />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleWatchlist(startup._id);
                                      }}
                                      loading={togglingWatchlist.has(startup._id)}
                                      style={{ padding: 4, height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    />
                                  </div>
                                  
                                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 13, minHeight: 40, marginBottom: 16 }}>
                                    {startup.tagline}
                                  </Paragraph>
                                </div>

                                <div>
                                  {/* Progress bar */}
                                  <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <Text style={{ color: '#00d09c', fontSize: 13, fontWeight: 700 }}>
                                        ₹{(startup.raisedAmount || 0).toLocaleString()}
                                      </Text>
                                      <Text style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12, fontWeight: 600 }}>
                                        {raisedProgress}% of target
                                      </Text>
                                    </div>
                                    <Progress 
                                      percent={raisedProgress} 
                                      showInfo={false} 
                                      strokeColor="#00d09c"
                                      trailColor={isDarkMode ? '#374151' : '#f1f5f9'}
                                      strokeWidth={6}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                      <Text type="secondary" style={{ fontSize: 11 }}>{startup.totalInvestors?.toLocaleString() || 0} investors</Text>
                                      <Text type="secondary" style={{ fontSize: 11 }}>Target: ₹{targetFunding.toLocaleString()}</Text>
                                    </div>
                                  </div>

                                  {/* Milestone Stepper */}
                                  <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                      <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                                        Stage
                                      </Text>
                                      <Text style={{ color: '#00d09c', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {startup.milestoneStage || 'MVP'}
                                      </Text>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                      {['idea', 'mvp', 'revenue', 'growth', 'scale'].map((step, sIdx) => {
                                        const currentIdx = getMilestoneStepIndex(startup.milestoneStage);
                                        const isActive = sIdx <= currentIdx;
                                        return (
                                          <div 
                                            key={step} 
                                            style={{ 
                                              flex: 1, 
                                              height: 4, 
                                              borderRadius: 2, 
                                              background: isActive ? '#00d09c' : (isDarkMode ? '#374151' : '#e2e8f0'),
                                              transition: 'background 0.3s' 
                                            }} 
                                            title={step.toUpperCase()}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Financial metrics grid */}
                                  <Row gutter={[8, 8]} style={{ 
                                    background: bgInner, 
                                    padding: '12px', 
                                    borderRadius: 8,
                                    border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7',
                                    marginBottom: 16
                                  }}>
                                    <Col span={12}>
                                      <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Min. Investment</Text>
                                      <Text style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 13, fontWeight: 700 }}>₹{(startup.minimumInvestment || 0).toLocaleString()}</Text>
                                    </Col>
                                    <Col span={12}>
                                      <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Valuation Cap</Text>
                                      <Text style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 13, fontWeight: 700 }}>
                                        ₹{(startup.valuationCap || startup.pastValuations?.[startup.pastValuations.length - 1] || 0).toLocaleString()}
                                      </Text>
                                    </Col>
                                    <Col span={12} style={{ marginTop: 8 }}>
                                      <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Security Type</Text>
                                      <Text style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 12, fontWeight: 600 }}>{startup.securityType || 'Crowd SAFE'}</Text>
                                    </Col>
                                    <Col span={12} style={{ marginTop: 8 }}>
                                      <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Days Left</Text>
                                      <Text style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 13, fontWeight: 700 }}>
                                        {startup.daysLeft > 0 ? `${startup.daysLeft} days` : 'Closed'}
                                      </Text>
                                    </Col>
                                  </Row>

                                  {/* Venture Details (Expandable) */}
                                  {expandedStartupId === startup._id && (
                                    <div className="fade-in-section" style={{ borderTop: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', paddingTop: 16, marginBottom: 16 }}>
                                      <div style={{ marginBottom: 12 }}>
                                        <Text style={{ color: isDarkMode ? '#9ca3af' : '#7c8099', fontWeight: 700, fontSize: 11, display: 'block', marginBottom: 2 }}>MARKETING STRATEGY (4 Ps)</Text>
                                        <Paragraph style={{ color: isDarkMode ? '#cbd5e1' : '#44475b', fontSize: 12, lineHeight: '1.5', marginBottom: 0 }}>{startup.marketingMixVariables}</Paragraph>
                                      </div>
                                      <div>
                                        <Text style={{ color: isDarkMode ? '#9ca3af' : '#7c8099', fontWeight: 700, fontSize: 11, display: 'block', marginBottom: 2 }}>BUDGETING & SUPPLY CHAIN</Text>
                                        <Paragraph style={{ color: isDarkMode ? '#cbd5e1' : '#44475b', fontSize: 12, lineHeight: '1.5', marginBottom: 0 }}>{startup.financialProcurement}</Paragraph>
                                      </div>
                                    </div>
                                  )}

                                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Button 
                                      type="text" 
                                      icon={<InfoCircleOutlined />}
                                      onClick={() => toggleExpandStartup(startup._id)}
                                      style={{ color: '#7c8099', fontSize: 13 }}
                                    >
                                      {expandedStartupId === startup._id ? 'Hide Details' : 'Venture Details'}
                                    </Button>
                                    <Button 
                                      type="primary" 
                                      icon={<DollarOutlined />}
                                      disabled={startup.daysLeft === 0}
                                      onClick={() => handleOpenInvestModal(startup)}
                                      style={{
                                        backgroundColor: startup.daysLeft === 0 ? '#cbd5e1' : '#00d09c',
                                        borderColor: startup.daysLeft === 0 ? '#cbd5e1' : '#00d09c',
                                        color: '#fff',
                                        borderRadius: 8,
                                        height: 38,
                                        fontWeight: 700,
                                        boxShadow: 'none'
                                      }}
                                    >
                                      {startup.daysLeft === 0 ? 'Closed' : 'Invest'}
                                    </Button>
                                  </Space>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        );
                      })
                    )}
                  </Row>
                </div>
              )
            },
            {
              key: '2',
              label: (
                <span style={{ fontSize: 15, padding: '4px 8px', fontWeight: 600, color: activeTab === '2' ? '#00d09c' : '#7c8099' }}>
                  <PieChartOutlined /> PORTFOLIO
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  {/* Row 1: Capital Stats */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                      <Card style={{ background: bgInner, border: `1px solid ${borderCl}` }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Capital Deployed</span>} 
                          value={`₹${totalInvestedMyPortfolio.toLocaleString()}`} 
                          valueStyle={{ color: '#10b981', fontSize: 24, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card style={{ background: bgInner, border: `1px solid ${borderCl}` }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Current Valuation</span>} 
                          value={`₹${(trajectoryData.values[trajectoryData.values.length - 1] || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                          valueStyle={{ 
                            color: trajectoryData.roi >= 0 ? '#00d09c' : '#ef4444', 
                            fontSize: 24, 
                            fontFamily: 'Outfit', 
                            fontWeight: 800 
                          }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card style={{ background: bgInner, border: `1px solid ${borderCl}` }}>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Active Holdings</span>} 
                          value={myInvestments.length} 
                          valueStyle={{ color: '#3b82f6', fontSize: 24, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Row 2: Asset Allocation Heatmap (SVG Donut Chart) & Valuation Growth Curve */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {/* Left: Donut Chart */}
                    <Col xs={24} md={12}>
                      <Card style={{ background: bgInner, border: `1px solid ${borderCl}`, minHeight: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: 0, fontSize: 14 }}>
                            📊 Allocation & Sector Performance
                          </Title>
                          {myInvestments.length > 0 && (
                            <Radio.Group 
                              size="small" 
                              value={allocationView} 
                              onChange={(e) => setAllocationView(e.target.value)}
                              buttonStyle="solid"
                            >
                              <Radio.Button value="chart">Pie Chart</Radio.Button>
                              <Radio.Button value="heatmap">Heatmap</Radio.Button>
                            </Radio.Group>
                          )}
                        </div>
                        {myInvestments.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, textAlign: 'center', padding: '0 16px' }}>
                            <PieChartOutlined style={{ fontSize: 36, color: '#00d09c', marginBottom: 12, opacity: 0.8 }} />
                            <Text style={{ color: tc, fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 4 }}>No Holdings Found</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>Deploy capital from the Marketplace tab to unlock sector allocation insights.</Text>
                          </div>
                        ) : allocationView === 'chart' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ position: 'relative', width: 130, height: 130 }}>
                              <svg width="130" height="130" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDarkMode ? '#1f2937' : '#e5e7eb'} strokeWidth="4.5"></circle>
                                {sectorSegments.map((seg, i) => (
                                  <circle 
                                    key={i}
                                    cx="21" 
                                    cy="21" 
                                    r="15.91549430918954" 
                                    fill="transparent" 
                                    stroke={seg.color} 
                                    strokeWidth="4.5" 
                                    strokeDasharray={seg.strokeDash} 
                                    strokeDashoffset={seg.strokeOffset}
                                    style={{ transition: 'stroke-dashoffset 0.3s' }}
                                  />
                                ))}
                                <g style={{ transform: 'translate(0px, 0px)' }}>
                                  <text x="50%" y="46%" textAnchor="middle" fill={tc} style={{ fontSize: '3.8px', fontWeight: 800, fontFamily: 'Outfit' }}>
                                    {totalInvestedMyPortfolio > 0 ? `₹${totalInvestedMyPortfolio >= 100000 ? (totalInvestedMyPortfolio / 1000).toFixed(0) + 'K' : totalInvestedMyPortfolio.toLocaleString()}` : '₹0'}
                                  </text>
                                  <text x="50%" y="58%" textAnchor="middle" fill="#7c8099" style={{ fontSize: '2px', fontWeight: 700, letterSpacing: '0.1px' }}>
                                    INVESTED
                                  </text>
                                </g>
                              </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 160 }}>
                              {sectorSegments.map((seg, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                                  <span style={{ color: tc, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 90 }}>
                                    {seg.category}
                                  </span>
                                  <span style={{ color: '#7c8099', fontWeight: 700 }}>
                                    {seg.percentage.toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Render Sector Heatmap Grid
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                              {sectorHeatmapData.map((sm, index) => {
                                let boxBg = '#121824';
                                let boxBorder = '#1f2937';
                                if (sm.roi > 15) {
                                  boxBg = isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)';
                                  boxBorder = '#10b981';
                                } else if (sm.roi > 5) {
                                  boxBg = isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)';
                                  boxBorder = '#059669';
                                } else if (sm.roi >= 0) {
                                  boxBg = isDarkMode ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.02)';
                                  boxBorder = '#34d399';
                                } else {
                                  boxBg = isDarkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.06)';
                                  boxBorder = '#ef4444';
                                }
                                
                                const totalVal = sectorHeatmapData.reduce((acc, curr) => acc + curr.currentValuation, 0);
                                const pctShare = totalVal > 0 ? (sm.currentValuation / totalVal) * 100 : 0;
                                
                                return (
                                  <div 
                                    key={index} 
                                    style={{
                                      background: boxBg,
                                      border: `1.5px solid ${boxBorder}`,
                                      borderRadius: 8,
                                      padding: '10px 12px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      minHeight: 90,
                                      transition: 'all 0.2s',
                                      cursor: 'default'
                                    }}
                                  >
                                    <div>
                                      <Text style={{ display: 'block', fontSize: 10, color: '#7c8099', textTransform: 'uppercase', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sm.category}
                                      </Text>
                                      <Text style={{ display: 'block', color: tc, fontWeight: 800, fontSize: 14, marginTop: 2 }}>
                                        ₹{Math.round(sm.currentValuation).toLocaleString()}
                                      </Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                      <Tag color={sm.roi >= 0 ? 'green' : 'red'} style={{ fontSize: 9, fontWeight: 700, margin: 0, borderRadius: 4, padding: '0 4px' }}>
                                        {sm.roi >= 0 ? '+' : ''}{sm.roi.toFixed(1)}% ROI
                                      </Tag>
                                      <Text style={{ fontSize: 10, color: '#7c8099', fontWeight: 600 }}>
                                        {pctShare.toFixed(0)}%
                                      </Text>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    </Col>

                    {/* Right: Portfolio Valuation Line Graph */}
                    <Col xs={24} md={12}>
                      <Card style={{ background: bgInner, border: `1px solid ${borderCl}`, minHeight: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: 0, fontSize: 14 }}>
                            📈 Portfolio Valuation Trajectory
                          </Title>
                          {myInvestments.length > 0 && (
                            <Tag 
                              color={trajectoryData.roi >= 0 ? "green" : "red"} 
                              style={{ fontWeight: 700 }}
                            >
                              {trajectoryData.roi >= 0 ? '+' : ''}{trajectoryData.roi.toFixed(1)}% ROI
                            </Tag>
                          )}
                        </div>
                        {myInvestments.length === 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, textAlign: 'center', padding: '0 16px' }}>
                            <RiseOutlined style={{ fontSize: 36, color: '#00d09c', marginBottom: 12, opacity: 0.8 }} />
                            <Text style={{ color: tc, fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 4 }}>No Trajectory Data</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>Performance tracking and ROI stats will be activated once you make your first pledge.</Text>
                          </div>
                        ) : (
                          <>
                            <div style={{ padding: '0 8px' }}>
                              <svg width="100%" height="120" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
                                <defs>
                                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                                  </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="10" y1="15" x2="290" y2="15" stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeDasharray="3 3" />
                                <line x1="10" y1="45" x2="290" y2="45" stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeDasharray="3 3" />
                                <line x1="10" y1="75" x2="290" y2="75" stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeDasharray="3 3" />
                                
                                {/* Area Gradient fill */}
                                <path d={areaPath} fill="url(#valGrad)" />
                                
                                {/* Line path */}
                                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                                
                                {/* Circle Markers */}
                                {svgPoints.slice(0, svgPoints.length - 1).map((p, idx) => (
                                  <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#10b981" />
                                ))}
                                {svgPoints.length > 0 && (
                                  <>
                                    <circle 
                                      cx={svgPoints[svgPoints.length - 1].x} 
                                      cy={svgPoints[svgPoints.length - 1].y} 
                                      r="4.5" 
                                      fill={isDarkMode ? '#111827' : '#fff'} 
                                      stroke="#10b981" 
                                      strokeWidth="2" 
                                    />
                                    {/* Valuation text label above the final point */}
                                    <text 
                                      x={svgPoints[svgPoints.length - 1].x} 
                                      y={svgPoints[svgPoints.length - 1].y - 8} 
                                      fill="#10b981" 
                                      style={{ fontSize: '7px', fontWeight: 800 }} 
                                      textAnchor="end"
                                    >
                                      ₹{svgPoints[svgPoints.length - 1].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </text>
                                  </>
                                )}
                                
                                {/* Axis Labels */}
                                {trajectoryData.months.map((month, idx) => (
                                  <text 
                                    key={idx} 
                                    x={10 + 70 * idx} 
                                    y="98" 
                                    fill="#7c8099" 
                                    style={{ fontSize: '7px', fontWeight: 600 }} 
                                    textAnchor="middle"
                                  >
                                    {month}
                                  </text>
                                ))}
                              </svg>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                Trailed performance tracking calculated based on startup valuation shifts.
                              </Text>
                            </div>
                          </>
                        )}
                      </Card>
                    </Col>
                  </Row>

                  <Card style={{ background: bgInner, border: `1px solid ${borderCl}`, borderRadius: 12 }}>
                    <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#44475b', marginBottom: 20, fontFamily: 'Outfit', fontWeight: 700 }}>Investment Ledger &amp; Valuation History</Title>
                    <Table 
                      dataSource={groupedHoldings} 
                      columns={portfolioColumns} 
                      pagination={{ pageSize: 5 }}
                      locale={{ emptyText: <span style={{ color: '#7c8099' }}>No holdings recorded. Go to Marketplace to invest.</span> }}
                      style={{ background: 'transparent' }}
                      rowClassName={() => 'portfolio-row'}
                      scroll={{ x: true }}
                    />
                  </Card>

                  {/* Feature 5: Chronological Activity Timeline */}
                  {(() => {
                    const filteredEvents = timelineEvents.filter(evt => {
                      if (timelineFilter === 'all') return true;
                      if (timelineFilter === 'investments') return evt.type === 'investment' || evt.type === 'sip';
                      if (timelineFilter === 'deposits') return evt.type === 'deposit';
                      if (timelineFilter === 'withdrawals') return evt.type === 'withdraw';
                      if (timelineFilter === 'sip') return evt.type === 'sip';
                      return true;
                    });

                    return (
                      <Card style={{ marginTop: 24, background: bgInner, border: `1px solid ${borderCl}`, borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <Title level={4} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: 0, fontSize: 16 }}>
                              📜 Chronological Activity Timeline
                            </Title>
                            <Paragraph type="secondary" style={{ fontSize: 12, margin: 0, marginTop: 4 }}>
                              Track all deposits, investments, SIPs, and exits in real-time.
                            </Paragraph>
                          </div>

                          {/* Filter Chips */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                              { label: 'All', value: 'all' },
                              { label: 'Investments', value: 'investments' },
                              { label: 'Deposits', value: 'deposits' },
                              { label: 'SIPs', value: 'sip' },
                              { label: 'Withdrawals', value: 'withdrawals' }
                            ].map(chip => (
                              <Tag
                                key={chip.value}
                                color={timelineFilter === chip.value ? 'green' : 'default'}
                                onClick={() => setTimelineFilter(chip.value)}
                                style={{ 
                                  cursor: 'pointer', 
                                  padding: '4px 12px', 
                                  borderRadius: 20, 
                                  fontWeight: 600,
                                  fontSize: 12,
                                  border: timelineFilter === chip.value ? '1px solid #00d09c' : `1px solid ${borderCl}`,
                                  background: timelineFilter === chip.value ? 'rgba(0, 208, 156, 0.1)' : 'transparent',
                                  color: timelineFilter === chip.value ? '#00d09c' : tc
                                }}
                              >
                                {chip.label}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        {filteredEvents.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '36px 0', color: '#7c8099' }}>
                            No activity events match the selected filter.
                          </div>
                        ) : (
                          <div style={{ position: 'relative', paddingLeft: 24, borderLeft: `2px solid ${borderCl}`, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
                            {filteredEvents.map((evt) => {
                              let color = '#00d09c';
                              let icon = '💼';
                              if (evt.type === 'deposit') {
                                color = '#3b82f6';
                                icon = '💰';
                              } else if (evt.type === 'withdraw') {
                                color = '#f59e0b';
                                icon = '📤';
                              } else if (evt.type === 'sip') {
                                color = '#8b5cf6';
                                icon = '🛒';
                              }

                              return (
                                <div key={evt.id} style={{ position: 'relative' }}>
                                  {/* Timeline Point */}
                                  <div style={{ 
                                    position: 'absolute', 
                                    left: -36, 
                                    top: 2, 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    background: isDarkMode ? '#1e293b' : '#ffffff', 
                                    border: `2px solid ${color}`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    zIndex: 1
                                  }}>
                                    {icon}
                                  </div>

                                  {/* Content */}
                                  <div style={{ 
                                    background: bgCard, 
                                    padding: '14px 18px', 
                                    borderRadius: 10, 
                                    border: `1px solid ${borderCl}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 12
                                  }}>
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <Text style={{ fontWeight: 800, color: tc, fontSize: 14 }}>
                                          {evt.title}
                                        </Text>
                                        {evt.startupName && (
                                          <Tag color="cyan" style={{ fontWeight: 600, fontSize: 10, borderRadius: 4 }}>
                                            {evt.startupName}
                                          </Tag>
                                        )}
                                      </div>
                                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                        {evt.description}
                                      </Text>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                      <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: 800, 
                                        color: evt.type === 'withdraw' ? '#f59e0b' : (evt.type === 'deposit' ? '#3b82f6' : '#00d09c') 
                                      }}>
                                        {evt.type === 'withdraw' ? '-' : '+'} ₹{evt.amount.toLocaleString()}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                                        {evt.date.toLocaleDateString()} · {evt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    );
                  })()}
                </div>
              )
            },
            {
              key: '4',
              label: (
                <span style={{ fontSize: 15, padding: '4px 8px', fontWeight: 600, color: activeTab === '4' ? '#00d09c' : '#7c8099' }}>
                  <BookOutlined /> VENTURE INSIGHTS
                </span>
              ),
              children: (
                <div style={{ marginTop: 16, maxWidth: 850 }}>
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#44475b', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>Venture Insights & Live News</Title>
                    <Text style={{ color: isDarkMode ? '#cbd5e1' : '#7c8099', fontSize: '13px' }}>
                      Get analyst opinions and live market news from Economic Times, Financial Express, Moneycontrol, and Business Standard.
                    </Text>
                  </div>

                  <Tabs
                    defaultActiveKey="news"
                    type="card"
                    items={[
                      {
                        key: 'news',
                        label: 'Live Financial Market News',
                        children: (
                          <div style={{ marginTop: 12 }}>
                            {newsLoading && marketNews.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: 32 }}>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                                <div style={{ marginTop: 12, color: isDarkMode ? '#9ca3af' : '#7c8099' }}>Fetching latest market news...</div>
                              </div>
                            ) : marketNews.length === 0 ? (
                              <Card style={{ textAlign: 'center', padding: 32 }}>
                                <Text style={{ color: isDarkMode ? '#9ca3af' : '#7c8099' }}>No recent market news found.</Text>
                              </Card>
                            ) : (
                              marketNews.map((news, index) => (
                                <Card 
                                  key={index} 
                                  style={{ 
                                    marginBottom: 16, 
                                    borderRadius: 12, 
                                    border: `1px solid ${isDarkMode ? '#1f2937' : '#edf2f7'}`,
                                    background: isDarkMode ? '#111827' : '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                  }}
                                  hoverable
                                  onClick={() => window.open(news.link, '_blank')}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00d09c' }}>
                                      {news.source} • {news.category}
                                    </span>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {new Date(news.pubDate).toLocaleString()}
                                    </Text>
                                  </div>
                                  <Title level={5} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', margin: '0 0 8px 0', fontFamily: 'Outfit', fontWeight: 600, fontSize: 15 }}>
                                    {news.title}
                                  </Title>
                                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                                    {news.contentSnippet}
                                  </Paragraph>
                                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button type="link" size="small" style={{ color: '#00d09c', padding: 0, fontWeight: 600 }}>
                                      Read Full Article &rarr;
                                    </Button>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        )
                      },
                      {
                        key: 'expert',
                        label: 'Expert Analyst Blogs & Tips',
                        children: (
                          <div style={{ marginTop: 12 }}>
                            {blogs.length === 0 ? (
                              <Card style={{ textAlign: 'center', padding: 32 }}>
                                <Text style={{ color: isDarkMode ? '#9ca3af' : '#7c8099' }}>No expert tips published yet.</Text>
                              </Card>
                            ) : (
                              blogs.map(blog => (
                                <Card key={blog._id} style={{ marginBottom: 16, borderRadius: 12 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Title level={5} style={{ color: isDarkMode ? '#f1f5f9' : '#44475b', margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>{blog.title}</Title>
                                    <Tag color="green" style={{ border: 'none', background: isDarkMode ? '#064e3b' : '#e6fffa', color: '#00d09c', fontWeight: 600 }}>
                                      {new Date(blog.timestamp).toLocaleDateString()}
                                    </Tag>
                                  </div>
                                  <Paragraph style={{ color: isDarkMode ? '#cbd5e1' : '#44475b', fontSize: 13, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {blog.content}
                                  </Paragraph>
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>Published by: <strong>{blog.author}</strong></Text>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              )
            }
          ]}
        />
      </Content>

      {/* ── Premium Platform Footer ── */}
      <Footer style={{ 
        background: isDarkMode ? '#0b0f19' : '#f9fafb', 
        borderTop: `1px solid ${borderCl}`, 
        padding: '48px 24px 24px 24px', 
        color: tc,
        fontFamily: 'Outfit'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Main Footer columns */}
          <Row gutter={[32, 32]} style={{ marginBottom: 32 }}>
            {/* Column 1: Company Logo & Details */}
            <Col xs={24} md={6}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🚀</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#00d09c', letterSpacing: -0.5 }}>ELEVATE</span>
              </div>
              <Paragraph style={{ color: tSec, fontSize: 13, lineHeight: '1.6', marginBottom: 16 }}>
                Vaishnavi Tech Park, South Tower, 3rd Floor<br />
                Sarjapur Main Road, Bellandur, Bengaluru – 560103<br />
                Karnataka, India
              </Paragraph>
              <div style={{ marginBottom: 16 }}>
                <Link to="/investor/info/contact-us" style={{ fontWeight: 700, fontSize: 13, display: 'block', color: tc, marginBottom: 8 }}>Contact Us</Link>
                <Link to="/investor/info/contact-us" style={{ color: '#00d09c', fontWeight: 600, fontSize: 13 }}>support@elevateequity.in</Link>
              </div>
              <div>
                <Space size={14} style={{ fontSize: 18, color: tSec }}>
                  <Link to="/investor/info/social-twitter" style={{ color: 'inherit' }}>𝕏</Link>
                  <Link to="/investor/info/social-instagram" style={{ color: 'inherit' }}>📸</Link>
                  <Link to="/investor/info/social-facebook" style={{ color: 'inherit' }}>👤</Link>
                  <Link to="/investor/info/social-linkedin" style={{ color: 'inherit' }}>💼</Link>
                  <Link to="/investor/info/social-youtube" style={{ color: 'inherit' }}>🎥</Link>
                </Space>
              </div>
            </Col>

            {/* Column 2: Elevate Links */}
            <Col xs={12} sm={8} md={6}>
              <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 }}>ELEVATE</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <Link to="/investor/info/about-us" style={{ color: tSec }}>About Us</Link>
                <Link to="/investor/info/pricing" style={{ color: tSec }}>Pricing</Link>
                <Link to="/investor/info/venture-insights" style={{ color: tSec }}>Venture Insights</Link>
                <Link to="/investor/info/media" style={{ color: tSec }}>Media & Press</Link>
                <Link to="/investor/info/careers" style={{ color: tSec }}>Careers</Link>
                <Link to="/investor/info/help" style={{ color: tSec }}>Help & Support</Link>
                <Link to="/investor/info/safety" style={{ color: tSec }}>Trust & Safety</Link>
                <Link to="/investor/info/investor-relations" style={{ color: tSec }}>Investor Relations</Link>
              </div>
            </Col>

            {/* Column 3: Products */}
            <Col xs={12} sm={8} md={6}>
              <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 }}>PRODUCTS</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <Link to="/investor/info/equity-crowdfunding" style={{ color: tSec }}>Equity Crowdfunding</Link>
                <Link to="/investor/info/startup-mutual-funds" style={{ color: tSec }}>Startup Mutual Funds</Link>
                <Link to="/investor/info/venture-debt" style={{ color: tSec }}>Venture Debt</Link>
                <Link to="/investor/info/secondary-market" style={{ color: tSec }}>Secondary Market</Link>
                <Link to="/investor/info/elevate-terminal" style={{ color: tSec }}>Elevate Terminal</Link>
                <Link to="/investor/info/angel-pools" style={{ color: tSec }}>Angel Pools</Link>
                <Link to="/investor/info/commodities" style={{ color: tSec }}>Carbon Credits</Link>
                <Link to="/investor/info/pms-services" style={{ color: tSec }}>PMS Services</Link>
              </div>
            </Col>

            {/* Column 4: Resources / Features */}
            <Col xs={24} sm={8} md={6}>
              <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 }}>RESOURCES & FEATURES</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <Link to="/investor/info/dtu-labs" style={{ color: tSec }}>DTU Labs Partner</Link>
                <Link to="/investor/info/startup-incubator" style={{ color: tSec }}>Startup Incubator</Link>
                <Link to="/investor/info/portfolio-tracker" style={{ color: tSec }}>Portfolio Tracker</Link>
                <Link to="/investor/info/live-activity" style={{ color: tSec }}>Live Activity Feed</Link>
                <Link to="/investor/info/valuation-simulator" style={{ color: tSec }}>Valuation Simulator</Link>
                <Link to="/investor/info/smart-kyc" style={{ color: tSec }}>Smart KYC Portal</Link>
                <Link to="/investor/info/market-news" style={{ color: tSec }}>Market News Digest</Link>
                <Link to="/investor/info/expert-panel" style={{ color: tSec }}>Expert Q&A Panel</Link>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: isDarkMode ? '#1f2937' : '#edf2f7', margin: '24px 0' }} />

          {/* Bottom Footer Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © 2016-2026 Elevate Equity. All rights reserved.
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Version 1.2.4
            </Text>
          </div>
        </div>
      </Footer>

      {/* Checkout Investment Modal */}
      <Modal
        title={<span style={{ color: tc, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}>Confirm Capital Pledge</span>}
        open={investModalVisible}
        onOk={handleConfirmInvestment}
        onCancel={() => setInvestModalVisible(false)}
        confirmLoading={submittingInvestment}
        okText="Pledge Capital"
        okButtonProps={{
          style: {
            backgroundColor: '#00d09c',
            borderColor: '#00d09c',
            color: '#fff',
            borderRadius: 8,
            height: 38,
            fontWeight: 700
          }
        }}
        cancelButtonProps={{
          style: {
            background: bgBtnCancel,
            color: tc,
            border: isDarkMode ? '1px solid #374151' : 'none',
            borderRadius: 8,
            height: 38
          }
        }}
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: '16px 0' }}
        wrapClassName="invest-modal-wrap"
      >
        <div style={{ background: bgInner, padding: 20, borderRadius: 12, border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', marginBottom: 20 }}>
          {selectedStartup && (
            <>
              <Statistic 
                title={<span style={{ color: '#7c8099', fontSize: 12 }}>DEAL SELECTION</span>} 
                value={selectedStartup.name} 
                valueStyle={{ color: tc, fontSize: 20, fontFamily: 'Outfit', fontWeight: 800 }}
              />
              <Paragraph style={{ color: '#7c8099', marginTop: 12, marginBottom: 0 }}>
                Sector Class: <strong style={{ color: '#00d09c' }}>{selectedStartup.category}</strong>
              </Paragraph>
            </>
          )}
        </div>

        <Text style={{ color: tc, display: 'block', marginBottom: 8, fontWeight: 600 }}>Capital Pledge Amount (INR)</Text>
        {currentUser && investAmount > currentUser.walletBalance && (
          <Alert 
            message={`Insufficient wallet balance (Your balance: ₹${currentUser.walletBalance.toLocaleString()})`} 
            type="error" 
            showIcon 
            style={{ marginBottom: 12 }} 
          />
        )}
        <InputNumber
          min={selectedStartup?.minimumInvestment || 10000}
          value={investAmount}
          onChange={setInvestAmount}
          onPressEnter={handleConfirmInvestment}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\₹\s?|(,*)/g, '')}
          style={{ width: '100%', height: 42, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: isDarkMode ? '1px solid #1f2937' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
        />
        <div style={{ marginTop: 24, borderTop: `1px solid ${borderCl}`, paddingTop: 20 }}>
          <Text style={{ color: tc, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 12 }}>
            📈 Exit ROI & Valuation Simulator
          </Text>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text style={{ fontSize: 12, color: tSec, display: 'block', marginBottom: 6 }}>Target Valuation Multiple: <strong>{exitMultiple}x</strong></Text>
              <Slider 
                min={2} 
                max={30} 
                value={exitMultiple} 
                onChange={setExitMultiple}
                tooltip={{ formatter: value => `${value}x Multiple` }}
              />
            </Col>
            <Col span={12}>
              <Text style={{ fontSize: 12, color: tSec, display: 'block', marginBottom: 6 }}>Exit Timeframe: <strong>{exitTimeframe} Years</strong></Text>
              <Slider 
                min={1} 
                max={10} 
                value={exitTimeframe} 
                onChange={setExitTimeframe}
                tooltip={{ formatter: value => `${value} Years` }}
              />
            </Col>
          </Row>

          <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', padding: 12, borderRadius: 8, marginTop: 12, border: `1px solid ${borderCl}` }}>
            <Row gutter={8}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Exit Value</Text>
                <Text style={{ color: '#10b981', fontWeight: 800, fontSize: 14 }}>₹{(investAmount * exitMultiple).toLocaleString()}</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Est. CAGR</Text>
                <Text style={{ color: '#00d09c', fontWeight: 800, fontSize: 14 }}>{(((exitMultiple) ** (1 / exitTimeframe) - 1) * 100).toFixed(1)}%</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>MoIC Multiple</Text>
                <Text style={{ color: '#8b5cf6', fontWeight: 800, fontSize: 14 }}>{exitMultiple}.0x</Text>
              </Col>
            </Row>
          </div>
        </div>

        <Text type="secondary" style={{ color: '#7c8099', fontSize: 12, display: 'block', marginTop: 12 }}>
          * Pledge will execute via MongoDB atomic operations. Minimum pledge required is ₹{(selectedStartup?.minimumInvestment || 10000).toLocaleString()}.
        </Text>
      </Modal>

      {/* Checkout Basket Investment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📦</span>
            <span style={{ color: tc, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}>Invest in Basket</span>
          </div>
        }
        open={basketModalVisible}
        onOk={handleConfirmBasketInvestment}
        onCancel={() => { setBasketModalVisible(false); setBasketPaymentType('onetime'); setSipDuration(12); }}
        confirmLoading={submittingBasketInvest}
        okText={basketPaymentType === 'sip' ? `Start SIP — ₹${(basketInvestAmount || 0).toLocaleString()}/mo` : 'Confirm One-Time Investment'}
        width={560}
        okButtonProps={{
          style: {
            backgroundColor: basketPaymentType === 'sip' ? '#8b5cf6' : '#00d09c',
            borderColor: basketPaymentType === 'sip' ? '#8b5cf6' : '#00d09c',
            color: '#fff',
            borderRadius: 8,
            height: 40,
            fontWeight: 700,
            fontSize: 13
          }
        }}
        cancelButtonProps={{
          style: {
            background: bgBtnCancel,
            color: tc,
            border: isDarkMode ? '1px solid #374151' : 'none',
            borderRadius: 8,
            height: 40
          }
        }}
        style={{ borderRadius: 16 }}
        styles={{ body: { padding: '8px 0 16px' } }}
        wrapClassName="invest-modal-wrap"
      >
        {/* Basket Info Header */}
        <div style={{ background: isDarkMode ? 'linear-gradient(135deg, #111827, #1a2035)' : 'linear-gradient(135deg, #f0fdf4, #eff6ff)', padding: '14px 16px', borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 20 }}>
          {selectedBasket && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: isDarkMode ? '#1e293b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${borderCl}` }}>
                {getBasketIcon(selectedBasket.icon)}
              </div>
              <div>
                <Text style={{ fontSize: 15, fontWeight: 800, color: tc, display: 'block' }}>{selectedBasket.name}</Text>
                <Text style={{ fontSize: 11, color: '#7c8099' }}>{selectedBasket.constituents.length} startups · Min ₹5,000</Text>
              </div>
            </div>
          )}
        </div>

        {/* Payment Type Toggle */}
        <div style={{ marginBottom: 20 }}>
          <Text style={{ color: '#7c8099', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Investment Type</Text>
          <Radio.Group
            value={basketPaymentType}
            onChange={(e) => setBasketPaymentType(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Radio.Button
                value="onetime"
                style={{
                  height: 'auto',
                  padding: '12px 16px',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  border: basketPaymentType === 'onetime' ? '2px solid #00d09c' : `2px solid ${borderCl}`,
                  background: basketPaymentType === 'onetime' ? (isDarkMode ? 'rgba(0,208,156,0.1)' : 'rgba(0,208,156,0.05)') : (isDarkMode ? '#111827' : '#f8fafc')
                }}
              >
                <span style={{ fontSize: 18 }}>💰</span>
                <Text style={{ fontWeight: 800, fontSize: 13, color: basketPaymentType === 'onetime' ? '#00d09c' : tc, display: 'block', marginTop: 4 }}>One-Time</Text>
                <Text style={{ fontSize: 10, color: '#7c8099', lineHeight: 1.4, display: 'block' }}>Invest a lump sum amount right now.</Text>
              </Radio.Button>
              <Radio.Button
                value="sip"
                style={{
                  height: 'auto',
                  padding: '12px 16px',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  border: basketPaymentType === 'sip' ? '2px solid #8b5cf6' : `2px solid ${borderCl}`,
                  background: basketPaymentType === 'sip' ? (isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)') : (isDarkMode ? '#111827' : '#f8fafc')
                }}
              >
                <span style={{ fontSize: 18 }}>📅</span>
                <Text style={{ fontWeight: 800, fontSize: 13, color: basketPaymentType === 'sip' ? '#8b5cf6' : tc, display: 'block', marginTop: 4 }}>Monthly SIP</Text>
                <Text style={{ fontSize: 10, color: '#7c8099', lineHeight: 1.4, display: 'block' }}>Auto-invest monthly for rupee-cost averaging.</Text>
              </Radio.Button>
            </div>
          </Radio.Group>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: basketPaymentType === 'sip' ? 16 : 0 }}>
          <Text style={{ color: '#7c8099', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            {basketPaymentType === 'sip' ? 'Monthly SIP Amount (Min ₹5,000/month)' : 'Investment Amount (Min ₹5,000)'}
          </Text>
          {currentUser && basketInvestAmount > currentUser.walletBalance && (
            <Alert
              message={`Insufficient wallet balance (Available: ₹${currentUser.walletBalance.toLocaleString()})`}
              type="error"
              showIcon
              style={{ marginBottom: 10 }}
            />
          )}
          <InputNumber
            min={5000}
            value={basketInvestAmount}
            onChange={setBasketInvestAmount}
            onPressEnter={handleConfirmBasketInvestment}
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/₹\s?|(,*)/g, '')}
            style={{ width: '100%', height: 44, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
          />
        </div>

        {/* SIP Duration Selector */}
        {basketPaymentType === 'sip' && (
          <div style={{ marginBottom: 16 }}>
            <Text style={{ color: '#7c8099', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>SIP Duration</Text>
            <Radio.Group
              value={sipDuration}
              onChange={(e) => setSipDuration(e.target.value)}
              buttonStyle="solid"
              size="middle"
              style={{ width: '100%' }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[3, 6, 12, 24, 36].map(mo => (
                  <Radio.Button
                    key={mo}
                    value={mo}
                    style={{
                      borderRadius: 6,
                      flex: 1,
                      textAlign: 'center',
                      fontWeight: 600,
                      minWidth: 60,
                      background: sipDuration === mo ? '#8b5cf6' : (isDarkMode ? '#111827' : '#f8fafc'),
                      borderColor: sipDuration === mo ? '#8b5cf6' : borderCl,
                      color: sipDuration === mo ? '#fff' : tc
                    }}
                  >
                    {mo < 12 ? `${mo}M` : `${mo / 12}Y`}
                  </Radio.Button>
                ))}
              </div>
            </Radio.Group>
          </div>
        )}

        {/* Summary Box */}
        {selectedBasket && basketInvestAmount >= 5000 && (
          <>
            {/* SIP Summary */}
            {basketPaymentType === 'sip' && (
              <div style={{ background: isDarkMode ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)', border: '1.5px solid #8b5cf6', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <Text style={{ color: '#8b5cf6', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 10 }}>📅 SIP Summary</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ display: 'block', fontSize: 10, color: '#7c8099', fontWeight: 600, marginBottom: 2 }}>MONTHLY</Text>
                    <Text style={{ display: 'block', fontWeight: 800, color: '#8b5cf6', fontSize: 16 }}>₹{(basketInvestAmount || 0).toLocaleString()}</Text>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: `1px solid ${borderCl}`, borderRight: `1px solid ${borderCl}` }}>
                    <Text style={{ display: 'block', fontSize: 10, color: '#7c8099', fontWeight: 600, marginBottom: 2 }}>DURATION</Text>
                    <Text style={{ display: 'block', fontWeight: 800, color: tc, fontSize: 16 }}>{sipDuration} months</Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ display: 'block', fontSize: 10, color: '#7c8099', fontWeight: 600, marginBottom: 2 }}>TOTAL COMMITMENT</Text>
                    <Text style={{ display: 'block', fontWeight: 800, color: '#00d09c', fontSize: 16 }}>₹{((basketInvestAmount || 0) * sipDuration).toLocaleString()}</Text>
                  </div>
                </div>
                <Alert
                  message="First SIP instalment will be deducted now. Remaining will be auto-debited monthly."
                  type="info"
                  showIcon
                  style={{ marginTop: 12, fontSize: 11 }}
                  banner={false}
                />
              </div>
            )}

            {/* Proportional Distribution */}
            <div style={{ borderTop: `1px solid ${borderCl}`, paddingTop: 16 }}>
              <Text style={{ color: tc, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 10 }}>
                📊 Allocation per startup {basketPaymentType === 'sip' ? '(per month)' : ''}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedBasket.constituents.map((item, idx) => {
                  const allocated = Math.round(basketInvestAmount * (item.weight / 100));
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? '#111827' : '#f8fafc', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderCl}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size="small" src={item.logoUrl} style={{ backgroundColor: '#00d09c', fontSize: 10 }}>{item.name[0]}</Avatar>
                        <Text style={{ fontWeight: 600, color: tc, fontSize: 13 }}>{item.name}</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text style={{ color: basketPaymentType === 'sip' ? '#8b5cf6' : '#00d09c', fontWeight: 700 }}>₹{allocated.toLocaleString()}</Text>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{item.weight}% weight</Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* ── Wallet Modal (Deposit & Withdrawal Gateways) ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>
            <WalletOutlined style={{ color: '#00d09c' }} />
            <span>Wallet Funds Manager</span>
          </div>
        }
        open={walletModalVisible}
        onCancel={() => {
          if (!processingWallet) {
            setWalletModalVisible(false);
            setWalletStep(0);
          }
        }}
        footer={null}
        width={550}
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: '8px 4px' }}
      >
        {walletStep === 0 && (
          <div>
            {/* Action Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <Button
                type={walletAction === 'deposit' ? 'primary' : 'default'}
                icon={<ArrowUpOutlined />}
                onClick={() => {
                  setWalletAction('deposit');
                  setWalletAmount(5000);
                }}
                style={{
                  height: 40,
                  borderRadius: 8,
                  fontWeight: 700,
                  backgroundColor: walletAction === 'deposit' ? '#00d09c' : (isDarkMode ? '#1f2937' : '#f8fafc'),
                  borderColor: walletAction === 'deposit' ? '#00d09c' : (isDarkMode ? '#374151' : '#d1d5db'),
                  color: walletAction === 'deposit' ? '#fff' : tc,
                  boxShadow: 'none'
                }}
              >
                Deposit Funds
              </Button>
              <Button
                type={walletAction === 'withdraw' ? 'primary' : 'default'}
                icon={<ArrowDownOutlined />}
                onClick={() => {
                  setWalletAction('withdraw');
                  setWalletAmount(5000);
                }}
                style={{
                  height: 40,
                  borderRadius: 8,
                  fontWeight: 700,
                  backgroundColor: walletAction === 'withdraw' ? (isDarkMode ? '#374151' : '#1a1d2e') : (isDarkMode ? '#1f2937' : '#f8fafc'),
                  borderColor: walletAction === 'withdraw' ? (isDarkMode ? '#374151' : '#1a1d2e') : (isDarkMode ? '#374151' : '#d1d5db'),
                  color: walletAction === 'withdraw' ? '#fff' : tc,
                  boxShadow: 'none'
                }}
              >
                Withdraw Funds
              </Button>
            </div>

            {/* Amount Section */}
            <div style={{ background: bgInner, padding: 16, borderRadius: 12, border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', marginBottom: 6 }}>
                Enter Transaction Amount (INR)
              </Text>
               <InputNumber
                min={100}
                max={5000000}
                value={walletAmount}
                onChange={setWalletAmount}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                style={{ width: '100%', height: 44, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: isDarkMode ? '1px solid #1f2937' : '1px solid #d1d5db', borderRadius: 8, fontSize: 18, fontWeight: 700 }}
              />

              {/* Amount Quick Presets */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {walletAction === 'deposit' ? (
                  [2000, 5000, 10000, 25000].map(amt => (
                    <Button
                      key={amt}
                      size="small"
                      onClick={() => setWalletAmount(amt)}
                      style={{ borderRadius: 6, fontSize: 11, background: isDarkMode ? '#121620' : '#fff', color: tc, borderColor: isDarkMode ? '#1f2937' : '#e2e8f0' }}
                    >
                      + ₹{amt.toLocaleString()}
                    </Button>
                  ))
                ) : (
                  [5000, 10000, 50000, (currentUser?.walletBalance || 0)].map((amt, idx) => {
                    const isAll = idx === 3;
                    return (
                      <Button
                        key={idx}
                        size="small"
                        onClick={() => setWalletAmount(amt)}
                        style={{ borderRadius: 6, fontSize: 11, background: isDarkMode ? '#121620' : '#fff', color: tc, borderColor: isDarkMode ? '#1f2937' : '#e2e8f0' }}
                      >
                        {isAll ? 'All Balance' : `₹${amt.toLocaleString()}`}
                      </Button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Gateway Sections */}
            {walletAction === 'deposit' ? (
              <div>
                <Divider style={{ margin: '12px 0', fontSize: 12, color: '#7c8099' }}>Choose Payment Gateway</Divider>
                <Radio.Group
                  value={paymentMethod}
                  onChange={e => {
                    setPaymentMethod(e.target.value);
                    setShowQrCode(false);
                  }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}
                >
                  <Radio.Button value="upi" style={{ height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    <QrcodeOutlined style={{ marginRight: 4 }} /> UPI / QR
                  </Radio.Button>
                  <Radio.Button value="card" style={{ height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    <CreditCardOutlined style={{ marginRight: 4 }} /> Card
                  </Radio.Button>
                  <Radio.Button value="netbanking" style={{ height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    <BankOutlined style={{ marginRight: 4 }} /> Banking
                  </Radio.Button>
                </Radio.Group>

                {/* UPI Mode */}
                {paymentMethod === 'upi' && (
                  <div className="fade-in-section">
                    {!showQrCode ? (
                      <div>
                        <Text style={{ color: '#44475b', display: 'block', marginBottom: 6, fontWeight: 600 }}>UPI Address ID</Text>
                        <Input
                          placeholder="e.g. mobile-no@upi or username@okhdfcbank"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          style={{ height: 40, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12 }}
                        />
                        <Button
                          type="dashed"
                          icon={<QrcodeOutlined />}
                          onClick={() => {
                            setShowQrCode(true);
                            setCountdown(300);
                          }}
                          block
                          style={{ height: 38, borderRadius: 8, borderColor: '#00d09c', color: '#00d09c' }}
                        >
                          Generate Instant Payment QR Code
                        </Button>
                      </div>
                    ) : (
                      <QrCodeView
                        countdown={countdown}
                        onSimulateSuccess={async () => {
                          const token = localStorage.getItem('token');
                          setProcessingWallet(true);
                          setWalletStep(1);
                          try {
                            const res = await fetch(`${API_URL}/api/wallet/deposit`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ amount: walletAmount })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              throw new Error(data.error || 'Failed to complete direct deposit simulation');
                            }
                            setWalletStep(2);
                            const updatedUser = { ...currentUser, walletBalance: data.updatedWalletBalance };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            setCurrentUser(updatedUser);
                            message.success('Simulated QR Payment successful and wallet credited!');
                            fetchData();
                          } catch (err) {
                            message.error(`QR Payment Simulation Failed: ${err.message}`);
                            setWalletStep(0);
                          } finally {
                            setProcessingWallet(false);
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Card Mode */}
                {paymentMethod === 'card' && (
                  <div className="fade-in-section">
                    {/* Saved Card Selector dropdown */}
                    {savedCards.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <Text style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 600, color: tc }}>Pay with Saved Card</Text>
                        <Select
                          placeholder="Choose a saved card"
                          style={{ width: '100%' }}
                          onChange={cardId => {
                            const card = savedCards.find(c => c.id === cardId);
                            if (card) {
                              setCardDetails({
                                number: card.number,
                                expiry: card.expiry,
                                cvv: '123',
                                name: card.name
                              });
                            }
                          }}
                          options={savedCards.map(c => ({
                            value: c.id,
                            label: `💳 ${c.cardType} ending in ${c.last4} (${c.name})`
                          }))}
                        />
                      </div>
                    )}

                    {/* Interactive Mock Card */}
                    <CardPreview details={cardDetails} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      <div>
                        <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Card Number</Text>
                        <Input
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardDetails.number}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
                            setCardDetails(prev => ({ ...prev, number: val }));
                          }}
                          style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Expiry (MM/YY)</Text>
                          <Input
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                              }
                              setCardDetails(prev => ({ ...prev, expiry: val }));
                            }}
                            style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                          />
                        </div>
                        <div>
                          <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>CVV / CVC</Text>
                          <Input.Password
                            placeholder="•••"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              setCardDetails(prev => ({ ...prev, cvv: val }));
                            }}
                            style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                          />
                        </div>
                      </div>
                      <div>
                        <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Cardholder Name</Text>
                        <Input
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                          style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div style={{ marginTop: 6, marginBottom: 4 }}>
                        <Checkbox 
                          checked={saveCard} 
                          onChange={e => setSaveCard(e.target.checked)}
                          style={{ fontWeight: 600, color: tc }}
                        >
                          Save this card for future payments
                        </Checkbox>
                      </div>
                    </div>
                  </div>
                )}

                {/* Netbanking Mode */}
                {paymentMethod === 'netbanking' && (
                  <div className="fade-in-section">
                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 8, fontWeight: 600 }}>Popular Banks</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                        <Button
                          key={bank}
                          onClick={() => setBankDetails(prev => ({ ...prev, bankName: bank }))}
                          style={{
                            height: 38,
                            borderRadius: 8,
                            textAlign: 'left',
                            borderColor: bankDetails.bankName === bank ? '#00d09c' : '#d1d5db',
                            background: bankDetails.bankName === bank ? '#f0fdf4' : '#fff',
                            color: '#44475b',
                            fontWeight: 600
                          }}
                        >
                          🏦 {bank}
                        </Button>
                      ))}
                    </div>

                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Or Select Other Bank</Text>
                    <Select
                      placeholder="Select Bank"
                      style={{ width: '100%', height: 38 }}
                      value={bankDetails.bankName}
                      onChange={val => setBankDetails(prev => ({ ...prev, bankName: val }))}
                      options={[
                        { value: 'HDFC Bank', label: 'HDFC Bank' },
                        { value: 'SBI Bank', label: 'State Bank of India' },
                        { value: 'ICICI Bank', label: 'ICICI Bank' },
                        { value: 'Axis Bank', label: 'Axis Bank' },
                        { value: 'Kotak Bank', label: 'Kotak Mahindra Bank' },
                        { value: 'Yes Bank', label: 'Yes Bank' },
                        { value: 'Punjab National Bank', label: 'Punjab National Bank' },
                        { value: 'Bank of Baroda', label: 'Bank of Baroda' }
                      ]}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Withdrawal
              <div className="fade-in-section">
                <Divider style={{ margin: '12px 0', fontSize: 12, color: '#7c8099' }}>Recipient Bank Details</Divider>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  <div>
                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Beneficiary Account Holder Name</Text>
                    <Input
                      placeholder="e.g. John Doe"
                      value={bankDetails.holderName}
                      onChange={e => setBankDetails(prev => ({ ...prev, holderName: e.target.value }))}
                      style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Bank Name</Text>
                    <Select
                      placeholder="Select Bank"
                      style={{ width: '100%', height: 38 }}
                      value={bankDetails.bankName}
                      onChange={val => setBankDetails(prev => ({ ...prev, bankName: val }))}
                      options={[
                        { value: 'HDFC Bank', label: 'HDFC Bank' },
                        { value: 'SBI Bank', label: 'State Bank of India' },
                        { value: 'ICICI Bank', label: 'ICICI Bank' },
                        { value: 'Axis Bank', label: 'Axis Bank' },
                        { value: 'Kotak Bank', label: 'Kotak Mahindra Bank' }
                      ]}
                    />
                  </div>
                  <div>
                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Account Number</Text>
                    <Input
                      placeholder="e.g. 5010023456789"
                      value={bankDetails.accountNo}
                      onChange={e => setBankDetails(prev => ({ ...prev, accountNo: e.target.value.replace(/\D/g, '') }))}
                      style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <Text style={{ color: '#44475b', display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>IFSC Code (11-digit alphanumeric)</Text>
                    <Input
                      placeholder="e.g. HDFC0000123"
                      maxLength={11}
                      value={bankDetails.ifsc}
                      onChange={e => setBankDetails(prev => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                      style={{ height: 38, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            {(!showQrCode || walletAction === 'withdraw') && (
              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleWalletTransaction}
                  style={{
                    backgroundColor: walletAction === 'deposit' ? '#00d09c' : '#1a1d2e',
                    borderColor: walletAction === 'deposit' ? '#00d09c' : '#1a1d2e',
                    height: 48,
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: 'none'
                  }}
                >
                  {walletAction === 'deposit' ? `Pay ₹${walletAmount.toLocaleString()} Securely` : `Confirm Withdrawal of ₹${walletAmount.toLocaleString()}`}
                </Button>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: '#7c8099', fontSize: 11 }}>
                  <SafetyCertificateOutlined style={{ color: '#00d09c', fontSize: 13 }} />
                  <span>256-bit Secure Gateway Connection. PCI-DSS Certified.</span>
                </div>
              </div>
            )}

            {/* Recent Wallet Transactions Ledger */}
            <div style={{ marginTop: 24, borderTop: `1px solid ${borderCl}`, paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: tc, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  📜 Recent Wallet Transactions
                </Text>
                <Button 
                  size="small" 
                  type="link" 
                  disabled={walletTransactions.length === 0}
                  onClick={handleDownloadStatement}
                  style={{ color: '#00d09c', fontSize: 11, fontWeight: 600, padding: 0 }}
                >
                  📥 Export Statement
                </Button>
              </div>

              {walletTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px 0', background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>No transactions recorded yet.</Text>
                </div>
              ) : (
                <div style={{ maxHeight: 150, overflowY: 'auto', borderRadius: 8, border: `1px solid ${borderCl}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, background: isDarkMode ? '#111827' : '#ffffff' }}>
                    <thead>
                      <tr style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${borderCl}` }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: '#7c8099' }}>Date</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: '#7c8099' }}>Type</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', color: '#7c8099' }}>Amount</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: '#7c8099' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTransactions.map((tx, idx) => {
                        const isCredit = ['deposit', 'sell_return', 'refund'].includes(tx.type);
                        return (
                          <tr key={tx._id || idx} style={{ borderBottom: idx !== walletTransactions.length - 1 ? `1px solid ${borderCl}` : 'none' }}>
                            <td style={{ padding: '6px 8px', color: tc }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '6px 8px' }}>
                              <Tag color={isCredit ? 'green' : 'volcano'} style={{ fontSize: 9, fontWeight: 700, borderRadius: 4 }}>
                                {tx.type.replace('_', ' ').toUpperCase()}
                              </Tag>
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: isCredit ? '#10b981' : '#ef4444' }}>
                              {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </td>
                            <td style={{ padding: '6px 8px', color: tSec, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.description}>
                              {tx.description || 'Wallet transaction'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {walletStep === 1 && (
          <div className="fade-in-section" style={{ textAlign: 'center', padding: '40px 10px' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: walletAction === 'deposit' ? '#00d09c' : '#1a1d2e', marginBottom: 24 }} spin />} />
            <Title level={4} style={{ color: '#1e293b', fontFamily: 'Outfit', fontWeight: 800 }}>
              {walletAction === 'deposit' ? 'Processing Gateway Deposit' : 'Processing Bank Transfer'}
            </Title>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 32 }}>
              Please do not refresh the page or close this modal.
            </Text>
            <Steps
              direction="vertical"
              size="small"
              current={1}
              items={[
                { title: 'Establishing Secure Handshake', description: 'SSL handshakes established' },
                { title: walletAction === 'deposit' ? 'Authorizing Gateway Payment' : 'Verifying Beneficiary Account Routing', description: 'Validating ledger balance' },
                { title: 'Updating Core Wallet Balance', description: 'Synchronizing DB logs' }
              ]}
              style={{ maxWidth: 310, margin: '0 auto', textAlign: 'left' }}
            />
          </div>
        )}

        {walletStep === 2 && (
          <div className="fade-in-section">
            <Result
              status="success"
              title={
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, color: tc, fontSize: 22 }}>
                  {walletAction === 'deposit' ? 'Funds Deposited Successfully!' : 'Withdrawal Completed!'}
                </span>
              }
              subTitle={
                <div style={{ color: tc, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>
                  <Text style={{ display: 'block', marginBottom: 4, color: tc }}>
                    Amount: <strong style={{ color: '#00d09c' }}>₹{walletAmount.toLocaleString()}</strong>
                  </Text>
                  <Text style={{ display: 'block', marginBottom: 12, color: tSec }}>
                    Transaction ID: <span style={{ fontFamily: 'Courier New, monospace' }}>TXN-{Math.floor(Math.random() * 900000000 + 100000000)}</span>
                  </Text>
                  <Text style={{
                    display: 'block',
                    background: isDarkMode ? '#1f2937' : '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isDarkMode ? '#374151' : '#edf2f7'}`,
                    color: tc
                  }}>
                    Your new wallet balance is: <strong style={{ color: '#00d09c' }}>₹{currentUser?.walletBalance?.toLocaleString()}</strong>
                  </Text>
                </div>
              }
              extra={[
                <Button
                  type="primary"
                  key="close"
                  onClick={() => {
                    setWalletModalVisible(false);
                    setWalletStep(0);
                  }}
                  style={{
                    backgroundColor: walletAction === 'deposit' ? '#00d09c' : '#1a1d2e',
                    borderColor: walletAction === 'deposit' ? '#00d09c' : '#1a1d2e',
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 700,
                    padding: '0 24px'
                  }}
                >
                  Return to Dashboard
                </Button>
              ]}
            />
          </div>
        )}
      </Modal>

      {/* ── Startup Details Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: isDarkMode ? '1px solid #1f2937' : '1px solid #f1f5f9', paddingBottom: 12 }}>
            {companyDetailsData?.startup?.logoUrl && (
              <img 
                src={companyDetailsData.startup.logoUrl} 
                alt={companyDetailsData.startup.name} 
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ color: tc, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}>
                {companyDetailsData?.startup?.name}
              </div>
              <div style={{ fontSize: 12, color: '#00d09c', fontWeight: 600 }}>
                {companyDetailsData?.startup?.category}
              </div>
            </div>
          </div>
        }
        open={companyDetailsVisible}
        onCancel={() => setCompanyDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCompanyDetailsVisible(false)} style={{ borderRadius: 8 }}>
            Close
          </Button>,
          companyDetailsData?.startup?.daysLeft > 0 && (
            <Button 
              key="invest" 
              type="primary" 
              icon={<DollarOutlined />}
              onClick={() => {
                setCompanyDetailsVisible(false);
                handleOpenInvestModal(companyDetailsData.startup);
              }}
              style={{
                backgroundColor: '#00d09c',
                borderColor: '#00d09c',
                borderRadius: 8,
                fontWeight: 700
              }}
            >
              Invest Now
            </Button>
          )
        ]}
        width={750}
        style={{ borderRadius: 16 }}
        styles={{ body: { padding: '10px 0' } }}
      >
        {companyDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Loading company profile & live data..." />
          </div>
        ) : companyDetailsData ? (
          (() => {
            const s = companyDetailsData.startup;
            const investments = companyDetailsData.investments || [];
            const raisedProgress = Math.min(100, Math.round(((s.raisedAmount || 0) / (s.targetGoal || 1)) * 100));

            return (
              <>
                {/* Milestone Stepper */}
                <div style={{ 
                  margin: '0 16px 20px 16px', 
                  background: isDarkMode ? '#1e293b' : '#f8fafc', 
                  border: `1px solid ${borderCl}`, 
                  borderRadius: 12, 
                  padding: '16px 24px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>🚀</span>
                    <Text style={{ color: tc, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Milestone Progress
                    </Text>
                  </div>
                  <Steps 
                    size="small" 
                    current={getMilestoneStepIndex(s.milestoneStage)} 
                    items={[
                      { title: 'Idea', description: <span style={{ fontSize: 10 }}>Conception</span> },
                      { title: 'MVP', description: <span style={{ fontSize: 10 }}>Product Demo</span> },
                      { title: 'Revenue', description: <span style={{ fontSize: 10 }}>Market Fit</span> },
                      { title: 'Growth', description: <span style={{ fontSize: 10 }}>Scale Up</span> },
                      { title: 'Scale', description: <span style={{ fontSize: 10 }}>Expansion</span> }
                    ]}
                    style={{
                      // Custom styles to ensure steps have consistent coloring
                      fontFamily: 'Outfit'
                    }}
                  />
                </div>

                {/* ── Holdings & Pledges Section (At the top) ── */}
                {currentCompanyHoldings && currentCompanyHoldings.length > 0 && (
                  <div style={{ 
                    margin: '0 16px 20px 16px', 
                    background: isDarkMode ? '#1e293b' : '#f8fafc', 
                    border: `1px solid ${borderCl}`, 
                    borderRadius: 12, 
                    padding: 16 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ color: tc, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        💼 Your Holdings & Pledges ({currentCompanyHoldings.length})
                      </Text>
                      <Tag color="green" style={{ fontWeight: 700, borderRadius: 4 }}>
                        ACTIVE HOLDING
                      </Tag>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${borderCl}` }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#7c8099', fontWeight: 600 }}>Purchase Date</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#7c8099', fontWeight: 600 }}>Pledged Capital</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#7c8099', fontWeight: 600 }}>Est. Share Price</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#7c8099', fontWeight: 600 }}>Shares Owned</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#7c8099', fontWeight: 600 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentCompanyHoldings.map((tx, idx) => {
                            const startup = tx.startupObj || s;
                            const valuations = [...(startup?.pastValuations || [])];
                            if (valuations.length === 0 || valuations[valuations.length - 1] !== startup?.valuationCap) {
                              if (startup?.valuationCap) {
                                valuations.push(startup.valuationCap);
                              }
                            }
                            
                            let purchaseSharePrice = startup?.pricePerShare || 100;
                            let shares = Math.round(tx.amount / purchaseSharePrice);
                            
                            if (valuations.length > 1) {
                              const currentVal = valuations[valuations.length - 1] || 1;
                              const txDate = tx.rawDate || new Date(tx.timestamp || tx.createdAt);
                              const today = new Date();
                              const diffMonths = (today.getFullYear() - txDate.getFullYear()) * 12 + today.getMonth() - txDate.getMonth();
                              
                              const valIdx = Math.max(0, valuations.length - 1 - Math.min(valuations.length - 1, diffMonths));
                              const purchaseVal = valuations[valIdx] || currentVal;
                              purchaseSharePrice = Math.round((startup?.pricePerShare || 100) * (purchaseVal / currentVal));
                              shares = Math.round(tx.amount / purchaseSharePrice);
                            }
                            
                            return (
                              <tr key={tx.key || idx} style={{ borderBottom: idx !== currentCompanyHoldings.length - 1 ? `1px solid ${borderCl}` : 'none' }}>
                                <td style={{ padding: '8px 8px', color: tc }}>
                                  {new Date(tx.rawDate || tx.timestamp).toLocaleDateString()} at {new Date(tx.rawDate || tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: '#00d09c' }}>
                                  ₹{tx.amount.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 8px', textAlign: 'right', color: tc }}>
                                  ₹{purchaseSharePrice.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 8px', textAlign: 'right', color: tc, fontWeight: 600 }}>
                                  {shares.toLocaleString()} units
                                </td>
                                <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                                  <Button 
                                    type="link" 
                                    danger 
                                    size="small" 
                                    icon={<ArrowDownOutlined />}
                                    onClick={async () => {
                                      await handleSellInvestment(tx.key);
                                      setCompanyDetailsVisible(false);
                                    }}
                                    style={{ padding: 0, fontSize: 11, fontWeight: 700 }}
                                  >
                                    Sell
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Tabs defaultActiveKey="1" style={{ padding: '0 16px' }} items={[
                  {
                    key: '1',
                    label: <span style={{ fontWeight: 600 }}>Overview</span>,
                    children: (
                      <div style={{ padding: '8px 0' }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: tc, display: 'block', marginBottom: 8 }}>Tagline</Text>
                        <Paragraph style={{ color: tc, fontStyle: 'italic', fontSize: 13 }}>"{s.tagline}"</Paragraph>
                        
                        <Divider style={{ margin: '12px 0' }} />
                        
                        <Text style={{ fontSize: 14, fontWeight: 700, color: tc, display: 'block', marginBottom: 8 }}>What the Company Does</Text>
                        <Paragraph style={{ color: isDarkMode ? '#cbd5e1' : '#4b5563', fontSize: 13, lineHeight: 1.6 }}>
                          {s.description || 'No detailed description available.'}
                        </Paragraph>
                        
                        <Divider style={{ margin: '12px 0' }} />

                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>FOUNDED YEAR</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>{s.foundedYear || 'N/A'}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>LOCATION</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>{s.location || 'N/A'}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>STAGE</Text>
                            <Tag color="cyan" style={{ fontWeight: 600, marginTop: 4 }}>{s.stage || 'Seed'}</Tag>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>TEAM SIZE</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>{s.teamSize || 'N/A'} Members</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>WEBSITE</Text>
                            {s.website ? (
                              <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00d09c', fontWeight: 600 }}>
                                {s.website.replace(/^https?:\/\/(www\.)?/, '')}
                              </a>
                            ) : 'N/A'}
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>LINKEDIN</Text>
                            {s.linkedIn ? (
                              <a href={s.linkedIn} target="_blank" rel="noopener noreferrer" style={{ color: '#00d09c', fontWeight: 600 }}>
                                LinkedIn Profile
                              </a>
                            ) : 'N/A'}
                          </Col>
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: '2',
                    label: <span style={{ fontWeight: 600 }}>Financials & Valuation</span>,
                    children: (
                      <div style={{ padding: '8px 0' }}>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Statistic 
                              title={<span style={{ color: '#7c8099', fontSize: 12 }}>VALUATION CAP</span>} 
                              value={s.valuationCap} 
                              formatter={(v) => `₹${Number(v).toLocaleString()}`}
                              valueStyle={{ color: tc, fontSize: 18, fontWeight: 800 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic 
                              title={<span style={{ color: '#7c8099', fontSize: 12 }}>MINIMUM INVESTMENT</span>} 
                              value={s.minimumInvestment} 
                              formatter={(v) => `₹${Number(v).toLocaleString()}`}
                              valueStyle={{ color: tc, fontSize: 18, fontWeight: 800 }}
                            />
                          </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        <Text style={{ fontSize: 13, fontWeight: 700, color: tc, display: 'block', marginBottom: 8 }}>VALUATION HISTORY &amp; PROJECTION</Text>
                        {s.pastValuations && s.pastValuations.length > 1 ? (
                          <div style={{ background: bgInner, padding: 16, borderRadius: 12, border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
                            {(() => {
                              const currentVal = s.pastValuations[s.pastValuations.length - 1];
                              const round1 = Math.round(currentVal * (1 + projectionGrowth / 100) * (projectionRetention / 100));
                              const round2 = Math.round(round1 * (1 + projectionGrowth / 100) * (projectionRetention / 100));
                              const round3 = Math.round(round2 * (1 + projectionGrowth / 100) * (projectionRetention / 100));
                              const projectedValuations = [...s.pastValuations, round1, round2, round3];
                              return (
                                <>
                                  <ValuationSparkline data={projectedValuations} projectionCount={3} />
                                  <div style={{ marginTop: 20, padding: '12px 16px', background: bgCard, borderRadius: 8, border: `1px solid ${borderCl}` }}>
                                    <Text style={{ fontSize: 12, fontWeight: 700, color: tc, display: 'block', marginBottom: 12 }}>
                                      VALUATION PROJECTION SIMULATOR (SaaS Model)
                                    </Text>
                                    <div style={{ marginBottom: 12 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                        <Text type="secondary">Expected Annual Growth Rate</Text>
                                        <Text style={{ color: '#00d09c', fontWeight: 600 }}>{projectionGrowth}%</Text>
                                      </div>
                                      <Slider 
                                        min={0} 
                                        max={100} 
                                        value={projectionGrowth} 
                                        onChange={(val) => setProjectionGrowth(val)} 
                                        trackStyle={{ backgroundColor: '#00d09c' }}
                                        handleStyle={{ borderColor: '#00d09c' }}
                                      />
                                    </div>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                        <Text type="secondary">Customer Retention Rate (Net Revenue Retention)</Text>
                                        <Text style={{ color: '#ea580c', fontWeight: 600 }}>{projectionRetention}%</Text>
                                      </div>
                                      <Slider 
                                        min={50} 
                                        max={100} 
                                        value={projectionRetention} 
                                        onChange={(val) => setProjectionRetention(val)} 
                                        trackStyle={{ backgroundColor: '#ea580c' }}
                                        handleStyle={{ borderColor: '#ea580c' }}
                                      />
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 10, color: '#7c8099', fontStyle: 'italic' }}>
                                      *Estimations are computed using compounded net expansion metrics.
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <Text type="secondary">No valuation history data available.</Text>
                        )}

                        <Divider style={{ margin: '16px 0' }} />

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#00d09c', fontSize: 13, fontWeight: 700 }}>
                              ₹{(s.raisedAmount || 0).toLocaleString()} raised
                            </Text>
                            <Text style={{ color: tc, fontSize: 12, fontWeight: 600 }}>
                              {raisedProgress}% of target (₹{(s.targetGoal || 0).toLocaleString()})
                            </Text>
                          </div>
                          <Progress percent={raisedProgress} showInfo={false} strokeColor="#00d09c" strokeWidth={8} />
                        </div>

                        <Row gutter={[16, 16]} style={{ marginTop: 16, background: bgInner, padding: 12, borderRadius: 8 }}>
                          <Col span={6}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>TRAILING REVENUE</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>₹{(s.trailingRevenue || 0).toLocaleString()}</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>EBITDA MARGIN</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>{s.ebitdaMargin || 0}%</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>BURN RATE</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>₹{(s.burnRate || 0).toLocaleString()}/mo</Text>
                          </Col>
                          <Col span={6}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>RUNWAY</Text>
                            <Text style={{ color: tc, fontWeight: 600 }}>{s.runway || 0} Months</Text>
                          </Col>
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: '3',
                    label: <span style={{ fontWeight: 600 }}>Strategy & Model</span>,
                    children: (
                      <div style={{ padding: '8px 0', maxHeight: 350, overflowY: 'auto' }}>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: 700, color: '#00d09c', display: 'block', marginBottom: 2 }}>BUSINESS MODEL</Text>
                          <Paragraph style={{ color: tc, fontSize: 13 }}>{s.businessModel || 'Direct B2B/B2C services and platform subscription models.'}</Paragraph>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: 700, color: '#00d09c', display: 'block', marginBottom: 2 }}>MARKET OPPORTUNITY</Text>
                          <Paragraph style={{ color: tc, fontSize: 13 }}>{s.marketOpportunity || 'Targeting emerging Indian consumer demographic & regional digital expansion.'}</Paragraph>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: 700, color: '#00d09c', display: 'block', marginBottom: 2 }}>COMPETITIVE ADVANTAGE</Text>
                          <Paragraph style={{ color: tc, fontSize: 13 }}>{s.competitiveAdvantage || 'Proprietary technology, first-mover advantage, and local supply chain lock-in.'}</Paragraph>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: 700, color: '#00d09c', display: 'block', marginBottom: 2 }}>GO TO MARKET STRATEGY</Text>
                          <Paragraph style={{ color: tc, fontSize: 13 }}>{s.marketingMixVariables || 'Standard marketing and offline channel distributions.'}</Paragraph>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: 700, color: '#00d09c', display: 'block', marginBottom: 2 }}>USE OF FUNDS</Text>
                          <Paragraph style={{ color: tc, fontSize: 13 }}>{s.useOfFunds || s.financialProcurement || 'Engineering scaling, tier-1 city user acquisition, and operating runway.'}</Paragraph>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: '4',
                    label: <span style={{ fontWeight: 600 }}>Team & Founders</span>,
                    children: (
                      <div style={{ padding: '8px 0' }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: tc, display: 'block', marginBottom: 8 }}>Founding Team</Text>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Card size="small" style={{ borderRadius: 8, background: bgInner }}>
                              <Card.Meta 
                                avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00d09c' }} />}
                                title={<span style={{ color: tc }}>{s.founderName || 'Primary Founder'}</span>}
                                description={<span style={{ color: '#7c8099' }}>Founder & CEO</span>}
                              />
                            </Card>
                          </Col>
                          {s.coFounders && (
                            <Col span={12}>
                              <Card size="small" style={{ borderRadius: 8, background: bgInner }}>
                                <Card.Meta 
                                  avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#10b981' }} />}
                                  title={<span style={{ color: tc }}>{s.coFounders}</span>}
                                  description={<span style={{ color: '#7c8099' }}>Co-Founder</span>}
                                />
                              </Card>
                            </Col>
                          )}
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: '5',
                    label: <span style={{ fontWeight: 600 }}>Past Investors & Backers</span>,
                    children: (
                      <div style={{ padding: '8px 0' }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: tc, display: 'block', marginBottom: 12 }}>
                          Funding Rounds & Investment History
                        </Text>
                        <Table 
                          dataSource={investments} 
                          columns={[
                            {
                              title: 'Investor/Backer',
                              dataIndex: 'investorName',
                              key: 'investorName',
                              render: (text) => <Text style={{ color: tc, fontWeight: 600 }}>{text}</Text>
                            },
                            {
                              title: 'Amount Invested',
                              dataIndex: 'amount',
                              key: 'amount',
                              render: (amt) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{amt.toLocaleString()}</Text>
                            },
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              key: 'date',
                              render: (date) => <Text style={{ color: '#7c8099' }}>{new Date(date).toLocaleDateString()}</Text>
                            },
                            {
                              title: 'Type',
                              dataIndex: 'type',
                              key: 'type',
                              render: (type) => <Tag color={type.includes('Lead') ? 'purple' : type.includes('Accelerator') ? 'blue' : 'orange'}>{type}</Tag>
                            }
                          ]}
                          pagination={{ pageSize: 5 }}
                          size="small"
                          rowKey={(record, index) => index}
                          locale={{ emptyText: 'No past backing history found.' }}
                        />
                      </div>
                    )
                  },
                  {
                    key: '6',
                    label: <span style={{ fontWeight: 600 }}>Updates & Q&A ({companyUpdates.length})</span>,
                    children: (
                      <div style={{ padding: '8px 0', maxHeight: 400, overflowY: 'auto' }}>
                        {/* Ask a Question section */}
                        <div style={{ marginBottom: 20, padding: 16, background: bgInner, borderRadius: 12, border: `1px solid ${borderCl}` }}>
                          <Text style={{ fontSize: 13, fontWeight: 700, color: tc, display: 'block', marginBottom: 8 }}>
                            🙋 Ask the Founder a Question
                          </Text>
                          <Input.TextArea 
                            rows={3} 
                            placeholder="Ask about their business model, future plans, financials, or technology..." 
                            value={questionText} 
                            onChange={(e) => setQuestionText(e.target.value)} 
                            style={{ 
                              background: isDarkMode ? '#121620' : '#ffffff', 
                              color: tc, 
                              border: isDarkMode ? '1px solid #1f2937' : '1px solid #d1d5db', 
                              borderRadius: 8, 
                              marginBottom: 10 
                            }} 
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              type="primary" 
                              loading={submittingQuestion} 
                              onClick={handlePostQuestion}
                              style={{ 
                                backgroundColor: '#00d09c', 
                                borderColor: '#00d09c', 
                                borderRadius: 8, 
                                fontWeight: 700 
                              }}
                            >
                              Submit Question
                            </Button>
                          </div>
                        </div>

                        {/* Updates and Questions List */}
                        <Text style={{ fontSize: 14, fontWeight: 700, color: tc, display: 'block', marginBottom: 12 }}>
                          📢 Live Updates & Q&A Feed
                        </Text>

                        {companyUpdates.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: '#7c8099' }}>
                            No updates or Q&A threads yet for this company.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {companyUpdates.map((item) => {
                              const isUpdate = item.type === 'update';
                              return (
                                <div 
                                  key={item._id} 
                                  style={{ 
                                    padding: 16, 
                                    background: isUpdate ? (isDarkMode ? 'rgba(0, 208, 156, 0.05)' : 'rgba(0, 208, 156, 0.02)') : bgInner, 
                                    borderRadius: 12, 
                                    border: `1.5px solid ${isUpdate ? 'rgba(0, 208, 156, 0.2)' : borderCl}`
                                  }}
                                >
                                  {/* Header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Avatar 
                                        icon={<UserOutlined />} 
                                        style={{ backgroundColor: isUpdate ? '#00d09c' : '#8b5cf6' }} 
                                        size="small" 
                                      />
                                      <div>
                                        <Text style={{ fontWeight: 700, color: tc, fontSize: 12 }}>
                                          {item.authorName}
                                        </Text>
                                        <Tag color={isUpdate ? 'green' : 'purple'} style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, borderRadius: 3 }}>
                                          {isUpdate ? 'COMPANY UPDATE' : 'INVESTOR QUESTION'}
                                        </Tag>
                                      </div>
                                    </div>
                                    <Text style={{ fontSize: 10, color: '#7c8099' }}>
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                  </div>

                                  {/* Content */}
                                  <Paragraph style={{ color: tc, fontSize: 12.5, margin: 0, whiteSpace: 'pre-line' }}>
                                    {item.content}
                                  </Paragraph>

                                  {/* Answer (if question and answered) */}
                                  {!isUpdate && item.answer && (
                                    <div style={{ 
                                      marginTop: 12, 
                                      paddingLeft: 12, 
                                      borderLeft: '3px solid #00d09c', 
                                      background: isDarkMode ? '#1e293b' : '#f8fafc',
                                      padding: '8px 12px',
                                      borderRadius: '0 8px 8px 0'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00d09c' }} size="small" />
                                        <Text style={{ fontWeight: 700, color: tc, fontSize: 11 }}>Founder Response</Text>
                                      </div>
                                      <Paragraph style={{ color: tc, fontSize: 12, margin: 0 }}>
                                        {item.answer}
                                      </Paragraph>
                                    </div>
                                  )}

                                  {!isUpdate && !item.answer && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: '#7c8099', fontStyle: 'italic' }}>
                                      ⏳ Awaiting founder response...
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }
                ]} />
              </>
            );
          })()
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Result status="warning" title="Failed to load data" />
          </div>
        )}
      </Modal>

      {/* ── Mock Razorpay Payment Modal ── */}
      <Modal
        open={mockRazorpayVisible}
        onCancel={() => {
          setMockRazorpayVisible(false);
          message.warning('Payment window closed. Deposit was not completed.');
        }}
        footer={null}
        width={380}
        styles={{
          body: { padding: 0 }
        }}
        closable={false}
      >
        <div style={{
          background: '#0b162f',
          padding: '24px 20px',
          color: '#fff',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#00d09c', fontWeight: 700, letterSpacing: 1 }}>RAZORPAY SECURE</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Elevate Equity Portal</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#7c8099' }}>Amount to Pay</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00d09c' }}>₹{walletAmount.toLocaleString()}.00</div>
          </div>
        </div>

        <div style={{ padding: 24, background: isDarkMode ? '#111827' : '#ffffff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Badge status="processing" text={<span style={{ color: tc, fontWeight: 600 }}>Test Mode Sandbox</span>} />
            <Text style={{ display: 'block', fontSize: 12, color: '#7c8099', marginTop: 4 }}>
              This simulates the Razorpay checkout interface. No real money will be charged.
            </Text>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button
              type="primary"
              size="large"
              loading={mockRazorpayLoading}
              onClick={() => handleMockRazorpayPayment('success')}
              style={{
                backgroundColor: '#00d09c',
                borderColor: '#00d09c',
                height: 48,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              Simulate Success Payment (₹{walletAmount.toLocaleString()})
            </Button>

            <Button
              danger
              size="large"
              onClick={() => handleMockRazorpayPayment('fail')}
              style={{
                height: 48,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14
              }}
            >
              Simulate Failed Payment
            </Button>

            <Button
              type="text"
              onClick={() => {
                setMockRazorpayVisible(false);
                message.warning('Payment cancelled.');
              }}
              style={{ color: '#7c8099', fontWeight: 600 }}
            >
              Cancel Payment
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, color: '#7c8099', fontSize: 10 }}>
            <SafetyCertificateOutlined style={{ color: '#00d09c' }} />
            <span>Secure SSL Encryption. Powered by Razorpay.</span>
          </div>
        </div>
      </Modal>

      {/* ── My Profile Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: tc }}>
            <UserOutlined style={{ color: '#00d09c' }} />
            <span>My Investor Profile</span>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        confirmLoading={updatingProfile}
        onOk={handleSaveProfile}
        okText="Save Profile Details"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 8, fontWeight: 700 }
        }}
        cancelButtonProps={{
          style: { borderRadius: 8 }
        }}
        width={500}
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: '8px 4px' }}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 8px' }}>
          {currentUser && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <Avatar 
                size={70} 
                src={profilePhoto || undefined}
                style={{ 
                  backgroundColor: '#00d09c', 
                  marginBottom: 8,
                  border: '3px solid #00d09c',
                  boxShadow: '0 4px 10px rgba(0,208,156,0.15)'
                }}
                icon={!profilePhoto && <UserOutlined style={{ fontSize: 32 }} />}
              />
              <Title level={5} style={{ color: tc, margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
                {currentUser.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 12, color: tSec }}>@{currentUser.username}</Text>
            </div>
          )}

          {/* Picture URL */}
          <div style={{ background: bgInner, padding: 12, borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 14 }}>
            <Text style={{ color: tSec, fontSize: 11, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Profile Picture URL</Text>
            <Input
              placeholder="Paste Unsplash image URL or image link..."
              value={profilePhoto}
              onChange={e => {
                const val = e.target.value;
                setProfilePhoto(val);
                localStorage.setItem('profile_photo', val);
              }}
              style={{ height: 36, borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
            />
          </div>

          {/* Profile Core info */}
          <div style={{ background: bgInner, padding: 14, borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 14 }}>
            <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: '0 0 12px 0', fontSize: 14 }}>
              Account Information
            </Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Username</Text>
                <Input value={currentUser?.username} disabled style={{ height: 36, borderRadius: 8 }} />
              </div>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Email Address</Text>
                <Input value={currentUser?.email} disabled style={{ height: 36, borderRadius: 8 }} />
              </div>
            </div>
            <div>
              <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Full Name</Text>
              <Input value={currentUser?.name} disabled style={{ height: 36, borderRadius: 8 }} />
            </div>
          </div>

          {/* KYC Details Card (Address, DOB, PAN Card) */}
          <div style={{ background: bgInner, padding: 14, borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 14 }}>
            <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: '0 0 12px 0', fontSize: 14 }}>
              KYC & Verification Details
            </Title>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Date of Birth</Text>
                <Input 
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={profileDob}
                  onChange={e => setProfileDob(e.target.value)}
                  style={{ height: 36, borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
                />
              </div>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>PAN Card Number</Text>
                <Input 
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={profilePan}
                  onChange={e => setProfilePan(e.target.value.toUpperCase())}
                  style={{ height: 36, borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
                />
              </div>
            </div>

            <div>
              <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Residential Address</Text>
              <Input.TextArea 
                placeholder="Enter complete residential address details..."
                value={profileAddress}
                onChange={e => setProfileAddress(e.target.value)}
                rows={2}
                style={{ borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
              />
            </div>
          </div>

          {/* Achievements & Badges Section */}
          <div style={{ background: bgInner, padding: 14, borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 14 }}>
            <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: '0 0 4px 0', fontSize: 14 }}>
              My Achievements & Badges
            </Title>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
              Click on any badge to view the unlock requirements and status.
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, textAlign: 'center' }}>
              {[
                {
                  id: 'angel',
                  name: 'Angel Pioneer',
                  emoji: '👼',
                  color: '#3b82f6',
                  description: 'First investment pledged',
                  criteria: 'Pledge capital to at least one startup listing on Elevate.',
                  earned: totalInvestedMyPortfolio > 0
                },
                {
                  id: 'whale',
                  name: 'Whale Investor',
                  emoji: '🐋',
                  color: '#ea580c',
                  description: 'Pledge over ₹50,000',
                  criteria: 'Invest an aggregate of ₹50,000 or more across any startup listings on the platform.',
                  earned: totalInvestedMyPortfolio >= 50000
                },
                {
                  id: 'maestro',
                  name: 'Portfolio Maestro',
                  emoji: '🎻',
                  color: '#8b5cf6',
                  description: 'Invest in 3+ companies',
                  criteria: 'Diversify your portfolio by investing in 3 or more unique startup listings.',
                  earned: myInvestments.length >= 3
                },
                {
                  id: 'eco',
                  name: 'Eco Champion',
                  emoji: '🌿',
                  color: '#10b981',
                  description: 'Support Green/Clean Tech',
                  criteria: 'Back at least one startup categorized under sustainable technology, clean energy, agricultural automation, or water purification.',
                  earned: myInvestments.some(inv => {
                    const sObj = startups.find(s => s._id === inv.startupId || s.name === inv.startupName);
                    return sObj && (sObj.category.toLowerCase().includes('clean') || sObj.category.toLowerCase().includes('water') || sObj.category.toLowerCase().includes('turbine'));
                  })
                },
                {
                  id: 'tech',
                  name: 'Tech Pioneer',
                  emoji: '🤖',
                  color: '#ec4899',
                  description: 'Support Advanced Tech',
                  criteria: 'Back at least one startup leading the frontier in artificial intelligence, robotics, VR, quantum computing, or bionics.',
                  earned: myInvestments.some(inv => {
                    const sObj = startups.find(s => s._id === inv.startupId || s.name === inv.startupName);
                    return sObj && (sObj.category.toLowerCase().includes('ai') || sObj.category.toLowerCase().includes('robotics') || sObj.category.toLowerCase().includes('quantum') || sObj.category.toLowerCase().includes('bionic'));
                  })
                }
              ].map(badge => (
                <Tooltip 
                  title={
                    <div style={{ padding: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                        {badge.emoji} {badge.name} ({badge.earned ? 'Unlocked' : 'Locked'})
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                        {badge.criteria}
                      </div>
                    </div>
                  } 
                  key={badge.id}
                >
                  <div 
                    onClick={() => {
                      Modal.info({
                        title: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>
                            <span style={{ fontSize: 24 }}>{badge.emoji}</span>
                            <span style={{ color: tc }}>{badge.name}</span>
                          </div>
                        ),
                        content: (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ marginBottom: 12 }}>
                              <Tag color={badge.earned ? 'green' : 'default'} style={{ fontWeight: 700 }}>
                                {badge.earned ? 'UNLOCKED' : 'LOCKED'}
                              </Tag>
                            </div>
                            <Text style={{ fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500, color: tc }}>
                              {badge.description}
                            </Text>
                            <div style={{ background: isDarkMode ? '#111827' : '#f9fafb', padding: '10px 12px', borderRadius: 8, border: `1px solid ${borderCl}` }}>
                              <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>
                                Unlock Criteria:
                              </Text>
                              <Text style={{ fontSize: 12, color: tc }}>
                                {badge.criteria}
                              </Text>
                            </div>
                          </div>
                        ),
                        okText: 'Close',
                        okButtonProps: {
                          style: { backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 6 }
                        },
                        maskClosable: true,
                        style: { borderRadius: 12 }
                      });
                    }}
                    style={{ 
                      padding: '8px 4px', 
                      borderRadius: 8, 
                      background: isDarkMode ? '#111827' : '#ffffff', 
                      border: badge.earned ? `1px solid ${badge.color}` : `1px solid ${borderCl}`,
                      opacity: badge.earned ? 1 : 0.4,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: badge.earned ? `0 2px 6px ${badge.color}25` : 'none',
                    }}
                  >
                    <Avatar 
                      size={32} 
                      style={{ 
                        backgroundColor: badge.earned ? badge.color : '#cbd5e1', 
                        color: '#fff', 
                        fontSize: 14,
                        margin: '0 auto',
                        filter: badge.earned ? 'none' : 'grayscale(100%)'
                      }}
                    >
                      {badge.emoji}
                    </Avatar>
                    <div style={{ fontWeight: 700, fontSize: 9, marginTop: 6, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {badge.name.split(' ')[0]}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Change Password Card */}
          <div style={{ background: bgInner, padding: 14, borderRadius: 10, border: `1px solid ${borderCl}`, marginBottom: 4 }}>
            <Title level={5} style={{ color: tc, fontFamily: 'Outfit', fontWeight: 700, margin: '0 0 12px 0', fontSize: 14 }}>
              Security & Credentials
            </Title>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>New Password</Text>
                <Input.Password 
                  placeholder="Type new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ height: 36, borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
                />
              </div>
              <div>
                <Text style={{ color: tSec, fontSize: 10, display: 'block', textTransform: 'uppercase', marginBottom: 2 }}>Confirm Password</Text>
                <Input.Password 
                  placeholder="Retype password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ height: 36, borderRadius: 8, background: isDarkMode ? '#121620' : '#ffffff', color: tc, border: `1px solid ${borderCl}` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Settings Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: tc }}>
            <SettingOutlined style={{ color: '#00d09c' }} />
            <span>Account Settings</span>
          </div>
        }
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" style={{ backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 8 }} onClick={() => { saveIdleSetting(); setSettingsModalVisible(false); }}>
            Save Settings
          </Button>
        ]}
        style={{ borderRadius: 16 }}
        width={540}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ background: bgInner, padding: 16, borderRadius: 12, border: `1px solid ${borderCl}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text style={{ color: tc, fontWeight: 600, display: 'block' }}>Email Notifications</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Receive notifications about new venture fund filings</Text>
              </div>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00d09c', width: 16, height: 16 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text style={{ color: tc, fontWeight: 600, display: 'block' }}>Two-Factor Authentication (2FA)</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Secure pledges via SMS/Email confirmation tokens</Text>
              </div>
              <input type="checkbox" style={{ accentColor: '#00d09c', width: 16, height: 16 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: tc, fontWeight: 600, display: 'block' }}>Platform Beta Access</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Enable early access to experimental DTU startup labs</Text>
              </div>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00d09c', width: 16, height: 16 }} />
            </div>
          </div>

          {/* Auto Logout Section */}
          <div style={{ background: bgInner, padding: 16, borderRadius: 12, border: `1px solid ${borderCl}`, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 15 }} />
              <Text style={{ color: tc, fontWeight: 700, fontSize: 14 }}>Auto-Logout After Inactivity</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              Session auto-ends after inactivity for security. A 60-second warning appears before logout.
            </Text>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Select
                value={selectedTimeout}
                onChange={setSelectedTimeout}
                style={{ flex: 1 }}
                options={TIMEOUT_OPTIONS}
                size="middle"
              />
              <Button
                type="primary"
                size="middle"
                onClick={saveIdleSetting}
                style={{ borderRadius: 8, background: '#00d09c', borderColor: '#00d09c', fontWeight: 700 }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Idle Timeout Warning Modal ─────────────────────────── */}
      <Modal
        open={warningVisible}
        closable={false}
        footer={null}
        centered
        width={420}
        styles={{ content: { background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 16, padding: 0 } }}
      >
        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b22, #ef444422)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid #f59e0b44'
          }}>
            <ClockCircleOutlined style={{ fontSize: 32, color: '#f59e0b' }} />
          </div>
          <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: '0 0 8px', fontFamily: 'Outfit', fontWeight: 800 }}>
            Session About to Expire
          </Title>
          <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 14 }}>
            You've been inactive. You will be automatically logged out in
          </Text>
          <div style={{
            margin: '20px 0', fontSize: 56, fontWeight: 800, fontFamily: 'Outfit',
            color: secondsLeft <= 10 ? '#ef4444' : '#f59e0b', lineHeight: 1
          }}>
            {secondsLeft}
            <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6, color: isDarkMode ? '#94a3b8' : '#64748b' }}>sec</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={resetTimer}
              style={{ borderRadius: 10, fontWeight: 700, height: 44, paddingInline: 28, background: 'linear-gradient(135deg, #00d09c, #00b386)', border: 'none', fontSize: 15 }}
            >
              I'm Still Here
            </Button>
            <Button
              size="large"
              onClick={handleLogout}
              style={{ borderRadius: 10, fontWeight: 700, height: 44, paddingInline: 28, background: 'transparent', border: `1px solid ${isDarkMode ? '#374151' : '#cbd5e1'}`, color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 15 }}
            >
              Logout Now
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

// ── Virtual Card Preview Helper Component ──
function CardPreview({ details }) {
  const formattedNum = details.number ? details.number.padEnd(19, '•') : '•••• •••• •••• ••••';
  const formattedExpiry = details.expiry || 'MM/YY';
  const cardName = details.name ? details.name.toUpperCase() : 'CARDHOLDER NAME';
  
  return (
    <div style={{
      width: '100%',
      height: 160,
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 12,
      padding: 20,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 8px 20px rgba(15,23,42,0.15)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 16
    }}>
      <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      <div style={{ position: 'absolute', left: '40%', top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#00d09c' }}>SECURE DEPOSIT CARD</span>
        <div style={{ width: 32, height: 24, borderRadius: 4, background: '#e2e8f0', opacity: 0.8 }} />
      </div>
      
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, margin: '14px 0', fontFamily: 'Courier New, monospace' }}>
        {formattedNum}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ fontSize: 8, display: 'block', color: '#94a3b8', textTransform: 'uppercase' }}>Card Holder</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{cardName}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 8, display: 'block', color: '#94a3b8', textTransform: 'uppercase' }}>Expires</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{formattedExpiry}</span>
        </div>
      </div>
    </div>
  );
}

// ── UPI QR Code View Helper Component ──
function QrCodeView({ countdown, onSimulateSuccess }) {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 16,
        display: 'inline-block',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: 16
      }}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ display: 'block' }}>
          <rect width="100" height="100" fill="#fff" />
          <path d="M5 5 h20 v5 h-15 v15 h-5 Z" fill="#1e293b" />
          <path d="M5 5 h10 v10 h-10 Z M7 7 h6 v6 h-6 Z" fill="#1e293b" />
          
          <path d="M75 5 h20 v20 h-5 v-15 h-15 Z" fill="#1e293b" />
          <path d="M85 5 h10 v10 h-10 Z M87 7 h6 v6 h-6 Z" fill="#1e293b" />
          
          <path d="M5 75 v20 h20 v-5 h-15 v-15 Z" fill="#1e293b" />
          <path d="M5 85 h10 v10 h-10 Z M7 87 h6 v6 h-6 Z" fill="#1e293b" />
          
          <rect x="25" y="25" width="10" height="10" fill="#1e293b" />
          <rect x="40" y="15" width="15" height="5" fill="#1e293b" />
          <rect x="65" y="30" width="10" height="15" fill="#00d09c" />
          <rect x="15" y="45" width="20" height="8" fill="#1e293b" />
          <rect x="45" y="45" width="8" height="20" fill="#1e293b" />
          <rect x="60" y="60" width="15" height="15" fill="#1e293b" />
          <rect x="30" y="70" width="10" height="10" fill="#1e293b" />
          <rect x="75" y="75" width="10" height="10" fill="#1e293b" />
          <rect x="15" y="65" width="5" height="5" fill="#1e293b" />
          <rect x="80" y="45" width="5" height="15" fill="#1e293b" />
          
          <circle cx="50" cy="50" r="10" fill="#00d09c" />
          <path d="M47 50 l2-2 l2 2 l-2 2 Z" fill="#fff" />
        </svg>
      </div>
      <Text style={{ display: 'block', fontSize: 13, color: '#44475b', fontWeight: 600 }}>
        Scan QR code using GPay, PhonePe, Paytm, or BHIM
      </Text>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
        QR Code expires in <span style={{ color: '#ef4444', fontWeight: 700 }}>{formattedTime}</span>
      </Text>
      
      <Button 
        type="dashed" 
        onClick={onSimulateSuccess}
        style={{ marginTop: 16, borderColor: '#00d09c', color: '#00d09c', borderRadius: 8, fontWeight: 700 }}
      >
        Simulate Successful QR App Scan
      </Button>
    </div>
  );
}

