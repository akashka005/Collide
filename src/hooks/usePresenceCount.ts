import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';

export interface PresenceState {
  count: number;
  formattedCount: string;
  activeLabel: string;
}

export function formatPresenceNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function usePresenceCount(): PresenceState {
  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/moderation/metrics`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.activeSessions === 'number') {
            setCount(Math.max(1, data.activeSessions));
          }
        }
      } catch {
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    count,
    formattedCount: formatPresenceNumber(count),
    activeLabel: count === 1 ? 'person online' : 'people online',
  };
}
