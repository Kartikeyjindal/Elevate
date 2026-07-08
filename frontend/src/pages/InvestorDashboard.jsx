import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import { 
  Layout, Card, Row, Col, Statistic, Button, Modal, 
  Form, Input, InputNumber, Table, Tabs, Tag, Space, Typography, Progress, message,
  Select, Radio, Divider, Alert, Spin, Result, Steps, Checkbox, Dropdown, Avatar, Badge
} from 'antd';
import { 
  WalletOutlined, RiseOutlined, PieChartOutlined, 
  FileAddOutlined, LogoutOutlined, DollarOutlined, FundOutlined,
  SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined, BookOutlined,
  CreditCardOutlined, BankOutlined, QrcodeOutlined, CheckCircleOutlined, LoadingOutlined,
  SafetyCertificateOutlined, SwapOutlined, KeyOutlined, TransactionOutlined,
  SunOutlined, MoonOutlined, UserOutlined, SettingOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useIdleTimeout, { getIdleTimeoutMinutes, setIdleTimeoutMinutes } from '../hooks/useIdleTimeout';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;


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

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [myInvestments, setMyInvestments] = useState([]);
  const [investModalVisible, setInvestModalVisible] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [investAmount, setInvestAmount] = useState(10000);
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  const [expandedStartupId, setExpandedStartupId] = useState(null);
  const [startupForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [blogs, setBlogs] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

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
          timestamp: new Date(inv.timestamp).toLocaleString(),
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
        throw new Error(data.error || 'Investment failed');
      }

      message.success('Investment confirmed successfully!');
      
      const updatedUser = { ...currentUser, walletBalance: data.updatedWalletBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      const mockInvestment = {
        key: data.investment._id,
        startupName: selectedStartup.name,
        amount: investAmount,
        timestamp: new Date().toLocaleString()
      };
      setMyInvestments(prev => [mockInvestment, ...prev]);

      setInvestModalVisible(false);
      fetchData();
    } catch (err) {
      message.error(err.message);
    } finally {
      setSubmittingInvestment(false);
    }
  };

  const handleSellInvestment = async (investmentId) => {
    const token = localStorage.getItem('token');
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
        throw new Error(data.error || 'Failed to sell investment');
      }

      message.success('Shares sold and balance refunded successfully!');
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

  // Filter startups based on search query
  const filteredStartups = startups.filter(startup => {
    const query = searchQuery.toLowerCase();
    return (
      startup.name.toLowerCase().includes(query) ||
      startup.category.toLowerCase().includes(query) ||
      startup.marketingMixVariables.toLowerCase().includes(query) ||
      (startup.tagline && startup.tagline.toLowerCase().includes(query))
    );
  });

  const portfolioColumns = [
    {
      title: 'Venture Name',
      dataIndex: 'startupName',
      key: 'startupName',
      render: (text) => <Text style={{ color: tc, fontWeight: 600 }}>{text}</Text>
    },
    {
      title: 'Amount Invested',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{amount.toLocaleString()}</Text>
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
            onClick={() => handleSellInvestment(record.key)}
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

                  {/* Marketplace list */}
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
                              style={{ overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7', background: isDarkMode ? '#111827' : '#ffffff' }}
                              bodyStyle={{ padding: 20 }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                                <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>
                                  {startup.name}
                                </Title>
                              </div>
                              
                              <Paragraph ellipsis={{ rows: 2 }} style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 13, minHeight: 40, marginBottom: 16 }}>
                                {startup.tagline}
                              </Paragraph>

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

                              {/* Financial metrics grid */}
                              <Row gutter={[8, 8]} style={{ 
                                background: isDarkMode ? '#1f2937' : '#f8fafc', 
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
                  <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                    <Col xs={24} md={12}>
                      <Card>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Capital Deployed</span>} 
                          value={`₹${totalInvestedMyPortfolio.toLocaleString()}`} 
                          valueStyle={{ color: '#10b981', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card>
                        <Statistic 
                          title={<span style={{ color: '#7c8099', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Active Holdings</span>} 
                          value={myInvestments.length} 
                          valueStyle={{ color: '#00d09c', fontSize: 26, fontFamily: 'Outfit', fontWeight: 800 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card>
                    <Title level={4} style={{ color: '#44475b', marginBottom: 20, fontFamily: 'Outfit', fontWeight: 700 }}>Investment Ledger</Title>
                    <Table 
                      dataSource={myInvestments} 
                      columns={portfolioColumns} 
                      pagination={{ pageSize: 5 }}
                      locale={{ emptyText: <span style={{ color: '#7c8099' }}>No holdings recorded. Go to Marketplace to invest.</span> }}
                      style={{ background: 'transparent' }}
                      rowClassName={() => 'portfolio-row'}
                    />
                  </Card>
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
        <Text type="secondary" style={{ color: '#7c8099', fontSize: 12, display: 'block', marginTop: 8 }}>
          * Pledge will execute via MongoDB atomic operations. Minimum pledge required is ₹{(selectedStartup?.minimumInvestment || 10000).toLocaleString()}.
        </Text>
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
        width={450}
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
                        onSimulateSuccess={() => {
                          setWalletAmount(walletAmount);
                          handleWalletTransaction();
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

