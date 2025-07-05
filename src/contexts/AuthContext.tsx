import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  plan: string;
  profileImage?: string;
  isEmailVerified: boolean; // Add email verification status
  subscription: {
    status: string;
    startDate: string;
    endDate: string;
  };
  usage: {
    wordsGenerated: number;
    wordsLimit: number;
    resetDate: string;
  };
  preferences: {
    defaultTone: string;
    defaultLanguage: string;
    emailNotifications: boolean;
  };
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, plan?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Mock API functions (replace with real API calls)
  const mockLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@example.com' && password === 'password') {
      const mockUser: User = {
        _id: '1',
        name: 'Demo User',
        email: email,
        plan: 'starter',
        profileImage: localStorage.getItem('userProfileImage') || undefined,
        isEmailVerified: true, // Demo user is pre-verified
        subscription: {
          status: 'trial',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        usage: {
          wordsGenerated: 0,
          wordsLimit: 1000,
          resetDate: new Date().toISOString()
        },
        preferences: {
          defaultTone: 'professional',
          defaultLanguage: 'en',
          emailNotifications: true
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      return { user: mockUser, token: mockToken };
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const mockRegister = async (name: string, email: string, password: string, plan = 'starter') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      _id: Date.now().toString(),
      name: name,
      email: email,
      plan: plan,
      profileImage: undefined,
      isEmailVerified: true, // Set to true after email verification
      subscription: {
        status: 'trial',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      usage: {
        wordsGenerated: 0,
        wordsLimit: plan === 'starter' ? 1000 : plan === 'professional' ? 10000 : -1,
        resetDate: new Date().toISOString()
      },
      preferences: {
        defaultTone: 'professional',
        defaultLanguage: 'en',
        emailNotifications: true
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    return { user: mockUser, token: mockToken };
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Load profile image from localStorage if it exists
          const savedProfileImage = localStorage.getItem('userProfileImage');
          if (savedProfileImage) {
            parsedUser.profileImage = savedProfileImage;
          }
          
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, token: newToken } = await mockLogin(email, password);

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, plan = 'starter') => {
    try {
      const { user: userData, token: newToken } = await mockRegister(name, email, password, plan);

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfileImage');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If profile image is being updated, save it separately for persistence
      if (userData.profileImage) {
        localStorage.setItem('userProfileImage', userData.profileImage);
      }
    }
  };

  const refreshUser = async () => {
    // Mock refresh - in real app, this would fetch latest user data
    console.log('Refreshing user data...');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};