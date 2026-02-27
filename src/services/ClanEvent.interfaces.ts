import type { Winner } from '../pages/EventSection';

export interface ClanEvent {
  title: string;
  description?: string;
  participants?: string[];
  winners?: Winner[];
  date?: string; // formatted date string
  images?: string[]
  footer?: string
}