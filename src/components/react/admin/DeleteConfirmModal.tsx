import React, { useState } from "react";
import "./AdminModal.css";
import { showSnackbar } from "../../../utils/snackbar";

interface Props {
  type: "event" | "request" | "resource";
  id: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({ type, id, onClose, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/${type}s?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error((errData as { error: string }).error || `Failed to delete ${type}`);
      }

      onSuccess();
      showSnackbar(`Deleted ${type} successfully`, "success");
    } catch (err: any) {
      showSnackbar(err.message || "An unexpected error occurred", "error");
      setIsDeleting(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content small-modal" onClick={handleModalClick}>
        <div className="admin-modal-header">
          <h3>Delete {type}</h3>
          <button className="admin-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="admin-error mb-4">{error}</div>}

        <div className="admin-modal-body">
          <p>Are you sure you want to delete this {type}?</p>
          <p className="text-danger mt-2 text-sm">This action cannot be undone.</p>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-action-btn outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-action-btn delete"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : `Delete ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
};
