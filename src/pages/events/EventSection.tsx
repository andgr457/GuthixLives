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
      <div className="event-title">
        {title}
        <div style={{fontWeight: 'bolder', fontSize: '0.75em'}}>
          {eventDate}
        </div>
      </div>
      
      <div>
        {description}
      </div>

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
          <div>
            
            {winners.map((w) => (
              <div>
                {w.name} <strong>{w.title}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {images && images.length > 0 && (<p className='image-winner'>
        <EventImages images={images.filter(i => i.includes('-winner'))} />
      </p>)}

      <div>
        {footer}
      </div>

      {images && images.length > 0 && (
        <div className="event-images">
          <EventImages images={images.filter(i => !i.includes('-winner'))} />
        </div>
      )}

    </section>
  );
};