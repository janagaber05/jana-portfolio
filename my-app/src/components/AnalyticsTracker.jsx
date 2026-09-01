import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startAnalyticsHeartbeat, trackPageView } from '../utils/siteAnalytics';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search || ''}`;
    trackPageView(path);
  }, [location.pathname, location.search]);

  useEffect(() => {
    return startAnalyticsHeartbeat(
      () => `${window.location.pathname}${window.location.search || ''}`,
    );
  }, []);

  return null;
}
