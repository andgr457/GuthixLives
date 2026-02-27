import { DateTime } from 'luxon';
import type { ClanEvent } from './ClanEvent.interfaces';

export const FASTIONSCAPE_1_EVENT: ClanEvent = {
  title: "👑 Guthix Lives – First Ever Fashionscape! 👑",
  description:
    "Our very first Clan Fashionscape lit up Varrock Square — and what a turnout it was!",
  participants: [
    "👑 Tessa Cero",
    "✨ Frostbit",
    "🛡️ Dwarf Cut",
    "🔥 Anub'Nerevar",
    "👑 Lord Meggedo",
    "⚡ Wolf of Odin",
    "🏹 Kingz Bow",
    '🗡️ Hint'
  ],
  winners: [
    { position: 2, title: "2nd Place", name: "Wolf of Odin" },
    { position: 1, title: "Grand Champion", name: "Hint" },
    { position: 3, title: "3rd Place", name: "Lord Meggedo & Dwarf Cut" },
  ],
  date: DateTime.fromObject({
    day: 26,
    month: 2,
    year: 2026,
    hour: 19,
    minute: 0,
    second: 0,
  })
    .toLocal()
    .toFormat("DDD t"),
  images: [
    '/img/fs-1-group.png',
    '/img/fs-1-winner.png',
    '/img/fs-1-group-2.png',
    '/img/fs-1-group-3.png'
  ],
  footer: 'This was just the beginning. More events, more creativity, and even bigger turnouts ahead with more rewards to be earned.'
}
  