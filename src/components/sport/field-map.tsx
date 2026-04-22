'use client';

import { useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface Field {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  pricePerHour: number;
  lat: number | null;
  lng: number | null;
}

interface FieldMapProps {
  fields: Field[];
}

let mapInstance: LeafletMap | null = null;

export function FieldMap({ fields }: FieldMapProps) {
  const hasCoords = fields.some((f) => f.lat && f.lng);

  useEffect(() => {
    let L: typeof import('leaflet');
    let map: LeafletMap;

    async function init() {
      L = (await import('leaflet')).default;

      // Fix default icon paths in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const container = document.getElementById('field-map');
      if (!container) return;
      if (mapInstance) { mapInstance.remove(); mapInstance = null; }

      const fieldsWithCoords = fields.filter((f) => f.lat && f.lng);
      const center: [number, number] = fieldsWithCoords.length > 0
        ? [fieldsWithCoords[0].lat!, fieldsWithCoords[0].lng!]
        : [13.736717, 100.523186]; // Bangkok default

      map = L.map(container).setView(center, 12);
      mapInstance = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      for (const field of fieldsWithCoords) {
        L.marker([field.lat!, field.lng!])
          .bindPopup(`
            <div style="min-width:160px">
              <strong>${field.name}</strong><br/>
              <span style="color:#6b7280;font-size:12px">${field.location ?? ''}</span><br/>
              <span style="color:#6366f1;font-weight:600;">฿${field.pricePerHour.toLocaleString()}/ชม.</span><br/>
              <a href="/sport/fields/${field.id}" style="color:#6366f1;font-size:12px;">จองเลย →</a>
            </div>
          `)
          .addTo(map);
      }

      if (fieldsWithCoords.length > 1) {
        const group = L.featureGroup(fieldsWithCoords.map((f) => L.marker([f.lat!, f.lng!])));
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }

    init().catch(() => {});

    return () => {
      if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    };
  }, [fields]);

  if (!hasCoords) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">ยังไม่มีสนามที่ระบุพิกัดบนแผนที่</p>
        <p className="text-sm text-gray-400 mt-1">แอดมินสามารถเพิ่มพิกัดได้ในหน้าจัดการสนาม</p>
      </div>
    );
  }

  return (
    <div id="field-map" className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 z-0" />
  );
}
