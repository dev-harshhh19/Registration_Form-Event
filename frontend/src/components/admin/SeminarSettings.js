import React, { useState, useEffect } from 'react';
import { 
  FaCalendar, FaMapMarkerAlt, FaUser, 
  FaSave, FaTimes, FaWhatsapp,
  FaInfoCircle, FaExclamationTriangle, FaUsers, FaClock
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const SeminarSettings = ({ onClose, onSave }) => {
  const [settings, setSettings] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    duration: '',
    description: '',
    instructor_name: '',
    instructor_email: '',
    max_participants: 100,
    registration_deadline: '',
    whatsapp_number: '',
    whatsapp_group_link: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSeminarSettings();
  }, []);

  const fetchSeminarSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/seminar-settings');
      if (response.data.success) {
        const data = response.data.data;
        setSettings({
          title: data.title || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          duration: data.duration || '',
          description: data.description || '',
          instructor_name: data.instructor_name || '',
          instructor_email: data.instructor_email || '',
          max_participants: data.max_participants || 100,
          registration_deadline: data.registration_deadline || '',
          whatsapp_number: data.whatsapp_number || '',
          whatsapp_group_link: data.whatsapp_group_link || ''
        });
      }
    } catch (error) {
      console.error('Error fetching seminar settings:', error);
      toast.error('Failed to load seminar settings');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!settings.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (settings.title.length < 5 || settings.title.length > 200) {
      newErrors.title = 'Title must be between 5 and 200 characters';
    }

    if (!settings.date.trim()) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(settings.date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }

    if (!settings.time.trim()) {
      newErrors.time = 'Time is required';
    }

    if (!settings.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (settings.location.length < 5 || settings.location.length > 200) {
      newErrors.location = 'Location must be between 5 and 200 characters';
    }

    if (!settings.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!settings.instructor_name.trim()) {
      newErrors.instructor_name = 'Instructor name is required';
    } else if (settings.instructor_name.length < 2 || settings.instructor_name.length > 100) {
      newErrors.instructor_name = 'Instructor name must be between 2 and 100 characters';
    }

    if (!settings.instructor_email.trim()) {
      newErrors.instructor_email = 'Instructor email is required';
    } else if (!/\S+@\S+\.\S+/.test(settings.instructor_email)) {
      newErrors.instructor_email = 'Please enter a valid email address';
    }

    if (!settings.max_participants || settings.max_participants < 1 || settings.max_participants > 1000) {
      newErrors.max_participants = 'Max participants must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put('/api/admin/seminar-settings', settings);
      
      if (response.data.success) {
        toast.success('Seminar settings updated successfully!');
        if (onSave) {
          onSave(); // Call onSave to refresh dashboard data
        } else if (onClose) {
          onClose();
        }
      } else {
        toast.error('Failed to update seminar settings');
      }
    } catch (error) {
      console.error('Error updating seminar settings:', error);
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      }
      toast.error('Failed to update seminar settings');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-secondary-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-secondary-700 shadow-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading seminar settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-secondary-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg border border-primary-600">
              <FaCalendar className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Seminar Settings</h2>
              <p className="text-slate-400">Manage date, time, location and other seminar details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Event Details */}
              <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-primary-400" />
                  Event Details
                </h3>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Seminar Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={settings.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                      errors.title ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                    } text-white placeholder-slate-500`}
                    placeholder="Enter seminar title"
                  />
                  {errors.title && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={settings.date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                        errors.date ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                      } text-white`}
                    />
                    {errors.date && (
                      <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                        <FaExclamationTriangle className="mr-1 text-xs" />
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Time <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={settings.time}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                        errors.time ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                      } text-white`}
                    />
                    {errors.time && (
                      <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                        <FaExclamationTriangle className="mr-1 text-xs" />
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={settings.location}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                        errors.location ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                      } text-white placeholder-slate-500`}
                      placeholder="Seminar venue"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FaClock />
                    </div>
                    <input
                      type="text"
                      name="duration"
                      value={settings.duration}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                        errors.duration ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                      } text-white placeholder-slate-500`}
                      placeholder="e.g., 3 hours"
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={settings.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-secondary-900/50 border border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-white placeholder-slate-500 resize-none"
                    placeholder="Brief description of the seminar"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaWhatsapp className="mr-2 text-green-400" />
                  Contact Information
                </h3>

                {/* WhatsApp Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    value={settings.whatsapp_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary-900/50 border border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-white placeholder-slate-500"
                    placeholder="+919156633236"
                  />
                </div>

                {/* WhatsApp Group Link */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    WhatsApp Group Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="whatsapp_group_link"
                    value={settings.whatsapp_group_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary-900/50 border border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-white placeholder-slate-500"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Capacity Settings */}
              <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaUsers className="mr-2 text-purple-400" />
                  Capacity Settings
                </h3>

                {/* Max Participants */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Maximum Participants <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={settings.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                      errors.max_participants ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                    } text-white placeholder-slate-500`}
                    placeholder="100"
                  />
                  {errors.max_participants && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.max_participants}
                    </p>
                  )}
                </div>

                {/* Registration Deadline */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    name="registration_deadline"
                    value={settings.registration_deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary-900/50 border border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-white"
                  />
                </div>
              </div>

              {/* Instructor Information */}
              <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaUser className="mr-2 text-amber-400" />
                  Instructor Information
                </h3>

                {/* Instructor Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instructor Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructor_name"
                    value={settings.instructor_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                      errors.instructor_name ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                    } text-white placeholder-slate-500`}
                    placeholder="Instructor full name"
                  />
                  {errors.instructor_name && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.instructor_name}
                    </p>
                  )}
                </div>

                {/* Instructor Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instructor Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="instructor_email"
                    value={settings.instructor_email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-secondary-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                      errors.instructor_email ? 'border-rose-400 bg-rose-500/10' : 'border-secondary-700'
                    } text-white placeholder-slate-500`}
                    placeholder="instructor@example.com"
                  />
                  {errors.instructor_email && (
                    <p className="text-rose-500 text-sm mt-1.5 flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" />
                      {errors.instructor_email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-secondary-700 mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-slate-400 flex items-center">
              <FaInfoCircle className="inline mr-2" />
              Changes will be reflected immediately across the entire system
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-secondary-700 rounded-lg text-slate-300 hover:bg-secondary-700 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-medium shadow-lg transform hover:scale-[1.02] disabled:opacity-50 flex items-center space-x-2 border border-primary-600"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeminarSettings;