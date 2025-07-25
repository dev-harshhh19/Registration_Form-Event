import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCalendar, FaUsers, FaGithub, FaRocket, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RegistrationFormContent = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  // const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    branch: '',
    yearOfStudy: '',
    workshopAttendance: '',
    githubUsername: '',
    consent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);

  // Simulate loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required.';
        else if (value.trim().length < 3) error = 'Full Name must be at least 3 characters.';
        else if (!/^[a-zA-Z\s]+$/.test(value.trim())) error = 'Name should only contain letters and spaces.';
        break;
      case 'email':
        if (!value.trim()) error = 'College Email ID is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone Number is required.';
        else if (!/^\d{10}$/.test(value.trim())) error = 'Phone Number must be exactly 10 digits.';
        break;
      case 'branch':
        if (!value) error = 'Please select your branch.';
        break;
      case 'yearOfStudy':
        if (!value) error = 'Please select your year of study.';
        break;
      case 'workshopAttendance':
        if (!value) error = 'Please select if you will attend the workshop.';
        break;
      case 'consent':
        if (!value) error = 'You must agree to receive emails.';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
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
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Execute reCAPTCHA
    if (!executeRecaptcha) {
        console.error('reCAPTCHA not loaded yet!');
        toast.error('reCAPTCHA not ready. Please try again.');
        setIsSubmitting(false);
        return;
    }
    const recaptchaToken = await executeRecaptcha('registration_form_submit');
    
    try {
      const response = await axios.post('/api/registration', { ...formData, recaptchaToken });
      
      if (response.data.success) {
        setShowSuccess(true);
        toast.success('Registration successful!');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if it's a maintenance mode error
      if (error.response?.status === 503) {
        setMaintenanceMode(true);
        setMaintenanceInfo(error.response.data);
        toast.error('Registration is temporarily unavailable');
        return;
      }
      
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
        toast.error('Please correct the highlighted errors.');
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => 
      typeof value === 'boolean' ? value : value.toString().trim() !== ''
    ) && Object.keys(errors).length === 0;
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center loading-screen">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse-slow flex items-center justify-center">
              <FaRocket className="text-white text-3xl animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-float"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in">Prompt Your Future</h2>
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-300 mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>Loading your future...</p>
        </div>
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center animate-bounce-in">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <FaRocket className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Registration Temporarily Closed</h3>
            <p className="text-gray-300 mb-6">{maintenanceInfo?.message || 'Registration is temporarily closed due to maintenance activities.'}</p>
            
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">🚨 Need Urgent Registration?</h4>
              <p className="text-gray-300 mb-4">Contact us directly on WhatsApp for immediate assistance:</p>
              <a
                href={maintenanceInfo?.contactInfo?.whatsappLink || 'https://wa.me/919156633236'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold"
              >
                📞 Contact on WhatsApp
              </a>
            </div>
            
            <button
              onClick={() => setMaintenanceMode(false)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center animate-bounce-in">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <FaCheck className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Registration Successful!</h3>
            <p className="text-gray-300">Thank you for registering! Please check your email for seminar details and updates.</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
              <FaEnvelope />
              <span>Confirmation email sent</span>
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  branch: '',
                  yearOfStudy: '',
                  workshopAttendance: '',
                  githubUsername: '',
                  consent: false
                });
              }}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Register Another Person
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-bounce-in">
            <FaRocket className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Prompt Your Future
          </h1>
          <p className="text-xl text-gray-300 mb-2">Learn Prompt Engineering & Build Your First Portfolio</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center"><FaCalendar className="mr-2" />Coming Soon</span>
            <span className="flex items-center"><FaUsers className="mr-2" />Limited Seats</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FaUser className="inline mr-2" />Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 ${errors.fullName ? 'border-red-400' : ''}`}
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaUser className="text-gray-400" />
                </div>
              </div>
              {errors.fullName && <div className="text-red-400 text-sm mt-1">{errors.fullName}</div>}
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FaEnvelope className="inline mr-2" />College Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="your.email@college.edu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaEnvelope className="text-gray-400" />
                </div>
              </div>
              {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FaPhone className="inline mr-2" />Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  className={`w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 ${errors.phone ? 'border-red-400' : ''}`}
                  placeholder="1234567890"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaPhone className="text-gray-400" />
                </div>
              </div>
              {errors.phone && <div className="text-red-400 text-sm mt-1">{errors.phone}</div>}
            </div>

            {/* Branch and Year Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <FaGraduationCap className="inline mr-2" />Branch
                </label>
                <div className="relative">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 appearance-none ${errors.branch ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select Branch</option>
                    <option value="IT">IT</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                </div>
                {errors.branch && <div className="text-red-400 text-sm mt-1">{errors.branch}</div>}
              </div>

              {/* Year */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <FaCalendar className="inline mr-2" />Year of Study
                </label>
                <div className="relative">
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 appearance-none ${errors.yearOfStudy ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaCalendar className="text-gray-400" />
                  </div>
                </div>
                {errors.yearOfStudy && <div className="text-red-400 text-sm mt-1">{errors.yearOfStudy}</div>}
              </div>
            </div>

            {/* Workshop Attendance */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-3 group-focus-within:text-blue-400 transition-colors">
                <FaUsers className="inline mr-2" />Will you attend the Workshop?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center cursor-pointer group/radio">
                  <input
                    type="radio"
                    name="workshopAttendance"
                    value="Yes"
                    checked={formData.workshopAttendance === 'Yes'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3 group-hover/radio:border-blue-400 transition-colors relative">
                    <div className={`absolute inset-1 bg-blue-400 rounded-full scale-0 transition-transform duration-200 ${formData.workshopAttendance === 'Yes' ? 'scale-100' : ''}`}></div>
                  </div>
                  <span className="text-gray-200 group-hover/radio:text-blue-400 transition-colors">Yes, I'm excited!</span>
                </label>
                <label className="flex items-center cursor-pointer group/radio">
                  <input
                    type="radio"
                    name="workshopAttendance"
                    value="No"
                    checked={formData.workshopAttendance === 'No'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3 group-hover/radio:border-blue-400 transition-colors relative">
                    <div className={`absolute inset-1 bg-blue-400 rounded-full scale-0 transition-transform duration-200 ${formData.workshopAttendance === 'No' ? 'scale-100' : ''}`}></div>
                  </div>
                  <span className="text-gray-200 group-hover/radio:text-blue-400 transition-colors">Not sure yet</span>
                </label>
              </div>
              {errors.workshopAttendance && <div className="text-red-400 text-sm mt-1">{errors.workshopAttendance}</div>}
            </div>

            {/* GitHub Username */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FaGithub className="inline mr-2" />GitHub Username <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="githubUsername"
                  value={formData.githubUsername}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  placeholder="your-github-username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaGithub className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="group">
              <label className="flex items-start cursor-pointer group/checkbox">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 border-gray-400 rounded mr-3 mt-0.5 group-hover/checkbox:border-blue-400 transition-colors relative flex-shrink-0 ${formData.consent ? 'bg-blue-400 border-blue-400' : ''}`}>
                  {formData.consent && <FaCheck className="text-white text-xs absolute inset-0 flex items-center justify-center" />}
                </div>
                <span className="text-gray-200 group-hover/checkbox:text-blue-400 transition-colors text-sm">
                  I agree to receive emails regarding the seminar and workshop. I understand that this will help me stay updated with important information.
                </span>
              </label>
              {errors.consent && <div className="text-red-400 text-sm mt-1">{errors.consent}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting || !executeRecaptcha}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Processing...
                </span>
              ) : !executeRecaptcha ? (
                <span className="flex items-center justify-center">
                  Loading reCAPTCHA...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaRocket className="mr-2" />
                  Register for Seminar
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm">Powered by AI & Innovation</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFormContent; 