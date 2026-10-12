"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";

/**
 * Shared scene for the Animated Card hosts: backdrop, walk-in, the raised arm and
 * the envelope hand-off. Each character only draws its own body, so the girl and
 * boy animate identically.
 */
export function BirthdayCharacter({
  animate,
  label,
  skin,
  sleeve,
  children,
}: {
  animate: boolean;
  label: string;
  skin: string;
  sleeve: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 420 420"
      fill="none"
      role="img"
      aria-label={label}
      className="birthday-girl"
    >
      <defs>
        <linearGradient
          id={`${id}skin`}
          x1="175"
          y1="98"
          x2="224"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DDA47D" />
          <stop offset="1" stopColor="#C98C67" />
        </linearGradient>
        <linearGradient
          id={`${id}env`}
          x1="244"
          y1="191"
          x2="299"
          y2="241"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF9F0" />
          <stop offset="1" stopColor="#F3D7CB" />
        </linearGradient>
      </defs>
      <ellipse cx="213" cy="385" rx="98" ry="9" fill="#68507C" opacity=".09" />
      <circle
        cx="211"
        cy="202"
        r="148"
        style={{ fill: "var(--card-halo, #F8EDF0)" }}
        opacity=".52"
      />
      <path
        d="M70 270C37 219 56 131 106 103M314 99C370 139 386 222 357 271"
        stroke="#D7B782"
        strokeWidth="1"
        strokeDasharray="2 8"
      />
      <g stroke="#B99762" strokeWidth="1.4">
        <path d="M92 149v14m-7-7h14M323 165v16m-8-8h16M301 71v11m-5.5-5.5h11M114 292v10m-5-5h10" />
        <path d="m75 215 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6ZM330 278l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" />
      </g>
      <g style={{ fill: "var(--card-dots, #D298AD)" }}>
        <circle cx="132" cy="92" r="2" />
        <circle cx="340" cy="228" r="2" />
        <circle cx="92" cy="278" r="2.5" />
        <circle cx="277" cy="53" r="2" />
      </g>
      <motion.g
        initial={false}
        animate={
          animate
            ? { opacity: [0, 1, 1], x: [-16, 0, 0], y: [8, 0, 0] }
            : { opacity: 1, x: 0, y: 0 }
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {children(id)}
        <motion.g
          id={`${id}arm`}
          style={{ transformOrigin: "233px 180px" }}
          initial={false}
          animate={animate ? { rotate: [6, 6, -7, 0] } : { rotate: 0 }}
          transition={{ duration: 1.7, times: [0, 0.3, 0.75, 1] }}
        >
          <path
            d="m232 178 13 9 12 26 27-8 4 11-37 13c-5 1-9-3-11-8l-14-24"
            fill={skin}
          />
          <path d="m279 204 10-4c5-1 7 3 5 6l-8 9-7-11Z" fill={skin} />
          <path d="m231 168 10 8 5 17-13 6-8-17 6-14Z" fill={sleeve} />
          {/* The card CSS hides this group by its id suffix while the large envelope flies in. */}
          <motion.g
            id={`${id}envelope`}
            style={{ transformOrigin: "282px 197px" }}
            initial={false}
            animate={
              animate
                ? {
                    x: [0, 0, -50, -55, 0],
                    y: [0, 0, 45, 65, 0],
                    scale: [1, 1, 1.7, 1.9, 1],
                    opacity: [1, 1, 1, 0, 1],
                    rotate: [0, 0, -5, 0, 0],
                  }
                : { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ duration: 3, times: [0, 0.32, 0.63, 0.84, 1] }}
          >
            <rect
              x="251"
              y="175"
              width="65"
              height="44"
              rx="3"
              fill={`url(#${id}env)`}
              stroke="#CDA795"
            />
            <path d="m252 217 29-25 34 25" stroke="#DBB9A8" />
            <motion.path
              d="m252 176 29 24 34-24"
              fill="#FFFAF3"
              stroke="#CDA795"
              style={{ transformOrigin: "283px 176px" }}
              initial={false}
              animate={animate ? { scaleY: [1, 1, -1, -1, 1] } : { scaleY: 1 }}
              transition={{ duration: 3, times: [0, 0.4, 0.6, 0.84, 1] }}
            />
            <circle
              cx="282"
              cy="197"
              r="6"
              style={{ fill: "var(--card-seal, #C98598)" }}
            />
            <path
              d="m279 197 3 3 3-3"
              stroke="#FAD8DC"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>
      </motion.g>
      <path
        d="M105 337c-9-19-12-33-10-48m9 43c-15-1-24-9-24-17 13 0 22 6 24 17Zm-8-20c9-5 14-14 10-22-9 3-13 11-10 22Z"
        stroke="#A6AF95"
        strokeWidth="1.5"
        fill="#C6CEBA"
      />
      <path
        d="M316 346c10-19 15-36 14-50m-11 39c15 0 24-8 25-16-12-1-23 6-25 16Zm10-21c-9-5-14-15-10-23 10 4 14 12 10 23Z"
        stroke="#A6AF95"
        strokeWidth="1.5"
        fill="#C6CEBA"
      />
    </svg>
  );
}
