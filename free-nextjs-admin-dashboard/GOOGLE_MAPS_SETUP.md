# Google Maps Setup Guide

## Issue
The worker dashboard shows "Map container not found" and "Please check your Google Maps API key configuration" because the Google Maps API key is not configured.

## Solution

### 1. Create Environment File
Create a `.env.local` file in the `free-nextjs-admin-dashboard` directory with your Google Maps API key:

```bash
# In free-nextjs-admin-dashboard/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

### 2. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 3. Restart Development Server
After adding the API key, restart your Next.js development server:

```bash
cd free-nextjs-admin-dashboard
npm run dev
```

### 4. Test the Map
1. Go to the worker dashboard
2. Click "Map" on any shift card
3. The map should now load properly

## Fallback Solution
If you don't have a Google Maps API key, the app will show a simple location card with a "Get Directions" button that opens Google Maps in a new tab.

## Current Status
- ✅ Backend API updated to include hospital profile data
- ✅ Frontend updated to display correct hospital information
- ✅ SimpleMap fallback component created
- ⏳ Google Maps API key needs to be configured

## Debug Information
The map modal now shows debug information including:
- Whether the API key is present
- The coordinates being used
- Map container status

This will help identify if the issue is with the API key or the map container rendering. 