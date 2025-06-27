"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building2, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle,
  XCircle,
  LogOut,
  Briefcase,
  Star
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import ShiftTimeline from "@/components/shifts/ShiftTimeline";
import ShiftLifecycleTimeline from "@/components/shifts/ShiftLifecycleTimeline";
import { filterActiveShifts, getEffectiveShiftStatus } from "@/lib/shiftUtils";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const shiftSchema = z.object({
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  pay: z.number().min(1, "Pay must be at least $1"),
  urgency: z.enum(["low", "medium", "high"]),
  requirements: z.string().min(1, "Requirements are required")
});

type ShiftFormData = z.infer<typeof shiftSchema>;

export default function HospitalDashboard() {
  const user = useAppStore((s) => s.user);
  const shifts = useAppStore((s) => s.shifts);
  const applications = useAppStore((s) => s.applications);
  const updateApplication = useAppStore((s) => s.updateApplication);
  const fetchShifts = useAppStore((s) => s.fetchShifts);
  const fetchApplications = useAppStore((s) => s.fetchApplications);
  const createShift = useAppStore((s) => s.createShift);
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();

  // Helper to capitalize
  function capitalize(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // Compute display name for dashboard header
  const displayName = (user?.first_name && user.first_name.trim())
    ? user.first_name
    : user?.username ? capitalize(user.username) : "Hospital";

  const [hospital, setHospital] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Hospital",
    location: user?.full_address || "Location not set",
    postedShifts: 0,
    totalApplicants: 0,
    avgRating: 0
  });
  const [showNewShiftForm, setShowNewShiftForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchShifts();
      fetchApplications();
    }
  }, [user, fetchShifts, fetchApplications]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchShifts();
      fetchApplications();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user, fetchShifts, fetchApplications]);

  // Update hospital stats when data changes
  useEffect(() => {
    const totalApplicants = applications.length;
    const avgRating = 4.5; // This would come from reviews in a real app
    
    setHospital(prev => ({
      ...prev,
      postedShifts: shifts.length,
      totalApplicants,
      avgRating,
      name: displayName,
      location: user?.full_address || "Location not set"
    }));
  }, [shifts, applications, displayName, user?.full_address]);

  const onSubmitShift = async (data: ShiftFormData) => {
    try {
      // Check if hospital location is set
      // if (!hospital.location || hospital.location === "Location not set") {
      //   setSuccess(null);
      //   alert("Please set your hospital location in your profile before posting shifts.");
      //   setShowNewShiftForm(false);
      //   setShowProfileForm(true);
      //   return;
      // }

      // Calculate duration in hours
      const startTime = new Date(`2000-01-01T${data.startTime}`);
      const endTime = new Date(`2000-01-01T${data.endTime}`);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      const shiftData = {
        department: data.department,
        role: data.role,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        duration_hours: durationHours,
        pay_per_hour: data.pay,
        urgency: data.urgency,
        requirements: data.requirements,
        location: "New York, NY", // Temporary hardcoded location
        description: "",
        max_applicants: 10
      };
      
      console.log('Creating shift with data:', shiftData);
      await createShift(shiftData);
      console.log('Shift created successfully');
      await fetchShifts();
      setShowNewShiftForm(false);
      reset();
      setSelectedDate(null);
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      setSuccess("Shift posted successfully!");
    } catch (error) {
      setSuccess(null);
      console.error('Error posting shift:', error);
      alert(`Error posting shift: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleApproveApplicant = async (applicationId: number) => {
    try {
      await updateApplication(applicationId, { status: 'approved' });
      await fetchApplications();
      setSuccess("Application approved.");
    } catch (error) {
      setSuccess(null);
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplicant = async (applicationId: number) => {
    try {
      await updateApplication(applicationId, { status: 'rejected' });
      await fetchApplications();
      setSuccess("Application rejected.");
    } catch (error) {
      setSuccess(null);
      console.error('Error rejecting application:', error);
    }
  };

  const getShiftApplicants = (shiftId: number) => {
    return applications.filter(app => app.shift.id === shiftId);
  };

  const stats = [
    {
      title: "Posted Shifts",
      value: shifts.length,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Total Applicants",
      value: applications.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Avg Rating",
      value: hospital.avgRating.toFixed(1),
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only show active shifts that haven't ended
    const isActive = getEffectiveShiftStatus(shift) === 'active';
    
    return matchesSearch && isActive;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access the dashboard
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName} Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {hospital.location}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowViewProfile(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                View Profile
              </button>
              <button
                onClick={() => setShowNewShiftForm(true)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  hospital.location === "Location not set" 
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Plus className="h-4 w-4" />
                {hospital.location === "Location not set" ? "Set Location First" : "Post New Shift"}
              </button>
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

      {success && (
        <div className="max-w-2xl mx-auto mt-4 mb-2 p-3 bg-green-100 text-green-800 rounded text-center">
          {success}
        </div>
      )}

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
          {/* Active Shifts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Active Shifts
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
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {filteredShifts.map((shift, index) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {shift.role} - {shift.department}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shift.date} • {shift.start_time} - {shift.end_time}
                          </p>
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {shift.applicant_count || 0} applicants
                        </span>
                        <button
                          onClick={() => setSelectedShift(selectedShift === shift.id ? null : shift.id)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                        >
                          {selectedShift === shift.id ? 'Hide' : 'View'} Applicants
                        </button>
                      </div>

                      {/* Shift Timeline */}
                      <ShiftTimeline
                        shiftDate={shift.date}
                        startTime={shift.start_time}
                        endTime={shift.end_time}
                        status={shift.status}
                        urgency={shift.urgency}
                      />

                      {/* Shift Lifecycle Timeline */}
                      <ShiftLifecycleTimeline
                        shiftDate={shift.date}
                        startTime={shift.start_time}
                        endTime={shift.end_time}
                        status={shift.status}
                        urgency={shift.urgency}
                        applicantCount={shift.applicant_count || 0}
                        createdAt={shift.created_at}
                      />

                      {/* Applicants List */}
                      {selectedShift === shift.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Applicants</h4>
                          <div className="space-y-3">
                            {getShiftApplicants(shift.id).map((app) => (
                              <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {app.worker.first_name} {app.worker.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {app.worker.email}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  {app.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleApproveApplicant(app.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleRejectApplicant(app.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {app.status === "approved" && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approved
                                    </span>
                                  )}
                                  {app.status === "rejected" && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Rejected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {getShiftApplicants(shift.id).length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No applicants yet
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {filteredShifts.length === 0 && (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No active shifts
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Get started by posting your first shift
                      </p>
                      <button
                        onClick={() => setShowNewShiftForm(true)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                          hospital.location === "Location not set" 
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        {hospital.location === "Location not set" ? "Set Location First" : "Post Your First Shift"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applicants */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Applicants
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {applications.slice(0, 5).map((applicant, index) => (
                    <motion.div
                      key={applicant.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {applicant.worker.first_name} {applicant.worker.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {applicant.worker.email}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Applied for: {applicant.shift.role}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(applicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {applicant.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveApplicant(applicant.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectApplicant(applicant.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {applicant.status === "approved" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </span>
                      )}
                      {applicant.status === "rejected" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                      )}
                    </motion.div>
                  ))}
                  
                  {applications.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No applicants yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Applicants will appear here when they apply to your shifts
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Shift Modal */}
      {showNewShiftForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Post New Shift
              </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmitShift)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role *
                </label>
                <input
                  {...register("role")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., RN, MD, RT"
                />
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <input
                  {...register("department")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Emergency Department"
                />
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <ReactDatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                      setSelectedDate(date);
                      setValue("date", date ? date.toISOString().split("T")[0] : "");
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholderText="Select date"
                    minDate={new Date()}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency *
                  </label>
                  <select
                    {...register("urgency")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.urgency && <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <ReactDatePicker
                    selected={selectedStartTime}
                    onChange={(date: Date | null) => {
                      setSelectedStartTime(date);
                      setValue("startTime", date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Start Time"
                    dateFormat="HH:mm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholderText="Select start time"
                  />
                  {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time *
                  </label>
                  <ReactDatePicker
                    selected={selectedEndTime}
                    onChange={(date: Date | null) => {
                      setSelectedEndTime(date);
                      setValue("endTime", date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "");
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="End Time"
                    dateFormat="HH:mm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholderText="Select end time"
                  />
                  {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pay per Hour ($) *
                </label>
                <input
                  {...register("pay", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="85"
                />
                {errors.pay && <p className="mt-1 text-sm text-red-600">{errors.pay.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements *
                </label>
                <textarea
                  {...register("requirements")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., RN license, 2+ years experience"
                />
                {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewShiftForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? "Posting..." : "Post Shift"}
                </button>
              </div>
            </form>
          </motion.div>
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
                  Hospital Profile
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
                      Organization Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.first_name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Contact Person
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
                      {user?.user_type === 'hospital' ? 'Hospital' : user?.user_type}
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
                <button
                  type="button"
                  onClick={() => {
                    setShowViewProfile(false);
                    setShowProfileForm(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Edit Profile
                </button>
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

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Hospital Profile
                </h2>
                <button
                  onClick={() => setShowProfileForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                // Update user profile with all form fields
                const updateData = {
                  first_name: formData.get('org_name') as string,
                  last_name: formData.get('contact_name') as string,
                  email: formData.get('email') as string,
                  phone_number: formData.get('phone') as string,
                  address: formData.get('address') as string,
                  city: formData.get('city') as string,
                  state: formData.get('state') as string,
                  zip_code: formData.get('zip_code') as string,
                  country: formData.get('country') as string,
                };
                
                // Call API to update user profile
                await apiClient.updateProfile(updateData);
                
                // Update local state
                setHospital(prev => ({ 
                  ...prev, 
                  name: `${updateData.first_name} ${updateData.last_name}`,
                  location: `${updateData.city}, ${updateData.state}`
                }));
                
                setShowProfileForm(false);
                setSuccess("Profile updated successfully!");
                
                // Refresh user data
                // You might want to add a method to refresh user data in the store
              } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
              }
            }} className="p-6 space-y-4">
              
              {/* Basic Information */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organization Name *
                    </label>
                    <input
                      name="org_name"
                      type="text"
                      defaultValue={user?.first_name || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Hospital Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Person *
                    </label>
                    <input
                      name="contact_name"
                      type="text"
                      defaultValue={user?.last_name || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Contact Person Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="email@hospital.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={user?.phone_number || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+1234567890"
                      required
                    />
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      name="address"
                      type="text"
                      defaultValue={user?.address || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="123 Hospital Street"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <input
                      name="city"
                      type="text"
                      defaultValue={user?.city || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State *
                    </label>
                    <input
                      name="state"
                      type="text"
                      defaultValue={user?.state || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zip Code *
                    </label>
                    <input
                      name="zip_code"
                      type="text"
                      defaultValue={user?.zip_code || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="12345"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      defaultValue={user?.country || "US"}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="NG">Nigeria</option>
                      <option value="KE">Kenya</option>
                      <option value="IN">India</option>
                      <option value="ZA">South Africa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 