import React, { useState, useEffect } from "react";
import "./AdminTable.css";
import { ResourceFormModal } from "./ResourceFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Pagination } from "./Pagination";
import { PencilIcon } from "../../icons/PencilIcon";
import { TrashIcon } from "../../icons/TrashIcon";

export interface IResource {
  id: number;
  name: string;
  isVideo: boolean;
  url: string | null;
  description: string;
  img: string;
  created_at: string;
  imgUrl?: string;
}

export const ResourcesTable: React.FC = () => {
  const [resources, setResources] = useState<IResource[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<IResource | null>(
    null,
  );

  const fetchResources = async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/resources?page=${pageNum}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = (await res.json()) as {
        data: IResource[];
        totalPages: number;
      };
      setResources(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Error fetching resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(page);
  }, [page]);

  const handleCreate = () => {
    setSelectedResource(null);
    setIsFormOpen(true);
  };

  const handleEdit = (resource: IResource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (resource: IResource) => {
    setSelectedResource(resource);
    setIsDeleteOpen(true);
  };

  const refreshTable = () => {
    fetchResources(page);
  };

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Resources</h2>
        <button className="admin-action-btn" onClick={handleCreate}>
          Create Resource
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
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
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No resources found.
                </td>
              </tr>
            ) : (
              resources.map((res) => (
                <tr key={res.id}>
                  <td>
                    {res.imgUrl ? (
                      <img
                        src={res.imgUrl}
                        alt={res.name}
                        className="admin-table-thumbnail"
                      />
                    ) : (
                      <div className="admin-table-thumbnail-placeholder">
                        No Img
                      </div>
                    )}
                  </td>
                  <td>{res.name}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        background: res.isVideo
                          ? "hsl(0 72% 95%)"
                          : "hsl(213 72% 95%)",
                        color: res.isVideo
                          ? "hsl(0 72% 40%)"
                          : "hsl(213 72% 40%)",
                      }}
                    >
                      {res.isVideo ? "Video" : "Article"}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="icon-btn"
                        onClick={() => handleEdit(res)}
                        title="Edit"
                      >
                        <PencilIcon width={20} height={20} />
                      </button>
                      <button
                        className="icon-btn delete-icon-btn"
                        onClick={() => handleDeletePrompt(res)}
                        title="Delete"
                      >
                        <TrashIcon width={20} height={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        setPage={setPage}
      />

      {isFormOpen && (
        <ResourceFormModal
          resource={selectedResource}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            refreshTable();
          }}
        />
      )}

      {isDeleteOpen && selectedResource && (
        <DeleteConfirmModal
          type="resource"
          id={selectedResource.id}
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
