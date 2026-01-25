import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function usePermissions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canManageContent: false,
    canManageBookings: false,
    canConsult: false,
    canManageHotel: false,
    isAdmin: false,
    isPandit: false,
    isJyotish: false,
    isEditor: false,
    isHotelAdmin: false
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        setLoading(false);
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      // Check provider profile for additional roles
      let providerRole = null;
      try {
        const providers = await base44.entities.ProviderProfile.filter({
          user_id: userData.id,
          is_deleted: false,
          profile_status: 'approved'
        });
        if (providers.length > 0) {
          providerRole = providers[0].provider_type;
        }
      } catch (e) {}

      // Determine permissions based on roles
      const appRole = userData.app_role || userData.role;
      const isAdmin = appRole === 'admin' || userData.role === 'admin';
      const isEditor = appRole === 'editor' || isAdmin;
      const isPandit = appRole === 'pandit' || providerRole === 'priest' || isAdmin;
      const isJyotish = appRole === 'jyotish' || providerRole === 'astrologer' || isAdmin;
      const isHotelAdmin = appRole === 'hotel_admin' || isAdmin;

      setPermissions({
        canEdit: isEditor || isAdmin,
        canManageContent: isEditor || isAdmin,
        canManageBookings: isPandit || isJyotish || isAdmin,
        canConsult: isPandit || isJyotish || isAdmin,
        canManageHotel: isHotelAdmin || isAdmin,
        isAdmin,
        isPandit,
        isJyotish,
        isEditor,
        isHotelAdmin
      });

      setLoading(false);
    } catch (e) {
      console.error('Error loading user permissions:', e);
      setLoading(false);
    }
  };

  return { user, permissions, loading, reload: loadUser };
}