'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getClientNetworkInfo, logVisitorVisit } from '@/utils/api';

export default function TrafficTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double-logging the exact same path in the same session immediately
    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    // Detect device category
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let device = 'Desktop';
    if (/Mobi|Android/i.test(ua)) {
      device = 'Mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
      device = 'Tablet';
    }

    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    // Fetch network info and log traffic
    getClientNetworkInfo()
      .then((network) => {
        logVisitorVisit({
          ip: network.ip,
          isp: network.isp,
          city: network.city,
          country: network.country,
          userAgent: ua,
          referrer: referrer || 'Direct / Bookmark',
          path: pathname || '/',
          device,
        });
      })
      .catch((err) => {
        console.warn('TrafficTracker: unable to retrieve network info', err);
      });
  }, [pathname]);

  return null;
}
