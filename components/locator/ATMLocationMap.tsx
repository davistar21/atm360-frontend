"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Blue pulsing user location icon
const userIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute inset-0 animate-ping bg-blue-500 rounded-full w-8 h-8 opacity-75"></div>
      <div class="relative bg-blue-600 rounded-full w-8 h-8 border-4 border-white shadow-lg"></div>
    </div>
  `,
  className: "user-location-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});




// Custom ATM icon based on status
const getAtmIcon = (status: string) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    ONLINE: { color: "#10b981", label: "Available" },
    MAINTENANCE: { color: "#f59e0b", label: "Maintenance" },
    OFFLINE: { color: "#ef4444", label: "Offline" },
    OUT_OF_CASH: { color: "#fb923c", label: "Out of Cash" },
    UNKNOWN: { color: "#6b7280", label: "Unknown" },
  };
  

  const config = statusConfig[status] || statusConfig.UNKNOWN;

  return L.divIcon({
    html: `
      <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="${config.color}" stroke="#ffffff" stroke-width="3" d="M19 1c-9.941 0-18 8.059-18 18 0 13.5 18 30 18 30s18-16.5 18-30c0-9.941-8.059-18-18-18z"/>
        <circle fill="#ffffff" cx="19" cy="19" r="8"/>
        <circle fill="${config.color}" cx="19" cy="19" r="5"/>
      </svg>
    `,
    className: "custom-marker",
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48],
  });
};

interface MapControllerProps {
  atm: ATM;
  userLocation: { lat: number; lng: number } | null;
}

// This component handles the routing logic
function MapController({ atm, userLocation }: MapControllerProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!userLocation) return;

    const atmLocation = atm.location.coordinates;

    // Clear existing routing control
    if (routingControlRef.current) {
      routingControlRef.current.remove();
    }

    if (!map || !atm?.location?.coordinates) return;


    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(atmLocation.lat, atmLocation.lng),
      ],
      lineOptions: {
        styles: [{ color: "#D91E2E", weight: 6, opacity: 0.9 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: function() { return null; } as any, 
    } as any).addTo(map);

    // Fit bounds to show both points
    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lng],
      [atmLocation.lat, atmLocation.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (routingControlRef.current && map) {
        try {
          routingControlRef.current.remove();
        } catch {}
        routingControlRef.current = null; 
      }
    };

  }, [map, atm, userLocation]);

  return null;
}

interface AtmLocationMapProps {
  atm: ATM;
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

export default function AtmLocationMap({
  atm,
  userLocation,
  className,
}: AtmLocationMapProps) {
  return (
    <div className={className}>
      <MapContainer
        key={atm.id}
        center={[atm.location.coordinates.lat, atm.location.coordinates.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors, HOT"
        />

        {/* ATM Marker with status-based color */}
        <Marker
          position={[
            atm.location.coordinates.lat,
            atm.location.coordinates.lng,
          ]}
          icon={getAtmIcon(atm.status)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{atm.location.branchName}</h3>
              <p className="text-sm text-gray-600">{atm.location.address}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  atm.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
                  atm.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' :
                  atm.status === 'OFFLINE' ? 'bg-red-100 text-red-700' :
                  atm.status === 'OUT_OF_CASH' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {atm.status === 'ONLINE' ? 'Available' :
                   atm.status === 'MAINTENANCE' ? 'Under Maintenance' :
                   atm.status === 'OFFLINE' ? 'Out of Service' :
                   atm.status === 'OUT_OF_CASH' ? 'Out of Cash' :
                   'Unknown'}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Routing Controller */}
        <MapController atm={atm} userLocation={userLocation} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 0.5rem;
        }
        .leaflet-routing-container {
          display: none;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}