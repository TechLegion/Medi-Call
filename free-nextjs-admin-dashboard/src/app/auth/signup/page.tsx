"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stethoscope, Building2, Users, Eye, EyeOff, ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

// Add country code map
const COUNTRY_CODES = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  // Add more as needed
];

const workerSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirm: z.string(),
  phone_number: z.string().min(10, "Please enter a valid phone number").max(15, "Phone number too long"),
  license_number: z.string().min(3, "License number is required"),
  specialties: z.string().min(1, "At least one specialty is required"),
  experience_years: z.coerce.number().min(0, "Experience is required"),
  certifications: z.string().optional(),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(3, "Zip code is required"),
  country: z.string().min(2, "Country is required").max(2, "Invalid country code"),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

const hospitalSchema = z.object({
  org_name: z.string().min(2, "Organization name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirm: z.string(),
  license_number: z.string().min(3, "License number is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(3, "Zip code is required"),
  phone: z.string().min(10, "Please enter a valid phone number").max(15, "Phone number too long"),
  website: z.string().optional(),
  departments: z.string().min(1, "At least one department is required"),
  contact_name: z.string().min(2, "Contact name is required"),
  contact_email: z.string().email("Please enter a valid contact email"),
  country: z.string().min(2, "Country is required").max(2, "Invalid country code"),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type WorkerFormData = z.infer<typeof workerSchema>;
type HospitalFormData = z.infer<typeof hospitalSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"worker" | "hospital">("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Country code state
  const [workerCountry, setWorkerCountry] = useState('US');
  const [workerDial, setWorkerDial] = useState('+1');
  const [workerLocalPhone, setWorkerLocalPhone] = useState('');
  const [hospitalCountry, setHospitalCountry] = useState('US');
  const [hospitalDial, setHospitalDial] = useState('+1');
  const [hospitalLocalPhone, setHospitalLocalPhone] = useState('');

  // Worker form
  const workerForm = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
  });

  // Hospital form
  const hospitalForm = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
  });

  const handleWorkerSubmit = async (data: WorkerFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const countryObj = COUNTRY_CODES.find(c => c.code === workerCountry);
      const phone_number = `${countryObj?.dial || ''}${workerLocalPhone}`;
      // Register user with address fields
      const response = await apiClient.register({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        user_type: "worker",
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: workerCountry,
      });
      // Create worker profile
      await apiClient.createWorkerProfile({
        license_number: data.license_number,
        specialties: data.specialties.split(",").map(s => s.trim()),
        experience_years: data.experience_years,
        certifications: data.certifications ? data.certifications.split(",").map(s => s.trim()) : [],
        availability: {},
        hourly_rate: 0,
        country: workerCountry,
        is_available: true,
      });
      router.push("/dashboard/worker");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHospitalSubmit = async (data: HospitalFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const countryObj = COUNTRY_CODES.find(c => c.code === hospitalCountry);
      const phone = `${countryObj?.dial || ''}${hospitalLocalPhone}`;
      // Register user with address fields
      const response = await apiClient.register({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        user_type: "hospital",
        first_name: data.org_name, // Use org name as first_name
        last_name: data.contact_name, // Store contact name as last_name
        phone_number: phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: hospitalCountry,
      });
      // Create hospital profile
      await apiClient.createHospitalProfile({
        hospital_name: data.org_name,
        license_number: data.license_number,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        phone: data.phone,
        website: data.website,
        departments: data.departments.split(",").map(s => s.trim()),
        bed_count: 0,
        country: hospitalCountry,
      });
      router.push("/dashboard/hospital");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">MediCall</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join MediCall and start connecting with healthcare professionals
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-l-lg border-2 transition-all ${userType === "worker" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-blue-300"}`}
            onClick={() => setUserType("worker")}
          >
            <Users className="inline-block h-5 w-5 mr-2" /> Worker
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg border-2 transition-all ${userType === "hospital" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-blue-300"}`}
            onClick={() => setUserType("hospital")}
          >
            <Building2 className="inline-block h-5 w-5 mr-2" /> Hospital
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
          </div>
        )}

        {/* Worker Signup Form */}
        {userType === "worker" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <form onSubmit={workerForm.handleSubmit(handleWorkerSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <select
                  value={workerCountry}
                  onChange={e => {
                    setWorkerCountry(e.target.value);
                    const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                    setWorkerDial(found ? found.dial : '');
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                {workerForm.formState.errors.country && <p className="text-red-600 text-sm">{workerForm.formState.errors.country.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input {...workerForm.register("first_name")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.first_name && <p className="text-red-600 text-sm">{workerForm.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input {...workerForm.register("last_name")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.last_name && <p className="text-red-600 text-sm">{workerForm.formState.errors.last_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input {...workerForm.register("username")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.username && <p className="text-red-600 text-sm">{workerForm.formState.errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input {...workerForm.register("email")} type="email" className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.email && <p className="text-red-600 text-sm">{workerForm.formState.errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <div className="relative">
                    <input {...workerForm.register("password")} type={showPassword ? "text" : "password"} className="w-full px-3 py-2 border rounded pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2">
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {workerForm.formState.errors.password && <p className="text-red-600 text-sm">{workerForm.formState.errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input {...workerForm.register("password_confirm")} type={showConfirmPassword ? "text" : "password"} className="w-full px-3 py-2 border rounded pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {workerForm.formState.errors.password_confirm && <p className="text-red-600 text-sm">{workerForm.formState.errors.password_confirm.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-600 select-none">
                    {workerDial}
                  </span>
                  <input
                    type="tel"
                    value={workerLocalPhone}
                    onChange={e => setWorkerLocalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Local number"
                    maxLength={15}
                    required
                  />
                </div>
                {workerForm.formState.errors.phone_number && <p className="text-red-600 text-sm">{workerForm.formState.errors.phone_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Number *</label>
                <input {...workerForm.register("license_number")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.license_number && <p className="text-red-600 text-sm">{workerForm.formState.errors.license_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialties (comma separated) *</label>
                <input {...workerForm.register("specialties")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.specialties && <p className="text-red-600 text-sm">{workerForm.formState.errors.specialties.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience Years *</label>
                <input type="number" {...workerForm.register("experience_years")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.experience_years && <p className="text-red-600 text-sm">{workerForm.formState.errors.experience_years.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications (comma separated)</label>
                <input {...workerForm.register("certifications")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.certifications && <p className="text-red-600 text-sm">{workerForm.formState.errors.certifications.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input {...workerForm.register("address")} className="w-full px-3 py-2 border rounded" />
                {workerForm.formState.errors.address && <p className="text-red-600 text-sm">{workerForm.formState.errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input {...workerForm.register("city")} className="w-full px-3 py-2 border rounded" />
                  {workerForm.formState.errors.city && <p className="text-red-600 text-sm">{workerForm.formState.errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input {...workerForm.register("state")} className="w-full px-3 py-2 border rounded" />
                  {workerForm.formState.errors.state && <p className="text-red-600 text-sm">{workerForm.formState.errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zip Code *</label>
                  <input {...workerForm.register("zip_code")} className="w-full px-3 py-2 border rounded" />
                  {workerForm.formState.errors.zip_code && <p className="text-red-600 text-sm">{workerForm.formState.errors.zip_code.message}</p>}
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Hospital Signup Form */}
        {userType === "hospital" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <form onSubmit={hospitalForm.handleSubmit(handleHospitalSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <select
                  value={hospitalCountry}
                  onChange={e => {
                    setHospitalCountry(e.target.value);
                    const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                    setHospitalDial(found ? found.dial : '');
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                {hospitalForm.formState.errors.country && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.country.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name *</label>
                <input {...hospitalForm.register("org_name")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.org_name && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.org_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input {...hospitalForm.register("username")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.username && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input {...hospitalForm.register("email")} type="email" className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.email && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <div className="relative">
                    <input {...hospitalForm.register("password")} type={showPassword ? "text" : "password"} className="w-full px-3 py-2 border rounded pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2">
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {hospitalForm.formState.errors.password && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input {...hospitalForm.register("password_confirm")} type={showConfirmPassword ? "text" : "password"} className="w-full px-3 py-2 border rounded pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {hospitalForm.formState.errors.password_confirm && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.password_confirm.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Number *</label>
                <input {...hospitalForm.register("license_number")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.license_number && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.license_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input {...hospitalForm.register("address")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.address && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input {...hospitalForm.register("city")} className="w-full px-3 py-2 border rounded" />
                  {hospitalForm.formState.errors.city && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input {...hospitalForm.register("state")} className="w-full px-3 py-2 border rounded" />
                  {hospitalForm.formState.errors.state && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zip Code *</label>
                  <input {...hospitalForm.register("zip_code")} className="w-full px-3 py-2 border rounded" />
                  {hospitalForm.formState.errors.zip_code && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.zip_code.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-600 select-none">
                    {hospitalDial}
                  </span>
                  <input
                    type="tel"
                    value={hospitalLocalPhone}
                    onChange={e => setHospitalLocalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Local number"
                    maxLength={15}
                    required
                  />
                </div>
                {hospitalForm.formState.errors.phone && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input {...hospitalForm.register("website")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.website && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.website.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departments (comma separated) *</label>
                <input {...hospitalForm.register("departments")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.departments && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.departments.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name *</label>
                <input {...hospitalForm.register("contact_name")} className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.contact_name && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.contact_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email *</label>
                <input {...hospitalForm.register("contact_email")} type="email" className="w-full px-3 py-2 border rounded" />
                {hospitalForm.formState.errors.contact_email && <p className="text-red-600 text-sm">{hospitalForm.formState.errors.contact_email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 