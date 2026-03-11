import type { ClanEvent } from '../../types/ClanEvent';
import { EventSection } from './EventSection';
import { FASHIONSCAPE_1_EVENT } from '../../services/events/Events.data';

export default function Events() {
  // Define events data
  const events: ClanEvent[] = [
    FASHIONSCAPE_1_EVENT
  ];

  return (
  <div>
    <div className='parchment'>
      <div className='event-title'>Events</div>
      {events.map((event, index) => {
        return <div>
          <a href={`#${event.id}_${index}`}>{index+1}. {event.title}</a>
        </div>
      })}
    </div>
    {events.map((event, index) => (
      <div id={`${event.id}_${index}`} className='parchment' style={{marginLeft: '5%', marginRight: '5%'}} key={`${index}_${event.title}`}>
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