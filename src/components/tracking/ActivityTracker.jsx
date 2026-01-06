import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

let sessionId = null;

const getSessionId = () => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
};

const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export default function ActivityTracker({ children, pageName }) {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const hasLoggedPageView = useRef(false);

  useEffect(() => {
    const logActivity = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;

        const user = await base44.auth.me();
        
        // Log page view only once per mount
        if (!hasLoggedPageView.current) {
          await base44.entities.UserActivity.create({
            user_id: user.id,
            event_type: 'page_view',
            page_name: pageName,
            session_id: getSessionId(),
            device_type: getDeviceType(),
            metadata: {
              path: location.pathname,
              search: location.search
            }
          });
          hasLoggedPageView.current = true;
        }
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.log('Activity tracking skipped');
      }
    };

    logActivity();
    startTimeRef.current = Date.now();

    return () => {
      // Log duration when leaving page
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      if (duration > 2) { // Only log if spent more than 2 seconds
        base44.auth.isAuthenticated().then(isAuth => {
          if (!isAuth) return;
          
          base44.auth.me().then(user => {
            base44.entities.UserActivity.create({
              user_id: user.id,
              event_type: 'page_view',
              page_name: pageName,
              duration_seconds: duration,
              session_id: getSessionId(),
              device_type: getDeviceType(),
              metadata: {
                path: location.pathname,
                exit: true
              }
            }).catch(() => {});
          }).catch(() => {});
        }).catch(() => {});
      }
    };
  }, [pageName, location]);

  return children;
}

// Utility function to log custom events
export const logUserEvent = async (eventType, data = {}) => {
  try {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;

    const user = await base44.auth.me();
    
    await base44.entities.UserActivity.create({
      user_id: user.id,
      event_type: eventType,
      session_id: getSessionId(),
      device_type: getDeviceType(),
      ...data
    });
  } catch (error) {
    // Silent fail
  }
};