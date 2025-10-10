import React from "react";

// Subtle starfield + radial glow inspired backdrop for the top of the page
export default function HeroBackdrop() {
  return (
    <div className="fixed inset-x-0 top-0 -z-10 mx-auto max-w-7xl aspect-[2/1] overflow-hidden">
      <div className="pointer-events-none select-none absolute inset-0 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 blur-[0.5px] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.25),transparent_60%)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="872"
          height="600"
          role="img"
          aria-label="Stars"
          className="fill-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mask-radial"
        >
          <circle cx="566" cy="161" r="0.7" opacity="0.12" />
          <circle cx="806" cy="451" r="1.2" opacity="0.32" />
          <circle cx="235" cy="205" r="0.6" opacity="0.9" />
          <circle cx="276" cy="43" r="1.2" opacity="0.9" />
          <circle cx="161" cy="323" r="1.2" opacity="0.12" />
          <circle cx="461" cy="247" r="0.6" opacity="0.9" />
          <circle cx="546" cy="53" r="1.2" opacity="0.9" />
          <circle cx="599" cy="26" r="0.9" opacity="0.9" />
          <circle cx="252" cy="571" r="0.9" opacity="0.32" />
          <circle cx="544" cy="397" r="1.2" opacity="0.9" />
          <circle cx="147" cy="442" r="0.9" opacity="0.9" />
          <circle cx="737" cy="565" r="0.9" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

