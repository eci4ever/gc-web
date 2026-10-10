import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Prev/next pager for server-paginated lists; hidden on a single page. */
export function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const go = (next: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onPageChange(next);
  };

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Sebelumnya"
            aria-label="Halaman sebelumnya"
            href="#"
            aria-disabled={page <= 1}
            onClick={page > 1 ? go(page - 1) : undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-sm tabular-nums text-muted-foreground">
            Halaman {page} / {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            text="Seterusnya"
            aria-label="Halaman seterusnya"
            href="#"
            aria-disabled={page >= totalPages}
            onClick={page < totalPages ? go(page + 1) : undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
