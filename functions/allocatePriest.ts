import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Priest Allocation Algorithm
 * Priority Order:
 * 1. Location Match (Proximity to user or Temple)
 * 2. Calendar Availability (Screen time/Free slots)
 * 3. Review Score (Highest rated)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      poojaId, 
      templeId, 
      serviceMode, 
      selectedDate, 
      timeSlot,
      userCity,
      userLocation // { lat, lng } for proximity calculation
    } = await req.json();

    if (!selectedDate || !serviceMode || !timeSlot) {
      return Response.json({ error: 'Missing required fields: selectedDate, serviceMode, timeSlot' }, { status: 400 });
    }

    // Get day of week
    const date = new Date(selectedDate);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[date.getDay()];

    // Step 1: Get all priest profiles that are approved and not deleted
    let priestFilter = {
      provider_type: 'priest',
      profile_status: 'approved',
      is_deleted: false
    };

    // Filter by service mode availability
    if (serviceMode === 'virtual') {
      priestFilter.is_available_online = true;
    } else {
      priestFilter.is_available_offline = true;
    }

    const allPriests = await base44.asServiceRole.entities.ProviderProfile.filter(priestFilter);

    if (allPriests.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No priests available',
        allocatedPriest: null 
      });
    }

    // Step 2: Filter by weekly schedule availability
    let availablePriests = allPriests.filter(priest => {
      const daySchedule = priest.weekly_schedule?.find(s => s.day === dayOfWeek);
      if (!daySchedule || !daySchedule.is_available) return false;

      // Check if the requested time slot falls within any available slot
      const requestedHour = parseInt(timeSlot.split(':')[0]);
      const hasMatchingSlot = daySchedule.slots?.some(slot => {
        const startHour = parseInt(slot.start_time.split(':')[0]);
        const endHour = parseInt(slot.end_time.split(':')[0]);
        return requestedHour >= startHour && requestedHour < endHour;
      });

      return hasMatchingSlot;
    });

    // Step 3: Filter out priests with unavailable dates
    availablePriests = availablePriests.filter(priest => {
      const isUnavailable = priest.unavailable_dates?.some(
        ud => ud.date === selectedDate
      );
      return !isUnavailable;
    });

    // Step 4: Check for existing bookings (slot already booked)
    const existingBookings = await base44.asServiceRole.entities.Booking.filter({
      date: selectedDate,
      time_slot: timeSlot,
      provider_id: { $in: availablePriests.map(p => p.id) },
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      is_deleted: false
    });

    const bookedPriestIds = new Set(existingBookings.map(b => b.provider_id));
    availablePriests = availablePriests.filter(p => !bookedPriestIds.has(p.id));

    if (availablePriests.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No priests available for this slot',
        allocatedPriest: null 
      });
    }

    // Step 5: If temple-based, filter by temple association
    if (serviceMode === 'temple' && templeId) {
      availablePriests = availablePriests.filter(priest => {
        return priest.associated_temples?.some(t => 
          t.temple_id === templeId && t.accepts_temple_visits === true
        );
      });

      if (availablePriests.length === 0) {
        return Response.json({ 
          success: false, 
          message: 'No priests available for this temple',
          allocatedPriest: null 
        });
      }
    }

    // Step 6: Get pooja mapping for price info if poojaId provided
    let priestPoojaMap = {};
    if (poojaId) {
      const mappings = await base44.asServiceRole.entities.PriestPoojaMapping.filter({
        pooja_id: poojaId,
        priest_id: { $in: availablePriests.map(p => p.id) },
        is_active: true,
        is_deleted: false
      });

      mappings.forEach(m => {
        priestPoojaMap[m.priest_id] = m;
      });

      // Only keep priests who can perform this pooja
      if (mappings.length > 0) {
        availablePriests = availablePriests.filter(p => priestPoojaMap[p.id]);
      }
    }

    // Step 7: Apply Priority-based Scoring Algorithm
    const scoredPriests = availablePriests.map(priest => {
      let score = 0;
      let breakdown = {};

      // PRIORITY 1: Location Match (max 100 points)
      let locationScore = 0;
      if (serviceMode === 'in_person' && userCity) {
        // Exact city match
        if (priest.city?.toLowerCase() === userCity.toLowerCase()) {
          locationScore = 100;
        } else {
          // Check if priest travels to user's city (based on travel_radius)
          locationScore = priest.outstation_available ? 50 : 0;
        }
      } else if (serviceMode === 'temple' && templeId) {
        // Check temple association
        const templeAssoc = priest.associated_temples?.find(t => t.temple_id === templeId);
        if (templeAssoc) {
          locationScore = 100;
        }
      } else if (serviceMode === 'virtual') {
        // For virtual, all have equal location score
        locationScore = 100;
      }
      breakdown.location = locationScore;
      score += locationScore * 3; // Weight: 3x for highest priority

      // PRIORITY 2: Calendar Availability / Screen Time (max 100 points)
      const screenTimeScore = Math.min(priest.screen_time_score || 0, 100);
      breakdown.screenTime = screenTimeScore;
      score += screenTimeScore * 2; // Weight: 2x for second priority

      // PRIORITY 3: Review Score (max 100 points)
      const reviewScore = ((priest.rating_average || 4.0) / 5) * 100;
      breakdown.review = Math.round(reviewScore);
      score += reviewScore * 1; // Weight: 1x for third priority

      // Bonus for verified priests
      if (priest.is_verified) {
        score += 20;
        breakdown.verified = 20;
      }

      // Bonus for experience
      const expBonus = Math.min((priest.years_of_experience || 0) * 2, 30);
      score += expBonus;
      breakdown.experience = expBonus;

      return {
        priest,
        totalScore: Math.round(score),
        breakdown,
        poojaMapping: priestPoojaMap[priest.id] || null
      };
    });

    // Sort by score descending
    scoredPriests.sort((a, b) => b.totalScore - a.totalScore);

    // Get the best match
    const bestMatch = scoredPriests[0];

    if (!bestMatch) {
      return Response.json({ 
        success: false, 
        message: 'No matching priests found',
        allocatedPriest: null 
      });
    }

    // Determine price
    let price = null;
    if (bestMatch.poojaMapping) {
      if (serviceMode === 'virtual') {
        price = bestMatch.poojaMapping.price_override_virtual;
      } else if (serviceMode === 'in_person') {
        price = bestMatch.poojaMapping.price_override_in_person;
      } else if (serviceMode === 'temple') {
        price = bestMatch.poojaMapping.price_override_temple;
      }
    }

    // Return allocated priest info
    return Response.json({
      success: true,
      allocatedPriest: {
        id: bestMatch.priest.id,
        display_name: bestMatch.priest.display_name,
        avatar_url: bestMatch.priest.avatar_url,
        city: bestMatch.priest.city,
        years_of_experience: bestMatch.priest.years_of_experience,
        rating_average: bestMatch.priest.rating_average,
        is_verified: bestMatch.priest.is_verified,
        languages: bestMatch.priest.languages,
        specializations: bestMatch.priest.specializations,
        price: price
      },
      allocationScore: bestMatch.totalScore,
      scoreBreakdown: bestMatch.breakdown,
      alternativePriests: scoredPriests.slice(1, 4).map(s => ({
        id: s.priest.id,
        display_name: s.priest.display_name,
        avatar_url: s.priest.avatar_url,
        rating_average: s.priest.rating_average,
        score: s.totalScore
      }))
    });

  } catch (error) {
    console.error('Allocation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});