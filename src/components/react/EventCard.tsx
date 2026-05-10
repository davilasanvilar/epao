import React, { useState } from "react";
import "./EventCard.css";
import dayjs from "dayjs";

export interface IEvent {
  id: number;
  name: string;
  description: string;
  price: number;
  date: string;
  img: string;
}

export const EventCard: React.FC<{ event: IEvent }> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`event-card ${isOpen ? "open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
      role="button"
      tabIndex={0}
    >
      <img src={event.img} alt={event.name} className="event-img" />

      <div className="event-content">
        <span className="event-date">{event.date}</span>
        <h3 className="event-title">{event.name}</h3>

        <div className="event-details-wrapper">
          <div className="event-details-inner">
            <p className="event-description">{event.description}</p>
            <div className="event-price">
              {event.price === 0 ? "Free" : `${event.price} EUR `}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
