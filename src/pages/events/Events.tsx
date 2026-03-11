import type { ClanEvent } from '../../types/ClanEvent';
import { EventSection } from './EventSection';
import { FASTIONSCAPE_1_EVENT } from '../../services/events/Events.data';

export default function Events() {
  // Define events data
  const events: ClanEvent[] = [
    FASTIONSCAPE_1_EVENT
  ];

  return (
  <div>
    {events.map((event, index) => (
      <div className='parchment' style={{marginLeft: '5%', marginRight: '5%'}} key={`${index}_${event.title}`}>
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