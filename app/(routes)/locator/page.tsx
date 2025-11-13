'use client';

import React, { useState, useEffect, useCallback, useRef} from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { haversineDistance, dijkstraShortestPath, GraphEdge, GraphNode } from "@/lib/utils/geolocation";
import useAtmStore, { selectAtms } from "@/lib/store/atmStore";
import mockAtms from "@/lib/mockAtms";
import {
  Navigation,
  Search,
  ChevronLeft,
  ExternalLink,
  Menu,
  Activity,
  AlertCircle,
  ChartNoAxesColumnDecreasing,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const osrmRouter = L.Routing.osrmv1({
  serviceUrl: "https://router.project-osrm.org/route/v1",
  profile: "foot", 
});

declare module "leaflet" {
  namespace Routing {
    interface RoutingControlOptions {
      createMarker?: (i: number, wp: any, n: number) => L.Marker | null;
    }
  }
}



delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const getStatusIcon = (status: string) => {
  const colorMap: Record<string, string> = {
    ONLINE: "#10b981",        
    MAINTENANCE: "#f59e0b",   
    OFFLINE: "#ef4444",       
    OUT_OF_CASH: "#fb923c",   
    UNKNOWN: "#6b7280",       
  };

  const color = colorMap[status] || "#6b7280";

  return L.divIcon({
    html: `
      <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" stroke="#ffffff" stroke-width="3" d="M19 1c-9.941 0-18 8.059-18 18 0 13.5 18 30 18 30s18-16.5 18-30c0-9.941-8.059-18-18-18z"/>
        <circle fill="#ffffff" cx="19" cy="19" r="8"/>
        <circle fill="${color}" cx="19" cy="19" r="5"/>
      </svg>
    `,
    className: "custom-marker",
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48],
  });
};

export const statusColors = {
  ONLINE: { bg: "bg-green-500", badge: "bg-green-100 text-green-700" },
  MAINTENANCE: { bg: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  OFFLINE: { bg: "bg-red-500", badge: "bg-red-100 text-red-700" },
  OUT_OF_CASH: { bg: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  UNKNOWN: { bg: "bg-gray-500", badge: "bg-gray-100 text-gray-700" },
};

const UserMarker = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16);
  }, [position, map]);

  const icon = L.divIcon({
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

  return <Marker position={position} icon={icon} />;
};

export default function App() {
  const atms = useAtmStore(selectAtms);
  const { refresh } = useAtmStore();

  useEffect(() => {
    if (atms.length === 0) {
      refresh();
    }
  }, [atms.length, refresh]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestAtm, setNearestAtm] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statsOpen, setStatsOpen] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");
  const [showRoute, setShowRoute] = useState(false);

  // Bank selection
  const [selectedBanks, setSelectedBanks] = useState<string[]>(["Zenith"]);
  const [selectAll, setSelectAll] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const banks = ["Zenith", "GTBank", "First Bank", "Access Bank", "UBA"];

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
    setSelectAll(false);
  };

  const toggleAllBanks = () => {
    if (selectAll) {
      setSelectedBanks([]);
      setSelectAll(false);
    } else {
      setSelectedBanks(banks);
      setSelectAll(true);
    }
  };

const filtered = atms.filter((atm) => {
  const bankIdUpper = atm.bankId.toUpperCase();

  const matchesBank =
    selectedBanks.length === 0 ||
    selectAll ||
    selectedBanks.some((bank) => bankIdUpper.startsWith(bank.toUpperCase()));

  const matchesSearch =
    atm.location.branchName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    atm.location.address?.toLowerCase().includes(searchQuery.toLowerCase());

  return matchesBank && matchesSearch;
});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Location access denied"),
      { enableHighAccuracy: true }
    );
  }, []);

const findNearest = useCallback(() => {
  if (showRoute && nearestAtm) {
    setNearestAtm(null);
    setShowRoute(false);
    return;
  }


  if (!userLocation || filtered.length === 0) return;

  const onlineAtms = filtered.filter((a) => a.status === "ONLINE");
  if (onlineAtms.length === 0) {
    alert("No online ATMs found nearby.");
    return;
  }

  const userNode: GraphNode = {
    id: "user",
    coordinates: { lat: userLocation[0], lng: userLocation[1] },
  };

  const atmNodes: GraphNode[] = onlineAtms.map((atm) => ({
    id: atm.id,
    coordinates: {
      lat: atm.location.coordinates.lat,
      lng: atm.location.coordinates.lng,
    },
  }));

  const allNodes = [userNode, ...atmNodes];

  const edges: GraphEdge[] = [];

  allNodes.forEach((fromNode) => {
    allNodes.forEach((toNode) => {
      if (fromNode.id !== toNode.id) {
        const weight = haversineDistance(
          fromNode.coordinates,
          toNode.coordinates
        );
        edges.push({
          from: fromNode.id,
          to: toNode.id,
          weight,
        });
      }
    });
  });

  let nearestAtmId: string | null = null;
  let shortestDistance = Infinity;

  atmNodes.forEach((atmNode) => {
    const path = dijkstraShortestPath(allNodes, edges, "user", atmNode.id);
    if (path && path.length > 1) {
      const distance = edges
        .filter((e) => path.includes(e.from) && path.includes(e.to))
        .reduce((sum, e) => sum + e.weight, 0);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestAtmId = atmNode.id;
      }
    }
  });

  if (!nearestAtmId) {
    alert("Could not find route to any ATM.");
    return;
  }

  const finalPath = dijkstraShortestPath(allNodes, edges, "user", nearestAtmId);
  if (!finalPath) return;

  const pathCoords: [number, number][] = finalPath.map((nodeId) => {
    const node = allNodes.find((n) => n.id === nodeId);
    return node
      ? [node.coordinates.lat, node.coordinates.lng]
      : [userLocation[0], userLocation[1]];
  });



  const nearestAtmObj = onlineAtms.find((a) => a.id === nearestAtmId);
  if (!nearestAtmObj) return; 

  setNearestAtm(nearestAtmObj);
  setShowRoute(true);
}, [userLocation, filtered]);


const RoutingControl: React.FC<{
  start: [number, number];
  end: [number, number];
}> = ({ start, end }) => {
  const map = useMap();
  const routingRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Remove any previous route
    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      router: osrmRouter,
      lineOptions: {
        styles: [{ color: "#D91E2E", weight: 6, opacity: 0.9 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0.1,
      },
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      
      createMarker: function() { return null; } as any, 
    }).addTo(map);

    routingRef.current = control;

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [map, start, end]);

  return null;
};


  const chartData = [
    { name: "Online", value: filtered.filter((a) => a.status === "ONLINE").length, fill: "#10b981" },
    { name: "Maintenance", value: filtered.filter((a) => a.status === "MAINTENANCE").length, fill: "#f59e0b" },
    { name: "Offline", value: filtered.filter((a) => a.status === "OFFLINE").length, fill: "#ef4444" },
    { name: "Out of Cash", value: filtered.filter((a) => a.status === "OUT_OF_CASH").length, fill: "#fb923c" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Search */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search branch or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-6 shadow-xl border-0 rounded-full bg-white"
          />
        </div>
      </div>

      {/* Bank Selection Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            className="absolute top-20 right-4 z-50 bg-white shadow-lg hover:bg-gray-100 text-zenith-neutral-900"
            size="lg"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">Select your bank</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="all-banks"
                checked={selectAll}
                onCheckedChange={toggleAllBanks}
              />
              <Label htmlFor="all-banks" className="text-base font-medium cursor-pointer">
                All Banks
              </Label>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="space-y-3">
              {banks.map((bank) => (
                <div key={bank} className="flex items-center space-x-3">
                  <Checkbox
                    id={bank}
                    checked={selectedBanks.includes(bank)}
                    onCheckedChange={() => toggleBank(bank)}
                    disabled={selectAll}
                  />
                  <Label
                    htmlFor={bank}
                    className={`text-base cursor-pointer ${selectAll ? "text-gray-400" : ""}`}
                  >
                    {bank}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Stats Widget */}
      <div className={`absolute top-20 left-0 z-50 transition-transform duration-300 ${statsOpen ? "translate-x-0" : "-translate-x-80"}`}>
        <Card className="w-80 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                ATM Status
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setStatsOpen(!statsOpen)}>
                <ChevronLeft className={`w-5 h-5 transition-transform ${statsOpen ? "" : "rotate-180"}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                      {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}

                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-gray-600">{d.name}:</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {!statsOpen && (
        <div className="absolute top-20 left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-40">
          <Button size="icon" variant="ghost" onClick={() => setStatsOpen(true)}>
            <ChartNoAxesColumnDecreasing className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40">
        <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="bg-white rounded-full shadow-xl">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Map View */}
      {view === "map" && (
        <div className="flex-1 z-0 h-full">
          <MapContainer
            center={userLocation || [6.5244, 3.3792]}
            zoom={13}
            zoomControl={false}
            className="h-full w-full"
            style={{ height: "100vh", width: "100%" }}
          >
            <ZoomControl position="bottomleft" />
                    <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors, HOT"
        />
            {userLocation && <UserMarker position={userLocation} />}
            {filtered.map((atm) => (
              <Marker
                key={atm.id}
                position={[atm.location.coordinates.lat, atm.location.coordinates.lng]}
                icon={getStatusIcon(atm.status)}
              >
                <Popup>
                  <div className="p-3 min-w-64">
                    <h3 className="font-bold text-lg">{atm.location.branchName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{atm.location.address}</p>
                    <Badge className={statusColors[atm.status].badge}>
                      {atm.status.replace(/_/g, " ")}
                    </Badge>
                    <div className="mt-3">
                      <Link
                        href={`/locator/${atm.id}`}
                        className="inline-flex items-center gap-1 bg-red text-white px-4 py-2 rounded-md text-sm hover:bg-zenith-neutral-100"
                      >
                        View Details <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && nearestAtm && (
              <RoutingControl
                start={userLocation}
                end={[
                  nearestAtm.location.coordinates.lat,
                  nearestAtm.location.coordinates.lng,
                ]}
              />
            )}
            </MapContainer>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto pt-32 pb-24 px-4">
          {filtered.length === 0 ? (
            <div className="text-center mt-20">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ATMs found</p>
            </div>
          ) : (
            <div className="space-y-4 mx-auto max-w-3xl">
              {filtered.map((atm) => (
                <Card key={atm.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{atm.location.branchName}</h3>
                        <p className="text-sm text-gray-600">{atm.location.address}</p>
                      </div>
                      <Badge className={statusColors[atm.status].badge}>
                        {atm.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <Link
                        href={`/locator/${atm.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-zenith-red-500 "
                      >
                        View Details <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Find Nearest Button */}
      {userLocation && view === "map" && (
  <Button
    onClick={findNearest}
    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 shadow-2xl"
    size="lg"
  >
    <Navigation className="w-5 h-5 mr-2" />
    {showRoute && nearestAtm
      ? `Hide route to ${nearestAtm.location.branchName}`
      : "Find Nearest ATM"}
  </Button>
)}
    </div>
  );
}
