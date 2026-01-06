import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

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

    // Search Temples
    temples.forEach(temple => {
      const matches = 
        temple.name?.toLowerCase().includes(searchTerm) ||
        temple.primary_deity?.toLowerCase().includes(searchTerm) ||
        temple.city?.toLowerCase().includes(searchTerm) ||
        temple.state?.toLowerCase().includes(searchTerm) ||
        temple.location?.toLowerCase().includes(searchTerm);
      
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

    // Search Poojas
    poojas.forEach(pooja => {
      const matches = 
        pooja.name?.toLowerCase().includes(searchTerm) ||
        pooja.category?.toLowerCase().includes(searchTerm) ||
        pooja.description?.toLowerCase().includes(searchTerm) ||
        pooja.purpose?.toLowerCase().includes(searchTerm);
      
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

    // Search Providers (Priests & Astrologers)
    providers.forEach(provider => {
      const matches = 
        provider.display_name?.toLowerCase().includes(searchTerm) ||
        provider.full_name?.toLowerCase().includes(searchTerm) ||
        provider.city?.toLowerCase().includes(searchTerm) ||
        provider.specializations?.some(s => s.toLowerCase().includes(searchTerm)) ||
        provider.languages?.some(l => l.toLowerCase().includes(searchTerm));
      
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

    // Search Campaigns
    campaigns.forEach(campaign => {
      const matches = 
        campaign.title?.toLowerCase().includes(searchTerm) ||
        campaign.category?.toLowerCase().includes(searchTerm) ||
        campaign.description?.toLowerCase().includes(searchTerm) ||
        campaign.beneficiary_organization?.toLowerCase().includes(searchTerm);
      
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