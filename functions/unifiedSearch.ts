import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Use AI to understand intent and generate semantic matches
    let semanticContext = null;
    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this search query: "${query}"

Identify what the user is looking for and provide relevant keywords and context.
Return a categorized breakdown of what they might be searching for.`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            category: { 
              type: "string",
              enum: ["temple", "pooja", "priest", "astrologer", "donation", "general"]
            },
            keywords: { 
              type: "array",
              items: { type: "string" }
            },
            deity_references: {
              type: "array",
              items: { type: "string" }
            },
            location_references: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      semanticContext = aiResponse;
    } catch (error) {
      // Fallback to basic search if AI fails
      console.log('AI search enhancement failed, using basic search');
    }

    // Search across all entities in parallel
    const [temples, poojas, providers, campaigns] = await Promise.all([
      base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }),
      base44.entities.Pooja.filter({ is_deleted: false }),
      base44.entities.ProviderProfile.filter({ 
        is_deleted: false, 
        is_hidden: false,
        profile_status: 'approved'
      }),
      base44.entities.DonationCampaign.filter({ is_deleted: false, is_hidden: false })
    ]);

    const results = [];

    // Helper function for semantic matching
    const semanticMatch = (text, additionalFields = []) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      
      // Direct match
      if (lowerText.includes(searchTerm)) return true;
      
      // Semantic match with AI keywords
      if (semanticContext?.keywords) {
        if (semanticContext.keywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
          return true;
        }
      }
      
      // Check additional fields
      return additionalFields.some(field => 
        field && field.toLowerCase().includes(searchTerm)
      );
    };

    // Search Temples with semantic understanding
    temples.forEach(temple => {
      const deityMatch = semanticContext?.deity_references?.some(deity => 
        temple.primary_deity?.toLowerCase().includes(deity.toLowerCase())
      );
      
      const locationMatch = semanticContext?.location_references?.some(loc => 
        temple.city?.toLowerCase().includes(loc.toLowerCase()) ||
        temple.state?.toLowerCase().includes(loc.toLowerCase())
      );
      
      const matches = 
        semanticMatch(temple.name, [temple.primary_deity, temple.city, temple.state]) ||
        deityMatch ||
        locationMatch ||
        temple.description?.toLowerCase().includes(searchTerm) ||
        temple.significance?.toLowerCase().includes(searchTerm);
      
      if (matches) {
        results.push({
          id: temple.id,
          type: 'temple',
          title: temple.name,
          subtitle: `${temple.primary_deity} Temple • ${temple.city}`,
          image: temple.thumbnail_url || temple.images?.[0],
          page: 'TempleDetail',
          params: `id=${temple.id}`
        });
      }
    });

    // Search Poojas with semantic understanding
    poojas.forEach(pooja => {
      const matches = 
        semanticMatch(pooja.name, [pooja.category, pooja.purpose]) ||
        pooja.description?.toLowerCase().includes(searchTerm) ||
        pooja.benefits?.some(b => b.toLowerCase().includes(searchTerm)) ||
        (semanticContext?.keywords?.some(kw => 
          pooja.purpose?.toLowerCase().includes(kw) ||
          pooja.description?.toLowerCase().includes(kw)
        ));
      
      if (matches) {
        results.push({
          id: pooja.id,
          type: 'pooja',
          title: pooja.name,
          subtitle: `Pooja • ${pooja.category?.replace(/_/g, ' ')}`,
          image: pooja.image_url,
          page: 'PoojaDetail',
          params: `id=${pooja.id}`
        });
      }
    });

    // Search Providers (Priests & Astrologers) with semantic understanding
    providers.forEach(provider => {
      const typeMatch = semanticContext?.category === provider.provider_type ||
        (semanticContext?.category === 'priest' && provider.provider_type === 'priest') ||
        (semanticContext?.category === 'astrologer' && provider.provider_type === 'astrologer');
      
      const matches = 
        semanticMatch(provider.display_name, [provider.full_name, provider.city]) ||
        provider.specializations?.some(s => 
          s.toLowerCase().includes(searchTerm) ||
          semanticContext?.keywords?.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
        ) ||
        provider.bio?.toLowerCase().includes(searchTerm) ||
        typeMatch;
      
      if (matches) {
        results.push({
          id: provider.id,
          type: provider.provider_type,
          title: provider.display_name,
          subtitle: `${provider.provider_type === 'priest' ? 'Priest' : 'Astrologer'} • ${provider.city || 'India'}`,
          image: provider.avatar_url,
          page: 'PriestProfile',
          params: `id=${provider.id}`
        });
      }
    });

    // Search Campaigns with semantic understanding
    campaigns.forEach(campaign => {
      const donationIntent = semanticContext?.category === 'donation' ||
        semanticContext?.keywords?.some(kw => 
          ['donate', 'donation', 'charity', 'help', 'support'].includes(kw.toLowerCase())
        );
      
      const matches = 
        semanticMatch(campaign.title, [campaign.category, campaign.beneficiary_organization]) ||
        campaign.description?.toLowerCase().includes(searchTerm) ||
        campaign.detailed_description?.toLowerCase().includes(searchTerm) ||
        (donationIntent && campaign.category?.toLowerCase().includes(searchTerm));
      
      if (matches) {
        results.push({
          id: campaign.id,
          type: 'campaign',
          title: campaign.title,
          subtitle: `Donation • ${campaign.category?.replace(/_/g, ' ')}`,
          image: campaign.thumbnail_url || campaign.images?.[0],
          page: 'CampaignDetail',
          params: `id=${campaign.id}`
        });
      }
    });

    // Limit to top 20 results
    return Response.json({ 
      results: results.slice(0, 20),
      total: results.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});