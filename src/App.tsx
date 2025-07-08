import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminPanel/AdminLayout';
import AdminLogin from './components/AdminPanel/AdminLogin';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
      <Router>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
              <Route path="/features" element={<Layout><Features /></Layout>} />
              <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/account-settings" element={<Layout><AccountSettings /></Layout>} />
              <Route path="/verify-email" element={<Layout><VerifyEmail /></Layout>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminLayout />} />
          </Routes>
      </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;