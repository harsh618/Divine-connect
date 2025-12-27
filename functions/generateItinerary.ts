import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { temple_name, temple_location, num_days, start_date, categories } = await req.json();

    const categoryLabels = {
      ghats: 'Ghats & River Sites',
      aarti: 'Aarti Spots',
      markets: 'Local Markets',
      ashrams: 'Ashrams & Spiritual Centers',
      temples: 'Other Temples',
      museums: 'Museums & Heritage',
      food: 'Local Cuisine',
      nature: 'Parks & Nature'
    };

    const selectedCategories = categories.map(c => categoryLabels[c] || c).join(', ');

    const prompt = `Create a detailed ${num_days}-day travel itinerary for visiting ${temple_name} in ${temple_location}, starting from ${start_date}.

The traveler is interested in: ${selectedCategories}

Please provide:
1. A day-by-day itinerary with specific timings
2. Recommended places to visit based on selected categories
3. Approximate time needed at each location
4. Travel tips and best times to visit
5. Local cuisine recommendations (if food is selected)
6. Cultural etiquette and dress code suggestions

Format the response in clear Markdown with headings for each day.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true
    });

    return Response.json({ 
      itinerary: response
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});