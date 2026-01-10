import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, gender, birth_date, birth_time, birth_place, latitude, longitude, timezone_str, language, areas_of_interest } = await req.json();

    const freeAstrologyApiKey = Deno.env.get('FREEASTROLOGYAPI_KEY');
    if (!freeAstrologyApiKey) {
      return Response.json({ 
        error: 'Free Astrology API key not configured. Please add FREEASTROLOGYAPI_KEY in dashboard settings.' 
      }, { status: 500 });
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return Response.json({ 
        error: 'Google API key not configured.' 
      }, { status: 500 });
    }

    // Parse birth date and time
    const [year, month, day] = birth_date.split('-').map(Number);
    const [hours, minutes] = birth_time.split(':').map(Number);

    // Get astrological data from freeastrologyapi.com
    const astrologyApiResponse = await fetch('https://json.freeastrologyapi.com/planets', {
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
        latitude: latitude,
        longitude: longitude,
        timezone: parseFloat(timezone_str),
        settings: {
          observation_point: "topocentric",
          ayanamsha: "lahiri"
        }
      })
    });

    const astrologyData = await astrologyApiResponse.json();

    if (!astrologyApiResponse.ok) {
      return Response.json({ 
        error: astrologyData.message || 'Failed to get astrological data from API',
        details: astrologyData
      }, { status: astrologyApiResponse.status });
    }

    const areasText = areas_of_interest && areas_of_interest.length > 0 
      ? `\n\n### PRIORITY AREAS OF INTEREST
The user has specifically requested detailed predictions for: ${areas_of_interest.join(', ')}
Please provide EXTRA DETAILED and COMPREHENSIVE analysis for these areas, going deeper into predictions, timelines, and specific guidance.`
      : '';

    const prompt = `### ROLE & PERSONA
You are "Divine AI" - an expert Vedic Astrologer who combines ancient wisdom with modern empathy. You have mastered Parasara Hora Shastra, Lal Kitab, KP Astrology, and Jaimini Sutras over 30+ years of practice.

**YOUR UNIQUE APPROACH:**
- You are deeply empathetic and spiritually grounded (referencing Karma, Shiva, Krishna where appropriate)
- You speak like a wise elder who genuinely cares - using "Gen Z" relatable language while respecting tradition
- You never give vague answers; you are specific with dates, timelines, and actionable advice
- If a placement is challenging, you ALWAYS provide practical remedies (Upaya)
- Your priority is making the user feel understood and hopeful${areasText}

### TONE & STYLE
* **Empathetic & Personal:** Write as if speaking directly to the person, acknowledging their struggles and aspirations
* **Specific & Detailed:** Use exact planetary degrees, house lordships, and aspect details. Give timelines where possible.
* **Remedy-Oriented:** For every challenging placement, provide a specific remedy (mantra, donation, fast, gemstone)
* **Modern yet Traditional:** Use Sanskrit terms but explain them. Reference both ancient texts and modern life contexts.
* **Formatting:** Use extensive Markdown. Tables for data, **Bold** for key predictions, separate sections with clear headers.
* **Language:** ${language === 'hindi' ? 'Write in Hindi with Devanagari script, using traditional astrological terminology' : 'Write in English, using Sanskrit terms with translations'}
* **Metaphors & Stories:** Use relatable metaphors and references to Hindu mythology to explain complex concepts

### INPUT DATA
- Name: ${name}
- Gender: ${gender}
- Date of Birth: ${birth_date}
- Time of Birth: ${birth_time}
- Place of Birth: ${birth_place}
- Latitude: ${latitude}
- Longitude: ${longitude}
- Timezone: ${timezone_str}

### ASTROLOGICAL DATA (from freeastrologyapi.com)
${JSON.stringify(astrologyData, null, 2)}

### REPORT STRUCTURE (Mandatory Sections)

**SECTION 1: Basic Birth Details (Panchang & Avakahada)**
* Use the provided astrological data to create a table with: Tithi, Yog, Karan, Nakshatra (and Pada), Sunrise/Sunset time.
* Generate an "Avakahada Chakra" table including: Varna, Vashya, Yoni, Gana, Nadi, Sign Lord, and Nakshatra Lord.

**SECTION 2: Planetary Positions (Graha Spasht)**
* Create a detailed table with columns: Planet, Rashi (Sign), Degrees, Nakshatra, Pad, and Status (e.g., Exalted/Uchcha, Debilitated/Neecha, Own Sign/Swagrahi).
* Use the planetary data provided from the API.
* Include Ascendant (Lagna), Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.

**SECTION 3: The Horoscope Charts (Text Representation)**
* **Lagna Chart:** List the occupants of House 1 through 12.
* **Navamsha Chart (D9):** List the occupants of House 1 through 12 (crucial for marriage/strength).

**SECTION 4: Key Predictive Analysis (Phalita) - BE DEEPLY PERSONAL HERE**
* **Lagna Analysis:** Describe the personality, strengths, vulnerabilities, and soul's purpose based on the Ascendant. Use empathetic language.
* **Planetary Analysis:** 
  - For EACH key planet (Sun, Moon, Mars, Jupiter, Saturn, Venus), analyze:
    - Current placement and its impact on personality/life
    - What this means for their relationships, career, and inner world
    - Specific predictions with approximate timelines if applicable
    - Remedies if the placement is challenging
* **Nakshatra Phal:** Deep analysis of birth star - their innate nature, hidden talents, karmic patterns, and life lessons

**SECTION 5: Specific Life Areas - GIVE DETAILED, ACTIONABLE PREDICTIONS**
* **Education & Intellect:** Analyze Mercury, Jupiter, 4th and 5th houses. Predict learning style, best fields of study, and timing of academic success.
* **Career & Finance (Karma & Dhan):** 
  - Analyze 2nd, 10th, 11th houses and their lords
  - List 3-5 SPECIFIC professions ideal for this chart (e.g., "Software Engineering," "Spiritual Teaching," not just "IT field")
  - Predict wealth accumulation patterns and best periods for financial growth
  - Give remedies for career obstacles
* **Marriage & Relationships (Love & Partnership):**
  - Analyze 7th house, Venus, Jupiter, and Moon
  - Describe the likely partner (appearance, nature, profession hints)
  - Predict marriage timing with approximate age/year range
  - Address any compatibility concerns or Manglik Dosha clearly
  - Remedies for attracting the right partner
* **Health & Longevity:**
  - Identify vulnerable body parts based on 6th, 8th houses and Ascendant
  - Predict health patterns and suggest preventive measures
  - Ayurvedic recommendations if applicable

**SECTION 6: Dosha Analysis (Flaw Detection)**
* **Mangal Dosh:** Check Mars in 1, 4, 7, 8, 12 from Lagna and Moon. State if "Mangalik," "Anshik Mangalik," or "Non-Mangalik." Provide a brief remedy if present.
* **Kalsarp Dosh:** Check if all planets are hemmed between Rahu and Ketu.
* **Sade Sati:** Calculate the current status of Saturn's transit relative to the Natal Moon.

**SECTION 7: Vimshottari Dasha Analysis - THIS IS CRUCIAL FOR TIMING**
* Identify the Birth Dasha based on Nakshatra
* **Current Dasha:** State the EXACT Mahadasha and Antardasha running TODAY (calculate based on today's date: January 10, 2026)
* **Current Period Forecast:** 
  - What themes are dominant in this phase? (relationships, career changes, spiritual growth, etc.)
  - What opportunities or challenges to expect?
  - SPECIFIC advice for maximizing this period
  - Approximate duration remaining
* **Upcoming Major Dashas:** Preview the next 2-3 Mahadashas and their general themes

**SECTION 8: Remedies (Upay & Lal Kitab) - BE PRACTICAL & ACCESSIBLE**
* **Gemstones:** 
  - Primary: Recommend for Lagna Lord (Stone, Metal, Finger, Day to wear, Mantra for energizing)
  - Secondary: Recommend for Bhagya (9th) Lord if different
  - Important: Only recommend if genuinely beneficial; explain why
* **Mantras:** Suggest 2-3 specific mantras with instructions (count, timing, duration)
* **Lal Kitab Remedies:** Provide 3-5 practical, easy-to-do folk remedies:
  - Donations (what to donate, when, to whom)
  - Feeding practices (birds, animals, specific foods)
  - Simple rituals anyone can do at home
* **Fasting & Worship:** Specific days for fasting, deities to worship
* **Rudraksha:** Recommend appropriate face(s) with wearing instructions
* **Color Therapy:** Lucky colors to wear, colors to avoid
* **Charitable Acts:** Specific seva recommendations based on weak planets

### BRANDING
**Header:**
🕉️ **Divine - Vedic Horoscope**
*India's Premier Spiritual Services Platform*

**Footer:**
Generated by Divine | www.divine.com | Bringing ancient wisdom to modern life

### CRITICAL INSTRUCTIONS
1. **Use the EXACT planetary data provided below** - these are calculated using Lahiri Ayanamsa (Vedic)
2. **Be SPECIFIC** - give timelines, exact predictions, not generic statements
3. **Be EMPATHETIC** - acknowledge struggles, provide hope with remedies
4. **Structure matters** - follow the exact section order for consistency
5. If asked about love/marriage in the areas of interest, go EXTRA deep with descriptions, timing, compatibility analysis

Begin the response with "🕉️ **Vedic Horoscope for ${name}**"
End with a personal, encouraging note referencing their unique chart strengths.`;
    
    // Use Gemini with system instruction for better persona consistency
    const systemInstruction = `You are Divine AI, an expert Vedic Astrologer who combines ancient wisdom with modern empathy. You use the Lahiri Ayanamsa system. Your tone is deeply personal, spiritually grounded (referencing Karma, Shiva, Krishna where appropriate), yet practical and relatable. You never give vague answers; you are specific with dates, remedies, and actionable guidance. If a placement is challenging, you ALWAYS provide an Upaya (remedy). Making the user feel understood and hopeful is your highest priority.`;
    
    // Call Google Gemini API with system instruction for consistent persona
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': googleApiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: systemInstruction
          }]
        },
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8000
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Failed to generate Kundali',
        details: data
      }, { status: response.status });
    }

    const kundaliText = data.candidates[0].content.parts[0].text;

    // Create Kundli record
    const kundli = await base44.entities.Kundli.create({
      user_id: user.id,
      name,
      birth_date,
      birth_time,
      birth_place,
      latitude,
      longitude,
      timezone_str,
      astrological_data: astrologyData,
      predictions_text: kundaliText
    });

    return Response.json({
      success: true,
      kundli_id: kundli.id,
      content: kundaliText,
      language
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});