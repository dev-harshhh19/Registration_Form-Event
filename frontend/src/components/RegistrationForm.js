import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCalendar, FaUsers, FaGithub, FaRocket, FaCheck, FaLock, FaStar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Wrapper component to handle reCAPTCHA loading
const RegistrationForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    // Check if reCAPTCHA is loaded
    if (executeRecaptcha) {
      setRecaptchaLoaded(true);
      console.log('reCAPTCHA loaded successfully');
    } else {
      console.log('reCAPTCHA not loaded yet');
    }
    console.log('executeRecaptcha function:', typeof executeRecaptcha);
  }, [executeRecaptcha]);

  // If reCAPTCHA is not loaded after a certain time, show a warning
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!recaptchaLoaded) {
        console.warn('reCAPTCHA failed to load. This may affect form submission.');
        toast('reCAPTCHA is taking longer to load than expected. Please disable ad blockers if you have them enabled.', {
          duration: 6000,
          icon: '⚠️'
        });
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, [recaptchaLoaded]);

  // Do not log reCAPTCHA site key to console to avoid noise

  return <RegistrationFormContent recaptchaLoaded={recaptchaLoaded} executeRecaptcha={executeRecaptcha} />;
};

const RegistrationFormContent = ({ recaptchaLoaded, executeRecaptcha }) => {
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
  const [seminarInfo, setSeminarInfo] = useState(null);

  // Fetch seminar information
  useEffect(() => {
    const fetchSeminarInfo = async () => {
      try {
        const response = await axios.get('/api/seminar-info');
        setSeminarInfo(response.data.data);
      } catch (error) {
        // If the endpoint is not found (404) it's ok — treat as "coming soon"
        if (error.response?.status === 404) {
          console.warn('Seminar info endpoint not found (404) — using fallback');
          setSeminarInfo(null);
          return;
        }

        // Log other errors for debugging but avoid leaking sensitive data
        console.error('Failed to fetch seminar info:', error.message || error);
      }
    };

    fetchSeminarInfo();
  }, []);

  // Simulate loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required.';
        else if (value.trim().length < 3) error = 'Full Name must be at least 3 characters.';
        // Allow unicode letters, spaces and common name punctuation (.,' -)
        else if (!/^[\p{L}\s.'-]+$/u.test(value.trim())) error = 'Name contains invalid characters.';
        break;
      case 'email':
        if (!value.trim()) error = 'College Email ID is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone Number is required.';
        else {
          const digits = value.replace(/[^0-9]/g, '');
          if (digits.length < 10 || digits.length > 15) error = 'Phone number must contain between 10 and 15 digits.';
        }
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

  // Simple client-side sanitization to remove tags and trim inputs
  const sanitizeInput = (value) => {
    if (typeof value === 'string') {
      // remove any HTML tags and excessive whitespace
      return value.replace(/<[^>]*>?/gm, '').trim();
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Execute reCAPTCHA
    console.log('Checking reCAPTCHA availability:', typeof executeRecaptcha);
    if (!executeRecaptcha) {
        console.error('reCAPTCHA not loaded yet!');
        toast.error('reCAPTCHA not ready. Please try again.');
        setIsSubmitting(false);
        return;
    }
    
    try {
      console.log('Executing reCAPTCHA...');
      const recaptchaToken = await executeRecaptcha('registration_form_submit');
      console.log('reCAPTCHA token received:', recaptchaToken ? 'Yes' : 'No');
      
      // Check if we got a valid token
      if (!recaptchaToken) {
        console.error('Failed to get reCAPTCHA token');
        toast.error('reCAPTCHA verification failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Sanitize form data before sending to backend
      const sanitized = {};
      Object.keys(formData).forEach((k) => {
        const v = formData[k];
        sanitized[k] = typeof v === 'boolean' ? v : sanitizeInput(v);
      });

      const response = await axios.post('/api/registration', { ...sanitized, recaptchaToken });
      
      if (response.data.success) {
        setShowSuccess(true);
        toast.success('Registration successful!');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      // In development, print full server error payload to help debugging
      if (process.env.NODE_ENV !== 'production') {
        console.error('Registration error (full):', error);
        console.debug('Server response data:', error.response?.data);
        if (Array.isArray(error.response?.data?.errors)) {
          try {
            console.groupCollapsed('API validation errors');
            console.table(error.response.data.errors.map(e => ({ field: e.field, message: e.message, value: e.value })));
            console.groupEnd();
          } catch (inner) {
            console.debug('Could not print table of errors', inner);
          }
        }
      }

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
          // In dev show a toast for each field error (helps quick debugging)
          if (process.env.NODE_ENV !== 'production') {
            toast.error(`${err.field}: ${err.message}`);
          }
        });
        setErrors(apiErrors);
        toast.error('Please correct the highlighted errors.');
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        // Show detailed message in dev, but keep friendly message in production
        toast.error(process.env.NODE_ENV !== 'production' ? `${errorMessage} (${JSON.stringify(error.response?.data)})` : errorMessage);
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center animate-pulse">
              <FaRocket className="text-white text-2xl animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in">Prompt Your Future</h2>
          <div className="flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-slate-400 mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center bg-secondary-800/50 backdrop-blur-lg rounded-2xl p-8 border border-secondary-700 shadow-2xl">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-6">
              <FaLock className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-amber-500 mb-3">Registration Temporarily Closed</h3>
            <p className="text-slate-300 mb-6">{maintenanceInfo?.message || 'Registration is temporarily closed due to maintenance activities.'}</p>
            
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-5 mb-6">
              <h4 className="text-lg font-semibold text-amber-500 mb-3 flex items-center justify-center">
                <FaStar className="mr-2" /> Need Urgent Registration?
              </h4>
              <p className="text-slate-300 mb-4">Contact us directly on WhatsApp for immediate assistance:</p>
              <a
                href={maintenanceInfo?.contactInfo?.whatsappLink || 'https://wa.me/919156633236'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg"
              >
                📞 Contact on WhatsApp
              </a>
            </div>
            
            <button
              onClick={() => setMaintenanceMode(false)}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center bg-secondary-800/50 backdrop-blur-lg rounded-2xl p-8 border border-secondary-700 shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <FaCheck className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-500 mb-3">Registration Successful!</h3>
            <p className="text-slate-300 mb-2">Thank you for registering!</p>
            <p className="text-slate-400 text-sm mb-6">Please check your email for seminar details and updates.</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-400 mb-6">
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
                setErrors({});
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 shadow-lg"
            >
              Register Another Person
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl mb-6 shadow-lg transform rotate-3 animate-float border border-primary-600">
            <FaRocket className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-300 via-primary-200 to-primary-400 bg-clip-text text-transparent mb-3">
            Prompt Your Future
          </h1>
          <p className="text-xl text-slate-300 mb-3">Learn Prompt Engineering & Build Your First Portfolio</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center bg-secondary-800/50 px-3 py-1.5 rounded-full border border-secondary-700">
              <FaCalendar className="mr-2 text-primary-400" />
              {seminarInfo?.date ? `Coming on ${new Date(seminarInfo.date).toLocaleDateString()}` : 'Coming Soon'}
            </span>
            <span className="flex items-center bg-secondary-800/50 px-3 py-1.5 rounded-full border border-secondary-700">
              <FaUsers className="mr-2 text-primary-400" />Limited Seats
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-secondary-700 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaUser className="inline mr-2" />Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.fullName ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm`}
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaUser className="text-slate-500" />
                </div>
              </div>
              {errors.fullName && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.fullName}</div>}
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaEnvelope className="inline mr-2" />College Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.email ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm`}
                  placeholder="your.email@college.edu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaEnvelope className="text-slate-500" />
                </div>
              </div>
              {errors.email && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaPhone className="inline mr-2" />Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                    // allow longer inputs (country codes, separators) — validation will strip non-digits
                  className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.phone ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm`}
                  placeholder="1234567890"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaPhone className="text-slate-500" />
                </div>
              </div>
              {errors.phone && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.phone}</div>}
            </div>

            {/* Branch and Year Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Branch */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                  <FaGraduationCap className="inline mr-2" />Branch
                </label>
                <div className="relative">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.branch ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 appearance-none backdrop-blur-sm`}
                  >
                    <option value="" className="bg-secondary-900">Select Branch</option>
                    <option value="IT" className="bg-secondary-900">IT</option>
                    <option value="Computer Science" className="bg-secondary-900">Computer Science</option>
                    <option value="Cybersecurity" className="bg-secondary-900">Cybersecurity</option>
                    <option value="Data Science" className="bg-secondary-900">Data Science</option>
                    <option value="Other" className="bg-secondary-900">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <FaGraduationCap className="text-slate-500" />
                  </div>
                </div>
                {errors.branch && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.branch}</div>}
              </div>

              {/* Year */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                  <FaCalendar className="inline mr-2" />Year of Study
                </label>
                <div className="relative">
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 bg-secondary-900/50 border ${errors.yearOfStudy ? 'border-red-700/50' : 'border-secondary-700'} rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 appearance-none backdrop-blur-sm`}
                  >
                    <option value="" className="bg-secondary-900">Select Year</option>
                    <option value="1st Year" className="bg-secondary-900">1st Year</option>
                    <option value="2nd Year" className="bg-secondary-900">2nd Year</option>
                    <option value="3rd Year" className="bg-secondary-900">3rd Year</option>
                    <option value="4th Year" className="bg-secondary-900">4th Year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <FaCalendar className="text-slate-500" />
                  </div>
                </div>
                {errors.yearOfStudy && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.yearOfStudy}</div>}
              </div>
            </div>

            {/* Workshop Attendance */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-3 group-focus-within:text-primary-300 transition-colors">
                <FaUsers className="inline mr-2" />Will you attend the Workshop?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center cursor-pointer group/radio p-4 bg-secondary-900/50 rounded-xl border border-secondary-700 hover:border-primary-500/50 transition-all duration-300">
                  <input
                    type="radio"
                    name="workshopAttendance"
                    value="Yes"
                    checked={formData.workshopAttendance === 'Yes'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-500 rounded-full mr-3 group-hover/radio:border-primary-400 transition-colors relative flex-shrink-0">
                    <div className={`absolute inset-1 bg-primary-500 rounded-full scale-0 transition-transform duration-200 ${formData.workshopAttendance === 'Yes' ? 'scale-100' : ''}`}></div>
                  </div>
                  <span className="text-slate-200 group-hover/radio:text-primary-300 transition-colors">Yes, I'm excited!</span>
                </label>
                <label className="flex items-center cursor-pointer group/radio p-4 bg-secondary-900/50 rounded-xl border border-secondary-700 hover:border-primary-500/50 transition-all duration-300">
                  <input
                    type="radio"
                    name="workshopAttendance"
                    value="No"
                    checked={formData.workshopAttendance === 'No'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-500 rounded-full mr-3 group-hover/radio:border-primary-400 transition-colors relative flex-shrink-0">
                    <div className={`absolute inset-1 bg-primary-500 rounded-full scale-0 transition-transform duration-200 ${formData.workshopAttendance === 'No' ? 'scale-100' : ''}`}></div>
                  </div>
                  <span className="text-slate-200 group-hover/radio:text-primary-300 transition-colors">Not sure yet</span>
                </label>
              </div>
              {errors.workshopAttendance && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.workshopAttendance}</div>}
            </div>

            {/* GitHub Username */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 group-focus-within:text-primary-300 transition-colors">
                <FaGithub className="inline mr-2" />GitHub Username <span className="text-slate-500 text-xs"></span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="githubUsername"
                  value={formData.githubUsername}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-secondary-900/50 border border-secondary-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="your-github-username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FaGithub className="text-slate-500" />
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="group">
              <label className="flex items-start cursor-pointer group/checkbox p-4 bg-secondary-900/50 rounded-xl border border-secondary-700 hover:border-primary-500/50 transition-all duration-300">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 border-slate-500 rounded mr-3 mt-0.5 group-hover/checkbox:border-primary-400 transition-colors relative flex-shrink-0 ${formData.consent ? 'bg-primary-500 border-primary-500' : ''}`}>
                  {formData.consent && <FaCheck className="text-white text-xs absolute inset-0 flex items-center justify-center" />}
                </div>
                <span className="text-slate-200 group-hover/checkbox:text-primary-300 transition-colors text-sm">
                  I agree to receive emails regarding the seminar and workshop. I understand that this will help me stay updated with important information.
                </span>
              </label>
              {errors.consent && <div className="text-red-500 text-sm mt-1.5 flex items-center"><FaStar className="mr-1 text-xs" />{errors.consent}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting || !executeRecaptcha}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 shadow-primary-500/20 border border-primary-600"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : !executeRecaptcha ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
        <div className="text-center mt-8 text-slate-500 animate-fade-in">
          <p className="text-sm">Powered by AI & Innovation</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;