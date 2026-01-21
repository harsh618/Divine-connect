import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Smart Priest Assignment Algorithm
// 5-factor scoring: Location(30%), Rating(25%), Availability(20%), Specialization(15%), Language(10%)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      pooja_id, 
      temple_id, 
      date, 
      time_slot, 
      user_location, 
      preferred_language,
      booking_type // 'temple_visit' or 'pooja'
    } = await req.json();

    // Get all available priests
    const allPriests = await base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest',
      profile_status: 'approved',
      is_deleted: false 
    });

    // Get pooja details if pooja booking
    let poojaDetails = null;
    if (pooja_id) {
      poojaDetails = await base44.entities.Pooja.filter({ id: pooja_id });
      poojaDetails = poojaDetails[0];
    }

    // Get temple details if temple visit
    let templeDetails = null;
    if (temple_id) {
      templeDetails = await base44.entities.Temple.filter({ id: temple_id });
      templeDetails = templeDetails[0];
    }

    // Calculate scores for each priest
    const priestScores = [];

    for (const priest of allPriests) {
      let totalScore = 0;
      const scoreBreakdown = {};

      // 1. LOCATION SCORE (30 points max)
      let locationScore = 0;
      if (user_location && priest.city) {
        const distance = calculateDistance(user_location, priest.city);
        if (distance <= 10) locationScore = 30;
        else if (distance <= 25) locationScore = 25;
        else if (distance <= 50) locationScore = 20;
        else if (distance <= 100) locationScore = 10;
        else locationScore = 5;
      } else {
        locationScore = 15; // Default if no location data
      }
      scoreBreakdown.location = locationScore;
      totalScore += locationScore;

      // 2. RATING SCORE (25 points max)
      let ratingScore = 0;
      const rating = priest.rating_average || 0;
      const totalConsultations = priest.total_consultations || 0;
      
      if (rating >= 4.8 && totalConsultations >= 50) ratingScore = 25;
      else if (rating >= 4.5 && totalConsultations >= 30) ratingScore = 22;
      else if (rating >= 4.0 && totalConsultations >= 20) ratingScore = 18;
      else if (rating >= 3.5 && totalConsultations >= 10) ratingScore = 15;
      else if (rating >= 3.0) ratingScore = 10;
      else ratingScore = 5;
      
      scoreBreakdown.rating = ratingScore;
      totalScore += ratingScore;

      // 3. AVAILABILITY SCORE (20 points max)
      let availabilityScore = 0;
      const isAvailable = await checkPriestAvailability(base44, priest.id, date, time_slot);
      
      if (isAvailable) {
        availabilityScore = 20;
      } else {
        availabilityScore = 0; // If not available, score is 0
      }
      
      scoreBreakdown.availability = availabilityScore;
      totalScore += availabilityScore;

      // 4. SPECIALIZATION SCORE (15 points max)
      let specializationScore = 0;
      
      if (poojaDetails) {
        // Check if priest specializes in this pooja category
        const priestSpecializations = priest.specializations || [];
        if (priestSpecializations.includes(poojaDetails.category)) {
          specializationScore = 15;
        } else if (priestSpecializations.length > 0) {
          specializationScore = 8;
        } else {
          specializationScore = 5;
        }
      } else if (templeDetails && templeDetails.primary_deity) {
        // Check if priest specializes in temple's deity
        const priestSpecializations = priest.specializations || [];
        if (priestSpecializations.includes(templeDetails.primary_deity.toLowerCase())) {
          specializationScore = 15;
        } else {
          specializationScore = 8;
        }
      } else {
        specializationScore = 10; // Default
      }
      
      scoreBreakdown.specialization = specializationScore;
      totalScore += specializationScore;

      // 5. LANGUAGE SCORE (10 points max)
      let languageScore = 0;
      const priestLanguages = priest.languages || [];
      
      if (preferred_language && priestLanguages.includes(preferred_language.toLowerCase())) {
        languageScore = 10;
      } else if (priestLanguages.includes('hindi') || priestLanguages.includes('english')) {
        languageScore = 7;
      } else {
        languageScore = 5;
      }
      
      scoreBreakdown.language = languageScore;
      totalScore += languageScore;

      // Add to results
      priestScores.push({
        priest_id: priest.id,
        priest_name: priest.display_name,
        priest_mobile: priest.mobile,
        total_score: totalScore,
        score_breakdown: scoreBreakdown,
        rating: rating,
        city: priest.city,
        is_available: availabilityScore > 0
      });
    }

    // Sort by total score (highest first)
    priestScores.sort((a, b) => b.total_score - a.total_score);

    // Filter only available priests
    const availablePriests = priestScores.filter(p => p.is_available);

    return Response.json({
      success: true,
      recommended_priest: availablePriests[0] || null,
      all_options: availablePriests.slice(0, 5), // Top 5 matches
      total_priests_evaluated: allPriests.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper function to calculate approximate distance
function calculateDistance(location1, location2) {
  // Simplified distance calculation
  // In production, use Google Maps API or similar
  // For now, return random for demo (replace with actual logic)
  return Math.floor(Math.random() * 150);
}

// Helper function to check priest availability
async function checkPriestAvailability(base44, priestId, date, timeSlot) {
  try {
    // Check if priest has any bookings at this time
    const existingBookings = await base44.entities.Booking.filter({
      provider_id: priestId,
      date: date,
      time_slot: timeSlot,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (existingBookings.length > 0) {
      return false; // Already booked
    }

    // Check priest's unavailable dates
    const priestProfile = await base44.entities.ProviderProfile.filter({ id: priestId });
    if (priestProfile[0] && priestProfile[0].unavailable_dates) {
      const unavailableDates = priestProfile[0].unavailable_dates || [];
      const isUnavailable = unavailableDates.some(ud => ud.date === date);
      if (isUnavailable) {
        return false;
      }
    }

    return true; // Available
  } catch (error) {
    return false; // Default to not available if error
  }
}