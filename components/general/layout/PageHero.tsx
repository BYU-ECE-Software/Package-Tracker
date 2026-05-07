import Image from "next/image";
import { NEXT_PUBLIC_BASE_PATH } from "@/next.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageHeroProps = {
  /** Card title rendered below the image */
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Path to the hero image (relative to NEXT_PUBLIC_BASE_PATH) */
  image?: string;
  /** CSS height of the image strip — number (px) or any CSS string e.g. "50vh" */
  height?: number | string;
  /** How the image fills its container */
  fit?: "cover" | "contain";
  /** CSS object-position for fine-tuning crop, e.g. "center 20%" */
  position?: string;
  /** Pull the card upward so it overlaps the bottom of the image */
  overlap?: boolean;
  /** Large text centred on the hero image */
  heroText?: string;
  /** Smaller text centred on the hero image, below heroText */
  heroSubtext?: string;
  /** Content rendered inside the card below title/subtitle */
  children?: React.ReactNode;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroOverlayText({
  heroText,
  heroSubtext,
}: {
  heroText?: string;
  heroSubtext?: string;
}) {
  if (!heroText && !heroSubtext) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center text-center">
      <div className="px-4 text-white">
        {heroText && (
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heroText}
          </h2>
        )}
        {heroSubtext && (
          <p className="mt-2 text-lg md:text-xl lg:text-2xl">{heroSubtext}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Full-width hero image with an overlapping (or stacked) content card.
 *
 * @param title      Card heading (required)
 * @param subtitle   Card subheading
 * @param image      Image path relative to NEXT_PUBLIC_BASE_PATH
 * @param height     CSS height of the image strip (default "60vh")
 * @param fit        "cover" (default) or "contain"
 * @param position   CSS object-position string (default "center")
 * @param overlap    Pull card up to overlap the image (default false)
 * @param heroText   Large centred text on the image
 * @param heroSubtext Smaller centred text on the image
 * @param children   Content inside the card
 */
export default function PageHero({
  title,
  subtitle,
  image = "/images/hero-default.webp",
  height = "60vh",
  fit = "cover",
  position = "center",
  overlap = false,
  heroText,
  heroSubtext,
  children,
}: PageHeroProps) {
  const imageHeight: React.CSSProperties = {
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <section className="relative">
      {/* Hero image strip */}
      <div className="relative w-full overflow-hidden" style={imageHeight}>
        <Image
          src={NEXT_PUBLIC_BASE_PATH + image}
          alt=""
          fill
          priority
          className={fit === "contain" ? "object-contain bg-slate-100" : "object-cover"}
          style={{ objectPosition: position }}
        />
        {/* Darkening overlay for text legibility */}
        <div className="absolute inset-0 bg-slate-900/40" />
        <HeroOverlayText heroText={heroText} heroSubtext={heroSubtext} />
      </div>

      {/* Content card */}
      <div className={`container-wide pb-6 ${overlap ? "-mt-16" : "mt-6"}`}>
        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}