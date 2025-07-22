import React from "react";
import Image from "next/image";

interface VNPayIconProps {
  className?: string;
  size?: number;
}

export const VNPayIcon: React.FC<VNPayIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* VNPay official logo background - blue gradient */}
      <defs>
        <linearGradient id="vnpayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="12" fill="url(#vnpayGradient)" />

      {/* VN text - larger and bold */}
      <text
        x="50"
        y="42"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        VN
      </text>

      {/* PAY text - smaller, positioned below */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="600"
        fontFamily="Arial, sans-serif"
        letterSpacing="1px"
      >
        PAY
      </text>

      {/* Small decorative element */}
      <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.3)" />
      <circle cx="80" cy="80" r="3" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
};

export const VNPayTextIcon = () => (
  <Image
    src="https://res.cloudinary.com/drosh1sey/image/upload/v1753171552/642c1e80-93fa-40b8-97e0-93960ec5b334.png"
    alt="VNPay Icon"
    width={16}
    height={16}
  />
);

export const VNPayInlineIcon = () => (
  <Image
    src="https://res.cloudinary.com/drosh1sey/image/upload/v1753171552/642c1e80-93fa-40b8-97e0-93960ec5b334.png"
    alt="VNPay Icon"
    width={16}
    height={16}
  />
);
