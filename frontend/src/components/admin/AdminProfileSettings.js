import React, { useState } from 'react';
import { 
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaSave, FaTimes, FaUserShield, FaKey,
  FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminProfileSettings = ({ onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('profile');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate profile form
  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (profileData.username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      toast.error('Please fix the validation errors');
      return;
    }

    // Check if data has changed
    if (profileData.username === user.username && profileData.email === user.email) {
      toast.info('No changes detected');
      return;
    }

    setIsProfileLoading(true);
    
    try {
      const result = await updateProfile(profileData.username, profileData.email);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        toast.success(result.message);
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaUserShield className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin Profile Settings</h2>
                <p className="text-cyan-100 text-sm">Manage your account information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <FaUser className="inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <FaLock className="inline mr-2" />
            Change Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  <FaUser className="inline mr-2 text-cyan-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      profileErrors.username ? 'border-rose-400 bg-rose-500/10' : 'border-white/20'
                    } text-white placeholder-slate-400`}
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
                {profileErrors.username && (
                  <p className="text-rose-400 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1 text-xs" />
                    {profileErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  <FaEnvelope className="inline mr-2 text-cyan-400" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      profileErrors.email ? 'border-rose-400 bg-rose-500/10' : 'border-white/20'
                    } text-white placeholder-slate-400`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-rose-400 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1 text-xs" />
                    {profileErrors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-400 hover:text-slate-300 font-medium transition-colors rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
                >
                  <FaSave className="text-sm" />
                  <span>{isProfileLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  <FaLock className="inline mr-2 text-rose-400" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      passwordErrors.currentPassword ? 'border-rose-400 bg-rose-500/10' : 'border-white/20'
                    } text-white placeholder-slate-400`}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-rose-400 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1 text-xs" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  <FaKey className="inline mr-2 text-green-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      passwordErrors.newPassword ? 'border-rose-400 bg-rose-500/10' : 'border-white/20'
                    } text-white placeholder-slate-400`}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-rose-400 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1 text-xs" />
                    {passwordErrors.newPassword}
                  </p>
                )}
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => {
                        let strength = 0;
                        if (passwordData.newPassword.length >= 6) strength++;
                        if (/[A-Z]/.test(passwordData.newPassword)) strength++;
                        if (/[0-9]/.test(passwordData.newPassword)) strength++;
                        if (/[^A-Za-z0-9]/.test(passwordData.newPassword)) strength++;
                        
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < strength
                                ? strength === 1
                                  ? 'bg-rose-400'
                                  : strength === 2
                                  ? 'bg-amber-400'
                                  : strength === 3
                                  ? 'bg-cyan-400'
                                  : 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400">
                      Include uppercase, numbers, and symbols for a stronger password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  <FaCheck className="inline mr-2 text-cyan-400" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      passwordErrors.confirmPassword 
                        ? 'border-rose-400 bg-rose-500/10' 
                        : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-white/20'
                    } text-white placeholder-slate-400`}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-rose-400 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1 text-xs" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && !passwordErrors.confirmPassword && (
                  <p className="text-emerald-400 text-sm flex items-center">
                    <FaCheck className="mr-1 text-xs" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-400 hover:text-slate-300 font-medium transition-colors rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-red-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
                >
                  <FaLock className="text-sm" />
                  <span>{isPasswordLoading ? 'Changing...' : 'Change Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSettings;