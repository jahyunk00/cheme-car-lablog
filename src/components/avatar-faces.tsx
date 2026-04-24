import type { LablogAvatarId } from "@/lib/avatar-ids";

type FaceProps = {
  uniquePrefix: string;
  pixelSize?: number;
  className?: string;
};

function Face1({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-1`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#ff005b" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(9 -5) rotate(219 18 18) scale(1)"
          fill="#ffb238"
          rx="6"
        />
        <g transform="translate(4.5 -4) rotate(9 18 18)">
          <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round" />
          <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
          <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
        </g>
      </g>
    </svg>
  );
}

function Face2({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-2`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#ff7d10" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(5 -1) rotate(55 18 18) scale(1.1)"
          fill="#0a0310"
          rx="6"
        />
        <g transform="translate(7 -6) rotate(-5 18 18)">
          <path d="M15 20c2 1 4 1 6 0" stroke="#FFFFFF" fill="none" strokeLinecap="round" />
          <rect x="14" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
          <rect x="20" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}

function Face3({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-3`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#0a0310" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(-3 7) rotate(227 18 18) scale(1.2)"
          fill="#ff005b"
          rx="36"
        />
        <g transform="translate(-3 3.5) rotate(7 18 18)">
          <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
          <rect x="12" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
          <rect x="22" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}

function Face4({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-4`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#d8fcb3" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(9 -5) rotate(219 18 18) scale(1)"
          fill="#89fcb3"
          rx="6"
        />
        <g transform="translate(4.5 -4) rotate(9 18 18)">
          <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round" />
          <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
          <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
        </g>
      </g>
    </svg>
  );
}

function Face5({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-5`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#4f46e5" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(-4 6) rotate(125 18 18) scale(1.05)"
          fill="#a5b4fc"
          rx="8"
        />
        <g transform="translate(0 -2) rotate(-8 18 18)">
          <path d="M14 20c2.5 1.5 5.5 1.5 8 0" stroke="#eef2ff" fill="none" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="2" fill="#eef2ff" />
          <circle cx="24" cy="15" r="2" fill="#eef2ff" />
        </g>
      </g>
    </svg>
  );
}

function Face6({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-6`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#0f766e" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(6 -3) rotate(15 18 18) scale(1.15)"
          fill="#5eead4"
          rx="36"
        />
        <g transform="translate(0 1) rotate(4 18 18)">
          <path d="M13 20.5a5 3.5 0 0 0 10 0" stroke="#042f2e" fill="none" strokeWidth="1.1" strokeLinecap="round" />
          <rect x="11" y="13.5" width="2" height="2.5" rx="0.8" fill="#042f2e" />
          <rect x="23" y="13.5" width="2" height="2.5" rx="0.8" fill="#042f2e" />
        </g>
      </g>
    </svg>
  );
}

function Face7({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-7`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#fbcfe8" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(2 8) rotate(200 18 18) scale(1.2)"
          fill="#be185d"
          rx="6"
        />
        <g transform="translate(-1 0) rotate(-6 18 18)">
          <path d="M12 20a6 2.5 0 0 0 12 0" fill="#fdf2f8" />
          <circle cx="12" cy="14" r="1.8" fill="#fdf2f8" />
          <circle cx="24" cy="14" r="1.8" fill="#fdf2f8" />
        </g>
      </g>
    </svg>
  );
}

function Face8({ uniquePrefix, pixelSize = 40, className }: FaceProps) {
  const m = `${uniquePrefix}-8`;
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-hidden
    >
      <mask id={m} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${m})`}>
        <rect width="36" height="36" fill="#d97706" />
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          transform="translate(-5 4) rotate(-35 18 18) scale(1.1)"
          fill="#451a03"
          rx="8"
        />
        <g transform="translate(1 -3) rotate(10 18 18)">
          <path d="M15 21c2 0.8 4 0.8 6 0" stroke="#fef3c7" fill="none" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="11.5" cy="15" rx="1.8" ry="2.2" fill="#fef3c7" />
          <ellipse cx="24.5" cy="15" rx="1.8" ry="2.2" fill="#fef3c7" />
        </g>
      </g>
    </svg>
  );
}

export function AvatarArt({
  id,
  uniquePrefix,
  pixelSize = 40,
  className,
}: {
  id: LablogAvatarId;
  uniquePrefix: string;
  pixelSize?: number;
  className?: string;
}) {
  const p = { uniquePrefix, pixelSize, className };
  switch (id) {
    case 1:
      return <Face1 {...p} />;
    case 2:
      return <Face2 {...p} />;
    case 3:
      return <Face3 {...p} />;
    case 4:
      return <Face4 {...p} />;
    case 5:
      return <Face5 {...p} />;
    case 6:
      return <Face6 {...p} />;
    case 7:
      return <Face7 {...p} />;
    case 8:
      return <Face8 {...p} />;
    default:
      return <Face1 {...p} />;
  }
}
