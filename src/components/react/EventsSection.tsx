import React, { useState, useEffect } from 'react';
import { EventCard, type IEvent } from './EventCard';
import './EventsSection.css';

export const EventsSection: React.FC = () => {
  const [eventType, setEventType] = useState<'future' | 'past'>('future');
  const [events, setEvents] = useState<IEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (type: 'future' | 'past', pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events?type=${type}&page=${pageNum}&limit=6`);
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await res.json();
      setEvents(data.events);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(eventType, page);
  }, [eventType, page]);

  const handleTypeChange = (type: 'future' | 'past') => {
    setEventType(type);
    setPage(1); // Reset to first page when switching types
  };

  return (
    <div className="events-section">
      <div className="events-header">
        <h2 className="events-title">Our Events</h2>
        <div className="events-tabs">
          <button 
            className={`events-tab ${eventType === 'future' ? 'active' : ''}`}
            onClick={() => handleTypeChange('future')}
          >
            Future Events
          </button>
          <button 
            className={`events-tab ${eventType === 'past' ? 'active' : ''}`}
            onClick={() => handleTypeChange('past')}
          >
            Past Events
          </button>
        </div>
      </div>

      {error && <div className="events-error">{error}</div>}

      <div className="events-grid-wrapper">
        {isLoading ? (
          <div className="events-loading">
            <div className="spinner"></div>
            <span>Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            No {eventType} events found.
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="events-pagination">
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
      )}
    </div>
  );
};
