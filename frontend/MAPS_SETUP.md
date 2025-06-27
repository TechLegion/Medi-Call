# Google Maps Integration Setup

This guide will help you set up Google Maps integration for the Medi-Call platform.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Maps API key

## Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your Next.js project:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual Google Maps API key.

## Step 3: Features Available

Once configured, the following features will be available:

### Worker Dashboard
- **View on Map**: Each shift card has a "Map" button that opens a modal with the hospital location
- **Get Directions**: Click "Get Directions" to open Google Maps with directions from your current location
- **Location Services**: The app will request your location to provide accurate directions

### Maps Page
- **Interactive Map**: View all hospital locations on an interactive map
- **Hospital Cards**: Each hospital shows contact info, rating, and distance from your location
- **Search & Filter**: Search hospitals by name or filter by specialty
- **Directions**: Get directions to any hospital with one click

### Hospital Dashboard
- **Location Integration**: Hospital locations are displayed with map previews
- **Distance Calculation**: Shows distance from worker locations to your hospital

## Step 4: Customization

### Adding Real Hospital Data

To use real hospital data instead of sample data:

1. Update the `sampleHospitals` array in `/src/app/maps/page.tsx`
2. Add real coordinates for each hospital
3. Connect to your backend API to fetch hospital data

### Styling the Map

You can customize the map appearance by modifying the `GoogleMap` component in `/src/components/maps/GoogleMap.tsx`.

### Adding More Features

Consider adding these features:
- Real-time traffic information
- Public transit directions
- Hospital ratings and reviews
- Parking information
- Accessibility features

## Troubleshooting

### Map Not Loading
- Check that your API key is correct
- Ensure the required APIs are enabled
- Check browser console for errors
- Verify the API key restrictions allow your domain

### Location Not Working
- Ensure HTTPS is enabled (required for geolocation)
- Check browser permissions for location access
- Try refreshing the page and allowing location access

### Performance Issues
- Consider implementing map clustering for many locations
- Use lazy loading for map components
- Optimize API calls with caching

## Security Notes

- Never commit your API key to version control
- Use API key restrictions in Google Cloud Console
- Consider implementing rate limiting
- Monitor API usage to avoid unexpected charges

## Support

For Google Maps API issues, refer to:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps Platform Support](https://developers.google.com/maps/support) 