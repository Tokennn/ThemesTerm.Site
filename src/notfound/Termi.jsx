import { forwardRef } from 'react';

/**
 * Termi, la mascotte du site : un petit terminal tout rond, écran sombre, yeux en pixels,
 * curseur clignotant en guise de bouche, et une pousse de feuille en antenne.
 * Les classes servent de cibles aux animations GSAP (NotFound.jsx).
 */
const Termi = forwardRef(function Termi(props, ref) {
  return (
    <svg ref={ref} className="termi" viewBox="0 0 220 260" role="img" aria-label="Termi, a small round terminal, waving" {...props}>
      <defs>
        <linearGradient id="termi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc56a" />
          <stop offset="1" stopColor="#6f9c45" />
        </linearGradient>
        <radialGradient id="termi-glow" cx=".5" cy=".45" r=".7">
          <stop offset="0" stopColor="#24382a" />
          <stop offset="1" stopColor="#141c17" />
        </radialGradient>
      </defs>

      <ellipse className="termi-shadow" cx="110" cy="248" rx="62" ry="8" fill="#5b4a22" opacity=".16" />

      <g className="termi-all">
        <g className="termi-legs" fill="#557f36">
          <rect x="70" y="214" width="26" height="30" rx="12" />
          <rect x="124" y="214" width="26" height="30" rx="12" />
        </g>

        <g className="termi-arm-l">
          <path d="M34 140 C14 146 8 166 14 182" stroke="#6f9c45" strokeWidth="16" strokeLinecap="round" fill="none" />
        </g>
        <g className="termi-arm-r">
          <path d="M186 140 C206 128 212 108 206 90" stroke="#6f9c45" strokeWidth="16" strokeLinecap="round" fill="none" />
        </g>

        <g className="termi-sprout">
          <path d="M110 52 V26" stroke="#557f36" strokeWidth="6" strokeLinecap="round" />
          <path d="M110 30 C96 32 86 24 84 10 C98 8 108 16 110 30Z" fill="#7fae4f" />
          <path d="M111 28 C112 14 122 6 138 6 C138 20 128 28 111 28Z" fill="#9cc56a" />
        </g>

        <rect x="24" y="48" width="172" height="176" rx="48" fill="url(#termi-body)" />
        <path d="M58 60 H162" stroke="#fff" strokeOpacity=".28" strokeWidth="6" strokeLinecap="round" />

        <rect x="46" y="74" width="128" height="100" rx="26" fill="url(#termi-glow)" />
        <rect x="46" y="74" width="128" height="100" rx="26" fill="none" stroke="#3f5f2b" strokeWidth="5" />

        <g className="termi-face">
          <g className="termi-eyes" fill="#a6f27c">
            <rect className="termi-eye" x="78" y="100" width="16" height="26" rx="7" />
            <rect className="termi-eye" x="126" y="100" width="16" height="26" rx="7" />
          </g>
          <rect className="termi-cursor" x="101" y="140" width="18" height="6" rx="2" fill="#ffe066" />
        </g>

        <ellipse cx="44" cy="184" rx="10" ry="6" fill="#ffb4a2" opacity=".75" />
        <ellipse cx="176" cy="184" rx="10" ry="6" fill="#ffb4a2" opacity=".75" />
      </g>
    </svg>
  );
});

export default Termi;
