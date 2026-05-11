import React from "react";

export function Pagination({
  page,
  totalPages,
  isLoading,
  setPage,
}: {
  page: number;
  totalPages: number;
  isLoading: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    totalPages > 1 && (
      <div className="admin-pagination">
        <button
          disabled={page === 1 || isLoading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages || isLoading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    )
  );
}
