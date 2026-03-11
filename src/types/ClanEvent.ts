import type { Winner } from '../pages/events/EventSection';

export interface ClanEvent {
  id: string
  title: string;
  description?: string;
  participants?: string[];
  winners?: Winner[];
  date?: string; // formatted date string
  images?: string[]
  footer?: string
}