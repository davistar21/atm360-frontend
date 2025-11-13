"use client";

import { useState, useMemo } from "react";
import { format, subHours, startOfDay } from "date-fns";
import {
  AlertCircle,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ── Mock Data ─────────────────────────────────────
const generateLogs = () => {
  const types = [
    "transaction",
    "cash_dispense",
    "card_insert",
    "error",
    "maintenance",
    "refill",
  ];
  const statuses = ["success", "warning", "error"];
  const locations = ["Downtown", "Mall", "Airport", "Suburb", "Station"];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    type: types[Math.floor(Math.random() * types.length)],
    atm: `ATM-${String(Math.floor(Math.random() * 80) + 1).padStart(3, "0")}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    amount: Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 50 : null,
    message: [
      "Card inserted",
      "Cash dispensed",
      "Low cash warning",
      "Paper jam",
      "Refill completed",
      "Network timeout",
      "Fraud detected",
    ][Math.floor(Math.random() * 7)],
  }));
};

const alerts = [
  {
    id: 1,
    type: "fraud",
    atm: "ATM-045",
    location: "Airport",
    time: subHours(new Date(), 1),
    message: "Unusual withdrawal pattern detected",
    severity: "high",
  },
  {
    id: 2,
    type: "downtime",
    atm: "ATM-012",
    location: "Mall",
    time: subHours(new Date(), 3),
    message: "No response for 15 minutes",
    severity: "critical",
  },
  {
    id: 3,
    type: "low_cash",
    atm: "ATM-067",
    location: "Suburb",
    time: subHours(new Date(), 2),
    message: "Cash level below 20%",
    severity: "medium",
  },
];

const timelineData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  transactions: Math.floor(Math.random() * 200) + 50,
  errors: Math.floor(Math.random() * 20),
}));

const heatmapData = Array.from({ length: 7 }, (_, d) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d],
  hours: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: Math.floor(Math.random() * 100),
  })),
}));

export default function ActivityPage() {
  const [logs] = useState(generateLogs());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (filter !== "all" && log.status !== filter) return false;
        if (
          search &&
          !log.atm.includes(search) &&
          !log.message.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs, search, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div
        data-guide="activity-header"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ATM Activity Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time logs, AI alerts, and performance
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* AI Alert Banner */}

      {/* Tabs */}
      <Card className="flex items-center gap-2 w-full rounded-lg animate-pulse bg-zenith-accent-200/50 border-zenith-accent-300 text-zenith-accent-800 !flex-row py-2 px-3">
        <Info size={20} />
        AI Monitoring is active...
      </Card>
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Transactions / Hour
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active ATMs</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74 / 80</div>
            <p className="text-xs text-muted-foreground">92.5% uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Alerts</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-orange-600">1 critical</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Alert Banner */}
      <Card className="border-orange-200 bg-orange-50 flex !flex-row items-center gap-2 w-full rounded-lg py-2 px-3">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <span className="text-sm text-orange-700 flex-1">
          Zeni is analyzing patterns. 3 active alerts require attention.
        </span>
        <a
          href="/ops/alerts"
          className="flex items-center gap-1 bg-orange-700/80 p-2 rounded-lg text-orange-100 ml-auto hover:bg-orange-700 transition px-3 py-1 text-sm font-medium"
        >
          View <ArrowUpRight size={20} />
        </a>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="alerts">AI Alerts</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions / Hour
                </CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,842</div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active ATMs
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">74 / 80</div>
                <p className="text-xs text-muted-foreground">92.5% uptime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">AI Alerts</CardTitle>
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-orange-600">1 critical</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#fca5a5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="search">Search logs</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="ATM ID, message..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filter">Filter</Label>
                  <select
                    id="filter"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>ATM</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {format(log.timestamp, "HH:mm:ss")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.atm}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {log.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{log.message}</span>
                            {log.amount && (
                              <Badge variant="outline">${log.amount}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(
                                log.status
                              )}`}
                            />
                            <span className="capitalize text-xs">
                              {log.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Alerts */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {alert.atm}
                          </CardTitle>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {format(alert.time, "HH:mm")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm">View Details</Button>
                    <Button size="sm" variant="outline">
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
