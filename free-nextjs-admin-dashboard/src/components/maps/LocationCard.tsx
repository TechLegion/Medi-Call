"use client";

import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Globe, Clock, Star } from 'lucide-react';
import GoogleMap from './GoogleMap';

interface LocationCardProps {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  distance?: string;
  coordinates: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  onGetDirections?: (location: { lat: number; lng: number }) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  name,
  address,
  phone,
  website,
  rating,
  distance,
  coordinates,
  userLocation,
  onGetDirections
}) => {
  const [showMap, setShowMap] = useState(false);

  const handleGetDirections = () => {
    if (onGetDirections) {
      onGetDirections(coordinates);
    } else {
      // Open Google Maps in new tab
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      if (userLocation) {
        window.open(`${url}&origin=${userLocation.lat},${userLocation.lng}`, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {name}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{address}</span>
            </div>
            {distance && (
              <div className="flex items-center text-gray-500 dark:text-gray-500 mb-2">
                <Navigation className="h-4 w-4 mr-2" />
                <span className="text-sm">{distance} away</span>
              </div>
            )}
          </div>
          {rating && (
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {rating}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              {phone}
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              <Globe className="h-4 w-4 mr-1" />
              Website
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGetDirections}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <GoogleMap
            center={coordinates}
            zoom={15}
            locations={[{ lat: coordinates.lat, lng: coordinates.lng, name, address }]}
            userLocation={userLocation}
            height="200px"
          />
        </div>
      )}
    </div>
  );
};

export default LocationCard; 