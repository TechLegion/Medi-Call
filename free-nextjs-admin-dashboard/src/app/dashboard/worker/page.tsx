"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  MapPin, 
  Search, 
  Filter,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  TrendingUp,
  Plus,
  LogOut,
  Navigation,
  User
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import GoogleMap from "@/components/maps/GoogleMap";
import ShiftTimeline from "@/components/shifts/ShiftTimeline";
import { filterActiveShifts, getEffectiveShiftStatus } from "@/lib/shiftUtils";
import SimpleMap from "@/components/maps/SimpleMap";

export default function WorkerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { coordinates } = useGeolocation();
  const shifts = useAppStore((s) => s.shifts);
  const applications = useAppStore((s) => s.applications);
  const createApplication = useAppStore((s) => s.createApplication);
  const fetchShifts = useAppStore((s) => s.fetchShifts);
  const fetchApplications = useAppStore((s) => s.fetchApplications);
  
  const [worker, setWorker] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Worker",
    location: "Location",
    completedShifts: 0,
    totalEarnings: 0,
    avgRating: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedShiftForMap, setSelectedShiftForMap] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);

  // Helper to capitalize username
  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // Compute display name for dashboard header
  const displayName = (user?.first_name && user?.last_name && user.first_name.trim() && user.last_name.trim())
    ? `${user.first_name} ${user.last_name}`
    : user?.username ? capitalize(user.username) : "User";

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchShifts();
      fetchApplications();
    }
  }, [user, fetchShifts, fetchApplications]);

  // Debug environment variables
  useEffect(() => {
    console.log('🔍 Environment Debug:');
    console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchShifts();
      fetchApplications();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user, fetchShifts, fetchApplications]);

  // Update worker stats when data changes
  useEffect(() => {
    const completedShifts = applications.filter(app => app.status === 'approved').length;
    const totalEarnings = completedShifts * 85; // Assuming $85/hr average
    const avgRating = 4.5; // This would come from reviews in a real app
    
    setWorker(prev => ({
      ...prev,
      completedShifts,
      totalEarnings,
      avgRating,
      name: displayName
    }));
  }, [applications, displayName]);

  const handleApplyToShift = async (shiftId: number) => {
    try {
      await createApplication({
        shift: shiftId,
        cover_letter: "I'm interested in this position and available for the shift.",
        proposed_rate: null
      });
      // Refresh applications to show the new one
      await fetchApplications();
      setSuccess("Applied to shift successfully!");
    } catch (error) {
      setSuccess(null);
      console.error('Error applying to shift:', error);
    }
  };

  const hasAppliedToShift = (shiftId: number) => {
    return applications.some(app => app.shift.id === shiftId);
  };

  const getApplicationStatus = (shiftId: number) => {
    const application = applications.find(app => app.shift.id === shiftId);
    return application?.status || null;
  };

  const handleViewOnMap = (shift: any) => {
    // For demo purposes, we'll use sample coordinates
    // In a real app, these would come from the shift data
    const sampleCoordinates = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Random location around NYC
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    };
    
    setSelectedShiftForMap({
      ...shift,
      coordinates: sampleCoordinates
    });
    setShowMapModal(true);
    setUseSimpleMap(false); // Reset to Google Maps by default
    setMapError(null); // Clear any previous errors

    // Set a timeout to automatically switch to SimpleMap if Google Maps takes too long
    setTimeout(() => {
      if (!useSimpleMap) {
        console.log('🔄 Auto-switching to SimpleMap due to timeout');
        setMapError('Google Maps loading timeout - switched to Simple Map');
        setUseSimpleMap(true);
      }
    }, 8000); // 8 second timeout
  };

  const handleMapError = (error: string) => {
    console.error('Map error:', error);
    setMapError(error);
    // Automatically switch to SimpleMap after 5 seconds if Google Maps fails
    setTimeout(() => {
      if (mapError) {
        setUseSimpleMap(true);
      }
    }, 5000);
  };

  const stats = [
    {
      title: "Completed Shifts",
      value: worker.completedShifts,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Total Earnings",
      value: `$${worker.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Average Rating",
      value: worker.avgRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    }
  ];

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || getEffectiveShiftStatus(shift) === filterStatus;
    
    // Only show active shifts that haven't ended
    const isActive = getEffectiveShiftStatus(shift) === 'active';
    
    return matchesSearch && matchesStatus && isActive;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access your dashboard
          </h2>
          <a
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      {success && (
        <div className="max-w-2xl mx-auto mt-4 mb-2 p-3 bg-green-100 text-green-800 rounded text-center">
          {success}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName} Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {worker.location}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {worker.avgRating}
                </span>
              </div>
              <button
                onClick={() => setShowViewProfile(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
              <a
                href="/dashboard/worker/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Edit Profile
              </a>
              <button
                onClick={() => {
                  logout();
                  router.push('/auth/signin');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Shifts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Shifts
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search shifts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="filled">Filled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredShifts.map((shift, index) => {
                    const hasApplied = hasAppliedToShift(shift.id);
                    const applicationStatus = getApplicationStatus(shift.id);
                    
                    return (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {shift.role} - {shift.department}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {shift.date} • {shift.start_time} - {shift.end_time}
                            </p>
                            <div className="flex items-center mt-1 space-x-4">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 mr-1" />
                                {shift.hospital.full_address || shift.location || 'Location not specified'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {shift.duration_hours}h
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${shift.pay_per_hour}/hr
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              shift.urgency === 'high' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : shift.urgency === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {shift.urgency} urgency
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {shift.hospital.first_name} {shift.hospital.last_name} • {shift.applicant_count || 0} applicants
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewOnMap(shift)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                            >
                              <Navigation className="h-4 w-4" />
                              Map
                            </button>
                            {!hasApplied && shift.status === 'active' && (
                              <button
                                onClick={() => handleApplyToShift(shift.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                Apply Now
                              </button>
                            )}
                            {hasApplied && applicationStatus === 'pending' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending Review
                              </span>
                            )}
                            {hasApplied && applicationStatus === 'approved' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approved
                              </span>
                            )}
                            {hasApplied && applicationStatus === 'rejected' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejected
                              </span>
                            )}
                            {shift.status === 'filled' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                                Filled
                              </span>
                            )}
                            {shift.status === 'cancelled' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                                Cancelled
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Shift Timeline */}
                        <ShiftTimeline
                          shiftDate={shift.date}
                          startTime={shift.start_time}
                          endTime={shift.end_time}
                          status={shift.status}
                          urgency={shift.urgency}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {filteredShifts.length === 0 && (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No shifts available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check back later for new opportunities
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {application.shift.role}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {application.shift.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            ${application.shift.pay_per_hour}/hr
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {application.shift.hospital.first_name} {application.shift.hospital.last_name}
                        </span>
                        {application.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Pending
                          </span>
                        )}
                        {application.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        )}
                        {application.status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {applications.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No activity yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your application history will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && selectedShiftForMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedShiftForMap.role} - {selectedShiftForMap.department}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedShiftForMap.hospital.first_name} {selectedShiftForMap.hospital.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedShiftForMap.hospital.full_address || selectedShiftForMap.location}
                </p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Debug Info:</strong> Map container should render below
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Coordinates:</strong> {selectedShiftForMap.coordinates.lat}, {selectedShiftForMap.coordinates.lng}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}
                </p>
                {mapError && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Map Error:</strong> {mapError}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                      Switching to Simple Map in 5 seconds...
                    </p>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setUseSimpleMap(false)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      !useSimpleMap 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={() => setUseSimpleMap(true)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      useSimpleMap 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Simple Map
                  </button>
                </div>
              </div>
              
              {/* Try Google Maps first, fallback to SimpleMap */}
              {!useSimpleMap && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <GoogleMap
                  center={selectedShiftForMap.coordinates}
                  zoom={15}
                  locations={[{
                    lat: selectedShiftForMap.coordinates.lat,
                    lng: selectedShiftForMap.coordinates.lng,
                    name: selectedShiftForMap.hospital.first_name + " " + selectedShiftForMap.hospital.last_name,
                    address: selectedShiftForMap.hospital.full_address || selectedShiftForMap.location
                  }]}
                  userLocation={coordinates || undefined}
                  height="400px"
                />
              ) : (
                <SimpleMap
                  location={{
                    name: selectedShiftForMap.hospital.first_name + " " + selectedShiftForMap.hospital.last_name,
                    address: selectedShiftForMap.hospital.full_address || selectedShiftForMap.location,
                    coordinates: selectedShiftForMap.coordinates
                  }}
                  height="400px"
                />
              )}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Date:</strong> {selectedShiftForMap.date}</p>
                  <p><strong>Time:</strong> {selectedShiftForMap.start_time} - {selectedShiftForMap.end_time}</p>
                  <p><strong>Pay:</strong> ${selectedShiftForMap.pay_per_hour}/hr</p>
                </div>
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedShiftForMap.coordinates.lat},${selectedShiftForMap.coordinates.lng}`;
                      if (coordinates) {
                        window.open(`${url}&origin=${coordinates.lat},${coordinates.lng}`, '_blank');
                      } else {
                        window.open(url, '_blank');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Worker Profile
                </h2>
                <button
                  onClick={() => setShowViewProfile(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      First Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.first_name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.last_name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Username
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.username || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.phone_number || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Account Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.user_type === 'worker' ? 'Healthcare Worker' : user?.user_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Street Address
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.address || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      City
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.city || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      State
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.state || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Zip Code
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.zip_code || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Country
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.country || "Not set"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Full Address
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.full_address || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Member Since
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Verification Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user?.is_verified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {user?.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href="/dashboard/worker/profile"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                >
                  Edit Profile
                </a>
                <button
                  type="button"
                  onClick={() => setShowViewProfile(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 