'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function Map({ latitude, longitude, locationName }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety check: Clean up any old map instance attached to the DOM node to prevent double initialization errors
    const container = mapContainerRef.current as unknown as { _leaflet_id?: number };
    if (container._leaflet_id) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      delete container._leaflet_id;
    }

    // Fix Leaflet marker icon asset path issue
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Add OpenStreetMap CartoDB Voyager tiles (sleek dark/light friendly aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${locationName}</b><br/>Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`).openPopup();

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, locationName]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mapContainerRef} className="h-[300px] md:h-[400px] w-full z-10" />
    </div>
  );
}
