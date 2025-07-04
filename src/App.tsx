import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
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
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;