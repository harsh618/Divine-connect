import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { place } = await req.json();

    if (!place) {
      return Response.json({ success: false, error: 'Place is required' });
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ error: 'Google API key not configured.' }, { status: 500 });
    }

    // Use Geocoding API
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${googleApiKey}`
    );
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      return Response.json({ 
        success: false, 
        error: 'Location not found. Please enter a valid city name.' 
      });
    }

    const result = geocodeData.results[0];
    const lat = result.geometry.location.lat;
    const lng = result.geometry.location.lng;

    // Get timezone
    const timestamp = Math.floor(Date.now() / 1000);
    const tzResponse = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${googleApiKey}`
    );
    const tzData = await tzResponse.json();

    if (tzData.status !== 'OK') {
      return Response.json({ 
        success: false, 
        error: 'Failed to determine timezone for this location.' 
      });
    }

    const timezoneOffset = (tzData.rawOffset + tzData.dstOffset) / 3600;

    return Response.json({
      success: true,
      latitude: lat,
      longitude: lng,
      timezone: timezoneOffset.toString(),
      formatted_address: result.formatted_address
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});