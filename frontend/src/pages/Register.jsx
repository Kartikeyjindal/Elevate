import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { smoothToggleTheme } from '../utils/themeUtils';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import {
  UserOutlined, MailOutlined, LockOutlined, RiseOutlined,
  RocketOutlined, TeamOutlined, ArrowLeftOutlined, BuildOutlined,
  CheckCircleOutlined, WarningOutlined, TagOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

/* ─── Logo (outside component, receives colors) ─── */
function Logo({ C }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <Space size="small" style={{ marginBottom: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,208,156,0.3)'
        }}>
          <RiseOutlined style={{ fontSize: 20, color: '#fff' }} />
        </div>
      </Space>
      <Title level={2} style={{
        color: C.textPrimary, margin: 0, fontFamily: 'Outfit',
        fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px'
      }}>elevate</Title>
      <Text style={{ color: C.textSecondary, fontSize: 13, marginTop: 4, display: 'block', fontWeight: 500 }}>
        Join the crowdfunding portal
      </Text>
    </div>
  );
}

export default function Register() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successRole, setSuccessRole] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  useEffect(() => {
    const handleTheme = () => setThemeMode(localStorage.getItem('theme') || 'light');
    window.addEventListener('themeChanged', handleTheme);
    return () => window.removeEventListener('themeChanged', handleTheme);
  }, []);

  const toggleTheme = () => {
    smoothToggleTheme(themeMode === 'dark', (nextTheme) => {
      localStorage.setItem('theme', nextTheme);
      window.dispatchEvent(new Event('themeChanged'));
    });
  };

  const isDark = themeMode === 'dark';
  const C = {
    mint: '#00d09c', dark: '#1a1d2e',
    companyTheme: isDark ? '#818cf8' : '#1a1d2e',
    textPrimary: isDark ? '#f1f5f9' : '#44475b', 
    textSecondary: isDark ? '#9ca3af' : '#7c8099',
    border: isDark ? '#1f2937' : '#d1d5db', 
    bg: isDark ? '#0b0f19' : '#f4f6f9', 
    white: isDark ? '#111827' : '#ffffff',
    error: '#ef4444', errorBg: isDark ? '#2d1a1a' : '#fef2f2', errorBorder: isDark ? '#4c1d1d' : '#fecaca',
  };

  const inputStyle = {
    background: C.white, border: `1px solid ${C.border}`,
    color: C.textPrimary, height: 44, borderRadius: '8px'
  };

  // Auto-set mode from URL query param (?type=investor or ?type=company)
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'investor' || type === 'company') {
      setMode(type);
    }
  }, [searchParams]);

  const onFinish = async (values) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        username: values.username.toLowerCase(),
        email: values.email,
        password: values.password,
        role: mode,
        ...(mode === 'company' && { companyName: values.companyName })
      };

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessRole(mode);
      setSuccessModalVisible(true);
    } catch (error) {
      // Show a visible inline error instead of a toast
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    setSuccessModalVisible(false);
    if (successRole === 'company') {
      navigate('/company');
    } else {
      navigate('/investor');
    }
  };

  const isCompany = mode === 'company';

  /* ─── Role Selection Screen ─── */
  if (mode === null) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: C.bg, padding: 24
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <Logo C={C} />

          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <Text style={{ color: C.textSecondary, fontSize: 15, fontWeight: 500 }}>
              Choose how you'd like to join Elevate
            </Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Investor Card */}
            <button
              onClick={() => setMode('investor')}
              style={{
                background: C.white, border: `2px solid ${C.border}`,
                borderRadius: 16, padding: '32px 24px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.mint; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,208,156,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf9', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TeamOutlined style={{ fontSize: 26, color: C.mint }} />
              </div>
              <Title level={4} style={{ color: C.textPrimary, fontFamily: 'Outfit', margin: '0 0 8px', fontSize: 18 }}>
                I'm an Investor
              </Title>
              <Text style={{ color: C.textSecondary, fontSize: 13, lineHeight: '1.5' }}>
                Discover and fund promising startups. Build your portfolio.
              </Text>
              <div style={{ marginTop: 20, background: C.mint, color: '#fff', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14 }}>
                Join as Investor →
              </div>
            </button>

            {/* Company Card */}
            <button
              onClick={() => setMode('company')}
              style={{
                background: C.white, border: `2px solid ${C.border}`,
                borderRadius: 16, padding: '32px 24px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.dark; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,29,46,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0f0ff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RocketOutlined style={{ fontSize: 26, color: C.dark }} />
              </div>
              <Title level={4} style={{ color: C.textPrimary, fontFamily: 'Outfit', margin: '0 0 8px', fontSize: 18 }}>
                List my Startup
              </Title>
              <Text style={{ color: C.textSecondary, fontSize: 13, lineHeight: '1.5' }}>
                Register your company and raise capital from the crowd.
              </Text>
              <div style={{ marginTop: 20, background: C.dark, color: '#fff', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14 }}>
                Register Company →
              </div>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text style={{ color: C.textSecondary, fontSize: 13 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: C.mint, fontWeight: 700 }}>Sign In</Link>
            </Text>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Registration Form (rendered at top level — no nested component) ─── */
  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: C.bg, padding: 24,
        position: 'relative'
      }}>
        <Button
          type="text"
          icon={isDark ? <SunOutlined style={{ color: '#eab308', fontSize: '16px' }} /> : <MoonOutlined style={{ color: '#64748b', fontSize: '16px' }} />}
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            color: C.textPrimary,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '20px',
            border: `1px solid ${C.border}`,
            backgroundColor: C.white,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          {isDark ? 'Bright' : 'Dark'}
        </Button>

        <Card
          style={{
            width: '100%', maxWidth: isCompany ? 480 : 420,
            background: C.white, border: `1px solid ${C.border}`,
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: 16
          }}
          styles={{ body: { padding: '40px 36px' } }}
        >
          <Logo C={C} />

          {/* Mode badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
            background: isDark ? (isCompany ? '#1e1b4b' : '#064e3b') : (isCompany ? '#f0f0ff' : '#f0fdf9'),
            border: `1px solid ${isDark ? (isCompany ? '#312e81' : '#065f46') : (isCompany ? '#e0e0ff' : '#d1fae5')}`,
            borderRadius: 10, padding: '10px 14px'
          }}>
            {isCompany ? <RocketOutlined style={{ color: C.companyTheme }} /> : <TeamOutlined style={{ color: C.mint }} />}
            <Text style={{ fontWeight: 700, color: isCompany ? C.companyTheme : C.mint, fontSize: 14 }}>
              {isCompany ? 'Company Registration' : 'Investor Account'}
            </Text>
            <button
              onClick={() => { setMode(null); setErrorMsg(''); form.resetFields(); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ArrowLeftOutlined /> Change
            </button>
          </div>

          {/* ── Inline error banner ── */}
          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: C.errorBg, border: `1px solid ${C.errorBorder}`,
              borderRadius: 8, padding: '12px 14px', marginBottom: 16
            }}>
              <WarningOutlined style={{ color: C.error, fontSize: 16, marginTop: 1, flexShrink: 0 }} />
              <div>
                <Text style={{ color: C.error, fontWeight: 700, fontSize: 13, display: 'block' }}>
                  Registration failed
                </Text>
                <Text style={{ color: '#b91c1c', fontSize: 13 }}>{errorMsg}</Text>
                {errorMsg.toLowerCase().includes('already exists') && (
                  <Text style={{ color: '#b91c1c', fontSize: 12, display: 'block', marginTop: 4 }}>
                    👉 <Link to="/login" style={{ color: C.error, fontWeight: 700, textDecoration: 'underline' }}>
                      Sign in instead
                    </Link>
                  </Text>
                )}
              </div>
            </div>
          )}

          <Form
            form={form}
            name="register_form"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            onValuesChange={() => errorMsg && setErrorMsg('')}
          >
            <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                placeholder="Full name" size="large" style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Please choose a username!' },
                { min: 3, message: 'Username must be at least 3 characters.' },
                { max: 20, message: 'Username cannot exceed 20 characters.' },
                { pattern: /^[a-zA-Z0-9_.]+$/, message: 'Only letters, numbers, underscores and dots allowed.' }
              ]}
              extra={<span style={{ fontSize: 11, color: C.textSecondary }}>Letters, numbers, _ and . only · 3–20 chars · Must be unique</span>}
            >
              <Input
                prefix={<><TagOutlined style={{ color: '#9ca3af', marginRight: 2 }} /><span style={{ color: '#9ca3af', fontSize: 13, marginRight: 2 }}>@</span></>}
                placeholder="username"
                size="large"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const res = await fetch(`${API_URL}/api/auth/validate-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: value })
                      });
                      const data = await res.json();
                      if (res.ok && !data.valid) {
                        return Promise.reject(new Error(data.reason || 'The email domain is invalid.'));
                      }
                    } catch (err) {
                      // Fail-safe: resolve if network is down
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                placeholder="Email address" size="large" style={inputStyle}
              />
            </Form.Item>

            <Form.Item name="password" rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                placeholder="Password (min 6 characters)" size="large" style={inputStyle}
              />
            </Form.Item>

            {isCompany && (
              <Form.Item name="companyName" rules={[{ required: true, message: 'Please enter your startup name!' }]}>
                <Input
                  prefix={<BuildOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                  placeholder="Startup / Company Name" size="large" style={inputStyle}
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={{
                  backgroundColor: isCompany ? C.companyTheme : C.mint,
                  borderColor: isCompany ? C.companyTheme : C.mint,
                  color: '#fff', height: 48, fontSize: 15, fontWeight: 700,
                  borderRadius: 8, boxShadow: 'none'
                }}
              >
                {isCompany ? 'Create Company Account' : 'Create Investor Account'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text style={{ color: C.textSecondary, fontSize: 13 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: C.mint, fontWeight: 700 }}>Sign In</Link>
            </Text>
          </div>
        </Card>
      </div>

      {/* ── Thank You Modal ── */}
      {successModalVisible && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 24,
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={handleModalOk}
        >
          <div
            style={{
              background: C.white, borderRadius: 20, padding: '48px 48px 40px',
              maxWidth: 420, width: '100%', textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
              margin: '0 auto 24px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,208,156,0.35)'
            }}>
              <CheckCircleOutlined style={{ fontSize: 42, color: '#fff' }} />
            </div>

            <Title level={3} style={{ color: C.textPrimary, fontFamily: 'Outfit', margin: '0 0 10px', fontWeight: 800, fontSize: 26 }}>
              Thank You for Registering!
            </Title>
            <Text style={{ color: C.textSecondary, fontSize: 15, display: 'block', lineHeight: '1.6', marginBottom: 32 }}>
              {successRole === 'company'
                ? "Welcome to Elevate! Your company has been registered. Head to your dashboard to get started."
                : "Welcome to Elevate! Start discovering and investing in promising startups."}
            </Text>

            <Button
              type="primary"
              size="large"
              onClick={handleModalOk}
              style={{
                background: successRole === 'company' ? C.companyTheme : C.mint,
                borderColor: successRole === 'company' ? C.companyTheme : C.mint,
                width: '100%', height: 50, fontSize: 16, fontWeight: 700, borderRadius: 10
              }}
            >
              {successRole === 'company' ? '🚀  Go to Company Dashboard' : '📈  Go to Investor Dashboard'}
            </Button>

            <Text style={{ color: C.textSecondary, fontSize: 12, display: 'block', marginTop: 16 }}>
              Click anywhere outside to continue
            </Text>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
}
