"use client";

import { BirthdayCharacter } from "@/components/birthday-character";

// Original vector artwork drawn on the same 420×420 grid and pose as BirthdayGirl.
export function BirthdayBoy({ animate = false }: { animate?: boolean }) {
  return (
    <BirthdayCharacter
      animate={animate}
      label="An illustrated birthday boy in a shirt and bow tie presenting an invitation"
      skin="#D79B75"
      sleeve="#8DB4DE"
    >
      {(id) => (
        <>
          <defs>
            <linearGradient
              id={`${id}shirt`}
              x1="170"
              y1="168"
              x2="246"
              y2="280"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A9CBEB" />
              <stop offset="1" stopColor="#6E9ACB" />
            </linearGradient>
            <linearGradient
              id={`${id}hair`}
              x1="170"
              y1="52"
              x2="246"
              y2="118"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5A3A2E" />
              <stop offset="1" stopColor="#33231F" />
            </linearGradient>
          </defs>
          <g id={`${id}left-arm`}>
            <path
              d="m181 171-12 13c-8 13-16 39-22 63-2 8 2 13 7 10l13-15 21-51"
              fill="#CE926F"
            />
            <path
              d="m181 169-12 14c-6 10-11 22-14 33l17 6 16-40Z"
              fill="#8DB4DE"
            />
            <path
              d="m150 244 5 10 9-9"
              stroke="#B5795D"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M194 146v23l-12 6c7 25 43 27 53 0l-14-8v-23"
            fill={`url(#${id}skin)`}
          />
          <g id={`${id}top`}>
            <path
              d="M181 168 193 171C199 182 213 182 221 170L234 168 243 188 235 214 239 272C217 280 199 280 177 272L181 214 173 188Z"
              fill={`url(#${id}shirt)`}
            />
            <path d="M193 171 208 186 200 193 189 178Z" fill="#F4F8FC" />
            <path d="M221 170 208 186 216 193 227 177Z" fill="#F4F8FC" />
            <g fill="#F4F8FC">
              <circle cx="208" cy="207" r="1.8" />
              <circle cx="208" cy="224" r="1.8" />
              <circle cx="208" cy="241" r="1.8" />
            </g>
            <path
              d="M208 189 195 182v14Zm0 0 13-7v14Z"
              fill="#2C3E66"
              stroke="#22325A"
              strokeLinejoin="round"
            />
            <circle cx="208" cy="189" r="3.2" fill="#22325A" />
          </g>
          <g id={`${id}legs`}>
            <path d="M178 264h60l-3 108h-18l-9-80-9 80h-18Z" fill="#3E4F7E" />
            <path d="M178 264h60v8h-60Z" fill="#2C3A5E" />
            <rect x="203" y="265" width="10" height="6" rx="1" fill="#D7B782" />
            <path
              d="M181 370h19c3 0 5 6 3 10-8 4-23 4-27 0 0-6 2-10 5-10ZM217 370h18c3 0 5 4 5 10-4 4-19 4-27 0-1-4 1-10 4-10Z"
              fill="#4A3428"
            />
          </g>
          <g id={`${id}face`}>
            <ellipse cx="177" cy="122" rx="6" ry="9" fill="#CB8B65" />
            <ellipse cx="236" cy="122" rx="6" ry="9" fill="#CB8B65" />
            <path
              d="M178 95c0-21 56-23 57 3l-2 31c-2 17-15 29-26 30-14-2-28-15-29-31V95Z"
              fill={`url(#${id}skin)`}
            />
            <path
              d="M174 112c-6-34 10-58 36-60 28-2 46 16 42 48l-3 12c-4-14-10-24-20-30-14 10-34 16-52 18l-3 12Z"
              fill={`url(#${id}hair)`}
            />
            <path
              d="M188 86c13-7 29-8 43 0"
              stroke="#7A5444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M184 115c4-2 8-2 11 0m20 0c3-2 7-2 11 0"
              stroke="#4A2F2A"
              strokeWidth="2.2"
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
              d="M199 139c5 5 11 5 16-1"
              stroke="#8E5048"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <ellipse
              cx="189"
              cy="133"
              rx="7"
              ry="3"
              fill="#D17C76"
              opacity=".22"
            />
            <ellipse
              cx="221"
              cy="133"
              rx="7"
              ry="3"
              fill="#D17C76"
              opacity=".22"
            />
          </g>
        </>
      )}
    </BirthdayCharacter>
  );
}
