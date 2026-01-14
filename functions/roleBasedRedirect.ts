import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Role-Based Redirect Service
 * Identifies user role and returns appropriate dashboard URL
 * 
 * Roles:
 * - admin: Full Admin Panel access
 * - priest/astrologer: Provider Dashboard
 * - hotel_provider: Hotel Dashboard
 * - user: Default User Home
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    if (user.role === 'admin') {
      return Response.json({
        role: 'admin',
        redirectUrl: 'AdminDashboard',
        permissions: ['manage_users', 'manage_content', 'manage_payments', 'view_analytics']
      });
    }

    // Check if provider (priest/astrologer)
    const providerProfiles = await base44.asServiceRole.entities.ProviderProfile.filter({
      user_id: user.id,
      is_deleted: false
    });

    if (providerProfiles.length > 0) {
      const provider = providerProfiles[0];
      
      if (provider.provider_type === 'priest') {
        return Response.json({
          role: 'priest',
          redirectUrl: 'PriestDashboard',
          profileId: provider.id,
          profileStatus: provider.profile_status,
          isVerified: provider.is_verified,
          permissions: ['manage_calendar', 'manage_bookings', 'write_articles', 'view_earnings']
        });
      }
      
      if (provider.provider_type === 'astrologer') {
        return Response.json({
          role: 'astrologer',
          redirectUrl: 'AstrologerDashboard',
          profileId: provider.id,
          profileStatus: provider.profile_status,
          isVerified: provider.is_verified,
          permissions: ['manage_calendar', 'manage_consultations', 'view_earnings']
        });
      }
    }

    // Check if hotel provider
    const hotelAdminQuery = await base44.asServiceRole.entities.Hotel.filter({
      admin_user_id: user.id,
      is_deleted: false
    });

    if (hotelAdminQuery.length > 0) {
      return Response.json({
        role: 'hotel_provider',
        redirectUrl: 'HotelDashboard',
        hotelIds: hotelAdminQuery.map(h => h.id),
        permissions: ['manage_hotel', 'manage_rooms', 'manage_bookings', 'view_analytics']
      });
    }

    // Default: Regular User/Devotee
    return Response.json({
      role: 'user',
      redirectUrl: 'Home',
      permissions: ['book_services', 'browse_content', 'make_donations', 'write_reviews']
    });

  } catch (error) {
    console.error('Role Redirect Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});