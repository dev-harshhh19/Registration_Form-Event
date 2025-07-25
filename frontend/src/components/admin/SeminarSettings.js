import React, { useState, useEffect } from 'react';
import { 
  FaCalendar, FaMapMarkerAlt, FaUser, 
  FaSave, FaTimes, FaSpinner, FaWhatsapp,
  FaInfoCircle, FaExclamationTriangle
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

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr; // Already in YYYY-MM-DD format
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading seminar settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaCalendar className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Seminar Settings</h2>
              <p className="text-gray-600">Manage date, time, location and other seminar details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Basic Information
                </h3>
                
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seminar Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={settings.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter seminar title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={settings.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the seminar..."
                  />
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <FaCalendar className="mr-2" />
                  Schedule Information
                </h3>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formatDateForInput(settings.date)}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="time"
                    value={settings.time}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 10:00 AM, 2:30 PM"
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.time}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={settings.duration}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 3 hours, 2.5 hours"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Registration Deadline */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    name="registration_deadline"
                    value={formatDateForInput(settings.registration_deadline)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Location & Contact Information */}
            <div className="space-y-6">
              {/* Location Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Location Information
                </h3>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={settings.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Seminar Hall, First Floor, IT Building"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Max Participants */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={settings.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.max_participants ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="100"
                  />
                  {errors.max_participants && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.max_participants}
                    </p>
                  )}
                </div>
              </div>

              {/* Instructor Information */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Instructor Information
                </h3>

                {/* Instructor Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructor_name"
                    value={settings.instructor_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.instructor_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Instructor full name"
                  />
                  {errors.instructor_name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.instructor_name}
                    </p>
                  )}
                </div>

                {/* Instructor Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="instructor_email"
                    value={settings.instructor_email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.instructor_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="instructor@example.com"
                  />
                  {errors.instructor_email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.instructor_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <FaWhatsapp className="mr-2" />
                  Contact Information
                </h3>

                {/* WhatsApp Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    value={settings.whatsapp_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+919156633236"
                  />
                </div>

                {/* WhatsApp Group Link */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Group Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="whatsapp_group_link"
                    value={settings.whatsapp_group_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-500">
              <FaInfoCircle className="inline mr-1" />
              Changes will be reflected immediately across the entire system
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
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
