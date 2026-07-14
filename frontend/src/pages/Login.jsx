import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { smoothToggleTheme } from '../utils/themeUtils';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import {
  LockOutlined, RiseOutlined, TeamOutlined, RocketOutlined,
  UserOutlined, WarningOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Login() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
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
    textPrimary: isDark ? '#f1f5f9' : '#44475b',
    textSecondary: isDark ? '#9ca3af' : '#7c8099',
    border: isDark ? '#1f2937' : '#d1d5db',
    bg: isDark ? '#0b0f19' : '#f4f6f9',
    white: isDark ? '#111827' : '#ffffff',
    error: '#ef4444', errorBg: isDark ? '#2d1a1a' : '#fef2f2', errorBorder: isDark ? '#4c1d1d' : '#fecaca',
  };

  const onFinish = async (values) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: values.identifier ? values.identifier.trim() : '',
          password: values.password,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const status = response.status;
        if (status === 404 || status >= 500) {
          throw new Error(`The API server is currently waking up or offline (Status ${status}). Please wait a few seconds and try again.`);
        }
        throw new Error(`The server returned an invalid HTML page instead of JSON. Please verify that the VITE_API_URL environment variable is configured correctly on your hosting platform.`);
      }
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'company') navigate('/company');
      else navigate('/investor');
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', backgroundColor: C.bg, padding: '24px',
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
          width: '100%', maxWidth: 420, background: C.white,
          border: `1px solid ${C.border}`,
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)',
          borderRadius: '16px'
        }}
        styles={{ body: { padding: '48px 36px' } }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Space size="small" style={{ marginBottom: 12 }}>
            <div style={{
              background: 'linear-gradient(135deg, #00d09c 0%, #05b184 100%)',
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0, 208, 156, 0.3)'
            }}>
              <RiseOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
          </Space>
          <Title level={2} style={{
            color: C.textPrimary, margin: 0, fontFamily: 'Outfit',
            fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px'
          }}>
            elevate
          </Title>
          <Text style={{ color: C.textSecondary, fontSize: '14px', marginTop: 4, display: 'block', fontWeight: 500 }}>
            Simple investing. Crowdfunding DTU.
          </Text>
        </div>

        {/* Inline error */}
        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: C.errorBg, border: `1px solid ${C.errorBorder}`,
            borderRadius: 8, padding: '12px 14px', marginBottom: 20
          }}>
            <WarningOutlined style={{ color: C.error, fontSize: 15, marginTop: 1, flexShrink: 0 }} />
            <Text style={{ color: '#b91c1c', fontSize: 13 }}>{errorMsg}</Text>
          </div>
        )}

        {/* Login Form */}
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          onValuesChange={() => errorMsg && setErrorMsg('')}
        >
          <Form.Item
            name="identifier"
            rules={[
              { required: true, message: 'Please enter your email or username!' },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  const trimmed = value.trim();
                  if (trimmed.includes('@')) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(trimmed)) {
                      return Promise.reject(new Error('Please enter a valid email address!'));
                    }
                    try {
                      const res = await fetch(`${API_URL}/api/auth/check-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: trimmed })
                      });
                      const data = await res.json();
                      if (res.ok && !data.exists) {
                        return Promise.reject(new Error('This email is not registered!'));
                      }
                    } catch (err) {
                      // Silently bypass network error to not block login
                      return Promise.resolve();
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              placeholder="Email or username"
              size="large"
              style={{ background: C.white, border: `1px solid ${C.border}`, color: C.textPrimary, height: 48, borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
              placeholder="Password"
              size="large"
              style={{ background: C.white, border: `1px solid ${C.border}`, color: C.textPrimary, height: 48, borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 28 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                backgroundColor: C.mint, borderColor: C.mint,
                color: '#fff', height: 48, fontSize: '15px', fontWeight: 700,
                borderRadius: '8px', boxShadow: 'none'
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        {/* Register Options */}
        <Divider style={{ color: C.textSecondary, fontSize: 12, borderColor: C.border }}>
          New to Elevate?
        </Divider>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link to="/register?type=investor">
            <button style={{
              width: '100%',
              background: isDark ? '#064e3b' : '#f0fdf9',
              border: `1px solid ${isDark ? '#065f46' : '#d1fae5'}`,
              borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#047857' : '#e6fef6'; e.currentTarget.style.borderColor = C.mint; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#064e3b' : '#f0fdf9'; e.currentTarget.style.borderColor = isDark ? '#065f46' : '#d1fae5'; }}
            >
              <TeamOutlined style={{ fontSize: 18, color: C.mint, display: 'block', marginBottom: 4 }} />
              <Text style={{ color: C.mint, fontWeight: 700, fontSize: 12 }}>Join as Investor</Text>
            </button>
          </Link>

          <Link to="/register?type=company">
            <button style={{
              width: '100%',
              background: isDark ? '#1e1b4b' : '#f5f3ff',
              border: `1px solid ${isDark ? '#312e81' : '#e0e0ff'}`,
              borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#312e81' : '#ede9fe'; e.currentTarget.style.borderColor = C.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1e1b4b' : '#f5f3ff'; e.currentTarget.style.borderColor = isDark ? '#312e81' : '#e0e0ff'; }}
            >
              <RocketOutlined style={{ fontSize: 18, color: isDark ? '#a78bfa' : C.dark, display: 'block', marginBottom: 4 }} />
              <Text style={{ color: isDark ? '#a78bfa' : C.dark, fontWeight: 700, fontSize: 12 }}>List your Startup</Text>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
