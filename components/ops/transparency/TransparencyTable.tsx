// /components/transparency/TransparencyTable.tsx
import { useMemo, useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { type TransparencyLog } from "@/lib/store/transparencyStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/app/hooks/use-mobile";

export function TransparencyTable({ logs }: { logs: TransparencyLog[] }) {
  const [selected, setSelected] = useState<null | TransparencyLog>(null);
  const pageSizeOptions = [5, 10, 15];
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = pageIndex * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, pageIndex, pageSize]);

  const pageCount = Math.ceil(logs.length / pageSize);
  const isMobile = useIsMobile();
  return (
    <div className="p-4">
      <div className="overflow-auto rounded-md border">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No logs
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">{log.type}</TableCell>
                  <TableCell>
                    <Badge className={`${getSeverityColor(log.severity)}`}>
                      {log.severity || "info"}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.user?.role || "—"}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {log.details}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => setSelected(log)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-2 flex justify-between items-center text-sm">
        <div>
          Page {pageIndex + 1} of {pageCount || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(pageIndex - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            <ChevronRight />
          </Button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            className="ml-2 rounded border px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <Drawer
        open={!!selected}
        onOpenChange={() => setSelected(null)}
        direction={isMobile ? "bottom" : "right"}
      >
        <DrawerContent className="p-6 max-w-[480px] mx-auto">
          {selected && (
            <>
              <DrawerHeader>
                <DrawerTitle>Log Details</DrawerTitle>
                <DrawerDescription>
                  Detailed view of the selected transparency log.
                </DrawerDescription>
              </DrawerHeader>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(selected, null, 2)}
              </pre>
              <DrawerFooter className="flex justify-end gap-2">
                <Button variant="outline" className="text-zenith-accent-900">
                  Export JSON
                </Button>
                <Button variant="default" className="bg-zenith-accent-600">
                  Trace Log
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

const getSeverityColor = (severity: TransparencyLog["severity"]) => {
  switch (severity) {
    case "critical":
      return "text-red-600 font-medium bg-red-200";
    case "error":
      return "text-red-400 font-medium bg-red-100";
    case "warning":
      return "text-yellow-600 font-medium bg-yellow-100";
    case "info":
      return "text-green-600 font-medium bg-green-100";
    default:
      return "text-gray-500 font-medium bg-gray-100";
  }
};
