"use client";

import { useRef, useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import Sidebar from "@/components/ops/Sidebar";
import { TopNav } from "@/components/ops/TopNav";
import { useAtmStore, selectAtms } from "@/lib/store/atmStore";

const PRIMARY = "#3F51B5";
const COLORS = ["#3F51B5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const atms = useAtmStore(selectAtms);

  const metrics = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Active ATMs (ONLINE status)
    const activeAtms = atms.filter((a) => a.status === "ONLINE").length;
    const totalAtms = atms.length;

    // Calculate average uptime from last 7 days
    const avgUptime =
      atms.reduce((acc, atm) => {
        return acc + (atm.uptimeMetrics?.uptimePercentageLast7Days || 0);
      }, 0) / (atms.length || 1);

    // Estimate transactions (based on active ATMs and uptime)
    const estimatedTransactions = Math.floor(
      activeAtms * 120 * (avgUptime / 100)
    );

    // Status distribution
    const statusDistribution = atms.reduce((acc, atm) => {
      acc[atm.status] = (acc[atm.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cash levels analysis
    const lowCashAtms = atms.filter(
      (a) => a.cashLevel.currentAmount / a.cashLevel.totalCapacity < 0.3
    ).length;

    const cashUtilization =
      (atms.reduce((acc, atm) => {
        return acc + atm.cashLevel.currentAmount / atm.cashLevel.totalCapacity;
      }, 0) /
        (atms.length || 1)) *
      100;

    // Network status
    const networkIssues = atms.filter(
      (a) =>
        a.networkStatus === "DISCONNECTED" || a.networkStatus === "INTERMITTENT"
    ).length;

    // Average downtime this month
    const avgDowntime =
      atms.reduce((acc, atm) => {
        return acc + (atm.uptimeMetrics?.downtimeMinutesThisMonth || 0);
      }, 0) / (atms.length || 1);

    // Type distribution
    const typeDistribution = atms.reduce((acc, atm) => {
      acc[atm.type] = (acc[atm.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Location distribution (by state)
    const stateDistribution = atms.reduce((acc, atm) => {
      const state = atm.location.state || "Unknown";
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Risk analysis
    const highRiskAtms = atms.filter(
      (a) => (a.predictiveScore?.failureRisk || 0) > 0.7
    ).length;

    return {
      activeAtms,
      totalAtms,
      avgUptime,
      estimatedTransactions,
      statusDistribution,
      lowCashAtms,
      cashUtilization,
      networkIssues,
      avgDowntime,
      typeDistribution,
      stateDistribution,
      highRiskAtms,
    };
  }, [atms]);

  // Generate monthly activity data (simulated based on current metrics)
  const activityData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const baseTransactions = metrics.estimatedTransactions;
    return months.map((month, i) => ({
      month,

      value: Math.floor(baseTransactions * (0.7 + Math.random() * 0.6)),
      uptime: Math.floor(85 + Math.random() * 12),
    }));
  }, [metrics.estimatedTransactions]);

  // Prepare chart data
  const statusChartData = Object.entries(metrics.statusDistribution).map(
    ([status, count]) => ({
      name: status.replace(/_/g, " "),
      value: count,
    })
  );

  const typeChartData = Object.entries(metrics.typeDistribution).map(
    ([type, count]) => ({
      name: type.replace(/_/g, " "),
      value: count,
    })
  );

  const topStates = Object.entries(metrics.stateDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([state, count]) => ({ state, count }));

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Show loading state
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg");

      // Calculate PDF dimensions (A4 proportions)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      // If content is taller than one page, add multiple pages
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "jpeg", 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "jpeg", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      const fileName = `ATM-Operations-Report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Download Button */}
      <div
        data-guide="reports-header"
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold text-gray-900">Operations Report</h1>
        <Button
          data-guide="download-pdf"
          onClick={downloadPDF}
          className="gap-2 bg-[#3F51B5] hover:bg-[#3547a3] text-white"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Report Content */}
      <div
        ref={reportRef}
        className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ATM Operations Report
          </h1>
          <p className="text-gray-500 mt-2">
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* KPI Row */}
        <div
          data-guide="report-metrics"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active ATMs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.activeAtms}/{metrics.totalAtms}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((metrics.activeAtms / metrics.totalAtms) * 100).toFixed(1)}%
                Online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Est. Transactions Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.estimatedTransactions.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on active ATMs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Avg. Uptime (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.avgUptime.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg. downtime: {metrics.avgDowntime.toFixed(0)}m
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData.slice(-6)}>
                    <Bar dataKey="value" fill={PRIMARY} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {(
                  ((metrics.totalAtms - metrics.networkIssues) /
                    metrics.totalAtms) *
                  100
                ).toFixed(1)}
                %
              </div>
              <Progress
                value={
                  ((metrics.totalAtms - metrics.networkIssues) /
                    metrics.totalAtms) *
                  100
                }
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {metrics.networkIssues} ATMs with network issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Cash Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.cashUtilization.toFixed(1)}%
              </div>
              <Progress value={metrics.cashUtilization} className="h-2" />
              <p className="text-xs text-gray-500">
                {metrics.lowCashAtms} ATMs below 30% capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                High Risk ATMs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-red-600">
                {metrics.highRiskAtms}
              </div>
              <Progress
                value={(metrics.highRiskAtms / metrics.totalAtms) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">
              Monthly Transaction Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill={PRIMARY} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">
                ATM Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">
                ATM Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Locations & Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">
                Top States by ATM Count
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStates.map((item, i) => (
                <div
                  key={item.state}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.state}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} ATMs (
                    {((item.count / metrics.totalAtms) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">
                Key Metrics Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total ATMs</span>
                <span className="text-sm font-medium">{metrics.totalAtms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Cash ATMs</span>
                <span className="text-sm font-medium text-orange-600">
                  {metrics.lowCashAtms}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Issues</span>
                <span className="text-sm font-medium text-red-600">
                  {metrics.networkIssues}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Risk</span>
                <span className="text-sm font-medium text-red-600">
                  {metrics.highRiskAtms}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Uptime</span>
                <span className="text-sm font-medium text-green-600">
                  {metrics.avgUptime.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-medium">
            This report is auto-generated from{" "}
            <span className=" text-zenith-red-500">
              <b className="text-zenith-neutral-900">ATM</b>360
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
