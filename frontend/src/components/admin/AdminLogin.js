import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaRocket } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-secondary-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl mb-6 shadow-lg transform rotate-3 animate-float border border-primary-600">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400">Enter your credentials to access the dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-secondary-700 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaUser className="inline mr-2" />Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.username ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaUser className="text-slate-500" />
                </div>
              </div>
              {errors.username && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaRocket className="mr-1 text-xs" />{errors.username}</div>}
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaLock className="inline mr-2" />Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.password ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {errors.password && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaRocket className="mr-1 text-xs" />{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 shadow-primary-500/20 border border-primary-600"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaShieldAlt className="mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Back to Registration */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-primary-400 transition-colors text-sm flex items-center justify-center"
            >
              <FaRocket className="mr-2" /> Back to Registration
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 animate-fade-in">
          <p className="text-sm">Secure Admin Access</p>
          <div className="flex items-center justify-center space-x-2 mt-2 text-slate-500">
            <FaShieldAlt className="text-primary-500" />
            <span>Protected Area</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;