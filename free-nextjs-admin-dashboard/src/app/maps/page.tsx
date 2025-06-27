"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, Filter, Star, Phone, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap from '@/components/maps/GoogleMap';
import LocationCard from '@/components/maps/LocationCard';

// Sample hospital data - in a real app, this would come from your API
const sampleHospitals = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Main Street, Downtown, NY 10001",
    phone: "+1 (555) 123-4567",
    website: "https://citygeneral.com",
    rating: 4.5,
    coordinates: { lat: 40.7589, lng: -73.9851 },
    specialties: ["Emergency", "Cardiology", "Neurology"],
    availableShifts: 5
  },
  {
    id: 2,
    name: "Metropolitan Medical Center",
    address: "456 Park Avenue, Midtown, NY 10022",
    phone: "+1 (555) 234-5678",
    website: "https://metropolitanmed.com",
    rating: 4.2,
    coordinates: { lat: 40.7505, lng: -73.9934 },
    specialties: ["Pediatrics", "Oncology", "Surgery"],
    availableShifts: 3
  },
  {
    id: 3,
    name: "Community Health Hospital",
    address: "789 Broadway, Brooklyn, NY 11201",
    phone: "+1 (555) 345-6789",
    website: "https://communityhealth.org",
    rating: 4.7,
    coordinates: { lat: 40.7021, lng: -73.9872 },
    specialties: ["Family Medicine", "Obstetrics", "Psychiatry"],
    availableShifts: 8
  },
  {
    id: 4,
    name: "University Medical Center",
    address: "321 5th Avenue, Manhattan, NY 10016",
    phone: "+1 (555) 456-7890",
    website: "https://universitymed.edu",
    rating: 4.8,
    coordinates: { lat: 40.7484, lng: -73.9857 },
    specialties: ["Research", "Transplant", "Trauma"],
    availableShifts: 2
  },
  {
    id: 5,
    name: "Regional Medical Center",
    address: "654 Queens Boulevard, Queens, NY 11375",
    phone: "+1 (555) 567-8901",
    website: "https://regionalmed.com",
    rating: 4.3,
    coordinates: { lat: 40.7282, lng: -73.7949 },
    specialties: ["Geriatrics", "Rehabilitation", "Dermatology"],
    availableShifts: 6
  }
];

export default function MapsPage() {
  const { user } = useAuth();
  const { coordinates, error: locationError, isLoading: locationLoading, requestLocation } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Get unique specialties for filter
  const specialties = Array.from(
    new Set(sampleHospitals.flatMap(hospital => hospital.specialties))
  ).sort();

  // Filter hospitals based on search and specialty
  const filteredHospitals = sampleHospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || 
                            hospital.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  // Calculate distances if user location is available
  const hospitalsWithDistance = filteredHospitals.map(hospital => {
    let distance = null;
    if (coordinates) {
      const R = 6371; // Earth's radius in km
      const dLat = (hospital.coordinates.lat - coordinates.lat) * Math.PI / 180;
      const dLon = (hospital.coordinates.lng - coordinates.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coordinates.lat * Math.PI / 180) * Math.cos(hospital.coordinates.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;
      distance = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;
    }
    return { ...hospital, distance };
  });

  // Sort by distance if available
  const sortedHospitals = hospitalsWithDistance.sort((a, b) => {
    if (a.distance && b.distance) {
      const aNum = parseFloat(a.distance.replace('km', '').replace('m', ''));
      const bNum = parseFloat(b.distance.replace('km', '').replace('m', ''));
      return aNum - bNum;
    }
    return 0;
  });

  const handleGetDirections = (hospitalCoordinates: { lat: number; lng: number }) => {
    setSelectedHospital(null);
    setShowDirections(true);
    // The map will show directions to this location
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access the maps
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
                Hospital Locations
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find hospitals near you and get directions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {locationError && (
                <button
                  onClick={requestLocation}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Enable Location
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Interactive Map
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDirections(!showDirections)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      showDirections 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {showDirections ? 'Hide' : 'Show'} Directions
                  </button>
                </div>
              </div>
              
              <GoogleMap
                center={coordinates || { lat: 40.7128, lng: -74.0060 }}
                zoom={coordinates ? 12 : 10}
                locations={sortedHospitals.map(h => ({
                  lat: h.coordinates.lat,
                  lng: h.coordinates.lng,
                  name: h.name,
                  address: h.address
                }))}
                showDirections={showDirections}
                userLocation={coordinates}
                height="500px"
              />

              {locationError && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    {locationError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hospital List */}
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Find Hospitals
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Hospital Cards */}
            <div className="space-y-4">
              {sortedHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LocationCard
                    name={hospital.name}
                    address={hospital.address}
                    phone={hospital.phone}
                    website={hospital.website}
                    rating={hospital.rating}
                    distance={hospital.distance}
                    coordinates={hospital.coordinates}
                    userLocation={coordinates}
                    onGetDirections={handleGetDirections}
                  />
                </motion.div>
              ))}

              {sortedHospitals.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hospitals found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 