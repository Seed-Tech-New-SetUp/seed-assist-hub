import { useState, useMemo, ReactNode } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: (item: T) => string | number | Date;
}

interface EventsDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((item: T) => string);
  filterSlot?: ReactNode;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

type SortDirection = "asc" | "desc" | null;

export function EventsDataTable<T extends { id?: string; event_id?: string }>({
  data,
  columns,
  searchPlaceholder = "Search events...",
  searchKey,
  filterSlot,
  emptyMessage = "No events found",
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
}: EventsDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle column header click for sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter data based on search (applied to ALL data, not just current page)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchKey) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const value = typeof searchKey === "function" 
        ? searchKey(item) 
        : String(item[searchKey] ?? "");
      return value.toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchKey]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    
    const column = columns.find(c => c.key === sortColumn);
    if (!column?.sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = column.sortKey!(a);
      const bVal = column.sortKey!(b);
      
      let comparison = 0;
      if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to page 1 when search or data changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("ellipsis");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3.5 w-3.5 ml-1" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Row: Page Size, Count, Search, and Filters */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Page size selector and event count */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>entries</span>
            <span className="text-foreground font-medium ml-2">
              {sortedData.length > 0 
                ? `(Showing ${startIndex + 1}-${endIndex} of ${sortedData.length} events)`
                : "(No events found)"
              }
            </span>
          </div>
        </div>

        {/* Row 2: Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {filterSlot && (
            <div className="flex flex-wrap gap-4 items-center">
              {filterSlot}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={cn(
                    col.className,
                    col.sortKey && "cursor-pointer select-none hover:bg-muted/50"
                  )}
                  onClick={() => col.sortKey && handleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortKey && renderSortIcon(col.key)}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={item.id || item.event_id || index}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
