import React, { useState, useEffect } from "react";
import "./AdminTable.css"; // We'll use a shared CSS file for both tables
import { TrashIcon } from "../../icons/TrashIcon";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Pagination } from "./Pagination";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

dayjs.extend(utc);

interface IRequest {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export const RequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);

  const fetchRequests = async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/requests?page=${pageNum}&limit=10`);
      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }
      const data = (await res.json()) as {
        data: IRequest[];
        totalPages: number;
      };
      setRequests(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(page);
  }, [page]);

  const handleDeletePrompt = (req: IRequest) => {
    setSelectedRequest(req);
    setIsDeleteOpen(true);
  };

  const refreshTable = () => {
    fetchRequests(page);
  };

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Requests</h2>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="whitespace-nowrap">
                    {dayjs.utc(req.created_at).local().format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td>{req.name}</td>
                  <td>{req.email}</td>
                  <td title={req.message}>{req.message}</td>
                  <td>
                    <button
                      className="icon-btn delete-icon-btn"
                      onClick={() => handleDeletePrompt(req)}
                      title="Delete"
                    >
                      <TrashIcon width={20} height={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} isLoading={isLoading} setPage={setPage} />

      {isDeleteOpen && selectedRequest && (
        <DeleteConfirmModal
          type="request"
          id={selectedRequest.id}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => {
            setIsDeleteOpen(false);
            refreshTable();
          }}
        />
      )}
    </div>
  );
};
