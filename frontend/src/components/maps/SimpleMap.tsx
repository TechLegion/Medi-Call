import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface SimpleMapProps {
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  height?: string;
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  location, 
  height = "400px", 
  className = "w-full" 
}) => {
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`} style={{ minHeight: height }}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {location.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {location.address}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
          </p>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleGetDirections}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="h-5 w-5" />
            Get Directions on Google Maps
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            <strong>Note:</strong> Interactive map requires Google Maps API key. 
            Click "Get Directions" to open in Google Maps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap; 