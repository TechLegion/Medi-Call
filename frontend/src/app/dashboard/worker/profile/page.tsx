"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient, WorkerProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  license_number: z.string().min(3, "License number is required"),
  specialties: z.string().min(1, "At least one specialty is required"),
  experience_years: z.coerce.number().min(0, "Experience is required"),
  certifications: z.string().optional(),
  hourly_rate: z.coerce.number().min(0, "Hourly rate is required"),
  country: z.string().min(2, "Country is required").max(2, "Invalid country code"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type Availability = {
  [day: string]: string[];
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function WorkerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>(() => {
    const initial: Availability = {};
    DAYS.forEach(day => (initial[day] = []));
    return initial;
  });
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [convertedRate, setConvertedRate] = useState<number | null>(null);
  const [country, setCountry] = useState<string>('US');
  const [rateSource, setRateSource] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getWorkerProfile();
        setProfile(data);
        reset({
          license_number: data.license_number,
          specialties: data.specialties.join(", "),
          experience_years: data.experience_years,
          certifications: data.certifications.join(", "),
          hourly_rate: data.hourly_rate || 0,
          country: data.country || 'US',
        });
        setCountry(data.country || 'US');
        if (data.availability) {
          setAvailability({ ...initialAvailability(), ...data.availability });
        }
        fetchCurrencyAndRate(data.country || 'US');
      } catch (err: any) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  function initialAvailability() {
    const initial: Availability = {};
    DAYS.forEach(day => (initial[day] = []));
    return initial;
  }

  const handleAddTimeRange = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], ""]
    }));
  };

  const handleRemoveTimeRange = (day: string, idx: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx)
    }));
  };

  const handleTimeRangeChange = (day: string, idx: number, value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((v, i) => (i === idx ? value : v))
    }));
  };

  async function fetchCurrencyAndRate(countryCode: string) {
    const countryToCurrency: Record<string, string> = {
      US: 'USD', GB: 'GBP', CA: 'CAD', NG: 'NGN', KE: 'KES', IN: 'INR',
      // ...add more as needed
    };
    const currencyCode = countryToCurrency[countryCode] || 'USD';
    setCurrency(currencyCode);
    setRateSource('');
    if (currencyCode === 'USD') {
      setExchangeRate(1);
      setConvertedRate(null);
      setRateSource('');
      return;
    }
    try {
      // Use backend proxy endpoint for all conversions
      const res = await fetch(`http://localhost:8000/api/currency-rate/?from=USD&to=${currencyCode}`);
      const data = await res.json();
      console.log('Backend currency-rate response:', data);
      const rate = data.rate || 1;
      setExchangeRate(rate);
      setConvertedRate(null);
      setRateSource(data.source || '');
    } catch {
      setExchangeRate(1);
      setConvertedRate(null);
      setRateSource('');
    }
  }

  useEffect(() => {
    if (profile && profile.hourly_rate && exchangeRate && currency !== 'USD') {
      setConvertedRate(Number(profile.hourly_rate) * exchangeRate);
    } else {
      setConvertedRate(null);
    }
  }, [profile, exchangeRate, currency]);

  const onSubmit = async (form: ProfileFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        license_number: form.license_number,
        specialties: form.specialties.split(",").map(s => s.trim()),
        experience_years: form.experience_years,
        certifications: form.certifications ? form.certifications.split(",").map(s => s.trim()) : [],
        availability,
        hourly_rate: form.hourly_rate,
        is_available: true,
        country: form.country,
      };
      if (profile) {
        await apiClient.updateWorkerProfile(payload);
        setSuccess("Profile updated successfully!");
      } else {
        await apiClient.createWorkerProfile(payload);
        setSuccess("Profile created successfully!");
      }
      const updated = await apiClient.getWorkerProfile();
      setProfile(updated);
      reset({
        license_number: updated.license_number,
        specialties: updated.specialties.join(", "),
        experience_years: updated.experience_years,
        certifications: updated.certifications.join(", "),
        hourly_rate: updated.hourly_rate || 0,
        country: updated.country || 'US',
      });
      setAvailability({ ...initialAvailability(), ...updated.availability });
      fetchCurrencyAndRate(updated.country || 'US');
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {profile ? "Edit Worker Profile" : "Create Worker Profile"}
        </h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && (
          <div className="mb-4 text-green-600 flex items-center justify-between">
            <span>{success}</span>
            <button
              className="ml-4 text-blue-600 underline"
              onClick={() => router.push("/dashboard/worker")}
              type="button"
            >
              Go to Dashboard
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Country *</label>
            <select {...register("country")} className="w-full px-3 py-2 border rounded" defaultValue={country} onChange={e => { setCountry(e.target.value); fetchCurrencyAndRate(e.target.value); }}>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="NG">Nigeria</option>
              <option value="KE">Kenya</option>
              <option value="IN">India</option>
            </select>
            {errors.country && <p className="text-red-600 text-sm">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">License Number *</label>
            <input {...register("license_number")}
              className="w-full px-3 py-2 border rounded" />
            {errors.license_number && <p className="text-red-600 text-sm">{errors.license_number.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Specialties (comma separated) *</label>
            <input {...register("specialties")}
              className="w-full px-3 py-2 border rounded" />
            {errors.specialties && <p className="text-red-600 text-sm">{errors.specialties.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Experience Years *</label>
            <input type="number" {...register("experience_years")}
              className="w-full px-3 py-2 border rounded" />
            {errors.experience_years && <p className="text-red-600 text-sm">{errors.experience_years.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Certifications (comma separated)</label>
            <input {...register("certifications")}
              className="w-full px-3 py-2 border rounded" />
            {errors.certifications && <p className="text-red-600 text-sm">{errors.certifications.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Availability *</label>
            <div className="space-y-2">
              {DAYS.map(day => (
                <div key={day} className="mb-2">
                  <div className="font-semibold capitalize">{day}</div>
                  {availability[day].length === 0 && (
                    <button type="button" className="text-blue-600 text-sm" onClick={() => handleAddTimeRange(day)}>
                      + Add time range
                    </button>
                  )}
                  {availability[day].map((range, idx) => (
                    <div key={idx} className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={range}
                        onChange={e => handleTimeRangeChange(day, idx, e.target.value)}
                        placeholder="08:00-12:00"
                        className="w-40 px-2 py-1 border rounded"
                      />
                      <button type="button" className="text-red-500" onClick={() => handleRemoveTimeRange(day, idx)}>
                        Remove
                      </button>
                      {idx === availability[day].length - 1 && (
                        <button type="button" className="text-blue-600" onClick={() => handleAddTimeRange(day)}>
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Hourly Rate ($) *</label>
            <input type="number" step="0.01" {...register("hourly_rate")}
              className="w-full px-3 py-2 border rounded" />
            {errors.hourly_rate && <p className="text-red-600 text-sm">{errors.hourly_rate.message}</p>}
            {currency !== 'USD' && (
              <p className="text-sm text-gray-600 mt-1">
                {rateSource === 'error' || rateSource === ''
                  ? <span className="text-red-500">Conversion unavailable for {currency}</span>
                  : rateSource === 'fallback'
                  ? <span className="text-yellow-600">Using estimated rate for {currency} (may not be current)</span>
                  : <>
                      Converted: <span className="font-semibold">{convertedRate ? convertedRate.toFixed(2) : '...'}</span> {currency} (1 USD = {exchangeRate} {currency})
                      {rateSource && <span className="ml-2 text-xs text-gray-400">Source: {rateSource}</span>}
                    </>
                }
              </p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
            {profile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
} 