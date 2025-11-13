"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { haversineDistance } from "@/lib/utils/geolocation";

// Dynamically import leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
// Import useMap normally - it's a hook that must be used inside MapContainer
import { useMap } from "react-leaflet";

// Lazy load leaflet CSS
if (typeof window !== "undefined") {
  import("leaflet/dist/leaflet.css");
  import("leaflet-routing-machine");
  import("leaflet-routing-machine/dist/leaflet-routing-machine.css");
}

let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
  require("leaflet-routing-machine");
}

// Fix for default marker icons (only on client)
if (typeof window !== "undefined" && L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

let osrmRouter: any;
if (typeof window !== "undefined" && L?.Routing) {
  osrmRouter = L.Routing.osrmv1({
    serviceUrl: "https://router.project-osrm.org/route/v1",
    profile: "driving",
  });
}

interface ArrivalMapProps {
  userLocation: { lat: number; lng: number } | null;
  atmLocation: { lat: number; lng: number };
  onDistanceUpdate?: (distance: number) => void;
  onArrival?: () => void;
}

function RoutingControl({
  start,
  end,
}: {
  start: [number, number];
  end: [number, number];
}) {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !L?.Routing || !osrmRouter || !map) {
      return;
    }

    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    try {
      const control = L.Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        router: osrmRouter,
        lineOptions: {
          styles: [{ color: "#0284c7", weight: 6, opacity: 0.9 }],
          extendToWaypoints: false,
          missingRouteTolerance: 0.1,
        },
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: function () {
          return null;
        } as any,
      }).addTo(map);

      routingRef.current = control;
    } catch (error) {
      console.error("Routing error:", error);
    }

    return () => {
      if (routingRef.current && map) {
        try {
          map.removeControl(routingRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
        routingRef.current = null;
      }
    };
  }, [map, start, end]);

  return null;
}

export default function ArrivalMap({
  userLocation,
  atmLocation,
  onDistanceUpdate,
  onArrival,
}: ArrivalMapProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate distance and ETA
  useEffect(() => {
    if (!userLocation) return;

    const dist = haversineDistance(userLocation, atmLocation);
    setDistance(dist);

    if (onDistanceUpdate) {
      onDistanceUpdate(dist);
    }

    // Calculate ETA (assuming average speed of 30 km/h in city)
    const speedKmh = 30;
    const timeHours = dist / 1000 / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    setEta(timeMinutes > 0 ? `${timeMinutes} min` : "< 1 min");

    // Don't auto-trigger arrival - user must explicitly click "Mark as Arrived"
    // In production, this would be enabled for automatic detection
    // if (dist <= 50 && onArrival) {
    //   onArrival();
    // }
  }, [userLocation, atmLocation, onDistanceUpdate, onArrival]);

  // Watch position for real-time updates
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const dist = haversineDistance(newLocation, atmLocation);
        setDistance(dist);

        if (onDistanceUpdate) {
          onDistanceUpdate(dist);
        }

        // Calculate ETA
        const speedKmh = 30;
        const timeHours = dist / 1000 / speedKmh;
        const timeMinutes = Math.round(timeHours * 60);
        setEta(timeMinutes > 0 ? `${timeMinutes} min` : "< 1 min");

        // Check if arrived
        if (dist <= 50 && onArrival) {
          onArrival();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [atmLocation, onDistanceUpdate, onArrival]);

  if (!mounted || typeof window === "undefined") {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-zenith-neutral-200 relative flex items-center justify-center bg-zenith-neutral-100">
        <p className="text-zenith-neutral-500">Loading map...</p>
      </div>
    );
  }

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [atmLocation.lat, atmLocation.lng];

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-zenith-neutral-200 relative">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors, HOT"
        />

        {/* User Location Marker */}
        {userLocation && L && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            {L.Popup && <L.Popup>Your Location</L.Popup>}
          </Marker>
        )}

        {/* ATM Location Marker */}
        {L && (
          <Marker position={[atmLocation.lat, atmLocation.lng]}>
            {L.Popup && <L.Popup>ATM Destination</L.Popup>}
          </Marker>
        )}

        {/* Route */}
        {userLocation && (
          <RoutingControl
            start={[userLocation.lat, userLocation.lng]}
            end={[atmLocation.lat, atmLocation.lng]}
          />
        )}
      </MapContainer>

      {/* Distance and ETA Overlay */}
      {distance !== null && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-zenith-neutral-200 z-[1000]">
          <div className="text-sm font-semibold text-zenith-neutral-900">
            Distance: {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
          </div>
          {eta && (
            <div className="text-xs text-zenith-neutral-600 mt-1">
              ETA: {eta}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

