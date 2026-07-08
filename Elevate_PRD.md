# Product Requirements Document (PRD): Elevate Equity Crowdfunding Platform

## 1. Project Overview
Elevate Equity is a MERN-stack crowdfunding and startup mutual fund platform. It connects retail and accredited investors with early-stage startups raising capital. The platform offers interactive investment flows, startup valuation tracking, administrative review workflows, and a live financial market news aggregator.

---

## 2. Target Audience & Roles

### 2.1 Retail/Accredited Investors
Users looking to explore startup listings, view detailed financials/marketing strategies, invest money from a digital wallet, and read expert market insights.

### 2.2 Startup Founders (Companies)
Founders looking to list their company, fill out fundraising applications, update company valuations, and track raised investments.

### 2.3 System Administrators
Admins responsible for reviewing and approving pending startup applications, publishing official system blogs, and reviewing system audit logs.

---

## 3. Key Features & Functional Requirements

### 3.1 User Authentication
* **Credentials Login:** Log in using email/username and password.
* **OTP Login:** Request a 6-digit OTP code sent to user email and verify to log in.
* **Registration:** Only `@gmail.com` addresses are allowed.

### 3.2 Investor Dashboard
* **Explore Deals:** Browse approved startups, search by category, and view fundraising progress bars.
* **Investment Flow:** Invest custom amounts. Verifies wallet balances before allocating equity.
* **Portfolio Tracking:** View current holdings and investment valuation changes.
* **Venture Insights:** Read system-published blogs and live financial news aggregated from top Indian publications (Economic Times, Financial Express, Moneycontrol, Business Standard).

### 3.3 Founder (Company) Dashboard & Application
* **VALUATION curve:** Interactive SVG graph displaying historical and current company valuations.
* **Application Form:** Multi-step registration form (General details, Pitch, Financials) under review by admins.

### 3.4 Admin Panel
* **Application Review:** Approve or reject pending startup applications.
* **Audit Logs:** View chronologically logged system actions for security monitoring.
* **Publish Blogs:** Create and publish articles visible on the Investor dashboard.

---

## 4. Technical Architecture
* **Frontend:** React, Vite, Ant Design, Vanilla CSS.
* **Backend:** Node.js, Express.js, Mongoose/MongoDB (with simulated in-memory storage fallback).
* **Performance Optimizations:** Backend caching (Stale-While-Revalidate) on live RSS feeds to drop page load time to under 5ms.
