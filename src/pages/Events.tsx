import type { ClanEvent } from '../services/ClanEvent.interfaces';
import { EventSection } from './EventSection';
import { FASTIONSCAPE_1_EVENT } from '../services/events.data';

export default function Events() {
  // Define events data
  const events: ClanEvent[] = [
    FASTIONSCAPE_1_EVENT
  ];

  return (
  <div className="container-item">
    {events.map((event, index) => (
      <div className="panel-item" key={`${index}_${event.title}`}>
        {/* Render the EventSection component */}
        <EventSection
          title={event.title}
          description={event.description}
          participants={event.participants}
          winners={event.winners}
          eventDate={event.date}
          images={event.images}
          footer={event.footer}
        />
      </div>
    ))}
  </div>
);
}