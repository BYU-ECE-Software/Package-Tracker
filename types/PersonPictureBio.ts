// Shape consumed by components/ui/cards/pictureBio.tsx (PersonPictureBioCard).
// Mirrors the Template-Repo type so the card stays drop-in compatible.

export type PersonPictureBio = {
  id: string;
  name: string;
  /** Image path relative to NEXT_PUBLIC_BASE_PATH. Falls back to /images/Cosmo.jpg. */
  image?: string;
  /** Department, role, or other short label rendered under the name. */
  affiliation?: string;
  bio?: string;
  /** When set, the whole card becomes a clickable link. External http(s) URLs open in a new tab. */
  link?: string;
};
