import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin && !!token;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedAdmin = localStorage.getItem('adminUser');

      if (storedToken && storedAdmin) {
        try {
          const parsedAdmin = JSON.parse(storedAdmin);
          setToken(storedToken);
          setAdmin(parsedAdmin);
          
          // Verify token is still valid
          await verifyToken(storedToken);
        } catch (error) {
          console.error('Failed to restore admin auth state:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      setAdmin(data.admin);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      throw error;
    }
  };

  const login = async (username: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, twoFactorCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        return { requiresTwoFactor: true };
      }

      // Successful login
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      return {};
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Call logout endpoint
    if (token) {
      fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }
  };

  const refreshToken = async () => {
    try {
      if (!token) throw new Error('No token available');

      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshToken
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};