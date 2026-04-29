// IDENTICAL to Template-Repo: components/general/cards/pictureBio.tsx
// Only difference: NEXT_PUBLIC_BASE_PATH is read from process.env directly
// instead of being re-exported from next.config.
import Image from "next/image";
import Link from "next/link";
import type { PersonPictureBio } from "@/types/PersonPictureBio";

const NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// ─── Inner card layout (always rendered) ─────────────────────────────────────

function PersonPictureBioCardInner({ personPictureBio }: { personPictureBio: PersonPictureBio }) {
  const imageSrc = NEXT_PUBLIC_BASE_PATH + (personPictureBio.image || "/images/Cosmo.jpg");

  return (
    <article
      id={personPictureBio.id}
      className={[
        "card p-4 md:p-6",
        "flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6",
        "transition-transform duration-200 ease-out",
        personPictureBio.link ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Portrait */}
      <div className="relative mx-auto w-full max-w-[220px] aspect-[4/5] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:mx-0 sm:w-[140px] sm:max-w-none sm:aspect-[7/8]">
        <Image
          src={imageSrc}
          alt={personPictureBio.name}
          fill
          sizes="(max-width: 640px) 220px, 140px"
          className="object-cover object-top"
        />
      </div>

      {/* Text content */}
      <div className="flex min-w-0 flex-col text-center sm:text-left">
        <h3 className="text-lg font-semibold leading-tight">{personPictureBio.name}</h3>

        {personPictureBio.affiliation && (
          <p className="mt-1 text-sm font-medium text-slate-600">{personPictureBio.affiliation}</p>
        )}

        {personPictureBio.bio && (
          <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
            {personPictureBio.bio}
          </p>
        )}

        {personPictureBio.link && (
          <p className="mt-3 text-sm font-medium text-[var(--byu-royal)]">
            View profile →
          </p>
        )}
      </div>
    </article>
  );
}

// ─── Link wrapper ─────────────────────────────────────────────────────────────

const LINK_CLASS =
  "block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--byu-royal)] rounded-2xl";

function PersonPictureBioLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = /^https?:\/\//i.test(href);

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {children}
    </a>
  ) : (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Renders a personPictureBio bio card.
 * If `personPictureBio.link` is set, the whole card becomes a clickable link.
 * External URLs (http/https) open in a new tab; internal paths use Next router.
 */
export default function PersonPictureBioCard({ personPictureBio }: { personPictureBio: PersonPictureBio }) {
  const inner = <PersonPictureBioCardInner personPictureBio={personPictureBio} />;

  return personPictureBio.link ? <PersonPictureBioLink href={personPictureBio.link}>{inner}</PersonPictureBioLink> : inner;
}