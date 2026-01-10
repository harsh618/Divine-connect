import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ success: true, places: [] });
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ error: 'Google API key not configured.' }, { status: 500 });
    }

    // Use Geocoding API to search for places
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
    );
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      return Response.json({ success: true, places: [] });
    }

    // Get timezone for each result
    const timestamp = Math.floor(Date.now() / 1000);
    
    const places = await Promise.all(
      geocodeData.results.slice(0, 5).map(async (result) => {
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        
        // Get timezone
        const tzResponse = await fetch(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${googleApiKey}`
        );
        const tzData = await tzResponse.json();
        
        const timezoneOffset = tzData.status === 'OK' 
          ? ((tzData.rawOffset + tzData.dstOffset) / 3600).toString()
          : '5.5'; // Default to IST

        return {
          description: result.formatted_address,
          formatted_address: result.formatted_address,
          latitude: lat,
          longitude: lng,
          timezone: timezoneOffset
        };
      })
    );

    return Response.json({ success: true, places });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});