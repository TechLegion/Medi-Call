# Google Maps Setup for Medi-Call Frontend

This guide will help you set up Google Maps integration for the Medi-Call frontend application.

## Prerequisites

1. A Google Cloud Platform account
2. Google Maps JavaScript API enabled
3. A valid API key with the necessary permissions

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Maps JavaScript API

### 2. Create an API Key

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory with your Google Maps API key:

```bash
# In frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Restrict API Key (Recommended)

For security, restrict your API key to:
- Only the Google Maps JavaScript API
- Your domain (for production)
- Localhost (for development)

### 5. Test the Integration

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the maps page to verify the integration is working

## Usage

The Google Maps integration is used in the following components:
- Location selection for shifts
- Hospital location display
- Worker location tracking

## Troubleshooting

- Ensure your API key is valid and has the correct permissions
- Check that the Google Maps JavaScript API is enabled
- Verify your domain restrictions if using them
- Check the browser console for any error messages

## Issue
The worker dashboard shows "Map container not found" and "Please check your Google Maps API key configuration" because the Google Maps API key is not configured.

## Solution

### 1. Create Environment File
Create a `.env.local` file in the `frontend` directory with your Google Maps API key:

```bash
# In frontend/.env.local
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
cd frontend
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