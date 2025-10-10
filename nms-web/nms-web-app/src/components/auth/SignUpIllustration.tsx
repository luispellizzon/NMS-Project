// components/auth/SignUpIllustration.tsx
export default function SignUpIllustration() {
  return (
    <div className="relative w-full max-w-md">
      {/* Hospital Building */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Building base */}
        <rect
          x="80"
          y="120"
          width="180"
          height="200"
          rx="8"
          fill="#B8E6E8"
        />

        {/* Building windows - left column */}
        <rect x="110" y="150" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="110" y="185" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="110" y="220" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="110" y="255" width="20" height="20" rx="4" fill="#E8F7F8" />

        {/* Building windows - middle column */}
        <rect x="150" y="150" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="150" y="185" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="150" y="220" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="150" y="255" width="20" height="20" rx="4" fill="#E8F7F8" />

        {/* Building windows - right column */}
        <rect x="190" y="150" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="190" y="185" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="190" y="220" width="20" height="20" rx="4" fill="#E8F7F8" />
        <rect x="190" y="255" width="20" height="20" rx="4" fill="#E8F7F8" />

        {/* Building entrance */}
        <rect x="140" y="270" width="40" height="50" rx="4" fill="#0d7377" />

        {/* Medical cross sign on building */}
        <g transform="translate(280, 110)">
          <rect x="0" y="0" width="60" height="60" rx="8" fill="#B8E6E8" />
          <rect x="18" y="10" width="24" height="40" rx="2" fill="#0d7377" />
          <rect x="10" y="18" width="40" height="24" rx="2" fill="#0d7377" />
        </g>

        {/* NMS logo badge */}
        <g transform="translate(290, 180)">
          <rect x="0" y="0" width="80" height="60" rx="8" fill="#B8E6E8" />

          {/* Brain icon */}
          <circle cx="25" cy="30" r="18" fill="#0d7377" />
          <path
            d="M 20 25 Q 25 20, 30 25 M 25 35 Q 20 30, 15 35 M 25 35 Q 30 30, 35 35"
            stroke="#B8E6E8"
            strokeWidth="2"
            fill="none"
          />

          {/* NMS text */}
          <text
            x="55"
            y="38"
            fontSize="16"
            fontWeight="bold"
            fill="#0d7377"
          >
            nms
          </text>
        </g>

        {/* Shadow/ground */}
        <ellipse
          cx="200"
          cy="330"
          rx="140"
          ry="15"
          fill="#0a5c5f"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}