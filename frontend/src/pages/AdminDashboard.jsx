import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import { smoothToggleTheme } from '../utils/themeUtils';
import { 
  Layout, Table, Button, Space, Card, Tag, Typography, 
  Statistic, Row, Col, Input, Form, message, Tabs, Alert,
  Modal, Progress, Divider, Spin, Select
} from 'antd';
import { 
  SafetyOutlined, LogoutOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, AuditOutlined, FileTextOutlined, 
  HourglassOutlined, CheckOutlined, SearchOutlined, 
  FilterOutlined, DownloadOutlined, BookOutlined, SendOutlined,
  UserOutlined, CalendarOutlined, LineChartOutlined, SolutionOutlined,
  DatabaseOutlined, SunOutlined, MoonOutlined, SettingOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import useIdleTimeout, { getIdleTimeoutMinutes, setIdleTimeoutMinutes } from '../hooks/useIdleTimeout';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

// Groww-style Rupee Sparkline Component for Admin Modal
function ValuationGraph({ data }) {
  const vals = data || [];
  if (vals.length < 2) return null;
  const width = 450;
  const height = 130;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = vals.map((val, idx) => {
    const x = (idx / (vals.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 30) - 15;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  const gradId = `admin-spark-grad-${Math.floor(Math.random() * 1000000)}`;
  const strokeColor = '#00d09c';
  
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
      {vals.map((val, idx) => {
        const x = (idx / (vals.length - 1)) * width;
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
              fontSize="9"
              fontWeight="600"
            >
              ₹{(val / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Custom SVG Line Chart for Analytics
function AnalyticsLineChart({ data, isDarkMode }) {
  if (!data || data.length === 0) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c8099' }}>No data available</div>;

  const width = 500;
  const height = 220;
  const padding = { left: 60, right: 20, top: 20, bottom: 40 };

  const maxVal = Math.max(...data.map(d => d.amount)) || 1;
  const minVal = 0;
  const range = maxVal - minVal;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, idx) => {
    const x = padding.left + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.amount - minVal) / range) * chartHeight;
    return { x, y, label: d.label, val: d.amount };
  });

  const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaData = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const gradId = "analytics-line-grad";
  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d09c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d09c" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding.top + r * chartHeight;
          const gridVal = maxVal - r * range;
          return (
            <g key={i}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke={isDarkMode ? '#334155' : '#e2e8f0'} 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding.left - 8} 
                y={y + 4} 
                textAnchor="end" 
                fill="#94a3b8" 
                style={{ fontSize: '10px', fontWeight: 600 }}
              >
                ₹{(gridVal / 100000).toFixed(1)}L
              </text>
            </g>
          );
        })}

        {/* Area under the line */}
        <path d={areaData} fill={`url(#${gradId})`} />

        {/* Main path */}
        <path 
          d={pathData} 
          fill="none" 
          stroke="#00d09c" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={padding.top + chartHeight + 20} 
            textAnchor="middle" 
            fill="#94a3b8" 
            style={{ fontSize: '9px', fontWeight: 700 }}
          >
            {p.label}
          </text>
        ))}

        {/* Hover dots & interaction rings */}
        {points.map((p, idx) => (
          <g key={idx}
             onMouseEnter={() => setHoveredPoint(p)}
             onMouseLeave={() => setHoveredPoint(null)}
             style={{ cursor: 'pointer' }}
          >
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="12" 
              fill="transparent" 
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoveredPoint && hoveredPoint.x === p.x ? 6.5 : 4} 
              fill="#00d09c" 
              stroke="#fff" 
              strokeWidth={hoveredPoint && hoveredPoint.x === p.x ? 2.5 : 1.5} 
              style={{ transition: 'all 0.15s ease' }}
            />
          </g>
        ))}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: `${(hoveredPoint.x / width) * 100}%`,
          top: `${(hoveredPoint.y / height) * 100 - 25}%`,
          transform: 'translate(-50%, -100%)',
          background: '#1e293b',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
          border: '1px solid #334155'
        }}>
          <div style={{ color: '#94a3b8', fontSize: 9 }}>{hoveredPoint.label} Volume</div>
          <div>₹{hoveredPoint.val.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

// Custom Horizontal Bar Chart
function AnalyticsBarChart({ data, isDarkMode, C }) {
  if (!data || data.length === 0) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c8099' }}>No data available</div>;

  const maxVal = Math.max(...data.map(d => d.raisedAmount)) || 1;
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '10px 0' }}>
      {data.map((item, idx) => {
        const pct = Math.min((item.raisedAmount / (item.targetGoal || 1)) * 100, 100);
        const barPct = (item.raisedAmount / maxVal) * 100;
        
        return (
          <div 
            key={item._id || idx}
            onMouseEnter={() => setHoveredBar(item)}
            onMouseLeave={() => setHoveredBar(null)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 700 }}>
              <Text style={{ color: C.text }}>{item.name}</Text>
              <Text style={{ color: '#00d09c' }}>₹{item.raisedAmount.toLocaleString()} <span style={{ color: C.textSec, fontWeight: 500 }}>({pct.toFixed(0)}%)</span></Text>
            </div>

            {/* Progress track */}
            <div style={{
              height: 10,
              width: '100%',
              background: isDarkMode ? '#1e293b' : '#f1f5f9',
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${barPct}%`,
                background: 'linear-gradient(90deg, #00d09c 0%, #05b184 100%)',
                borderRadius: 5,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>

            {/* Tooltip on hover */}
            {hoveredBar && hoveredBar._id === item._id && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: -30,
                background: '#1e293b',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 5
              }}>
                Target: ₹{item.targetGoal.toLocaleString()} ({item.category})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Custom SVG Donut Chart
function AnalyticsDonutChart({ data, isDarkMode, C }) {
  if (!data || data.length === 0) return <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c8099' }}>No data available</div>;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = 55;
  const circumference = 2 * Math.PI * radius; // 345.57
  let accumulatedPercent = 0;

  const colors = [
    '#00d09c', // Teal
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#ef4444', // Red
    '#10b981', // Emerald
    '#6366f1'  // Indigo
  ];

  const segments = data.map((d, idx) => {
    const percent = d.count / total;
    const strokeDashoffset = circumference - (percent * circumference);
    const strokeDasharray = `${circumference} ${circumference}`;
    const rotation = accumulatedPercent * 360;
    accumulatedPercent += percent;

    return {
      category: d.category,
      count: d.count,
      percent,
      color: colors[idx % colors.length],
      strokeDashoffset,
      strokeDasharray,
      rotation
    };
  });

  const [hoveredSegment, setHoveredSegment] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill="transparent" 
            stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} 
            strokeWidth="20" 
          />
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              style={{
                transform: `rotate(${seg.rotation}deg)`,
                transformOrigin: '80px 80px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredSegment(seg)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Central content */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          {hoveredSegment ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: hoveredSegment.color, fontFamily: 'Outfit' }}>
                {hoveredSegment.count}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textSec, textTransform: 'uppercase', maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hoveredSegment.category}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: 'Outfit' }}>
                {total}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textSec, textTransform: 'uppercase' }}>
                Total approved
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, maxHeight: 160, overflowY: 'auto' }}>
        {segments.map((seg, idx) => (
          <div 
            key={idx} 
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: C.textSec }}
            onMouseEnter={() => setHoveredSegment(seg)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100, color: hoveredSegment && hoveredSegment.category === seg.category ? C.text : C.textSec }}>
              {seg.category}
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 800, color: C.text }}>
              {seg.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allStartups, setAllStartups] = useState([]);
  const [pendingStartups, setPendingStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeSubTab, setActiveSubTab] = useState('1'); // 1: Vetting Queue, 2: Financial Blogs
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Search states for User and Company Access
  const [userQuery, setUserQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [searchingUser, setSearchingUser] = useState(false);

  const [companyQuery, setCompanyQuery] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [searchingCompany, setSearchingCompany] = useState(false);

  // Platform Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('all'); // all, 6m, 30d

  const handleUserSearch = async () => {
    if (!userQuery.trim()) {
      message.warning('Please enter a username or email');
      return;
    }
    setSearchingUser(true);
    setUserData(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/lookup?query=${encodeURIComponent(userQuery.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
      } else {
        message.error(data.error || 'User not found');
      }
    } catch (err) {
      message.error('Error searching for user');
    } finally {
      setSearchingUser(false);
    }
  };

  const handleCompanySearch = async () => {
    if (!companyQuery.trim()) {
      message.warning('Please enter a company name');
      return;
    }
    setSearchingCompany(true);
    setCompanyData(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/companies/lookup?query=${encodeURIComponent(companyQuery.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCompanyData(data);
      } else {
        message.error(data.error || 'Company not found');
      }
    } catch (err) {
      message.error('Error searching for company');
    } finally {
      setSearchingCompany(false);
    }
  };

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

  const C = {
    bg: isDarkMode ? '#0b0f19' : '#f8fafc',
    card: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#1f2937' : '#edf2f7',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSec: isDarkMode ? '#cbd5e1' : '#64748b',
    inputBg: isDarkMode ? '#111827' : '#ffffff',
    borderDarker: isDarkMode ? '#374151' : '#cbd5e1'
  };

  // Vetting detailed modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStartupDetails, setSelectedStartupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch all startups (to calculate dashboard summary stats)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 1. Fetch pending
      const resPending = await fetch(`${API_URL}/api/admin/startups/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPending.status === 401 || resPending.status === 403) {
        handleLogout();
        return;
      }
      const dataPending = await resPending.json();
      setPendingStartups((dataPending || []).map(item => ({ ...item, key: item._id })));

      // 2. Fetch approved
      const resApproved = await fetch(`${API_URL}/api/startups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataApproved = await resApproved.json();

      // Combine both for metrics calculations
      setAllStartups([...(dataPending || []), ...(dataApproved || [])]);

      // 3. Fetch blogs
      const resBlogs = await fetch(`${API_URL}/api/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resBlogs.ok) {
        const dataBlogs = await resBlogs.json();
        setBlogs(dataBlogs || []);
      }

      // 4. Fetch audit logs
      const resLogs = await fetch(`${API_URL}/api/admin/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resLogs.ok) {
        const dataLogs = await resLogs.json();
        setAuditLogs(dataLogs || []);
      }

    } catch (err) {
      message.error('Failed to load vetting data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchAnalyticsData = useCallback(async () => {
    setLoadingAnalytics(true);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        message.error('Failed to load platform analytics');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'Platform Analytics') {
      fetchAnalyticsData();
    }
  }, [activeMenu, fetchAnalyticsData]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.info('Session ended. You have been logged out.');
    navigate('/login');
  }, [navigate]);

  // ── Idle Timeout ──────────────────────────────────────────────
  const { warningVisible, secondsLeft, resetTimer } = useIdleTimeout(handleLogout);

  // ── Settings Modal ────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTimeout, setSelectedTimeout] = useState(getIdleTimeoutMinutes());

  const saveSettings = () => {
    setIdleTimeoutMinutes(selectedTimeout);
    resetTimer();
    setSettingsOpen(false);
    message.success(`Auto-logout set to ${selectedTimeout} minute${selectedTimeout > 1 ? 's' : ''}`);
  };

  const TIMEOUT_OPTIONS = [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
  ];

  const handleReview = async (id, decision) => {
    const executeReview = async (startupId, status, rejectionReason = '') => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/api/admin/startups/${startupId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status, rejectionReason })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update status');
        }

        message.success(`Venture application successfully ${status}!`);
        // Update local detailed view if active
        if (selectedStartupDetails && selectedStartupDetails.startup && selectedStartupDetails.startup._id === startupId) {
          setSelectedStartupDetails(prev => ({
            ...prev,
            startup: { ...prev.startup, status, rejectionReason }
          }));
        }
        fetchAllData();
      } catch (err) {
        message.error(err.message);
      }
    };

    if (decision === 'rejected') {
      let reason = '';
      Modal.confirm({
        title: 'Reject Startup Application',
        icon: <ExclamationCircleOutlined style={{ color: '#eb5757' }} />,
        content: (
          <div style={{ marginTop: 10 }}>
            <Paragraph>Please enter the basis/reason for rejecting this application. This feedback will be visible to the company founder.</Paragraph>
            <Input.TextArea
              rows={4}
              placeholder="e.g. Incomplete financial disclosures or unrealistic valuation cap..."
              onChange={(e) => { reason = e.target.value; }}
            />
          </div>
        ),
        okText: 'Confirm Rejection',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          if (!reason || !reason.trim()) {
            message.error('Rejection reason is required');
            return Promise.reject();
          }
          await executeReview(id, 'rejected', reason);
        }
      });
    } else {
      Modal.confirm({
        title: 'Approve Startup Application',
        icon: <CheckCircleOutlined style={{ color: '#00d09c' }} />,
        content: 'Are you sure you want to approve this company for the investment marketplace?',
        okText: 'Approve',
        okType: 'primary',
        cancelText: 'Cancel',
        onOk: async () => {
          await executeReview(id, 'approved');
        }
      });
    }
  };

  const handleOpenDetails = async (record) => {
    if (!record || !record._id) return;
    setLoadingDetails(true);
    setDetailModalVisible(true);
    setSelectedStartupDetails(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/startups/${record._id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load startup details');
      const data = await res.json();
      setSelectedStartupDetails(data);
    } catch (err) {
      message.error(err.message);
      setDetailModalVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePublishBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) {
      message.error('Blog title and content are required');
      return;
    }

    setPublishing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: blogTitle, content: blogContent })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish blog');
      }

      message.success('Financial insights tip published successfully!');
      setBlogTitle('');
      setBlogContent('');
      fetchAllData();
    } catch (err) {
      message.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Helper function to extract capital initials for company avatar badges
  const getInitials = (name) => {
    if (!name) return 'CO';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filter application queue based on search
  const filteredQueue = allStartups.filter(startup => {
    const query = searchQuery.toLowerCase();
    return (
      (startup.name || '').toLowerCase().includes(query) ||
      (startup.category || '').toLowerCase().includes(query) ||
      (startup.status || '').toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      title: 'STARTUP NAME',
      key: 'name',
      render: (_, record) => {
        const initials = getInitials(record.name);
        const colors = ['#eff6ff', '#f0fdf4', '#fdf2f8', '#faf5ff', '#fff7ed'];
        const textColors = ['#2563eb', '#16a34a', '#db2777', '#9333ea', '#ea580c'];
        const hash = (record.name || '').length % colors.length;

        return (
          <Space size="middle">
            <div style={{
              width: 32,
              height: 32,
              background: colors[hash],
              color: textColors[hash],
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12
            }}>
              {initials}
            </div>
            <span 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenDetails(record);
              }}
              style={{ color: '#00d09c', cursor: 'pointer', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              {record.name}
            </span>
          </Space>
        );
      }
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Text style={{ color: C.textSec, fontWeight: 500 }}>{cat}</Text>
    },
    {
      title: 'VALUATION (POST)',
      dataIndex: 'pastValuations',
      key: 'valuation',
      render: (vals) => {
        const arr = vals || [];
        const latestVal = arr.length > 0 ? arr[arr.length - 1] : 0;
        if (latestVal >= 1000000) {
          return <Text style={{ color: C.text, fontWeight: 800 }}>₹{(latestVal / 1000000).toFixed(1)}M</Text>;
        }
        return <Text style={{ color: C.text, fontWeight: 800 }}>₹{(latestVal / 1000).toFixed(0)}k</Text>;
      }
    },
    {
      title: 'APPLICATION DATE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{date ? new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Oct 24, 2023'}</Text>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const isPending = status === 'pending';
        const isRejected = status === 'rejected';
        return (
          <Tag color={isPending ? 'blue' : isRejected ? 'error' : 'success'} style={{ 
            borderRadius: '4px', 
            padding: '2px 8px', 
            fontWeight: 700,
            textTransform: 'capitalize',
            border: 'none',
            background: isPending ? '#eff6ff' : isRejected ? '#fef2f2' : '#ecfdf5',
            color: isPending ? '#3b82f6' : isRejected ? '#ef4444' : '#10b981'
          }}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => {
        if (record.status !== 'pending') {
          return <Text style={{ color: '#9ca3af', fontWeight: 600, fontSize: 13 }}>Processed</Text>;
        }
        return (
          <Space size="small">
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleReview(record._id, 'approved')}
              style={{ backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 6, height: 32, fontSize: 13 }}
            >
              Approve
            </Button>
            <Button 
              type="primary" 
              danger 
              icon={<CloseCircleOutlined />} 
              onClick={() => handleReview(record._id, 'rejected')}
              style={{ borderRadius: 6, height: 32, fontSize: 13 }}
            >
              Reject
            </Button>
          </Space>
        );
      }
    }
  ];

  // Stats Calculations
  const pendingCount = allStartups.filter(s => s.status === 'pending').length;
  const approvedCount = allStartups.filter(s => s.status === 'approved').length;
  const totalCount = allStartups.length;

  // Safe checks for Selected Startup details values
  const detailStartup = selectedStartupDetails?.startup;
  const detailInvestments = selectedStartupDetails?.investments || [];
  const detailValuations = detailStartup?.pastValuations || [];
  const detailLatestVal = detailValuations.length > 0 ? detailValuations[detailValuations.length - 1] : 0;

  const getFilteredTrends = () => {
    if (!analyticsData || !analyticsData.investmentTrends) return [];
    const trends = analyticsData.investmentTrends;
    if (analyticsDateRange === '6m') {
      return trends.slice(-6);
    }
    if (analyticsDateRange === '30d') {
      return trends.slice(-2); // Show last 2 months for monthly granularity
    }
    return trends;
  };

  const exportAnalyticsCSV = () => {
    if (!analyticsData) return;
    const { summary } = analyticsData;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Total Platform Volume,₹${summary.totalPlatformVolume.toLocaleString()}\n`;
    csvContent += `Total Registered Users,${summary.totalUsersCount}\n`;
    csvContent += `Investors Count,${summary.investorUsersCount}\n`;
    csvContent += `Company Founders Count,${summary.companyUsersCount}\n`;
    csvContent += `Total Investments Placed,${summary.totalInvestmentsCount}\n`;
    csvContent += `Average Investment Size,₹${summary.averageInvestmentSize.toLocaleString()}\n`;
    csvContent += `Total Listed Startups,${summary.totalStartupsCount}\n`;
    csvContent += `Approved Startups,${summary.approvedStartupsCount}\n`;
    csvContent += `Pending Startups Review,${summary.pendingStartupsCount}\n`;
    csvContent += `Rejected Startups,${summary.rejectedStartupsCount}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("CSV report downloaded successfully!");
  };

  const renderAnalyticsContent = () => {
    if (loadingAnalytics) {
      return (
        <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, textAlign: 'center', padding: '60px 0' }}>
          <Progress percent={60} status="active" strokeColor="#00d09c" showInfo={false} style={{ maxWidth: 300, margin: '0 auto' }} />
          <Text style={{ C, color: C.textSec, display: 'block', marginTop: 16, fontWeight: 600 }}>Assembling platform telemetry...</Text>
        </Card>
      );
    }

    if (!analyticsData) {
      return (
        <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, textAlign: 'center', padding: '40px 0' }}>
          <Text style={{ color: C.textSec }}>Failed to retrieve platform analytics.</Text>
        </Card>
      );
    }

    const { summary, categoryDistribution, topFunded } = analyticsData;
    const filteredTrends = getFilteredTrends();

    return (
      <div className="fade-in-section">
        {/* Date Filter & Export Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Space>
            <Text style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>FILTER RANGE:</Text>
            <Select
              value={analyticsDateRange}
              onChange={setAnalyticsDateRange}
              style={{ width: 150 }}
              dropdownStyle={{ background: C.card }}
            >
              <Select.Option value="all">All Time</Select.Option>
              <Select.Option value="6m">Last 6 Months</Select.Option>
              <Select.Option value="30d">Last 30 Days</Select.Option>
            </Select>
          </Space>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={exportAnalyticsCSV}
            style={{ borderRadius: 8, backgroundColor: '#00d09c', borderColor: '#00d09c', fontWeight: 600 }}
          >
            Export Report (CSV)
          </Button>
        </div>

        {/* Analytics Stats Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ padding: '8px 12px', borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
              <Statistic 
                title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Total Platform Volume</span>}
                value={`₹${summary.totalPlatformVolume.toLocaleString()}`}
                valueStyle={{ color: '#00d09c', fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ padding: '8px 12px', borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
              <Statistic 
                title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Investor/Founder Accounts</span>}
                value={`${summary.investorUsersCount} / ${summary.companyUsersCount}`}
                valueStyle={{ color: C.text, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}
                suffix={<span style={{ fontSize: 11, color: C.textSec }}>users</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ padding: '8px 12px', borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
              <Statistic 
                title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Total Pledges Count</span>}
                value={summary.totalInvestmentsCount}
                valueStyle={{ color: C.text, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ padding: '8px 12px', borderRadius: 12, background: C.card, border: `1px solid ${C.border}` }}>
              <Statistic 
                title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Avg Pledge Capital</span>}
                value={`₹${summary.averageInvestmentSize.toLocaleString()}`}
                valueStyle={{ color: C.text, fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {/* Line Chart */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card }}>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: C.text, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', fontFamily: 'Outfit' }}>
                  Funding Trend (Capital Raised Over Time)
                </Text>
              </div>
              <AnalyticsLineChart data={filteredTrends} isDarkMode={isDarkMode} />
            </Card>
          </Col>

          {/* Bar Chart */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card }}>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: C.text, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', fontFamily: 'Outfit' }}>
                  Top 5 Capital Backed Startups
                </Text>
              </div>
              <AnalyticsBarChart data={topFunded} isDarkMode={isDarkMode} C={C} />
            </Card>
          </Col>
        </Row>

        {/* Donut Chart Row */}
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card }}>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: C.text, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', fontFamily: 'Outfit' }}>
                  Startup Industry Sector Distribution
                </Text>
              </div>
              <AnalyticsDonutChart data={categoryDistribution} isDarkMode={isDarkMode} C={C} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic 
                title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Campaign Status Breakdown</span>}
                value={`${summary.approvedStartupsCount} Approved / ${summary.pendingStartupsCount} Pending / ${summary.rejectedStartupsCount} Rejected`}
                valueStyle={{ color: C.text, fontSize: 15, fontWeight: 700 }}
                formatter={(val) => val}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text style={{ color: C.textSec }}>Approved & Active Campaign Ratio:</Text>
                  <Text style={{ color: '#00d09c', fontWeight: 800 }}>
                    {summary.totalStartupsCount > 0 ? ((summary.approvedStartupsCount / summary.totalStartupsCount) * 100).toFixed(0) : 0}%
                  </Text>
                </div>
                <Progress 
                  percent={summary.totalStartupsCount > 0 ? Math.round((summary.approvedStartupsCount / summary.totalStartupsCount) * 100) : 0} 
                  strokeColor="#00d09c" 
                  showInfo={false} 
                  style={{ margin: 0 }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Render Body based on Sider menu selection
  const renderMainContent = () => {
    if (activeMenu === 'Audit Logs') {
      return (
        <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
              System Vetting Audit Logs
            </Title>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>Export Logs</Button>
          </div>
          <Table 
            dataSource={auditLogs}
            rowKey="_id"
            columns={[
              {
                title: 'ACTION / OPERATION',
                dataIndex: 'action',
                key: 'action',
                render: (text) => {
                  const isApprove = text.includes('APPROVED');
                  return (
                    <Tag color={isApprove ? 'success' : 'error'} style={{ fontWeight: 700, borderRadius: 4, textTransform: 'uppercase' }}>
                      {text}
                    </Tag>
                  );
                }
              },
              {
                title: 'STARTUP NAME',
                dataIndex: 'startupName',
                key: 'startupName',
                render: (name) => <Text style={{ color: C.text, fontWeight: 700 }}>{name}</Text>
              },
              {
                title: 'PERFORMED BY',
                dataIndex: 'adminName',
                key: 'adminName',
                render: (admin) => <Tag color="blue" style={{ fontWeight: 600 }}>{admin}</Tag>
              },
              {
                title: 'TIMESTAMP',
                dataIndex: 'timestamp',
                key: 'timestamp',
                render: (ts) => (
                  <Text style={{ color: C.textSec, fontSize: 13 }}>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    {new Date(ts).toLocaleDateString()} at {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Text>
                )
              }
            ]}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <span style={{ color: '#7c8099' }}>No audit actions logged in current session.</span> }}
            style={{ background: 'transparent' }}
          />
        </Card>
      );
    }

    if (activeMenu === 'User Access') {
      return (
        <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
              User Accounts Registry Access
            </Title>
            <Text style={{ color: C.textSec, fontSize: 13 }}>
              Look up active investor credentials, ledger balances, and portfolio transaction lists by username or email.
            </Text>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 500 }}>
            <Input 
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Enter exact username or email (e.g. investor@example.com)"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onPressEnter={handleUserSearch}
              style={{
                borderRadius: 8,
                height: 40,
                border: `1px solid ${C.borderDarker}`,
                background: C.inputBg,
                color: C.text
              }}
            />
            <Button 
              type="primary" 
              onClick={handleUserSearch} 
              loading={searchingUser}
              style={{ height: 40, borderRadius: 8, backgroundColor: '#00d09c', borderColor: '#00d09c', fontWeight: 600 }}
            >
              Search
            </Button>
          </div>

          {searchingUser && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12, color: C.textSec }}>Searching user ledger...</div>
            </div>
          )}

          {!searchingUser && userData && (
            <div className="fade-in-section">
              <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 24 }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Full Name" value={userData.user.name} valueStyle={{ color: C.text, fontSize: 16, fontWeight: 700 }} formatter={(val) => val} />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Username" value={userData.user.username} valueStyle={{ color: C.text, fontSize: 16, fontWeight: 700 }} formatter={(val) => val} />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Email Address" value={userData.user.email} valueStyle={{ color: C.text, fontSize: 16, fontWeight: 700 }} formatter={(val) => val} />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Account Role" value={userData.user.role.toUpperCase()} valueStyle={{ color: '#00d09c', fontSize: 16, fontWeight: 800 }} formatter={(val) => val} />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Wallet Balance" value={`₹${userData.user.walletBalance.toLocaleString()}`} valueStyle={{ color: C.text, fontSize: 18, fontWeight: 800 }} />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic title="Member Since" value={new Date(userData.user.createdAt).toLocaleDateString()} valueStyle={{ color: C.text, fontSize: 16, fontWeight: 600 }} formatter={(val) => val} />
                  </Col>
                </Row>
              </div>

              <div>
                <Title level={5} style={{ color: C.text, marginBottom: 12 }}>
                  Venture Investment Ledger ({userData.investments.length})
                </Title>
                <Table 
                  dataSource={userData.investments}
                  rowKey="_id"
                  columns={[
                    {
                      title: 'STARTUP NAME',
                      dataIndex: 'startupName',
                      key: 'startupName',
                      render: (name) => <Text style={{ color: C.text, fontWeight: 700 }}>{name}</Text>
                    },
                    {
                      title: 'CATEGORY',
                      dataIndex: 'startupCategory',
                      key: 'startupCategory',
                      render: (cat) => <Tag color="blue" style={{ border: 'none' }}>{cat}</Tag>
                    },
                    {
                      title: 'PLEDGE CAPITAL',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amount) => <Text style={{ color: '#00d09c', fontWeight: 800 }}>₹{amount.toLocaleString()}</Text>
                    },
                    {
                      title: 'TRANSACTION DATE',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (ts) => <Text style={{ color: C.textSec }}>{new Date(ts).toLocaleString()}</Text>
                    }
                  ]}
                  locale={{ emptyText: <span style={{ color: C.textSec }}>No startup backing records found for this account.</span> }}
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </div>
          )}
        </Card>
      );
    }

    if (activeMenu === 'Company Access') {
      return (
        <Card style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.card }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
              Company Registry Access
            </Title>
            <Text style={{ color: C.textSec, fontSize: 13 }}>
              Look up DTU incubated startup campaign records, marketing specifications, capital metrics, and backing ledgers.
            </Text>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 500 }}>
            <Input 
              prefix={<DatabaseOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Enter exact company/startup name (e.g. AgroDrone India)"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              onPressEnter={handleCompanySearch}
              style={{
                borderRadius: 8,
                height: 40,
                border: `1px solid ${C.borderDarker}`,
                background: C.inputBg,
                color: C.text
              }}
            />
            <Button 
              type="primary" 
              onClick={handleCompanySearch} 
              loading={searchingCompany}
              style={{ height: 40, borderRadius: 8, backgroundColor: '#00d09c', borderColor: '#00d09c', fontWeight: 600 }}
            >
              Search
            </Button>
          </div>

          {searchingCompany && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12, color: C.textSec }}>Retrieving venture profile...</div>
            </div>
          )}

          {!searchingCompany && companyData && (
            <div className="fade-in-section">
              <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 24 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                  <Col>
                    <Title level={3} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
                      {companyData.company.name}
                    </Title>
                    <Text style={{ color: C.textSec, fontSize: 13, fontWeight: 600 }}>
                      Founder: <span style={{ color: C.text }}>{companyData.company.founderName || 'DTU Incubator Representative'}</span>
                    </Text>
                  </Col>
                  <Col>
                    <Space>
                      <Tag color="blue" style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', fontWeight: 700 }}>
                        {companyData.company.category}
                      </Tag>
                      <Tag 
                        color={companyData.company.status === 'approved' ? 'success' : companyData.company.status === 'rejected' ? 'error' : 'warning'}
                        style={{ border: 'none', fontWeight: 700, textTransform: 'uppercase' }}
                      >
                        {companyData.company.status}
                      </Tag>
                    </Space>
                  </Col>
                </Row>
              </div>

              {/* Metrics */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                    <Statistic 
                      title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11 }}>Valuation Cap</span>}
                      value={`₹${(companyData.company.valuationCap || 0).toLocaleString()}`}
                      valueStyle={{ color: C.text, fontSize: 16, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                    <Statistic 
                      title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11 }}>Pledges Raised</span>}
                      value={`₹${(companyData.company.raisedAmount || 0).toLocaleString()}`}
                      valueStyle={{ color: '#00d09c', fontSize: 16, fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                    <Statistic 
                      title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11 }}>Min. Pledge</span>}
                      value={`₹${(companyData.company.minimumInvestment || 10000).toLocaleString()}`}
                      valueStyle={{ color: C.text, fontSize: 16, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                    <Statistic 
                      title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11 }}>Days Left</span>}
                      value={companyData.company.daysLeft > 0 ? `${companyData.company.daysLeft} days` : 'Closed'}
                      valueStyle={{ color: C.text, fontSize: 16, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Details sections */}
              <div style={{ marginBottom: 20 }}>
                <Text style={{ color: C.text, fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Marketing Mix (4 Ps Strategy)
                </Text>
                <Paragraph style={{ color: C.textSec, fontSize: 13, lineHeight: '1.6' }}>
                  {companyData.company.marketingMixVariables}
                </Paragraph>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text style={{ color: C.text, fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Financial Procurement & Supply Logistics
                </Text>
                <Paragraph style={{ color: C.textSec, fontSize: 13, lineHeight: '1.6' }}>
                  {companyData.company.financialProcurement}
                </Paragraph>
              </div>

              <div>
                <Title level={5} style={{ color: C.text, marginBottom: 12 }}>
                  Active Investor Ledger ({companyData.investments.length})
                </Title>
                <Table 
                  dataSource={companyData.investments}
                  rowKey="_id"
                  columns={[
                    {
                      title: 'Investor Name',
                      dataIndex: 'investorName',
                      key: 'investorName',
                      render: (t) => <Text style={{ color: C.text, fontWeight: 600 }}>{t || 'Unknown Investor'}</Text>
                    },
                    {
                      title: 'Pledge Capital',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amt) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{amt.toLocaleString()}</Text>
                    },
                    {
                      title: 'Allocation Date',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (dt) => <Text style={{ color: C.textSec }}><CalendarOutlined style={{ marginRight: 6 }} />{new Date(dt).toLocaleDateString()}</Text>
                    }
                  ]}
                  locale={{ emptyText: <span style={{ color: C.textSec }}>No funding recorded for this venture yet.</span> }}
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </div>
          )}
        </Card>
      );
    }

    if (activeMenu === 'Platform Analytics') {
      return renderAnalyticsContent();
    }

    if (activeMenu !== 'Dashboard' && activeMenu !== 'Platform Analytics') {
      return (
        <Card style={{ borderRadius: 12, padding: '24px 0', textAlign: 'center' }}>
          <DatabaseOutlined style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }} />
          <Title level={4} style={{ color: C.text, fontFamily: 'Outfit', fontWeight: 700 }}>{activeMenu} Space</Title>
          <Paragraph style={{ color: C.textSec, maxWidth: 450, margin: '0 auto' }}>
            This administrative partition is configured under Sandbox Institutional Vetting tier. Full ledger tracking is operational.
          </Paragraph>
        </Card>
      );
    }

    // Default Dashboard view
    return (
      <>
        {/* Stat Cards Grid matching screenshot */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={8}>
            <Card style={{ padding: '16px 20px', borderRadius: 12, background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text style={{ color: '#64748b', fontWeight: 700, fontSize: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    TOTAL APPLICATIONS
                  </Text>
                  <Title level={2} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: '12px 0 0 0', fontFamily: 'Outfit', fontWeight: 800, fontSize: 36 }}>
                    {totalCount > 0 ? (1200 + totalCount).toLocaleString() : '1,248'}
                  </Title>
                </div>
                <div style={{ padding: 8, background: isDarkMode ? '#1f2937' : '#f1f5f9', borderRadius: 8, color: '#64748b', display: 'flex' }}>
                  <FileTextOutlined style={{ fontSize: 20 }} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Tag color="blue" style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', fontWeight: 700 }}>
                  ↑ 12% YTD
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card style={{ padding: '16px 20px', borderRadius: 12, background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text style={{ color: '#64748b', fontWeight: 700, fontSize: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    PENDING REVIEW
                  </Text>
                  <Title level={2} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: '12px 0 0 0', fontFamily: 'Outfit', fontWeight: 800, fontSize: 36 }}>
                    {pendingCount}
                  </Title>
                </div>
                <div style={{ padding: 8, background: isDarkMode ? '#2c1e14' : '#fff7ed', borderRadius: 8, color: '#ea580c', display: 'flex' }}>
                  <HourglassOutlined style={{ fontSize: 20 }} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Tag color="warning" style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', fontWeight: 700 }}>
                  Requires Action
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card style={{ padding: '16px 20px', borderRadius: 12, background: isDarkMode ? '#111827' : '#ffffff', border: isDarkMode ? '1px solid #1f2937' : '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text style={{ color: '#64748b', fontWeight: 700, fontSize: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    APPROVED STARTUPS
                  </Text>
                  <Title level={2} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: '12px 0 0 0', fontFamily: 'Outfit', fontWeight: 800, fontSize: 36 }}>
                    {approvedCount > 0 ? (340 + approvedCount) : '342'}
                  </Title>
                </div>
                <div style={{ padding: 8, background: isDarkMode ? '#064e3b' : '#f0fdf4', borderRadius: 8, color: '#16a34a', display: 'flex' }}>
                  <CheckOutlined style={{ fontSize: 20 }} />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>₹450M Deployed</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {activeSubTab === '1' ? (
          /* Table Card (Application Queue) */
          <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Title level={4} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>
                Application Queue
              </Title>
              <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>Export</Button>
            </div>

            <Table 
              dataSource={filteredQueue} 
              columns={columns} 
              loading={loading}
              pagination={{ pageSize: 8 }}
              rowKey="_id"
              locale={{ emptyText: <span style={{ color: '#7c8099' }}>No applications registered in system.</span> }}
              style={{ background: 'transparent' }}
            />
          </Card>
        ) : (
          /* Blogs & Insights Vetting Portal */
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card style={{ borderRadius: 12 }}>
                <Title level={4} style={{ color: C.text, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 700 }}>
                  Publish Investor Blog
                </Title>
                <Paragraph style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}>
                  Write financial insights and tips to guide platform investors in selecting the best seed funding options.
                </Paragraph>

                <Form layout="vertical" onSubmitCapture={handlePublishBlog}>
                  <Form.Item label={<span style={{ color: C.textSec, fontWeight: 600 }}>Blog / Tip Title</span>}>
                    <Input 
                      placeholder="e.g., Selecting Startups: The 4 Ps Vetting Strategy" 
                      value={blogTitle} 
                      onChange={(e) => setBlogTitle(e.target.value)}
                      style={{ height: 40, borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item label={<span style={{ color: C.textSec, fontWeight: 600 }}>Financial Content</span>}>
                    <Input.TextArea 
                      placeholder="Detail supply chain structures, capitalization budgets, or market growth pointers..." 
                      rows={6}
                      value={blogContent} 
                      onChange={(e) => setBlogContent(e.target.value)}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={publishing}
                    icon={<SendOutlined />}
                    block
                    style={{
                      backgroundColor: '#00d09c',
                      borderColor: '#00d09c',
                      height: 42,
                      borderRadius: 8,
                      fontWeight: 700
                    }}
                  >
                    Publish Insights
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card style={{ borderRadius: 12 }}>
                <Title level={4} style={{ color: C.text, marginBottom: 20, fontFamily: 'Outfit', fontWeight: 700 }}>
                  Published Insights Feed
                </Title>
                {blogs.length === 0 ? (
                  <Alert message="No blogs published. Write your first tip to guide platform investors." type="info" showIcon />
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: 8 }}>
                    {blogs.map(blog => (
                      <div 
                        key={blog._id} 
                        style={{ 
                          background: isDarkMode ? '#1e293b' : '#f8fafc', 
                          padding: '20px', 
                          borderRadius: 8, 
                          border: `1px solid ${C.border}`,
                          marginBottom: 16
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Title level={5} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 700 }}>{blog.title}</Title>
                          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                            {new Date(blog.timestamp).toLocaleDateString()}
                          </Text>
                        </div>
                        <Paragraph style={{ color: C.textSec, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: 0 }}>
                          {blog.content}
                        </Paragraph>
                        <div style={{ marginTop: 12 }}>
                          <Tag color="cyan" style={{ border: 'none', borderRadius: 4 }}>Author: {blog.author}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      
      {/* Left Sidebar Navigation matching screenshot */}
      <Sider width={260} style={{ background: isDarkMode ? '#111827' : '#ffffff', borderRight: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}` }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${isDarkMode ? '#1f2937' : '#f1f5f9'}` }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              marginRight: 10,
              boxShadow: '0 4px 10px rgba(0,208,156,0.2)'
            }}></div>
            <div>
              <Title level={5} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>
                Global Equity Fu...
              </Title>
              <Text style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 11, display: 'block', marginTop: -2, fontWeight: 600 }}>
                Institutional Tier
              </Text>
            </div>
          </div>
        </div>

        {/* Sidebar Menu options */}
        <div style={{ padding: '20px 0' }}>
          {[
            { name: 'Dashboard', icon: <AuditOutlined /> },
            { name: 'User Access', icon: <UserOutlined /> },
            { name: 'Company Access', icon: <DatabaseOutlined /> },
            { name: 'Audit Logs', icon: <BookOutlined /> },
            { name: 'Platform Analytics', icon: <LineChartOutlined /> }
          ].map(item => {
            const isSelected = activeMenu === item.name;
            return (
              <div 
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  borderLeft: isSelected ? `4px solid ${isDarkMode ? '#00d09c' : '#3b82f6'}` : '4px solid transparent',
                  background: isSelected ? (isDarkMode ? '#1e293b' : '#eff6ff') : 'transparent',
                  color: isSelected ? (isDarkMode ? '#00d09c' : '#1e3a8a') : (isDarkMode ? '#9ca3af' : '#64748b'),
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 14,
                  marginBottom: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ marginRight: 12, display: 'flex', alignItems: 'center', fontSize: 16 }}>{item.icon}</span>
                {item.name}
              </div>
            );
          })}
        </div>

        {/* Bottom sidebar buttons */}
        <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 24px' }}>
           <Button 
             type="text" 
             icon={isDarkMode ? <SunOutlined style={{ color: '#eab308' }} /> : <MoonOutlined style={{ color: '#64748b' }} />} 
             onClick={toggleTheme} 
             style={{ color: '#64748b', fontWeight: 600, width: '100%', textAlign: 'left', padding: 0, marginBottom: 8 }}
           >
             {isDarkMode ? 'Bright Mode' : 'Dark Mode'}
           </Button>
           <Button 
             type="text" 
             icon={<SettingOutlined />} 
             onClick={() => { setSelectedTimeout(getIdleTimeoutMinutes()); setSettingsOpen(true); }}
             style={{ color: '#64748b', fontWeight: 600, width: '100%', textAlign: 'left', padding: 0, marginBottom: 8 }}
           >
             Settings
           </Button>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout} 
            style={{ color: '#64748b', fontWeight: 600, width: '100%', textAlign: 'left', padding: 0 }}
          >
            Logout admin
          </Button>
        </div>
      </Sider>

      {/* Main Area */}
      <Layout style={{ background: 'transparent' }}>
        <Content style={{ padding: '40px 48px' }} className="fade-in-section">
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <Title level={2} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, letterSpacing: '-0.8px' }}>
                Startup Mutual Fund Administration
              </Title>
              <Text style={{ color: '#64748b', fontSize: 15, display: 'block', marginTop: 4, fontWeight: 500 }}>
                Manage applications, valuations, and portfolio metrics.
              </Text>
            </div>
            

          </div>

          {/* Tab Sub header */}
          {activeMenu === 'Dashboard' && (
            <div style={{ marginBottom: 28 }}>
              <Tabs 
                activeKey={activeSubTab} 
                onChange={setActiveSubTab}
                items={[
                  {
                    key: '1',
                    label: <span style={{ fontWeight: 600, fontSize: 14 }}><AuditOutlined /> Vetting Queue</span>
                  },
                  {
                    key: '2',
                    label: <span style={{ fontWeight: 600, fontSize: 14 }}><BookOutlined /> Investor Blogs & Tips</span>
                  }
                ]}
              />
            </div>
          )}

          {renderMainContent()}

        </Content>
      </Layout>

      {/* Startup Details Vetting Modal */}
      <Modal
        title={<span style={{ color: C.text, fontSize: 20, fontFamily: 'Outfit', fontWeight: 800 }}><SolutionOutlined /> Startup Venture Profile</span>}
        open={detailModalVisible}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={720}
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: '24px 0' }}
      >
        {loadingDetails ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Progress percent={70} status="active" strokeColor="#00d09c" showInfo={false} style={{ maxWidth: 300, margin: '0 auto' }} />
            <Text style={{ color: C.textSec, display: 'block', marginTop: 12, fontWeight: 500 }}>Fetching live financial audit records...</Text>
          </div>
        ) : detailStartup ? (
          <div style={{ padding: '0 24px', maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Header info */}
            <div style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3} style={{ color: C.text, margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
                    {detailStartup.name}
                  </Title>
                  <Text style={{ color: C.textSec, fontSize: 13, fontWeight: 600 }}>
                    Founder: <span style={{ color: C.text }}>{detailStartup.founderName || 'DTU Incubator Representative'}</span>
                  </Text>
                  {detailStartup.tagline && (
                    <Paragraph style={{ color: C.textSec, fontSize: 13, fontStyle: 'italic', marginTop: 8, marginBottom: 0 }}>
                      {detailStartup.tagline}
                    </Paragraph>
                  )}
                </Col>
                <Col>
                  <Space>
                    <Tag color="blue" style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', fontWeight: 700 }}>
                      {detailStartup.category}
                    </Tag>
                    <Tag 
                      color={detailStartup.status === 'approved' ? 'success' : detailStartup.status === 'rejected' ? 'error' : 'warning'}
                      style={{ border: 'none', fontWeight: 700, textTransform: 'uppercase' }}
                    >
                      {detailStartup.status}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Valuation Cap (Rs)</span>}
                    value={`₹${(detailStartup.valuationCap || detailLatestVal).toLocaleString()}`}
                    valueStyle={{ color: C.text, fontSize: 22, fontFamily: 'Outfit', fontWeight: 800 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Campaign Pledges</span>}
                    value={`₹${(detailStartup.raisedAmount || 0).toLocaleString()}`}
                    valueStyle={{ color: '#00d09c', fontSize: 22, fontFamily: 'Outfit', fontWeight: 800 }}
                    suffix={<span style={{ fontSize: 11, color: C.textSec }}>
                      / ₹${(detailStartup.maxGoal || 10000000).toLocaleString()} max
                    </span>}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Min. Investment</span>}
                    value={`₹${(detailStartup.minimumInvestment || 10000).toLocaleString()}`}
                    valueStyle={{ color: C.text, fontSize: 15, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Share Price</span>}
                    value={`₹${(detailStartup.pricePerShare || 0).toFixed(2)}`}
                    valueStyle={{ color: C.text, fontSize: 15, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Security Type</span>}
                    value={detailStartup.securityType || 'Crowd SAFE'}
                    valueStyle={{ color: C.text, fontSize: 13, fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ padding: '4px 8px', background: isDarkMode ? '#1e293b' : '#fafafa', border: `1px solid ${C.border}` }}>
                  <Statistic 
                    title={<span style={{ color: C.textSec, fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Days Left</span>}
                    value={detailStartup.daysLeft > 0 ? `${detailStartup.daysLeft} days` : 'Closed'}
                    valueStyle={{ color: C.text, fontSize: 15, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Valuation Trend */}
            <div style={{ marginBottom: 24 }}>
              <Text style={{ color: C.text, fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>
                <LineChartOutlined style={{ marginRight: 6, color: '#00d09c' }} /> Valuation Progression Graph
              </Text>
              <div style={{ background: isDarkMode ? '#111827' : '#f8fafc', padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'center' }}>
                <ValuationGraph data={detailValuations} />
              </div>
            </div>

            <Divider style={{ margin: '20px 0' }} />
            {/* Business Spec details */}
            <div style={{ marginBottom: 20 }}>
              <Text style={{ color: C.text, fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Marketing Mix (4 Ps Strategy)
              </Text>
              <Paragraph style={{ color: C.textSec, fontSize: 13, lineHeight: '1.6' }}>
                {detailStartup.marketingMixVariables}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text style={{ color: C.text, fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Financial Procurement & Supply Logistics
              </Text>
              <Paragraph style={{ color: C.textSec, fontSize: 13, lineHeight: '1.6' }}>
                {detailStartup.financialProcurement}
              </Paragraph>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* Backers / Past Investors Table */}
            <div>
              <Text style={{ color: C.text, fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>
                <UserOutlined style={{ marginRight: 6, color: '#00d09c' }} /> Active Investor Ledger ({detailInvestments.length})
              </Text>
              <Table 
                dataSource={detailInvestments}
                rowKey="_id"
                columns={[
                  {
                    title: 'Investor Name',
                    dataIndex: 'investorName',
                    key: 'investorName',
                    render: (t) => <Text style={{ color: C.text, fontWeight: 600 }}>{t || 'Unknown Investor'}</Text>
                  },
                  {
                    title: 'Pledge Capital',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amt) => <Text style={{ color: '#00d09c', fontWeight: 700 }}>₹{(amt || 0).toLocaleString()}</Text>
                  },
                  {
                    title: 'Allocation Date',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: (dt) => <Text style={{ color: C.textSec }}><CalendarOutlined style={{ marginRight: 6 }} />{dt ? new Date(dt).toLocaleDateString() : 'N/A'}</Text>
                  }
                ]}
                pagination={{ pageSize: 4 }}
                size="small"
                locale={{ emptyText: <span style={{ color: C.textSec, fontSize: 12 }}>No backing capital recorded for this campaign yet.</span> }}
              />
            </div>

            {/* Inline vetting controls for pending */}
            {detailStartup.status === 'pending' && (
              <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20, textAlign: 'right' }}>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => handleReview(detailStartup._id, 'approved')}
                    style={{ backgroundColor: '#00d09c', borderColor: '#00d09c', borderRadius: 8, height: 38 }}
                  >
                    Approve Application
                  </Button>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<CloseCircleOutlined />} 
                    onClick={() => handleReview(detailStartup._id, 'rejected')}
                    style={{ borderRadius: 8, height: 38 }}
                  >
                    Reject Application
                  </Button>
                </Space>
              </div>
            )}

          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text style={{ color: '#7c8099' }}>Failed to retrieve venture profile telemetry.</Text>
          </div>
        )}
      </Modal>

      {/* ── Idle Timeout Warning Modal ───────────────────────────── */}
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
            margin: '20px 0',
            fontSize: 56,
            fontWeight: 800,
            fontFamily: 'Outfit',
            color: secondsLeft <= 10 ? '#ef4444' : '#f59e0b',
            lineHeight: 1
          }}>
            {secondsLeft}
            <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6, color: isDarkMode ? '#94a3b8' : '#64748b' }}>sec</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={resetTimer}
              style={{
                borderRadius: 10, fontWeight: 700, height: 44, paddingInline: 28,
                background: 'linear-gradient(135deg, #00d09c, #00b386)',
                border: 'none', fontSize: 15
              }}
            >
              I'm Still Here
            </Button>
            <Button
              size="large"
              onClick={handleLogout}
              style={{
                borderRadius: 10, fontWeight: 700, height: 44, paddingInline: 28,
                background: 'transparent',
                border: `1px solid ${isDarkMode ? '#374151' : '#cbd5e1'}`,
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: 15
              }}
            >
              Logout Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Settings Modal ───────────────────────────────────────── */}
      <Modal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={null}
        centered
        width={460}
        title={null}
        styles={{ content: { background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 16, padding: 0 } }}
      >
        <div style={{ padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: isDarkMode ? '#0f172a' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SettingOutlined style={{ fontSize: 22, color: '#00d09c' }} />
            </div>
            <div>
              <Title level={4} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
                Session Settings
              </Title>
              <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13 }}>
                Configure auto-logout timeout for security
              </Text>
            </div>
          </div>

          <div style={{
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: 12,
            padding: '20px',
            border: `1px solid ${isDarkMode ? '#1f2937' : '#e2e8f0'}`,
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
              <Text style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a', fontWeight: 700, fontSize: 14 }}>
                Auto-Logout After Inactivity
              </Text>
            </div>
            <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13, display: 'block', marginBottom: 16 }}>
              If no activity is detected, your session will automatically end for security. A warning will appear 60 seconds before logout.
            </Text>
            <Select
              value={selectedTimeout}
              onChange={setSelectedTimeout}
              style={{ width: '100%', height: 44 }}
              options={TIMEOUT_OPTIONS}
              size="large"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button
              size="large"
              onClick={() => setSettingsOpen(false)}
              style={{
                borderRadius: 10, fontWeight: 600, height: 44,
                border: `1px solid ${isDarkMode ? '#374151' : '#cbd5e1'}`,
                color: isDarkMode ? '#94a3b8' : '#64748b',
                background: 'transparent'
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={saveSettings}
              style={{
                borderRadius: 10, fontWeight: 700, height: 44, paddingInline: 28,
                background: 'linear-gradient(135deg, #00d09c, #00b386)',
                border: 'none'
              }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
}

