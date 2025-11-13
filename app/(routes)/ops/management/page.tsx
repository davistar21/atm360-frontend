"use client";
import { useState, useMemo, useRef } from "react";
import { format } from "date-fns";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Search,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Building2,
  RefreshCw,
  Key,
  AlertTriangle,
  Plus,
  Edit2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useAtmStore } from "@/lib/store/atmStore";
import Sidebar from "@/components/ops/Sidebar";
import { TopNav } from "@/components/ops/TopNav";
import { toast } from "sonner";

export default function AdminManagementPage() {
  const { atms, loading, updateAtm, refresh } = useAtmStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock unresolved issues
  const [unresolvedIssues] = useState(7);
  const [issues] = useState([
    {
      id: "INC-001",
      title: "ATM-LAG-0100 not showing up",
      priority: "HIGH",
      date: "2025-11-10",
      status: "OPEN",
      atmId: "ATM-LAG-0100",
    },
    {
      id: "INC-002",
      title: "Slow messaging to engineer",
      priority: "MEDIUM",
      date: "2025-11-09",
      status: "OPEN",
      atmId: "ATM-LAG-0234",
    },
    {
      id: "INC-003",
      title: "Engineer code invalid",
      priority: "CRITICAL",
      date: "2025-11-08",
      status: "IN_PROGRESS",
      atmId: "ATM-LAG-0156",
    },
  ]);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("atms");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<
    "atms" | "branches" | "cashlogs"
  >("atms");

  const [parseResult, setParseResult] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Compute branches from ATMs
  const branches = useMemo(() => {
    const branchMap = new Map<
      string,
      {
        name: string;
        address: string;
        lga: string;
        state: string;
        atmCount: number;
      }
    >();

    atms.forEach((atm) => {
      const branchName = atm.location.branchName;
      if (!branchName) return;

      const existing = branchMap.get(branchName);
      if (existing) {
        existing.atmCount += 1;
      } else {
        branchMap.set(branchName, {
          name: branchName,
          address: atm.location.address,
          lga: atm.location.lga || "N/A",
          state: atm.location.state || "Lagos",
          atmCount: 1,
        });
      }
    });

    return Array.from(branchMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [atms]);

  // Filtered ATMs based on search
  const filteredAtms = useMemo(() => {
    if (!search) return atms;
    const lowerSearch = search.toLowerCase();
    return atms.filter(
      (a) =>
        a.id.toLowerCase().includes(lowerSearch) ||
        a.location.branchName?.toLowerCase().includes(lowerSearch) ||
        a.location.address.toLowerCase().includes(lowerSearch)
    );
  }, [atms, search]);

  // File upload handlers
  const triggerFileUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseErrors([]);
    setParseResult([]);
    setUploading(true);
    setUploadProgress(20);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv" || ext === "txt") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (res: any) => {
          setParseResult(res.data);
          setUploadProgress(100);
          setTimeout(() => {
            setUploading(false);
            setUploadOpen(true);
          }, 500);
        },
        error: (err: Error) => {
          setParseErrors([`CSV parse error: ${err.message}`]);
          setUploading(false);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = ev.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          setParseResult(json);
          setUploadProgress(100);
          setTimeout(() => {
            setUploading(false);
            setUploadOpen(true);
          }, 500);
        } catch (err) {
          setParseErrors([
            `Excel parse error: ${
              err instanceof Error ? err?.message : "Failed to read"
            }`,
          ]);
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setParseErrors(["Failed to read Excel file"]);
        setUploading(false);
      };
      reader.readAsBinaryString(file);
    } else {
      setParseErrors([
        "Unsupported file type. Please use CSV, TXT, or Excel files.",
      ]);
      setUploading(false);
    }
  };

  const handleBulkImport = () => {
    setUploading(true);
    setUploadProgress(30);

    setTimeout(() => {
      console.log("Bulk importing:", parseResult);
      alert(`✅ Successfully imported ${parseResult.length} records!`);
      setUploadOpen(false);
      setParseResult([]);
      setUploadProgress(100);
      setTimeout(() => setUploading(false), 1000);
    }, 2000);
  };

  const downloadTemplate = () => {
    const templates: Record<string, { csv: string; name: string }> = {
      atms: {
        csv: `id,bankId,branchName,address,lga,state,model,type,status,cashCapacity,cashCurrent\nATM-LAG-0100,GTB001,Ikeja Main,123 Ikeja Road,Ikeja,Lagos,NCR SelfServ 80,FULL_FUNCTION,ONLINE,50000000,35000000\nATM-LAG-0101,GTB001,Victoria Island,45 Ahmadu Bello Way,Victoria Island,Lagos,Diebold Nixdorf,FULL_FUNCTION,ONLINE,40000000,28000000`,
        name: "atm-import-template.csv",
      },
      branches: {
        csv: `name,address,lga,manager,phone\nIkeja Main Branch,123 Ikeja Road,Ikeja,Chinedu Okonkwo,+2348012345678\nVI Branch,45 Ahmadu Bello Way,Victoria Island,Amina Bello,+2348087654321`,
        name: "branch-import-template.csv",
      },
      cashlogs: {
        csv: `atmId,date,amountLoaded,loadedBy,verifiedBy\nATM-LAG-0100,2025-11-10,25000000,John Doe,Jane Smith\nATM-LAG-0101,2025-11-09,20000000,Peter Pan,Mary Jane`,
        name: "cashlog-import-template.csv",
      },
    };

    const { csv, name } = templates[uploadType];
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        data-guide="api-key"
        className="bg-white border-b px-6 py-3 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">API Key:</span>
          <code className="text-xs bg-gray-100 px-3 py-1 rounded font-mono text-gray-800">
            *************************************
          </code>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => {
              navigator.clipboard.writeText(
                "sk_live_atm_lagos_9f8e3k2m1n4b7x6c5v8z"
              );
              // alert('API Key copied to clipboard!');
              toast.success("API Key copied to clipboard!");
            }}
          >
            Copy
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Lagos Operations • {format(new Date(), "PPP p")}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div
            data-guide="management-header"
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Management Console
              </h1>
              <p className="text-gray-600 mt-1">
                Zenith Admin Portal • Operations & Configuration
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                data-guide="bulk-import"
                onClick={triggerFileUpload}
                className="bg-zenith-neutral-900 hover:bg-zenith-neutral-800"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search ATMs, branches, issues..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress < 100 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Progress value={uploadProgress} className="flex-1" />
                  <span className="text-sm text-gray-600 font-medium">
                    Processing file... {uploadProgress}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList
              data-guide="management-tabs"
              className="grid w-full grid-cols-4"
            >
              <TabsTrigger value="atms">ATMs ({atms.length})</TabsTrigger>
              <TabsTrigger value="branches">
                Branches ({branches.length})
              </TabsTrigger>
              <TabsTrigger value="issues">
                Log Issues
                {unresolvedIssues > 0 && (
                  <Badge className="ml-2 bg-red-600 text-white">
                    {unresolvedIssues}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Configuration</TabsTrigger>
            </TabsList>

            {/* ATMs Tab */}
            <TabsContent value="atms" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">ATM Fleet Management</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUploadType("atms");
                    downloadTemplate();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ATM ID</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cash Level</TableHead>
                        <TableHead>Uptime (7d)</TableHead>
                        <TableHead>Failure Risk</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAtms.slice(0, 15).map((atm) => (
                        <TableRow key={atm.id}>
                          <TableCell className="font-medium">
                            {atm.id}
                          </TableCell>
                          <TableCell>
                            {atm.location.branchName || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                atm.status === "ONLINE"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {atm.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ₦
                            {(atm.cashLevel.currentAmount / 1_000_000).toFixed(
                              1
                            )}
                            M
                          </TableCell>
                          <TableCell>
                            {atm.uptimeMetrics?.uptimePercentageLast7Days || 0}%
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                (atm.predictiveScore?.failureRisk ?? 0) > 0.7
                                  ? "text-red-600 font-bold"
                                  : ""
                              }
                            >
                              {Math.round(
                                (atm.predictiveScore?.failureRisk || 0) * 100
                              )}
                              %
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branches Tab */}
            <TabsContent value="branches" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Branch Directory</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUploadType("branches");
                    downloadTemplate();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>LGA</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>ATM Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch.name}>
                          <TableCell className="font-medium">
                            {branch.name}
                          </TableCell>
                          <TableCell>{branch.lga}</TableCell>
                          <TableCell>{branch.state}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {branch.address}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{branch.atmCount}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Log Issues Tab */}
            <TabsContent value="issues" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Client-Reported Issues
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      File New Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>File Issue to Vendor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>ATM ID</Label>
                        <Input placeholder="ATM-LAG-XXXX" className="mt-1" />
                      </div>
                      <div>
                        <Label>Issue Title</Label>
                        <Input
                          placeholder="e.g., Card reader not working"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select defaultValue="MEDIUM">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={5}
                          placeholder="Provide detailed description of the issue..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-red-600 hover:bg-red-700">
                        Submit Issue
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue ID</TableHead>
                        <TableHead>ATM ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date Filed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">
                            {issue.id}
                          </TableCell>
                          <TableCell>{issue.atmId}</TableCell>
                          <TableCell>{issue.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                issue.priority === "CRITICAL"
                                  ? "destructive"
                                  : issue.priority === "HIGH"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.date}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                issue.status === "OPEN"
                                  ? "bg-orange-500"
                                  : issue.status === "IN_PROGRESS"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              }
                            >
                              {issue.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold">System Configuration</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Low Cash Threshold (₦)</Label>
                    <Input
                      type="number"
                      defaultValue="5000000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alert when ATM cash falls below this amount
                    </p>
                  </div>
                  <div>
                    <Label>Uptime Alert Threshold (%)</Label>
                    <Input type="number" defaultValue="95" className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      Alert when uptime drops below this percentage
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bank Core API URL</Label>
                    <Input
                      placeholder="https://api.bank.com/v2"
                      defaultValue="https://api.gtbank.com/v2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cash Logistics Provider</Label>
                    <Select defaultValue="protega">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protega">Protega</SelectItem>
                        <SelectItem value="cashconnect">CashConnect</SelectItem>
                        <SelectItem value="brinks">Brinks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SMS Provider</Label>
                    <Select defaultValue="termii">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="termii">Termii</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="africas_talking">
                          Africa's Talking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alert Email</Label>
                    <Input
                      type="email"
                      defaultValue="ops@gtbank.com"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bulk Import Preview Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Bulk Import Preview • {uploadType.toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {parseErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Errors Found</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {parseErrors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">
                    Found {parseResult.length} records
                  </p>
                  <p className="text-sm">
                    Review the data below before importing
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parseResult[0] &&
                        Object.keys(parseResult[0]).map((key) => (
                          <TableHead
                            key={key}
                            className="bg-gray-50 font-semibold"
                          >
                            {key}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.slice(0, 10).map((row: any, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <TableCell key={j} className="text-xs">
                            {String(val).substring(0, 50)}
                            {String(val).length > 50 ? "..." : ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {parseResult.length > 10 && (
                      <TableRow>
                        <TableCell
                          colSpan={Object.keys(parseResult[0] || {}).length}
                          className="text-center text-gray-500 py-4"
                        >
                          ... and {parseResult.length - 10} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadType(uploadType);
                  downloadTemplate();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkImport}
                className="bg-green-600 hover:bg-green-700"
                disabled={parseErrors.length > 0 || parseResult.length === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Import {parseResult.length} Records
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
