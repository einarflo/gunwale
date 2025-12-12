// LogoLoader.tsx
import React from "react";
import styled, { keyframes } from "styled-components";

type LogoLoaderProps = {
  className?: string;
};

// Hver strek får sin egen "fase" i animasjonen
const stroke1 = keyframes`
  0%   { opacity: 0; }
  10%  { opacity: 1; }  /* fader inn */
  70%  { opacity: 1; }  /* står synlig */
  85%  { opacity: 0; }  /* felles fade ut */
  100% { opacity: 0; }
`;

const stroke2 = keyframes`
  0%   { opacity: 0; }
  15%  { opacity: 0; }
  25%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const stroke3 = keyframes`
  0%   { opacity: 0; }
  20%  { opacity: 0; }
  30%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const stroke4 = keyframes`
  0%   { opacity: 0; }
  25%  { opacity: 0; }
  35%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const stroke5 = keyframes`
  0%   { opacity: 0; }
  30%  { opacity: 0; }
  40%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const stroke6 = keyframes`
  0%   { opacity: 0; }
  35%  { opacity: 0; }
  45%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const stroke7 = keyframes`
  0%   { opacity: 0; }
  40%  { opacity: 0; }
  50%  { opacity: 1; }
  70%  { opacity: 1; }
  85%  { opacity: 0; }
  100% { opacity: 0; }
`;

const StyledLogoLoader = styled.svg`
  display: block;
  margin: 0 auto;
  width: 150px;
  height: auto;

  .stroke {
    opacity: 0;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .stroke-no-1 {
    animation-name: ${stroke1};
  }

  .stroke-no-2 {
    animation-name: ${stroke2};
  }

  .stroke-no-3 {
    animation-name: ${stroke3};
  }

  .stroke-no-4 {
    animation-name: ${stroke4};
  }

  .stroke-no-5 {
    animation-name: ${stroke5};
  }

  .stroke-no-6 {
    animation-name: ${stroke6};
  }

  .stroke-no-7 {
    animation-name: ${stroke7};
  }
`;

export const LogoLoader: React.FC<LogoLoaderProps> = ({ className }) => {
  return (
    <StyledLogoLoader
      className={className}
      width="1279"
      height="546"
      viewBox="0 0 1279 546"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="img"
    >
      <title>Logo loader</title>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(-250, -247)">
          <g transform="translate(300, 297)">
            {/* Du kan endre rekkefølgen på stroke-no-X hvis du vil ha annen "tegneretning" */}
            <circle
              className="stroke stroke-no-1"
              stroke="#6A71FA"
              strokeWidth="100"
              cx="427.5"
              cy="297.5"
              r="148.5"
            />
            <line
              className="stroke stroke-no-2"
              x1="714"
              y1="151"
              x2="866"
              y2="445"
              stroke="#6A71FA"
              strokeWidth="100"
              strokeLinecap="round"
            />
            <line
              className="stroke stroke-no-3"
              x1="865.5"
              y1="444.5"
              x2="1022"
              y2="151"
              strokeOpacity="0.907787403"
              stroke="#917EF9"
              strokeWidth="100"
              strokeLinecap="round"
            />
            <line
              className="stroke stroke-no-4"
              x1="1179"
              y1="0"
              x2="1178.5"
              y2="444.5"
              stroke="#6A71FA"
              strokeWidth="100"
              strokeLinecap="round"
            />
            <path
              className="stroke stroke-no-5"
              d="M0.5,45.5 L0.5,310.013139 C0.148514596,343.974604 12.4057206,372.800411 37.2716181,396.490563 C62.1375157,420.180715 99.2606192,436.183861 148.640929,444.5"
              stroke="#6A71FA"
              strokeWidth="100"
              strokeLinecap="round"
            />
            <line
              className="stroke stroke-no-6"
              x1="660.5"
              y1="444.5"
              x2="566"
              y2="243"
              strokeOpacity="0.891118403"
              stroke="#917EF9"
              strokeWidth="100"
              strokeLinecap="round"
            />
            <line
              className="stroke stroke-no-7"
              x1="0"
              y1="150"
              x2="103.5"
              y2="149.5"
              strokeOpacity="0.823229383"
              stroke="#917EF9"
              strokeWidth="92"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </StyledLogoLoader>
  );
};

export default LogoLoader;
