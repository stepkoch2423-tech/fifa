import type { Player, PlayerStats } from "../types/football";

export const PLAYER_STAT_KEYS: {
  key: keyof PlayerStats;
  label: string;
}[] = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical", label: "PHY" },
];

const IMAGE_WIDTHS = {
  table: 96,
  card: 160,
  hero: 220,
  modal: 320,
} as const;

export type PlayerImageVariant = keyof typeof IMAGE_WIDTHS;

export function getTopAttributes(player: Player, count = 3) {
  return [...PLAYER_STAT_KEYS]
    .map((entry) => ({
      ...entry,
      value: player[entry.key],
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, count);
}

export function getOptimizedPlayerImageUrl(
  url: string,
  variant: PlayerImageVariant,
) {
  if (url.startsWith("data:")) return url;

  if (url.startsWith("/player-photos-optimized/")) {
    return url;
  }

  if (url.startsWith("/player-photos/")) {
    return url
      .replace("/player-photos/", "/player-photos-optimized/")
      .replace(/\.[^.]+$/, ".jpg");
  }

  const width = IMAGE_WIDTHS[variant];
  if (url.includes("upload.wikimedia.org") && /\/\d+px-/.test(url)) {
    return url.replace(/\/\d+px-/, `/${width}px-`);
  }

  if (
    url.includes("upload.wikimedia.org/wikipedia/commons/") &&
    !url.includes("/wikipedia/commons/thumb/")
  ) {
    try {
      const parsedUrl = new URL(url);
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const commonsIndex = segments.indexOf("commons");
      const fileSegments = segments.slice(commonsIndex + 1);
      const fileName = fileSegments[fileSegments.length - 1];

      if (fileSegments.length >= 3 && fileName) {
        return `https://${parsedUrl.host}/wikipedia/commons/thumb/${fileSegments.join("/")}/${width}px-${fileName}`;
      }
    } catch {
      return url;
    }
  }

  return url;
}

export function createPlayerAvatarDataUrl(
  name: string,
  startColor: string,
  endColor: string,
) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${startColor}" />
          <stop offset="1" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="480" height="640" rx="40" fill="#07101f"/>
      <rect x="24" y="24" width="432" height="592" rx="32" fill="url(#g)" opacity="0.94"/>
      <circle cx="240" cy="214" r="98" fill="rgba(255,255,255,0.18)"/>
      <path d="M240 152c34 0 61 27 61 61s-27 61-61 61-61-27-61-61 27-61 61-61Z" fill="rgba(7,16,31,0.36)"/>
      <path d="M122 474c18-74 83-121 118-121s100 47 118 121v68H122v-68Z" fill="rgba(7,16,31,0.36)"/>
      <text x="240" y="574" text-anchor="middle" fill="white" font-size="92" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
