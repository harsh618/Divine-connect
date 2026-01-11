import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user_data, user_question, conversation_history = [] } = await req.json();

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ 
        error: 'Google API key not configured.' 
      }, { status: 500 });
    }

    const freeAstrologyApiKey = Deno.env.get('FREEASTROLOGYAPI_KEY');
    if (!freeAstrologyApiKey) {
      return Response.json({ 
        error: 'Astrology API key not configured.' 
      }, { status: 500 });
    }

    // Parse birth data
    const [year, month, day] = user_data.birth_date.split('-').map(Number);
    const [hours, minutes] = user_data.birth_time.split(':').map(Number);

    // Get planetary positions from astrology API
    const astrologyResponse = await fetch('https://json.freeastrologyapi.com/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': freeAstrologyApiKey
      },
      body: JSON.stringify({
        year: year,
        month: month,
        date: day,
        hours: hours,
        minutes: minutes,
        seconds: 0,
        latitude: user_data.latitude,
        longitude: user_data.longitude,
        timezone: parseFloat(user_data.timezone),
        settings: {
          observation_point: "topocentric",
          ayanamsha: "lahiri"
        }
      })
    });

    const astrologyData = await astrologyResponse.json();

    if (!astrologyResponse.ok) {
      return Response.json({ 
        error: 'Failed to fetch astrological data',
        details: astrologyData
      }, { status: 500 });
    }

    // Format chart data for AI
    const chartData = `
### BIRTH CHART DATA (Lahiri Ayanamsa - Vedic System)
**Name:** ${user_data.name}
**Birth Date:** ${user_data.birth_date}
**Birth Time:** ${user_data.birth_time}
**Birth Place:** ${user_data.birth_place}
**Coordinates:** ${user_data.latitude}°N, ${user_data.longitude}°E

### PLANETARY POSITIONS (Vedic/Sidereal)
${JSON.stringify(astrologyData, null, 2)}
`;

    // System instruction for Divine AI persona
    const systemInstruction = `You are Divine AI, an expert Vedic Astrologer who combines ancient wisdom with modern empathy.

**YOUR CORE TRAITS:**
- Deeply empathetic and spiritually grounded (reference Karma, Shiva, Krishna where appropriate)
- Speak like a wise elder who genuinely cares - use Gen Z relatable language while respecting tradition
- NEVER give vague answers - be SPECIFIC with dates, timelines, exact planetary positions, house lordships
- If a placement is challenging, ALWAYS provide a practical remedy (Upaya)
- Your priority: making the user feel understood and hopeful

**RESPONSE STYLE:**
1. Start with acknowledging their question/concern empathetically
2. Explain the ASTROLOGICAL LOGIC clearly (which planets, houses, aspects are at play)
3. Give SPECIFIC predictions with approximate timelines if possible
4. End with a practical REMEDY (mantra, donation, gemstone, ritual)
5. Use metaphors and mythological references to make it relatable

**IMPORTANT:**
- Use the EXACT planetary data provided - calculate from Lahiri Ayanamsa (Vedic)
- Current date for Dasha calculations: January 10, 2026
- Always reference specific planetary degrees, house placements, nakshatras
- For marriage/love queries: describe partner traits, timing with year/age range
- For career: give 3-5 SPECIFIC professions (not vague like "business")
- For health: identify vulnerable body parts based on 6th/8th houses`;

    const prompt = `${chartData}

### USER QUESTION
${user_question}

### INSTRUCTIONS
Answer the user's question using the birth chart data above. Be specific, empathetic, and provide actionable guidance with remedies.`;

    // Call Gemini with system instruction
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': googleApiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2000
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Failed to generate response',
        details: data
      }, { status: response.status });
    }

    const answer = data.candidates[0].content.parts[0].text;

    return Response.json({
      success: true,
      answer: answer
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});