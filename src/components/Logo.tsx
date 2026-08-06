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

  // Official PLN Yellow Square Emblem (Yellow Square + 3 Cyan Waves + Red Lightning Bolt)
  const renderEmblem = () => (
    <svg
      width={40 * scale}
      height={40 * scale}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-xs shadow-xs"
    >
      {/* Yellow Background Box */}
      <rect width="100" height="100" fill="#FFE600" rx="3" />

      {/* 3 Cyan Wavy Lines (Waves) */}
      <path
        d="M 8,42 Q 22,34 36,42 T 64,42 T 92,42"
        stroke="#00A0E9"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 8,58 Q 22,50 36,58 T 64,58 T 92,58"
        stroke="#00A0E9"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 8,74 Q 22,66 36,74 T 64,74 T 92,74"
        stroke="#00A0E9"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Red Lightning Bolt */}
      <path
        d="M 60,10 L 41,44 L 68,40 L 44,91 L 58,52 L 32,56 Z"
        fill="#E60012"
        stroke="#B3000E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={`flex items-center justify-center ${className}`}>{renderEmblem()}</div>;
  }

  const isWhite = variant === "white";
  const isPrint = variant === "print";

  // Text color resolution
  const plnTextColor = isWhite ? "#FFFFFF" : isPrint ? "#0f172a" : "#0f172a dark:text-white";
  const subTextColor = isWhite ? "#FFFFFF" : isPrint ? "#334155" : "#1e293b dark:text-slate-200";

  return (
    <div 
      className={`flex items-center gap-3 select-none ${className}`}
      style={{ height }}
    >
      {renderEmblem()}
      
      <div className="flex flex-col justify-center leading-none">
        {/* Large Bold "PLN" Header */}
        <span 
          className="font-black tracking-tight leading-none text-left"
          style={{ 
            fontSize: `${height * 0.48}px`,
            color: isWhite ? "#FFFFFF" : isPrint ? "#0284c7" : undefined
          }}
        >
          <span className={plnTextColor}>PLN</span>
        </span>

        {/* Sub-header "Nusantara Power Services" */}
        <span 
          className="font-bold tracking-tight text-left font-sans mt-0.5"
          style={{ 
            fontSize: `${height * 0.22}px`,
            color: isWhite ? "#FFFFFF" : isPrint ? "#334155" : undefined
          }}
        >
          <span className={subTextColor}>Nusantara Power Services</span>
        </span>
      </div>
    </div>
  );
}

