export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="60 40 260 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* STEAM WAVES */}
      <path
        d="M 180 130 C 170 110, 190 90, 180 70"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 200 120 C 190 100, 210 80, 200 60"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 220 130 C 210 110, 230 90, 220 70"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* COFFEE CUP */}
      <path
        d="M 140 140 L 260 140 C 260 190 230 220 200 220 C 170 220 140 190 140 140 Z"
        fill="white"
      />
      {/* CUP HANDLE */}
      <path
        d="M 250 150 C 285 150, 285 185, 250 185"
        stroke="white"
        strokeWidth="12"
        fill="none"
      />
      {/* SAUCER */}
      <line
        x1="130"
        y1="230"
        x2="270"
        y2="230"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* TEXT: CAFE */}
      <text
        x="135"
        y="290"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="48"
        fontWeight="900"
        fill="white"
        letterSpacing="2"
        textAnchor="end"
      >
        C
      </text>

      {/* COFFEE BEAN (The "O") */}
      <g transform="translate(150, 250)">
        <ellipse cx="20" cy="25" rx="16" ry="24" fill="#a47b59" />
        <path
          d="M 14 8 C 30 15, 10 35, 26 42"
          stroke="#5f3e27"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <text
        x="185"
        y="290"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="48"
        fontWeight="900"
        fill="white"
        letterSpacing="2"
      >
        FE
      </text>

      {/* THREE GOLD LINES */}
      <line x1="60" y1="310" x2="110" y2="310" stroke="#c09d6c" strokeWidth="4" />
      <line x1="70" y1="325" x2="110" y2="325" stroke="#c09d6c" strokeWidth="4" />
      <line x1="60" y1="340" x2="110" y2="340" stroke="#c09d6c" strokeWidth="4" />

      {/* TEXT: EXPRESS */}
      <text
        x="125"
        y="342"
        fontFamily="Arial, sans-serif"
        fontSize="38"
        fontWeight="bold"
        fill="white"
        letterSpacing="4"
      >
        EXPRESS
      </text>
    </svg>
  );
}
