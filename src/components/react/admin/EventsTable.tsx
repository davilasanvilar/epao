import React, { useState, useEffect } from "react";
import "./AdminTable.css";
import { EventFormModal } from "./EventFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Pagination } from "./Pagination";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { PencilIcon } from "../../icons/PencilIcon";
import { TrashIcon } from "../../icons/TrashIcon";

dayjs.extend(utc);

export interface IEvent {
  id: number;
  name: string;
  description: string;
  price: number;
  date: string;
  img: string;
  imgUrl?: string;
}

export const EventsTable: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const fetchEvents = async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events?page=${pageNum}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = (await res.json()) as { data: IEvent[]; totalPages: number };
      setEvents(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Error fetching events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: IEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (event: IEvent) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const refreshTable = () => {
    fetchEvents(page);
  };

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Events</h2>
        <button className="admin-action-btn" onClick={handleCreate}>
          Create Event
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Date</th>
              <th>Name</th>
              <th>Price</th>
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
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id}>
                  <td>
                    {evt.imgUrl ? (
                      <img src={evt.imgUrl} alt={evt.name} className="admin-table-thumbnail" />
                    ) : (
                      <div className="admin-table-thumbnail-placeholder">No Img</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    {dayjs.utc(evt.date).local().format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td>{evt.name}</td>
                  <td>{evt.price === 0 ? "Free" : `${evt.price} €`}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="icon-btn" onClick={() => handleEdit(evt)} title="Edit">
                        <PencilIcon width={20} height={20} />
                      </button>
                      <button
                        className="icon-btn delete-icon-btn"
                        onClick={() => handleDeletePrompt(evt)}
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

      <Pagination page={page} totalPages={totalPages} isLoading={isLoading} setPage={setPage} />

      {isFormOpen && (
        <EventFormModal
          event={selectedEvent}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            refreshTable();
          }}
        />
      )}

      {isDeleteOpen && selectedEvent && (
        <DeleteConfirmModal
          type="event"
          id={selectedEvent.id}
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
