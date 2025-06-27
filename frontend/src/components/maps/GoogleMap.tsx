"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  locations?: Location[];
  showDirections?: boolean;
  userLocation?: { lat: number; lng: number };
  className?: string;
  height?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  locations = [],
  showDirections = false,
  userLocation,
  className = "w-full h-96",
  height = "400px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        console.log('🔄 Starting Google Maps load...');
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          console.error('❌ Google Maps API key not configured');
          setError('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
          setIsLoading(false);
          return;
        }

        console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('✅ Google Maps loaded successfully');
        setGoogleLoaded(true);
      } catch (err) {
        console.error('❌ Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google is loaded and container is ready
  useEffect(() => {
    if (!googleLoaded) {
      console.log('⏳ Waiting for Google Maps to load...');
      return;
    }

    if (!mapRef.current) {
      console.log('⏳ Waiting for map container...');
      return;
    }

    const initMap = async () => {
      try {
        console.log('🔄 Initializing map... (attempt', initAttempts + 1, ')');
        setInitAttempts(prev => prev + 1);
        
        // Ensure we have the google object
        if (typeof google === 'undefined') {
          console.error('❌ Google Maps not loaded yet');
          return;
        }

        console.log('✅ Google object available');

        // Create map
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        console.log('✅ Map instance created');

        setMap(mapInstance);

        // Initialize directions service
        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll add our own markers
        });
        
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        console.log('✅ Directions service initialized');
        setIsLoading(false);

        // Trigger resize after a short delay to ensure proper rendering
        setTimeout(() => {
          if (mapInstance) {
            console.log('🔄 Triggering map resize...');
            google.maps.event.trigger(mapInstance, 'resize');
            mapInstance.setCenter(center);
            console.log('✅ Map resize completed');
          }
        }, 300);

      } catch (err) {
        console.error('❌ Error initializing map:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(initMap, 200);
    return () => clearTimeout(timer);
  }, [googleLoaded, center, zoom, initAttempts]);

  // Add markers for locations
  useEffect(() => {
    if (!map || !locations.length) return;

    console.log('🔄 Adding markers for', locations.length, 'locations');

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    locations.forEach((location, index) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
              <circle cx="16" cy="16" r="12" fill="#1E40AF"/>
              <circle cx="16" cy="16" r="8" fill="#DBEAFE"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1F2937;">${location.name}</h3>
            ${location.address ? `<p style="margin: 0; color: #6B7280; font-size: 14px;">${location.address}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    console.log('✅ Markers added successfully');

    // Fit bounds to show all markers
    if (newMarkers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
    }
  }, [map, locations]);

  // Add user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    console.log('🔄 Adding user location marker');
    const userMarker = new google.maps.Marker({
      position: userLocation,
      map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#10B981"/>
            <circle cx="12" cy="12" r="8" fill="#ECFDF5"/>
            <circle cx="12" cy="12" r="4" fill="#10B981"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      }
    });

    return () => {
      userMarker.setMap(null);
    };
  }, [map, userLocation]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !error) {
        console.error('❌ Map loading timeout - switching to fallback');
        setError('Map loading timeout. Please refresh the page or check your internet connection.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, error]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`} style={{ minHeight: height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Loading map...</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Google Maps: {googleLoaded ? '✅ Loaded' : '⏳ Loading...'} | 
            Container: {mapRef.current ? '✅ Ready' : '⏳ Waiting...'} | 
            Attempts: {initAttempts}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`} style={{ minHeight: height }}>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please check your Google Maps API key configuration
          </p>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Location:</strong> {locations[0]?.name || 'Hospital Location'}</p>
            <p><strong>Address:</strong> {locations[0]?.address || 'Address not available'}</p>
            <p><strong>Debug:</strong> Google: {googleLoaded ? 'Loaded' : 'Not loaded'} | Container: {mapRef.current ? 'Ready' : 'Not ready'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: height }}>
      <div 
        ref={mapRef} 
        style={{ 
          height: height,
          width: '100%',
          minHeight: '300px',
          position: 'relative'
        }}
        className="rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
};

export default GoogleMap; 