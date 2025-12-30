import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch platform data for context
    const [temples, poojas, priests, astrologers, campaigns] = await Promise.all([
      base44.asServiceRole.entities.Temple.filter({ 
        is_deleted: false, 
        is_hidden: false 
      }, '-created_date', 20),
      base44.asServiceRole.entities.Pooja.filter({ 
        is_deleted: false 
      }, '-total_bookings', 20),
      base44.asServiceRole.entities.ProviderProfile.filter({ 
        provider_type: 'priest',
        is_deleted: false,
        is_hidden: false,
        profile_status: 'approved'
      }, '-screen_time_score', 10),
      base44.asServiceRole.entities.ProviderProfile.filter({ 
        provider_type: 'astrologer',
        is_deleted: false,
        is_hidden: false,
        profile_status: 'approved'
      }, '-screen_time_score', 10),
      base44.asServiceRole.entities.DonationCampaign.filter({ 
        status: 'active',
        is_deleted: false,
        is_hidden: false
      }, '-raised_amount', 10)
    ]);

    // Build comprehensive context
    const platformContext = {
      temples: temples.map(t => ({
        name: t.name,
        location: `${t.city}, ${t.state}`,
        deity: t.primary_deity,
        description: t.description,
        live_darshan: !!t.live_darshan_url,
        opening_hours: t.opening_hours,
        dress_code: t.dress_code,
        significance: t.significance
      })),
      poojas: poojas.map(p => ({
        name: p.name,
        category: p.category,
        purpose: p.purpose,
        benefits: p.benefits,
        duration: p.duration_minutes,
        price_virtual: p.base_price_virtual,
        price_in_person: p.base_price_in_person,
        price_temple: p.base_price_temple,
        best_time: p.best_time,
        required_items: p.required_items
      })),
      priests: priests.map(p => ({
        name: p.display_name,
        city: p.city,
        experience: p.years_of_experience,
        languages: p.languages,
        specializations: p.specializations,
        rating: p.rating_average,
        available_online: p.is_available_online,
        available_offline: p.is_available_offline
      })),
      astrologers: astrologers.map(a => ({
        name: a.display_name,
        city: a.city,
        experience: a.years_of_experience,
        languages: a.languages,
        astrology_types: a.astrology_types,
        rating: a.rating_average,
        consultation_rates: {
          chat: a.consultation_rate_chat,
          voice: a.consultation_rate_voice,
          video: a.consultation_rate_video
        }
      })),
      donation_campaigns: campaigns.map(c => ({
        title: c.title,
        category: c.category,
        goal: c.goal_amount,
        raised: c.raised_amount,
        description: c.description,
        beneficiary: c.beneficiary_organization
      }))
    };

    // Use Perplexity API for enhanced responses with platform context
    const prompt = `You are a Divine Assistant for a spiritual platform called "Divine Connect". 
You help users with temple visits, pooja bookings, astrology consultations, connecting with priests, donations, and planning yatras (pilgrimages).

Here is the current data available on our platform:

TEMPLES:
${JSON.stringify(platformContext.temples, null, 2)}

POOJAS:
${JSON.stringify(platformContext.poojas, null, 2)}

PRIESTS:
${JSON.stringify(platformContext.priests, null, 2)}

ASTROLOGERS:
${JSON.stringify(platformContext.astrologers, null, 2)}

DONATION CAMPAIGNS:
${JSON.stringify(platformContext.donation_campaigns, null, 2)}

User's question: "${message}"

Instructions:
1. Answer ONLY based on the platform data provided above
2. Be helpful, spiritual, and respectful
3. If the user asks about something not in the data, politely inform them and suggest alternatives from available data
4. Provide specific recommendations (names, locations, prices) when available
5. Keep responses concise but informative (2-4 sentences)
6. Use appropriate spiritual greetings when relevant
7. If asked about booking or availability, mention that they can book directly through the platform

Respond naturally and helpfully:`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return Response.json({ 
      reply: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Divine Assistant Error:', error);
    return Response.json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
});