import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaDownload, FaSearch, FaTrash, 
  FaSignOutAlt, FaUser, FaEnvelope,
  FaCalendar, FaEye, FaTimes, FaMapMarkerAlt,
  FaClock, FaEdit, FaChevronDown,
  FaChevronUp, FaCog, FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SeminarSettings from './SeminarSettings';
import AdminProfileSettings from './AdminProfileSettings';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSeminarSettings, setShowSeminarSettings] = useState(false);
  const [seminarInfo, setSeminarInfo] = useState({});
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [controlsLoading, setControlsLoading] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showSeminarInfo, setShowSeminarInfo] = useState(false);
  const [showAdminProfileSettings, setShowAdminProfileSettings] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
fetchData();
}, []); // eslint-disable-line react-hooks/exhaustive-deps


  const fetchData = async () => {
    try {
      setLoading(true);
      const [registrationsRes, statsRes, seminarRes] = await Promise.all([
        axios.get(`/api/admin/registrations?page=${currentPage}&limit=${itemsPerPage}`),
        axios.get('/api/admin/statistics'),
        axios.get('/api/admin/seminar-settings')
      ]);

      if (registrationsRes.data.success) {
        setRegistrations(registrationsRes.data.data.registrations);
      }

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }

      if (seminarRes.data.success) {
        setSeminarInfo(seminarRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/registrations/${id}`);
      if (response.data.success) {
        toast.success('Registration deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete registration');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete registration');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axios.get('/api/admin/export/csv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 text-sm bg-yellow-200 px-2 py-1 rounded">Updated Version</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaUser />
                <span className="hidden sm:inline">{user?.username}</span>
              </div>
              
              {/* Seminar Settings Button - Always Visible */}
              <button
                onClick={() => {
                  console.log('Seminar Settings button clicked');
                  setShowSeminarSettings(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                title="Manage Seminar Settings"
                style={{ minWidth: '140px' }} // Ensure minimum width
              >
                <FaCalendar className="text-base" />
                <span>Seminar Settings</span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                title="Logout"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Admin Profile Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl shadow-2xl p-8 mb-8 border border-purple-300/20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-400/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl shadow-xl">
                    <FaUserShield className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.username || 'Admin'}
                  </h2>
                  <p className="text-blue-100 text-lg">System Administrator & Security Manager</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center text-sm text-green-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </span>
                    <span className="text-sm text-blue-200">
                      Last login: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowAdminProfileSettings(true)}
                  className="flex items-center space-x-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaUser className="text-lg" />
                  <span className="font-medium">Profile Settings</span>
                </button>
              </div>
            </div>
            
            {/* Profile Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FaUser className="text-blue-300 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-200 mb-1">Username</p>
                    <p className="text-white font-bold text-lg">{user?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <FaEnvelope className="text-green-300 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-200 mb-1">Email</p>
                    <p className="text-white font-bold text-lg truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FaCog className="text-purple-300 text-xl animate-spin-slow" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-200 mb-1">System Role</p>
                    <p className="text-white font-bold text-lg">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collapsible Admin Control Panel */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
            onClick={() => setShowAdminControls(!showAdminControls)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg">
                <FaCog className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin Controls</h2>
                <p className="text-gray-600 text-sm">Manage system settings and controls</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 font-medium">
                {showAdminControls ? 'Hide' : 'Show'} Controls
              </span>
              {showAdminControls ? 
                <FaChevronUp className="text-gray-400 text-lg transition-transform" /> : 
                <FaChevronDown className="text-gray-400 text-lg transition-transform" />
              }
            </div>
          </div>
          
          {showAdminControls && (
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Registration Control */}
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="font-semibold text-gray-800 mb-2">Registration Control</h3>
                    <p className="text-sm text-gray-600 mb-3">Enable or disable new registrations</p>
                    <button 
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      onClick={async () => {
                        try {
                          setControlsLoading(true);
                          const res = await axios.get('/api/admin/registration-control');
                          const currentState = res.data.data?.enabled ?? true;
                          await axios.put('/api/admin/registration-control', { enabled: !currentState });
                          toast.success(`Registration ${currentState ? 'disabled' : 'enabled'} successfully`);
                          setRegistrationEnabled(!currentState);
                          fetchData();
                        } catch (error) {
                          console.error('Failed to toggle registration:', error);
                          toast.error('Failed to toggle registration');
                        } finally {
                          setControlsLoading(false);
                        }
                      }}
                      disabled={controlsLoading}
                    >
                      {controlsLoading ? 'Loading...' : `${registrationEnabled ? 'Disable' : 'Enable'} Registration`}
                    </button>
                  </div>
        
                  {/* Email Control */}
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="font-semibold text-gray-800 mb-2">Email Service Control</h3>
                    <p className="text-sm text-gray-600 mb-3">Toggle email notifications for registrations</p>
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      onClick={async () => {
                        try {
                          setControlsLoading(true);
                          const res = await axios.get('/api/admin/email-control');
                          const currentState = res.data.data?.enabled ?? true;
                          await axios.put('/api/admin/email-control', { enabled: !currentState });
                          toast.success(`Email service ${currentState ? 'disabled' : 'enabled'} successfully`);
                          setEmailEnabled(!currentState);
                          fetchData();
                        } catch (error) {
                          console.error('Failed to toggle email service:', error);
                          toast.error('Failed to toggle email service');
                        } finally {
                          setControlsLoading(false);
                        }
                      }}
                      disabled={controlsLoading}
                    >
                      {controlsLoading ? 'Loading...' : `${emailEnabled ? 'Disable' : 'Enable'} Email Service`}
                    </button>
                  </div>
        
                  {/* Send Reminder Emails */}
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="font-semibold text-gray-800 mb-2">Send Reminders</h3>
                    <p className="text-sm text-gray-600 mb-3">Send reminder emails to all registered users</p>
                    <button
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      onClick={async () => {
                        try {
                          setControlsLoading(true);
                          await axios.post('/api/admin/send-reminders', { type: '24h' });
                          toast.success('Reminder emails sent successfully!');
                        } catch (error) {
                          console.error('Failed to send reminders:', error);
                          toast.error('Failed to send reminder emails');
                        } finally {
                          setControlsLoading(false);
                        }
                      }}
                      disabled={controlsLoading}
                    >
                      {controlsLoading ? 'Sending...' : 'Send Reminder Emails'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Current Seminar Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200 mb-8 overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-blue-100/50 transition-colors"
            onClick={() => setShowSeminarInfo(!showSeminarInfo)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <FaCalendar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Current Seminar Information</h2>
                <p className="text-gray-600 text-sm">View and manage your seminar details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSeminarSettings(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaEdit className="text-sm" />
                <span className="font-medium">Edit</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 font-medium">
                  {showSeminarInfo ? 'Hide' : 'Show'} Details
                </span>
                {showSeminarInfo ? 
                  <FaChevronUp className="text-gray-400 text-lg transition-transform" /> : 
                  <FaChevronDown className="text-gray-400 text-lg transition-transform" />
                }
              </div>
            </div>
          </div>
          
          {showSeminarInfo && (
            <div className="px-6 pb-6 border-t border-blue-200">
              <div className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaCalendar className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Title</p>
                        <p className="text-gray-900 font-semibold text-sm">{seminarInfo.title || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaCalendar className="text-green-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Date</p>
                        <p className="text-gray-900 font-semibold text-sm">
                          {seminarInfo.date ? new Date(seminarInfo.date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaClock className="text-orange-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Time</p>
                        <p className="text-gray-900 font-semibold text-sm">{seminarInfo.time || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FaMapMarkerAlt className="text-red-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                        <p className="text-gray-900 font-semibold text-sm">{seminarInfo.location || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {seminarInfo.description && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FaEdit className="text-gray-600 text-lg" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Description</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{seminarInfo.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.basic?.totalRegistrations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Workshop Yes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.basic?.workshopYes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaUsers className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Workshop No</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.basic?.workshopNo || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaEnvelope className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.basic?.emailsSent || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Branch Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.branch || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Year Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year of Study Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.year || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ yearOfStudy, percent }) => `${yearOfStudy} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(statistics.year || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <FaDownload />
                  <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Workshop</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="font-medium">{registration.fullName}</td>
                    <td>{registration.email}</td>
                    <td>{registration.branch}</td>
                    <td>{registration.yearOfStudy}</td>
                    <td>
                      <span className={`badge ${registration.workshopAttendance === 'Yes' ? 'badge-success' : 'badge-warning'}`}>
                        {registration.workshopAttendance}
                      </span>
                    </td>
                    <td>{new Date(registration.registrationDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(registration._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No registrations found
            </div>
          )}
        </div>
      </div>

      {/* Registration Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Registration Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.yearOfStudy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Workshop Attendance</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.workshopAttendance}</p>
                </div>
                {selectedRegistration.githubUsername && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub Username</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.githubUsername}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRegistration.registrationDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Sent</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRegistration.emailSent ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Seminar Settings Modal */}
      {showSeminarSettings && (
        <SeminarSettings 
          onClose={() => setShowSeminarSettings(false)}
          onSave={() => {
            fetchData(); // Refresh data when settings are saved
            setShowSeminarSettings(false);
          }}
        />
      )}

      {/* Admin Profile Settings Modal */}
      {showAdminProfileSettings && (
        <AdminProfileSettings 
          onClose={() => setShowAdminProfileSettings(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
