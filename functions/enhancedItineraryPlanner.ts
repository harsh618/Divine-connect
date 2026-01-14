import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enhanced AI Itinerary Planner
 * Generates personalized spiritual trip itineraries based on user preferences
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      num_days,
      group_size,
      adults = 2,
      children = 0,
      mood, // 'peaceful', 'festive', 'adventurous', 'spiritual'
      theme, // 'beach_nearby', 'mountain', 'river_ghats', 'pilgrimage'
      base_location, // City or specific temple
      specific_temple_id,
      budget_level, // 'budget', 'moderate', 'premium'
      start_date,
      interests // Array: ['temples', 'ghats', 'aarti', 'markets', 'food', 'meditation']
    } = await req.json();

    if (!num_days || !base_location) {
      return Response.json({ 
        error: 'Missing required fields: num_days, base_location' 
      }, { status: 400 });
    }

    // Build detailed preferences description
    const moodDescriptions = {
      peaceful: 'peaceful and meditative with quiet, serene experiences',
      festive: 'vibrant and celebratory with crowded festivals and ceremonies',
      adventurous: 'active and adventurous with trekking and exploration',
      spiritual: 'deeply spiritual with extended meditation and prayers'
    };

    const themeDescriptions = {
      beach_nearby: 'coastal temple towns with beaches nearby for relaxation',
      mountain: 'mountain temples and hill stations with scenic views',
      river_ghats: 'sacred river cities with ghats and water rituals',
      pilgrimage: 'traditional pilgrimage circuit covering multiple sacred sites'
    };

    const budgetDescriptions = {
      budget: 'Budget-friendly options with dharamshalas and simple local food',
      moderate: 'Mid-range hotels and decent restaurants',
      premium: 'Premium accommodations and fine dining experiences'
    };

    // Fetch temple data if specific temple provided
    let templeInfo = '';
    if (specific_temple_id) {
      const temples = await base44.asServiceRole.entities.Temple.filter({
        id: specific_temple_id,
        is_deleted: false
      });
      if (temples.length > 0) {
        const temple = temples[0];
        templeInfo = `\nMain Temple: ${temple.name} in ${temple.city}, ${temple.state}. Primary Deity: ${temple.primary_deity}. ${temple.significance || ''}`;
      }
    }

    // Build the comprehensive prompt
    const prompt = `You are an expert spiritual travel planner in India. Create a detailed ${num_days}-day itinerary for a group of ${adults} adults${children > 0 ? ` and ${children} children` : ''} traveling to ${base_location}.
${templeInfo}

**Travel Preferences:**
- Mood/Vibe: ${moodDescriptions[mood] || 'balanced spiritual and leisure experiences'}
- Theme: ${themeDescriptions[theme] || 'general pilgrimage and sightseeing'}
- Budget Level: ${budgetDescriptions[budget_level] || 'moderate'}
- Start Date: ${start_date || 'Flexible'}
- Interests: ${interests?.join(', ') || 'temples, local culture, spiritual experiences'}

**Requirements:**
1. Include 5-7 activities per day with realistic timings
2. Balance spiritual activities with rest and meals
3. Consider travel time between locations
4. Include hidden gems and local experiences
5. Suggest best times for darshan/aarti
6. Include practical tips for each location
${children > 0 ? '7. Include family-friendly activities suitable for children' : ''}

Generate a JSON response with this exact structure:
{
  "overview": {
    "destination": "City name",
    "duration": "X days",
    "best_time_to_visit": "Season/months",
    "estimated_budget": "₹X - ₹Y per person",
    "highlights": ["highlight1", "highlight2", "highlight3"]
  },
  "days": [
    {
      "day": 1,
      "title": "Day 1: Arrival & Temple Introduction",
      "theme": "Getting oriented",
      "activities": [
        {
          "time": "6:00 AM - 7:30 AM",
          "name": "Activity Name",
          "description": "Detailed description...",
          "location": "Specific location",
          "category": "temple|ghat|food|market|meditation|sightseeing",
          "tips": "Practical tips",
          "duration_minutes": 90,
          "cost_estimate": "Free or ₹X"
        }
      ],
      "meals": {
        "breakfast": "Suggestion with location",
        "lunch": "Suggestion with location", 
        "dinner": "Suggestion with location"
      },
      "accommodation_tip": "Where to stay suggestion"
    }
  ],
  "packing_list": ["item1", "item2"],
  "important_tips": ["tip1", "tip2"],
  "nearby_attractions": [
    {
      "name": "Place name",
      "distance_km": 10,
      "description": "Brief description"
    }
  ]
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          overview: {
            type: "object",
            properties: {
              destination: { type: "string" },
              duration: { type: "string" },
              best_time_to_visit: { type: "string" },
              estimated_budget: { type: "string" },
              highlights: { type: "array", items: { type: "string" } }
            }
          },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                title: { type: "string" },
                theme: { type: "string" },
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      location: { type: "string" },
                      category: { type: "string" },
                      tips: { type: "string" },
                      duration_minutes: { type: "number" },
                      cost_estimate: { type: "string" }
                    }
                  }
                },
                meals: {
                  type: "object",
                  properties: {
                    breakfast: { type: "string" },
                    lunch: { type: "string" },
                    dinner: { type: "string" }
                  }
                },
                accommodation_tip: { type: "string" }
              }
            }
          },
          packing_list: { type: "array", items: { type: "string" } },
          important_tips: { type: "array", items: { type: "string" } },
          nearby_attractions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                distance_km: { type: "number" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      itinerary: response,
      generated_for: {
        user_id: user.id,
        location: base_location,
        days: num_days,
        group_size: { adults, children }
      }
    });

  } catch (error) {
    console.error('Itinerary Generation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});