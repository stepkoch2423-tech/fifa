const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMatchDate(date: string) {
  return shortDateFormatter.format(new Date(date));
}

export function formatLongMatchDate(date: string) {
  return longDateFormatter.format(new Date(date));
}

export function getClubInitials(label: string) {
  const tokens = label
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) return "FC";
  if (tokens.length === 1) return tokens[0].slice(0, 3).toUpperCase();
  return tokens
    .slice(0, 2)
    .map((token) => token[0])
    .join("")
    .toUpperCase();
}
