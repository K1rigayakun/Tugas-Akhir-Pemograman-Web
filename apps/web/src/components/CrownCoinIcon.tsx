import React from "react";

interface CrownCoinIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function CrownCoinIcon({ size = 16, className = "", style, ...props }: CrownCoinIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={`inline-block align-middle ${className}`}
      style={{ color: "var(--color-gold)", ...style }}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        fill="currentColor"
        d="M6 15h12v2H6v-2zm1-2l1.5-5L12 11l3.5-3L17 13H7z"
      />
    </svg>
  );
}
