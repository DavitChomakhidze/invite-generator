"use client";

import { motion } from "motion/react";
import { useId } from "react";

export function BirthdayGirl({ animate = false }: { animate?: boolean }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 420 420"
      fill="none"
      role="img"
      aria-label="An illustrated birthday girl in a blush dress presenting an invitation"
      className="birthday-girl"
    >
      <defs>
        <linearGradient
          id={`${id}dress`}
          x1="164"
          y1="194"
          x2="258"
          y2="358"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EFA4B3" />
          <stop offset=".53" stopColor="#D9849D" />
          <stop offset="1" stopColor="#C97190" />
        </linearGradient>
        <linearGradient
          id={`${id}hair`}
          x1="150"
          y1="82"
          x2="251"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4B2E33" />
          <stop offset="1" stopColor="#271D29" />
        </linearGradient>
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
      <circle cx="211" cy="202" r="148" fill="#F8EDF0" opacity=".52" />
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
      <g fill="#D298AD">
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
        <g id={`${id}hair-back`}>
          <path
            d="M166 108c-4-34 13-56 40-56 34-2 53 24 49 54-3 24 14 54 16 78 3 25-21 45-54 42-40 4-68-9-62-39 6-29 12-51 11-79Z"
            fill={`url(#${id}hair)`}
          />
          <path
            d="M248 111c-2 48 22 68 10 91M169 119c-2 35-20 67-7 78"
            stroke="#725044"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".6"
          />
        </g>
        <g id={`${id}legs`}>
          <path
            d="m188 312 20 1-5 62h-14l-1-63ZM225 312l18-2-4 65h-13l-1-63Z"
            fill="#CE926F"
          />
          <path
            d="m188 369 16 1-1 12c-8 4-20 5-23 1-2-4 5-9 8-14ZM226 370h14l9 11c3 6-14 8-22 1l-1-12Z"
            fill="#A8607A"
          />
          <path d="m188 371 15 6m24-1 12-5" stroke="#F1C7D0" strokeWidth="2" />
        </g>
        <path
          d="m181 171-12 13c-8 13-16 39-22 63-2 8 2 13 7 10l13-15 21-51"
          fill="#CE926F"
        />
        <path
          d="m150 244 5 10 9-9"
          stroke="#B5795D"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M194 146v23l-12 6c7 25 43 27 53 0l-14-8v-23"
          fill={`url(#${id}skin)`}
        />
        <path
          d="M194 151c6 9 18 12 27 5v-11h-27v6Z"
          fill="#B6795A"
          opacity=".4"
        />
        <g id={`${id}dress`}>
          <path
            d="m181 168 12 3c6 11 20 11 28-1l13-2 9 20-13 34c3 25 25 55 40 110-29 16-83 20-122-1 14-48 32-84 38-109l-13-34 8-20Z"
            fill={`url(#${id}dress)`}
          />
          <path
            d="m180 171 6 25m48-26-6 26"
            stroke="#FAD3DB"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="m187 217 43 1 1 10h-45l1-11Z" fill="#F5BFCC" />
          <path
            d="M194 234c-2 31-21 73-21 103M212 235v107m13-107c2 27 22 75 24 102"
            stroke="#B86483"
            strokeWidth="2"
            opacity=".5"
          />
          <path
            d="M184 243c-11 31-20 53-23 79m36-66-8 74m39-76 10 72"
            stroke="#F3B9CB"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".55"
          />
          <path
            d="M150 331c31 14 88 15 117 0"
            stroke="#F6C5D1"
            strokeWidth="3"
          />
          <path
            d="m209 221-9-6c-8-3-9 10-2 10l11-4 9-6c8-3 10 10 2 10l-11-4Z"
            fill="#FFDBE2"
          />
          <circle cx="209" cy="221" r="3" fill="#D995AB" />
        </g>
        <g id={`${id}face`}>
          <ellipse cx="177" cy="122" rx="6" ry="9" fill="#CB8B65" />
          <ellipse cx="236" cy="122" rx="6" ry="9" fill="#CB8B65" />
          <path
            d="M178 95c0-21 56-23 57 3l-2 31c-2 17-15 29-26 30-14-2-28-15-29-31V95Z"
            fill={`url(#${id}skin)`}
          />
          <path
            d="M174 111c12-6 22-18 27-29 6 13 20 24 39 27-1-37-22-45-40-40-19 4-29 17-26 42Z"
            fill={`url(#${id}hair)`}
          />
          <path
            d="M185 116c3-2 7-2 10 0m20 0c3-2 7-2 10 0"
            stroke="#5A3432"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M186 123c3 3 6 3 9 0m20 0c3 3 6 3 9 0"
            stroke="#442B30"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="m205 124-2 9h5"
            stroke="#B5785C"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M200 139c4 5 10 5 14-1"
            stroke="#9D535B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse
            cx="189"
            cy="133"
            rx="7"
            ry="3"
            fill="#D17C76"
            opacity=".45"
          />
          <ellipse
            cx="221"
            cy="133"
            rx="7"
            ry="3"
            fill="#D17C76"
            opacity=".45"
          />
          <circle cx="178" cy="133" r="3" fill="#E6C789" />
          <circle cx="235" cy="133" r="3" fill="#E6C789" />
          <path d="M194 173c9 7 18 6 26-1" stroke="#EBD3A3" strokeWidth="1.7" />
          <circle cx="207" cy="177" r="2.5" fill="#F6DBA4" />
        </g>
        <g id={`${id}hair-detail`}>
          <path
            d="M183 83c9-10 23-14 35-7"
            stroke="#785143"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m229 86 10-7m-8 11 12-2"
            stroke="#E7C889"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="233" cy="86" r="3" fill="#F5D9A7" />
        </g>
        <motion.g
          id={`${id}arm`}
          style={{ transformOrigin: "233px 180px" }}
          initial={false}
          animate={animate ? { rotate: [6, 6, -7, 0] } : { rotate: 0 }}
          transition={{ duration: 1.7, times: [0, 0.3, 0.75, 1] }}
        >
          <path
            d="m232 178 13 9 12 26 27-8 4 11-37 13c-5 1-9-3-11-8l-14-24"
            fill="#D79B75"
          />
          <path d="m279 204 10-4c5-1 7 3 5 6l-8 9-7-11Z" fill="#D79B75" />
          <path d="m231 168 10 8 5 17-13 6-8-17 6-14Z" fill="#E69AAF" />
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
            <circle cx="282" cy="197" r="6" fill="#C98598" />
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
