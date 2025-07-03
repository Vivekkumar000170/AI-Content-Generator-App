import React from 'react';
import { User, Settings, LogOut, Crown, Zap, TrendingUp, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const usagePercentage = user.usage.wordsLimit === -1 
    ? 0 
    : Math.round((user.usage.wordsGenerated / user.usage.wordsLimit) * 100);

  const daysRemaining = Math.ceil(
    (new Date(user.subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'professional': return Crown;
      case 'enterprise': return TrendingUp;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'professional': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-orange-500 to-red-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const PlanIcon = getPlanIcon(user.plan);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    console.log('Opening settings...');
    // In a real app, this would navigate to settings page
  };

  const handleUpgrade = () => {
    console.log('Opening upgrade modal...');
    // In a real app, this would open upgrade modal or navigate to pricing
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      {/* User Info Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user.name}</h3>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Plan Info */}
      <div className={`bg-gradient-to-r ${getPlanColor(user.plan)} p-4 rounded-xl mb-6 shadow-lg`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <PlanIcon className="w-6 h-6" />
            <div>
              <h4 className="font-semibold capitalize">{user.plan} Plan</h4>
              <p className="text-sm opacity-90">
                {user.subscription.status === 'trial' ? 'Free Trial' : 'Active Subscription'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Words Generated</span>
            <span className="text-gray-300 text-sm">
              {user.usage.wordsGenerated.toLocaleString()} / {
                user.usage.wordsLimit === -1 
                  ? 'Unlimited' 
                  : user.usage.wordsLimit.toLocaleString()
              }
            </span>
          </div>
          {user.usage.wordsLimit !== -1 && (
            <div className="w-full bg-gray-700/50 rounded-full h-2 backdrop-blur-xl">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/30 backdrop-blur-xl rounded-lg p-3 border border-white/5">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-xs">Content Created</span>
            </div>
            <p className="text-white font-semibold">12</p>
          </div>
          <div className="bg-gray-700/30 backdrop-blur-xl rounded-lg p-3 border border-white/5">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-xs">This Month</span>
            </div>
            <p className="text-white font-semibold">{user.usage.wordsGenerated.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button 
          onClick={handleSettings}
          className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-xl border border-transparent hover:border-white/10"
        >
          <Settings className="w-5 h-5" />
          <span>Account Settings</span>
        </button>
        
        {user.plan === 'starter' && (
          <button 
            onClick={handleUpgrade}
            className="w-full flex items-center space-x-3 p-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-xl border border-transparent hover:border-purple-500/20"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade Plan</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;