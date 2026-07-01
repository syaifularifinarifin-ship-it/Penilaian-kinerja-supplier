/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon" | "print" | "white";
  height?: number;
}

export default function Logo({ className = "", variant = "full", height = 40 }: LogoProps) {
  const scale = height / 40;
  const width = variant === "icon" ? height : height * 4.2;

  // Render standard icon only (PLN Yellow Shield with Red Lightning and Blue Waves)
  const renderIcon = (isWhiteText = false, isPrint = false) => (
    <svg
      width={40 * scale}
      height={40 * scale}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* PLN Yellow Shield/Trapezoid */}
      <path
        d="M6 4C6 2.89543 6.89543 2 8 2H32C33.1046 2 34 2.89543 34 4V31C34 32.1046 33.1046 33 32 33H8C6.89543 33 6 32.1046 6 31V4Z"
        fill={isPrint ? "#facc15" : "#FBBF24"}
        stroke={isPrint ? "#000" : "#D97706"}
        strokeWidth="1"
      />
      {/* Three Blue Waves */}
      <path
        d="M10 12C13 12 14 14 17 14C20 14 21 12 24 12C27 12 28 14 31 14"
        stroke={isPrint ? "#1e3a8a" : "#1D4ED8"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10 18C13 18 14 20 17 20C20 20 21 18 24 18C27 18 28 20 31 20"
        stroke={isPrint ? "#1e3a8a" : "#1D4ED8"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10 24C13 24 14 26 17 26C20 26 21 24 24 24C27 24 28 26 31 26"
        stroke={isPrint ? "#1e3a8a" : "#1D4ED8"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Red Lightning Bolt */}
      <path
        d="M26 4L12 21H19L15 38L30 17H22L26 4Z"
        fill={isPrint ? "#dc2626" : "#EF4444"}
        stroke={isPrint ? "#000" : "#B91C1C"}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={`flex items-center justify-center ${className}`}>{renderIcon()}</div>;
  }

  const isWhite = variant === "white";
  const isPrint = variant === "print";

  return (
    <div 
      className={`flex items-center gap-3 select-none ${className}`}
      style={{ height }}
    >
      {renderIcon(isWhite, isPrint)}
      
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1">
          <span 
            className="font-black tracking-tight text-lg leading-none"
            style={{ color: isWhite ? "#FFFFFF" : isPrint ? "#0284c7" : "#0284c7" }}
          >
            PLN
          </span>
          <span 
            className="font-light tracking-wide text-[10px] uppercase font-sans"
            style={{ color: isWhite ? "#93C5FD" : isPrint ? "#475569" : "#0ea5e9" }}
          >
            Nusantara Power
          </span>
        </div>
        <span 
          className="font-extrabold tracking-widest uppercase text-[9px] mt-0.5 leading-none block font-sans"
          style={{ color: isWhite ? "#E0F2FE" : isPrint ? "#1e293b" : "#0369a1" }}
        >
          Services
        </span>
      </div>
    </div>
  );
}
