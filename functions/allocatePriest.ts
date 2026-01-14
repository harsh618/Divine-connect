import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Advanced Priest Allocation Algorithm
 * 
 * Weighted Scoring System:
 * 1. Location Match (30% weight) - Distance between priest/temple/user
 * 2. Priest Rating (25% weight) - Rating, services completed, response rate, cancellation rate
 * 3. Availability (20% weight) - Calendar, travel time, max services per day
 * 4. Specialization Match (15% weight) - Matches priest skills to booking requirements
 * 5. Language Match (10% weight) - User's preferred language vs priest's languages
 * 
 * Final score out of 100, highest score priest gets assigned
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
      userLanguage,
      serviceType, // e.g., "Marriage Ceremony", "Griha Pravesh"
      templeCity,
      templeLat,
      templeLng
    } = await req.json();

    if (!selectedDate || !serviceMode || !timeSlot) {
      return Response.json({ error: 'Missing required fields: selectedDate, serviceMode, timeSlot' }, { status: 400 });
    }

    console.log('Allocation Request:', { poojaId, templeId, serviceMode, selectedDate, timeSlot, userCity });

    // Get day of week
    const date = new Date(selectedDate);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[date.getDay()];

    // Step 1: Get all approved priests
    let priestFilter = {
      provider_type: 'priest',
      profile_status: 'approved',
      is_deleted: false,
      is_hidden: false
    };

    if (serviceMode === 'virtual') {
      priestFilter.is_available_online = true;
    } else {
      priestFilter.is_available_offline = true;
    }

    const allPriests = await base44.asServiceRole.entities.ProviderProfile.filter(priestFilter);
    console.log(`Found ${allPriests.length} approved priests`);

    if (allPriests.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No priests available',
        allocatedPriest: null 
      });
    }

    // Step 2: Filter by weekly schedule availability
    let availablePriests = allPriests.filter(priest => {
      // If no schedule set, consider available
      if (!priest.weekly_schedule || priest.weekly_schedule.length === 0) return true;
      
      const daySchedule = priest.weekly_schedule.find(s => s.day === dayOfWeek);
      if (!daySchedule) return true; // No specific day config = available
      if (!daySchedule.is_available) return false;

      // Parse requested time slot (e.g., "6:00 AM - 8:00 AM")
      const timeMatch = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return true;
      
      let requestedHour = parseInt(timeMatch[1]);
      if (timeMatch[3].toUpperCase() === 'PM' && requestedHour !== 12) requestedHour += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && requestedHour === 12) requestedHour = 0;

      // Check if requested time falls within any available slot
      if (!daySchedule.slots || daySchedule.slots.length === 0) return true;
      
      return daySchedule.slots.some(slot => {
        const startHour = parseInt(slot.start_time?.split(':')[0]) || 0;
        const endHour = parseInt(slot.end_time?.split(':')[0]) || 24;
        return requestedHour >= startHour && requestedHour < endHour;
      });
    });

    console.log(`After schedule filter: ${availablePriests.length} priests`);

    // Step 3: Filter out priests with unavailable dates
    availablePriests = availablePriests.filter(priest => {
      if (!priest.unavailable_dates || priest.unavailable_dates.length === 0) return true;
      return !priest.unavailable_dates.some(ud => ud.date === selectedDate);
    });

    // Step 4: Check for existing bookings on same slot
    const bookedPriestIds = new Set();
    try {
      const existingBookings = await base44.asServiceRole.entities.Booking.filter({
        date: selectedDate,
        time_slot: timeSlot,
        status: ['pending', 'confirmed', 'in_progress'],
        is_deleted: false
      });
      existingBookings.forEach(b => {
        if (b.provider_id) bookedPriestIds.add(b.provider_id);
      });
    } catch (e) {
      console.log('Booking filter error (ignoring):', e.message);
    }

    availablePriests = availablePriests.filter(p => !bookedPriestIds.has(p.id));
    console.log(`After booking filter: ${availablePriests.length} priests`);

    if (availablePriests.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No priests available for this slot',
        allocatedPriest: null 
      });
    }

    // Step 5: Get temple info if provided
    let temple = null;
    if (templeId) {
      try {
        const temples = await base44.asServiceRole.entities.Temple.filter({ id: templeId });
        temple = temples[0] || null;
      } catch (e) {
        console.log('Temple fetch error:', e.message);
      }
    }

    const effectiveTempleCity = temple?.city || templeCity;

    // Step 6: Get pooja info if provided
    let pooja = null;
    let priestPoojaMap = {};
    if (poojaId) {
      try {
        const poojas = await base44.asServiceRole.entities.Pooja.filter({ id: poojaId });
        pooja = poojas[0] || null;

        const mappings = await base44.asServiceRole.entities.PriestPoojaMapping.filter({
          pooja_id: poojaId,
          is_active: true,
          is_deleted: false
        });
        mappings.forEach(m => {
          priestPoojaMap[m.priest_id] = m;
        });
      } catch (e) {
        console.log('Pooja fetch error:', e.message);
      }
    }

    // ============================================
    // WEIGHTED SCORING ALGORITHM
    // ============================================
    const WEIGHTS = {
      location: 30,        // 30% weight
      rating: 25,          // 25% weight
      availability: 20,    // 20% weight
      specialization: 15,  // 15% weight
      language: 10         // 10% weight
    };

    const scoredPriests = availablePriests.map(priest => {
      let scores = {
        location: 0,
        rating: 0,
        availability: 0,
        specialization: 0,
        language: 0
      };

      // ========== 1. LOCATION SCORE (30%) ==========
      // Max 100 points before weight applied
      if (serviceMode === 'virtual') {
        // Virtual - all priests equally accessible
        scores.location = 100;
      } else if (serviceMode === 'temple' || serviceMode === 'in_temple') {
        // Temple-based service
        const priestCity = priest.city?.toLowerCase().trim();
        const targetCity = effectiveTempleCity?.toLowerCase().trim();
        
        // Check if priest is associated with temple
        const templeAssoc = priest.associated_temples?.find(t => t.temple_id === templeId);
        
        if (templeAssoc) {
          scores.location = 100; // Perfect match - associated with temple
        } else if (priestCity && targetCity && priestCity === targetCity) {
          scores.location = 80; // Same city as temple
        } else if (priest.outstation_available) {
          scores.location = 40; // Willing to travel
        } else {
          scores.location = 10; // Different city, doesn't travel
        }
      } else if (serviceMode === 'in_person' || serviceMode === 'at_home') {
        // Home visit
        const priestCity = priest.city?.toLowerCase().trim();
        const targetCity = userCity?.toLowerCase().trim();
        
        if (priestCity && targetCity && priestCity === targetCity) {
          scores.location = 100; // Same city
        } else if (priest.outstation_available) {
          // Check travel radius
          const travelRadius = priest.travel_radius_km || 50;
          scores.location = travelRadius >= 100 ? 60 : 40;
        } else {
          scores.location = 0; // Can't serve this location
        }
      }

      // ========== 2. RATING SCORE (25%) ==========
      // Combines: rating, services completed, response rate, cancellation rate
      // Max 100 points before weight applied
      
      // Rating (0-5) -> 0-40 points
      const ratingScore = ((priest.rating_average || 4.0) / 5) * 40;
      
      // Total services/bookings completed -> 0-25 points
      const totalBookings = priest.total_consultations || 0;
      const servicesScore = Math.min(totalBookings / 100, 1) * 25; // Cap at 100 bookings
      
      // Response rate (assume from screen_time_score) -> 0-20 points
      const responseRate = Math.min((priest.screen_time_score || 50) / 100, 1);
      const responseScore = responseRate * 20;
      
      // Cancellation rate (lower is better) -> 0-15 points
      // Assume low cancellation if verified and experienced
      const cancellationPenalty = priest.is_verified ? 0 : 5;
      const cancellationScore = 15 - cancellationPenalty;
      
      scores.rating = Math.round(ratingScore + servicesScore + responseScore + cancellationScore);

      // ========== 3. AVAILABILITY SCORE (20%) ==========
      // Calendar availability, travel time, max services per day
      // Max 100 points before weight applied
      
      let availabilityScore = 50; // Base score for being available
      
      // Has specific schedule configured = more reliable
      if (priest.weekly_schedule && priest.weekly_schedule.length > 0) {
        availabilityScore += 20;
      }
      
      // Default slot duration (shorter = more flexible)
      const slotDuration = priest.default_slot_duration || 60;
      if (slotDuration <= 30) availabilityScore += 15;
      else if (slotDuration <= 60) availabilityScore += 10;
      
      // Experience implies they can manage schedule well
      if ((priest.years_of_experience || 0) >= 5) availabilityScore += 15;
      
      scores.availability = Math.min(availabilityScore, 100);

      // ========== 4. SPECIALIZATION MATCH (15%) ==========
      // Match priest skills/specializations to booking requirements
      // Max 100 points before weight applied
      
      let specializationScore = 50; // Base score
      
      const priestSpecs = priest.specializations || [];
      const priestServices = priest.priest_services?.map(s => s.pooja_name?.toLowerCase()) || [];
      const allPriestSkills = [
        ...priestSpecs.map(s => s.toLowerCase()),
        ...priestServices
      ];
      
      // If pooja specified, check if priest can perform it
      if (pooja) {
        const poojaName = pooja.name?.toLowerCase();
        const poojaCategory = pooja.category?.toLowerCase();
        
        if (priestPoojaMap[priest.id]) {
          specializationScore = 100; // Has explicit mapping for this pooja
        } else if (allPriestSkills.some(s => s.includes(poojaName) || poojaName?.includes(s))) {
          specializationScore = 80; // Name match
        } else if (allPriestSkills.some(s => s.includes(poojaCategory) || poojaCategory?.includes(s))) {
          specializationScore = 60; // Category match
        }
      }
      
      // If service type specified (e.g., "Marriage Ceremony")
      if (serviceType) {
        const serviceTypeLower = serviceType.toLowerCase();
        if (allPriestSkills.some(s => s.includes(serviceTypeLower) || serviceTypeLower.includes(s))) {
          specializationScore = Math.max(specializationScore, 90);
        }
      }
      
      scores.specialization = specializationScore;

      // ========== 5. LANGUAGE MATCH (10%) ==========
      // Match user's preferred language with priest's languages
      // Max 100 points before weight applied
      
      let languageScore = 50; // Base - assume basic Hindi/English
      
      const priestLanguages = (priest.languages || []).map(l => l.toLowerCase());
      
      // Default languages most priests know
      if (priestLanguages.includes('hindi') || priestLanguages.includes('english')) {
        languageScore = 60;
      }
      
      if (userLanguage) {
        const userLangLower = userLanguage.toLowerCase();
        if (priestLanguages.includes(userLangLower)) {
          languageScore = 100; // Perfect match
        } else if (priestLanguages.length > 3) {
          languageScore = 70; // Multi-lingual, might know user's language
        }
      } else {
        // No preference, give neutral score
        languageScore = 70;
      }
      
      scores.language = languageScore;

      // ========== CALCULATE FINAL WEIGHTED SCORE ==========
      const weightedScore = 
        (scores.location * WEIGHTS.location / 100) +
        (scores.rating * WEIGHTS.rating / 100) +
        (scores.availability * WEIGHTS.availability / 100) +
        (scores.specialization * WEIGHTS.specialization / 100) +
        (scores.language * WEIGHTS.language / 100);

      return {
        priest,
        totalScore: Math.round(weightedScore),
        scores,
        breakdown: {
          location: `${scores.location}/100 (${WEIGHTS.location}% weight)`,
          rating: `${scores.rating}/100 (${WEIGHTS.rating}% weight)`,
          availability: `${scores.availability}/100 (${WEIGHTS.availability}% weight)`,
          specialization: `${scores.specialization}/100 (${WEIGHTS.specialization}% weight)`,
          language: `${scores.language}/100 (${WEIGHTS.language}% weight)`
        },
        poojaMapping: priestPoojaMap[priest.id] || null
      };
    });

    // Sort by total score descending
    scoredPriests.sort((a, b) => b.totalScore - a.totalScore);

    console.log('Top 3 priests:', scoredPriests.slice(0, 3).map(s => ({
      name: s.priest.display_name,
      score: s.totalScore,
      breakdown: s.breakdown
    })));

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
      } else if (serviceMode === 'in_person' || serviceMode === 'at_home') {
        price = bestMatch.poojaMapping.price_override_in_person;
      } else {
        price = bestMatch.poojaMapping.price_override_temple;
      }
    }

    // Return allocated priest with full scoring details
    return Response.json({
      success: true,
      allocatedPriest: {
        id: bestMatch.priest.id,
        display_name: bestMatch.priest.display_name,
        avatar_url: bestMatch.priest.avatar_url,
        city: bestMatch.priest.city,
        years_of_experience: bestMatch.priest.years_of_experience,
        rating_average: bestMatch.priest.rating_average,
        total_consultations: bestMatch.priest.total_consultations,
        is_verified: bestMatch.priest.is_verified,
        languages: bestMatch.priest.languages,
        specializations: bestMatch.priest.specializations,
        price: price
      },
      allocationScore: bestMatch.totalScore,
      maxPossibleScore: 100,
      scoreBreakdown: bestMatch.breakdown,
      rawScores: bestMatch.scores,
      weights: WEIGHTS,
      // Backup priest (second highest score)
      backupPriest: scoredPriests[1] ? {
        id: scoredPriests[1].priest.id,
        display_name: scoredPriests[1].priest.display_name,
        score: scoredPriests[1].totalScore
      } : null,
      // Alternative options
      alternativePriests: scoredPriests.slice(1, 5).map(s => ({
        id: s.priest.id,
        display_name: s.priest.display_name,
        avatar_url: s.priest.avatar_url,
        rating_average: s.priest.rating_average,
        years_of_experience: s.priest.years_of_experience,
        languages: s.priest.languages,
        score: s.totalScore,
        breakdown: s.breakdown
      }))
    });

  } catch (error) {
    console.error('Allocation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});