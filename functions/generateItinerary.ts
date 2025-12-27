import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { temple_name, temple_location, num_days, start_date, end_date, categories, vibe } = await req.json();

    const categoryLabels = {
      sacred_walks: 'Sacred Walks',
      ghats: 'Ghats',
      aarti: 'Aarti Spots',
      markets: 'Local Markets',
      temples: 'Other Temples',
      food: 'Local Cuisine'
    };

    const vibeLabels = {
      adventurous: 'adventurous and activity-packed',
      peaceful: 'peaceful and meditative',
      festive: 'festive and celebratory'
    };

    const selectedCategories = categories.map(c => categoryLabels[c] || c).join(', ');
    const vibeDescription = vibe ? vibeLabels[vibe] : 'balanced';

    const prompt = `Create a detailed ${num_days}-day travel itinerary for visiting ${temple_name} in ${temple_location}, from ${start_date} to ${end_date}.

The traveler is interested in: ${selectedCategories}
The desired vibe is: ${vibeDescription}

Return a structured JSON with the following format:
{
  "days": [
    {
      "title": "Day 1: December 30, 2025 - Morning Rituals",
      "activities": [
        {
          "time": "6:30 AM - 8:00 AM",
          "name": "Morning Darshan",
          "description": "Early morning visit to the temple...",
          "location": "Temple Name",
          "category": "Temples"
        }
      ]
    }
  ]
}

Include 4-6 activities per day with specific timings. Make it practical and realistic.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      location: { type: "string" },
                      category: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      itinerary: response
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});