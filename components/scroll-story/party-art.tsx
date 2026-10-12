import { useId } from "react";
import styles from "./story.module.css";

// Original vector decorations. No artwork or media is extracted from the reference.
// Theme colors come from CSS custom properties set on the story, so artwork recolors per theme.
const fill = (token: string) => ({ fill: `var(--${token})` });
const stroke = (token: string) => ({ stroke: `var(--${token})` });
export function DiscoBall({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      className={className}
      data-decoration="disco"
      viewBox="0 0 160 190"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <circle cx="80" cy="109" r="70" />
        </clipPath>
        <pattern
          id={`${id}-tiles`}
          x="6"
          y="34"
          width="75"
          height="70"
          patternUnits="userSpaceOnUse"
        >
          {Array.from({ length: 25 }, (_, i) => {
            const x = i % 5;
            const y = Math.floor(i / 5);
            const colors = [
              "#e2eaff",
              "#b6c1e3",
              "#f9f5ff",
              "#8694c0",
              "#cad6f0",
            ];
            return (
              <rect
                key={i}
                x={x * 15}
                y={y * 14}
                width="13"
                height="12"
                rx="1"
                fill={colors[(x * 3 + y * 7) % colors.length]}
              />
            );
          })}
        </pattern>
      </defs>
      <path d="M80 0v39" stroke="#a884ae" strokeWidth="2" />
      <circle cx="80" cy="109" r="72" fill="#f7f6ff" />
      <g clipPath={`url(#${id})`} transform="rotate(-13 80 109)">
        <circle cx="80" cy="109" r="70" fill="#9ca7d3" />
        <circle cx="80" cy="109" r="70" fill={`url(#${id}-tiles)`} />
        <ellipse
          cx="80"
          cy="109"
          rx="37"
          ry="70"
          stroke="#fff"
          strokeOpacity=".6"
        />
      </g>
      <path
        className={`${styles.discoGlint} ${styles.ambient}`}
        d="m43 70 3 12 12 3-12 3-3 12-3-12-12-3 12-3Z"
        fill="white"
      />
      <path
        className={`${styles.discoGlint} ${styles.ambient}`}
        d="m115 128 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"
        fill="white"
      />
    </svg>
  );
}

export function RibbonBow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-decoration="bow"
      viewBox="0 0 150 160"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M73 66C40 34 7 8 10 41c2 29 45 46 62 37C39 83 27 124 25 150l23-15 9 20c-1-30 7-60 19-75 7 32 29 54 47 67l-1-24 22-2c-31-16-50-31-61-48 24 17 61-7 60-32-1-33-47-2-64 25Z"
        style={{ ...fill("deco-main"), ...stroke("deco-line") }}
        strokeWidth="2"
      />
      <path
        d="M69 68C48 48 27 30 23 36c-5 15 26 37 44 37m16-6c20-17 39-28 45-24 0 14-22 29-43 30M73 80c-18 18-28 41-29 59m40-58c13 25 26 37 44 47"
        style={stroke("deco-light")}
        strokeWidth="6"
      />
      <path
        d="m68 61 14-2 7 18-17 7Z"
        style={{ ...fill("deco-light"), ...stroke("deco-line") }}
        strokeWidth="2"
      />
    </svg>
  );
}

export function PartyHat({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 110 140"
      data-decoration="hat"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m55 17-43 99q43 26 86 0Z"
        style={fill("deco-cool")}
        stroke="#fff5fb"
        strokeWidth="4"
      />
      <path
        d="m47 36-8 71m16-81 2 87m8-77 17 75"
        style={stroke("deco-main")}
        strokeWidth="9"
      />
      <path
        d="M12 111q43 27 86 0l-3 13q-40 25-80 0Z"
        style={fill("deco-deep")}
      />
      <path
        d="m55 2 5 8 9-1-3 9 5 7-10 2-6 8-5-8-10-2 5-7-3-9 9 1Z"
        style={fill("deco-cool-light")}
      />
      <path
        d="m23 121 5 1m13 4 5 1m13 0 5-1m12-3 5-2"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PartyGlass({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 85 130"
      data-decoration="glass"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="63"
        cy="25"
        r="18"
        fill="#e9e58e"
        stroke="#8f9560"
        strokeWidth="2"
      />
      <path
        d="M63 10v30M48 25h30M52 14l22 22m0-22L52 36"
        stroke="#fffbc4"
        strokeWidth="2"
      />
      <path
        d="m10 33 63 1-32 43Z"
        style={{ ...fill("deco-main"), ...stroke("deco-line") }}
        strokeWidth="2"
      />
      <path d="m16 42 51 1-26 34Z" style={fill("deco-deep")} />
      <path
        d="M41 77v39m-20 5q20-10 40 0Z"
        style={stroke("deco-line")}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="m22 35 10 12" style={stroke("deco-light")} strokeWidth="3" />
    </svg>
  );
}

export function Kiss({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-decoration="kiss"
      viewBox="0 0 90 65"
      aria-hidden="true"
    >
      <path
        d="M5 31C25 25 24 7 39 17l6 6 7-7c12-9 19 9 33 15-19 5-23 24-41 24S20 39 5 31Z"
        fill="#d365a2"
      />
      <path d="M9 31q35 5 72 0-38 21-72 0Z" fill="#fbd6ee" />
      <path
        d="m25 21 3 9m8-10 3 10m14-10-3 10m14-10-4 10M29 39l5 6m7-7 2 11m10-11-2 9m12-9-4 5"
        stroke="#f9badd"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Balloons({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-decoration="balloons"
      viewBox="0 0 120 190"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M38 92c4 30-10 52 6 96M84 82c-6 32 10 58-10 106"
        style={stroke("deco-line")}
        strokeWidth="1.5"
      />
      <ellipse
        cx="38"
        cy="52"
        rx="30"
        ry="38"
        style={{ ...fill("deco-main"), ...stroke("deco-line") }}
        strokeWidth="2"
      />
      <path d="m33 89 5 6 5-6Z" style={fill("deco-main")} />
      <ellipse
        cx="84"
        cy="46"
        rx="26"
        ry="33"
        style={{ ...fill("deco-cool"), ...stroke("deco-line") }}
        strokeWidth="2"
      />
      <path d="m80 78 4 6 4-6Z" style={fill("deco-cool")} />
      <path
        d="M24 34q6-12 16-14M73 30q4-9 12-11"
        style={stroke("deco-light")}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Balloon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-decoration="balloon"
      viewBox="0 0 50 110"
      fill="none"
      aria-hidden="true"
    >
      <path d="M25 66c-6 16 8 26-2 44" style={stroke("deco-line")} />
      <ellipse
        cx="25"
        cy="32"
        rx="21"
        ry="28"
        style={{ ...fill("deco-deep"), ...stroke("deco-line") }}
        strokeWidth="1.5"
      />
      <path d="m21 59 4 6 4-6Z" style={fill("deco-deep")} />
      <path
        d="M14 20q4-8 11-10"
        style={stroke("deco-light")}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BowTie({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-decoration="bowtie"
      viewBox="0 0 120 68"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M52 28 10 6Q2 34 10 62l42-22Zm16 0 42-22q8 28 0 56L68 40Z"
        style={{ ...fill("deco-main"), ...stroke("deco-line") }}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 18q-4 16 0 32M100 18q4 16 0 32"
        style={stroke("deco-deep")}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="50"
        y="22"
        width="20"
        height="24"
        rx="5"
        style={{ ...fill("deco-deep"), ...stroke("deco-line") }}
        strokeWidth="2.5"
      />
    </svg>
  );
}
