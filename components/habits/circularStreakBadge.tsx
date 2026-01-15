"use client";

import * as React from "react";

type Variant = "current" | "best";

export default function CircularStreakBadge({
  value,
  variant = "current",
  size = 56, // ✅ default 56
}: {
  value: number;
  variant?: Variant;
  size?: number;
}) {
  const ringText =
    variant === "best"
      ? "BEST STREAK • DAYS •"
      : "CURRENT STREAK • DAYS •";

  const color = variant === "best" ? "#F59E0B" : "#F97316"; // yellow / orange
  const bg = variant === "best" ? "#FEF3C7" : "#FFEDD5"; // yellow-100 / orange-100

  // ✅ tuned for 56px
  const outerRing = 4;
  const labelRing = 11;
  const innerPadding = 1;

  const r = size / 2;
  const innerRadius = r - outerRing - labelRing - innerPadding;

  const pathId = React.useId();
  const textRadius = r - outerRing - labelRing / 2;

  return (
    <div
      className="shrink-0"
      style={{ width: size, height: size }}
      aria-label={`${variant === "best" ? "Best" : "Current"} streak: ${value} days`}
      title={`${variant === "best" ? "Best" : "Current"} streak: ${value} days`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* outer thick ring */}
        <circle
          cx={r}
          cy={r}
          r={r - outerRing / 2}
          fill="transparent"
          stroke={color}
          strokeWidth={outerRing}
        />

        {/* label band */}
        <circle
          cx={r}
          cy={r}
          r={r - outerRing - labelRing / 2}
          fill="transparent"
          stroke={bg}
          strokeWidth={labelRing}
        />

        {/* circular path */}
        <defs>
          <path
            id={pathId}
            d={`
              M ${r} ${r - textRadius}
              a ${textRadius} ${textRadius} 0 1 1 0 ${textRadius * 2}
              a ${textRadius} ${textRadius} 0 1 1 0 -${textRadius * 2}
            `}
          />
        </defs>

        {/* circular text */}
        <text
          fill={color}
          fontSize="6.2"
          fontWeight="900"
          letterSpacing="1.4"
          style={{ textTransform: "uppercase" }}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {ringText}
          </textPath>
        </text>

        {/* inner circle */}
        <circle
          cx={r}
          cy={r}
          r={innerRadius}
          fill={bg}
          stroke={color}
          strokeWidth="1.8"
        />

        {/* number */}
        <text
          x={r}
          y={r}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="900"
          fill={color}
        >
          {value}
        </text>
      </svg>
    </div>
  );
}
