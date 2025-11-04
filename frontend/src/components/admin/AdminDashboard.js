import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaDownload, FaSearch, FaTrash, 
  FaSignOutAlt, FaUser, FaEnvelope,
  FaCalendar, FaEye, FaTimes,
  FaClock, FaChevronDown,
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

  const COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-black">
      {/* Header */}
      <header className="bg-secondary-800/50 backdrop-blur-lg border-b border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <span className="ml-4 text-xs bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2 py-1 rounded-full">Updated Version</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <FaUser />
                <span className="hidden sm:inline">{user?.username}</span>
              </div>
              
              {/* Seminar Settings Button - Always Visible */}
              <button
                onClick={() => {
                  console.log('Seminar Settings button clicked');
                  setShowSeminarSettings(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-primary-500/20 transform hover:scale-[1.02] border border-primary-600"
                title="Manage Seminar Settings"
                style={{ minWidth: '140px' }} // Ensure minimum width
              >
                <FaCalendar className="text-base" />
                <span>Seminar Settings</span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-800 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-rose-500/20 transform hover:scale-[1.02] border border-rose-700"
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
        <div className="bg-gradient-to-br from-secondary-800/50 to-secondary-900/50 rounded-2xl shadow-2xl p-8 mb-8 border border-secondary-700 backdrop-blur-xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 to-primary-800/10 backdrop-blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary-600/10 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-xl border border-primary-600">
                    <FaUserShield className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center border border-green-600">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.username || 'Admin'}
                  </h2>
                  <p className="text-primary-400 text-lg">System Administrator & Security Manager</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center text-sm text-green-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </span>
                    <span className="text-sm text-slate-400">
                      Last login: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowAdminProfileSettings(true)}
                  className="flex items-center space-x-2 px-5 py-3 bg-secondary-900/50 backdrop-blur-sm text-white rounded-xl hover:bg-secondary-900/70 transition-all duration-300 border border-secondary-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <FaUser className="text-lg" />
                  <span className="font-medium">Profile Settings</span>
                </button>
              </div>
            </div>
            
            {/* Profile Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary-900/50 backdrop-blur-sm p-5 rounded-xl border border-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-secondary-900/70">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-900/50 rounded-lg border border-primary-800">
                    <FaUser className="text-primary-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-300 mb-1">Username</p>
                    <p className="text-white font-bold text-lg">{user?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary-900/50 backdrop-blur-sm p-5 rounded-xl border border-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-secondary-900/70">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-900/50 rounded-lg border border-green-800">
                    <FaEnvelope className="text-green-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-300 mb-1">Email</p>
                    <p className="text-white font-bold text-lg truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              
              <div className="bg-secondary-900/50 backdrop-blur-sm p-5 rounded-xl border border-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-secondary-900/70">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-900/50 rounded-lg border border-purple-800">
                    <FaCog className="text-purple-400 text-xl animate-spin-slow" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-300 mb-1">System Role</p>
                    <p className="text-white font-bold text-lg">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collapsible Admin Control Panel */}
        <div className="bg-secondary-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-secondary-700 mb-8 overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-secondary-800/70 transition-colors"
            onClick={() => setShowAdminControls(!showAdminControls)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-secondary-700 to-secondary-900 rounded-lg border border-secondary-600">
                <FaCog className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Controls</h2>
                <p className="text-slate-400 text-sm">Manage system settings and controls</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-400 font-medium">
                {showAdminControls ? 'Hide' : 'Show'} Controls
              </span>
              {showAdminControls ? 
                <FaChevronUp className="text-slate-400 text-lg transition-transform" /> : 
                <FaChevronDown className="text-slate-400 text-lg transition-transform" />
              }
            </div>
          </div>
          
          {showAdminControls && (
            <div className="px-6 pb-6 border-t border-secondary-700">
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Registration Control */}
                  <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 shadow backdrop-blur-sm">
                    <h3 className="font-semibold text-white mb-2">Registration Control</h3>
                    <p className="text-sm text-slate-400 mb-4">Enable or disable new registrations</p>
                    <button 
                      className={`w-full px-4 py-2.5 rounded-lg transition-all duration-300 font-medium ${registrationEnabled ? 'bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 border border-rose-700' : 'bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 border border-emerald-700'} text-white shadow-lg transform hover:scale-[1.02]`}
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
                      {controlsLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </span>
                      ) : `${registrationEnabled ? 'Disable' : 'Enable'} Registration`}
                    </button>
                  </div>
        
                  {/* Email Control */}
                  <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 shadow backdrop-blur-sm">
                    <h3 className="font-semibold text-white mb-2">Email Service Control</h3>
                    <p className="text-sm text-slate-400 mb-4">Toggle email notifications for registrations</p>
                    <button
                      className={`w-full px-4 py-2.5 rounded-lg transition-all duration-300 font-medium ${emailEnabled ? 'bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 border border-rose-700' : 'bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 border border-emerald-700'} text-white shadow-lg transform hover:scale-[1.02]`}
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
                      {controlsLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </span>
                      ) : `${emailEnabled ? 'Disable' : 'Enable'} Email Service`}
                    </button>
                  </div>
        
                  {/* Send Reminder Emails */}
                  <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 shadow backdrop-blur-sm">
                    <h3 className="font-semibold text-white mb-2">Send Reminders</h3>
                    <p className="text-sm text-slate-400 mb-4">Send reminder emails to all registered users</p>
                    <button
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-lg transform hover:scale-[1.02] border border-amber-700"
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
                      {controlsLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </span>
                      ) : 'Send Reminder Emails'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Current Seminar Information */}
        <div className="bg-secondary-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-secondary-700 mb-8 overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-secondary-800/70 transition-colors"
            onClick={() => setShowSeminarInfo(!showSeminarInfo)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg border border-primary-600">
                <FaCalendar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Current Seminar Information</h2>
                <p className="text-slate-400 text-sm">View and manage seminar details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-400 font-medium">
                {showSeminarInfo ? 'Hide' : 'Show'} Details
              </span>
              {showSeminarInfo ? 
                <FaChevronUp className="text-slate-400 text-lg transition-transform" /> : 
                <FaChevronDown className="text-slate-400 text-lg transition-transform" />
              }
            </div>
          </div>
          
          {showSeminarInfo && (
            <div className="px-6 pb-6 border-t border-secondary-700">
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <FaCalendar className="mr-2 text-primary-400" /> Event Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">Title</p>
                      <p className="text-white font-medium">{seminarInfo.title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Date & Time</p>
                      <p className="text-white font-medium">
                        {seminarInfo.date ? `${new Date(seminarInfo.date).toLocaleDateString()} at ${seminarInfo.time}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="text-white font-medium">{seminarInfo.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary-900/50 p-5 rounded-xl border border-secondary-700 backdrop-blur-sm">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <FaUsers className="mr-2 text-purple-400" /> Capacity & Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">Max Participants</p>
                      <p className="text-white font-medium">{seminarInfo.max_participants || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Duration</p>
                      <p className="text-white font-medium">{seminarInfo.duration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Instructor</p>
                      <p className="text-white font-medium">{seminarInfo.instructor_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Registrations Card */}
          <div className="bg-gradient-to-br from-primary-900/50 to-primary-800/50 rounded-2xl p-6 border border-primary-700 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 bg-primary-900/50 rounded-lg border border-primary-800">
                <FaUsers className="text-primary-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-slate-400 text-sm">Total Registrations</p>
                <p className="text-2xl font-bold text-white">{statistics.totalRegistrations || 0}</p>
              </div>
            </div>
          </div>

          {/* Workshop Attendance Card */}
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-6 border border-purple-700 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-900/50 rounded-lg border border-purple-800">
                <FaCalendar className="text-purple-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-slate-400 text-sm">Workshop Attendance</p>
                <p className="text-2xl font-bold text-white">
                  {statistics.workshopYes || 0} <span className="text-sm font-normal">Yes</span> / {statistics.workshopNo || 0} <span className="text-sm font-normal">No</span>
                </p>
              </div>
            </div>
          </div>

          {/* Today's Registrations Card */}
          <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 rounded-2xl p-6 border border-emerald-700 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-900/50 rounded-lg border border-emerald-800">
                <FaClock className="text-emerald-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-slate-400 text-sm">Today's Registrations</p>
                <p className="text-2xl font-bold text-white">{statistics.todayRegistrations || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Branch Distribution Chart */}
          <div className="bg-secondary-800/50 backdrop-blur-lg rounded-2xl p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-4">Branch Distribution</h3>
            <div className="h-64">
              {statistics.branchStats && statistics.branchStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.branchStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="branch" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                    <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Year Distribution Chart */}
          <div className="bg-secondary-800/50 backdrop-blur-lg rounded-2xl p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-4">Year of Study Distribution</h3>
            <div className="h-64">
              {statistics.yearStats && statistics.yearStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.yearStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ yearOfStudy, percent }) => `${yearOfStudy}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statistics.yearStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-secondary-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-secondary-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-700 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-white">Registrations</h3>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-900/50 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 shadow-lg transform hover:scale-[1.02] border border-emerald-700"
              >
                <FaDownload />
                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-secondary-900/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Workshop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id} className="hover:bg-secondary-800/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{registration.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{registration.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{registration.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{registration.yearOfStudy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${registration.workshopAttendance === 'Yes' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-amber-900/50 text-amber-400 border border-amber-800'}`}>
                        {registration.workshopAttendance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(registration.registrationDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowModal(true);
                          }}
                          className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-900/50 rounded-lg transition-colors border border-transparent hover:border-primary-800"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(registration._id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/50 rounded-lg transition-colors border border-transparent hover:border-rose-800"
                          title="Delete Registration"
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
            <div className="text-center py-12 text-slate-400">
              <FaUsers className="mx-auto text-3xl mb-3 text-slate-600" />
              <p>No registrations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-secondary-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-secondary-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Registration Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <p className="text-white font-medium">{selectedRegistration.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <p className="text-white font-medium">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                  <p className="text-white font-medium">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Branch</label>
                  <p className="text-white font-medium">{selectedRegistration.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Year of Study</label>
                  <p className="text-white font-medium">{selectedRegistration.yearOfStudy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Workshop Attendance</label>
                  <p className="text-white font-medium">{selectedRegistration.workshopAttendance}</p>
                </div>
                {selectedRegistration.githubUsername && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">GitHub Username</label>
                    <p className="text-white font-medium">{selectedRegistration.githubUsername}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Registration Date</label>
                  <p className="text-white font-medium">
                    {new Date(selectedRegistration.registrationDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Sent</label>
                  <p className="text-white font-medium">
                    {selectedRegistration.emailSent ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-rose-400">No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-secondary-700 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-medium shadow-lg transform hover:scale-[1.02] border border-primary-600"
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