import React, { useState } from 'react';
import { 
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaSave, FaTimes, FaEdit, FaUserShield, FaKey,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaUserShield className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin Profile Settings</h2>
                <p className="text-blue-100 text-sm">Manage your account information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaEdit className="text-sm" />
                <span>Profile Information</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaKey className="text-sm" />
                <span>Change Password</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <FaUser className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Personal Information</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Update your username and email address. These changes will be reflected immediately.
                </p>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <FaUser className="inline mr-2 text-blue-500" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      profileErrors.username
                        ? 'border-red-400 bg-red-50'
                        : profileData.username !== user?.username
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                  {profileData.username !== user?.username && !profileErrors.username && (
                    <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                  {profileErrors.username && (
                    <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {profileErrors.username && (
                  <p className="text-red-500 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <FaEnvelope className="inline mr-2 text-green-500" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      profileErrors.email
                        ? 'border-red-400 bg-red-50'
                        : profileData.email !== user?.email
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                  {profileData.email !== user?.email && !profileErrors.email && (
                    <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                  {profileErrors.email && (
                    <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {profileErrors.email && (
                  <p className="text-red-500 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProfileLoading || (profileData.username === user?.username && profileData.email === user?.email)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  <FaSave className="text-sm" />
                  <span>{isProfileLoading ? 'Updating...' : 'Update Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-3 mb-2">
                  <FaLock className="text-orange-600" />
                  <h3 className="font-semibold text-gray-800">Security Update</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Choose a strong password that you haven't used elsewhere. Minimum 6 characters required.
                </p>
              </div>

              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <FaLock className="inline mr-2 text-red-500" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.currentPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <FaKey className="inline mr-2 text-green-500" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1" />
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
                                  ? 'bg-red-400'
                                  : strength === 2
                                  ? 'bg-yellow-400'
                                  : strength === 3
                                  ? 'bg-blue-400'
                                  : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      Include uppercase, numbers, and symbols for a stronger password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <FaCheck className="inline mr-2 text-blue-500" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.confirmPassword 
                        ? 'border-red-400 bg-red-50' 
                        : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && !passwordErrors.confirmPassword && (
                  <p className="text-green-500 text-sm flex items-center">
                    <FaCheck className="mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
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
