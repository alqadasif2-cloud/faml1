import React, { useState } from 'react';

interface FamilyGuardLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  rounded?: boolean;
}

export const FamilyGuardLogo: React.FC<FamilyGuardLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textColor = 'text-white',
  subtextColor = 'text-slate-400',
  rounded = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute pixel dimensions
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs': return 24;
      case 'sm': return 36;
      case 'md': return 48;
      case 'lg': return 72;
      case 'xl': return 96;
      case '2xl': return 140;
      default: return 48;
    }
  };

  const dim = getDimension();
  const primaryImagePath = 'أيقونة درع العائلة الذكي.png';
  const encodedImagePath = encodeURI('أيقونة درع العائلة الذكي.png');

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: `${dim}px`, height: `${dim}px` }}
        className={`relative shrink-0 select-none overflow-hidden ${
          rounded ? 'rounded-2xl shadow-lg shadow-blue-900/30' : ''
        }`}
      >
        {!imageError ? (
          <img
            src={primaryImagePath}
            srcSet={`${encodedImagePath} 1x`}
            alt="FamilyGuard Logo - أيقونة درع العائلة الذكي"
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          /* High-Fidelity SVG Vector Fallback representing the exact uploaded Shield with Father, Kids & Phone */
          <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B56D6" />
                <stop offset="50%" stopColor="#043CB8" />
                <stop offset="100%" stopColor="#011F7E" />
              </linearGradient>
              <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2F1FF" />
                <stop offset="100%" stopColor="#8CC2FF" />
              </linearGradient>
              <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1259D4" />
                <stop offset="100%" stopColor="#02308E" />
              </linearGradient>
            </defs>

            {/* App Icon Rounded Base */}
            <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />

            {/* Outer Shield Glow & Border */}
            <path
              d="M256 52 C350 78 418 84 418 84 C418 240 376 360 256 424 C136 360 94 240 94 84 C94 84 162 78 256 52 Z"
              fill="url(#shieldBorder)"
              stroke="#BADEFF"
              strokeWidth="4"
            />
            {/* Inner Shield Body */}
            <path
              d="M256 68 C340 92 402 98 402 98 C402 235 362 344 256 405 C150 344 110 235 110 98 C110 98 172 92 256 68 Z"
              fill="url(#shieldInner)"
            />

            {/* Family Silhouettes: Father Center, Boy Left, Girl Right */}
            {/* Father Head */}
            <circle cx="256" cy="155" r="42" fill="#FFFFFF" />
            {/* Father Shoulders */}
            <path
              d="M172 265 C172 210 210 195 256 195 C302 195 340 210 340 265 Z"
              fill="#FFFFFF"
            />

            {/* Boy Left Silhouette */}
            <circle cx="190" cy="235" r="30" fill="#0E45AC" />
            <path
              d="M140 325 C140 280 165 270 190 270 C215 270 230 280 235 325 Z"
              fill="#0E45AC"
            />

            {/* Girl Right Silhouette with Ponytail */}
            <circle cx="320" cy="238" r="29" fill="#0E45AC" />
            {/* Ponytail */}
            <path
              d="M296 242 C290 248 285 265 292 278 C298 282 304 275 304 265 Z"
              fill="#0E45AC"
            />
            <path
              d="M276 325 C282 285 298 272 320 272 C345 272 370 285 370 325 Z"
              fill="#0E45AC"
            />

            {/* Mobile Phone with Lock in Foreground */}
            <g transform="translate(198, 290)">
              {/* Phone Body */}
              <rect x="0" y="0" width="116" height="152" rx="26" fill="#031F6B" stroke="#BFE0FF" strokeWidth="9" />
              {/* Speaker Bar */}
              <rect x="42" y="14" width="32" height="5" rx="2.5" fill="#58A5FF" />
              {/* Phone Inner Shield */}
              <path
                d="M58 40 C76 46 88 48 88 48 C88 82 78 106 58 118 C38 106 28 82 28 48 C28 48 40 46 58 40 Z"
                fill="#FFFFFF"
              />
              {/* Padlock Icon */}
              <rect x="47" y="70" width="22" height="18" rx="4" fill="#0B4BBF" />
              <path
                d="M52 70 V61 C52 57.5 54.5 55 58 55 C61.5 55 64 57.5 64 61 V70"
                stroke="#0B4BBF"
                strokeWidth="4"
                fill="none"
              />
              {/* Keyhole */}
              <circle cx="58" cy="77" r="2" fill="#FFFFFF" />
              <rect x="57" y="77" width="2" height="5" fill="#FFFFFF" />
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className={`font-black tracking-tight leading-tight ${textColor} ${
            dim >= 72 ? 'text-2xl' : dim >= 48 ? 'text-lg' : 'text-base'
          }`}>
            FamilyGuard
          </span>
          <span className={`text-[11px] font-medium leading-normal ${subtextColor}`}>
            الرقابة الأبوية الذكية
          </span>
        </div>
      )}
    </div>
  );
};
