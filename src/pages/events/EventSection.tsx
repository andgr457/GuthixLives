import React from "react";
import "../../styles/Event.css";
import "../../styles/Podium.css";
import { EventImages } from './EventImages';

export interface LateArrival {
  text: string;
  highlight?: string;
}

export interface Winner {
  position: 1 | 2 | 3;
  title: string;
  name: string;
}

export interface EventSectionProps {
  title: string;
  description?: string;
  participants?: string[];
  lateArrival?: LateArrival;
  winners?: Winner[];
  eventDate?: string
  images?: string[]; // array of URLs from /public/img
  footer?: string
}

export const EventSection: React.FC<EventSectionProps> = ({
  title,
  description,
  participants,
  winners,
  eventDate,
  images,
  footer
}) => {
  return (
    <section style={{textAlign: 'center'}}>
      <h2 className="event-title">{title}</h2>

      <p style={{ fontSize: "1.3rem", color: "#aaa", marginTop: "12px", textAlign: "center" }}>
        {eventDate}
      </p>

      <p className='event-paragraph'>
        {description}
      </p>

      <p className='event-paragraph'>
        A very special thanks to the clan members that joined!
      </p>
      {participants && participants.length > 0 && (
        <ul className="event-list">
          {participants.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}

      {winners && winners.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#FFC107", marginBottom: "16px" }}>
            🏆 Winners 🏆
          </h3>
          <div className="podium-container">
            {winners.map((w, i) => (
              <div>
                <div key={i} className={`podium-block podium-${w.position}`}>
                  <p className="podium-name">{w.name}</p>
                  <p className="podium-title">{w.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images && images.length > 0 && (<p className='image-winner'>
        <EventImages images={images.filter(i => i.includes('-winner'))} />
      </p>)}

      <p className="event-footer">
        {footer}
      </p>

      {images && images.length > 0 && (
        <div className="event-images">
          <EventImages images={images.filter(i => !i.includes('-winner'))} />
        </div>
      )}

    </section>
  );
};