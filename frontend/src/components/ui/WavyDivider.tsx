import React from 'react';

interface WavyDividerProps {
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  flip?: boolean;
  height?: number;
}

export const WavyDivider: React.FC<WavyDividerProps> = ({
  className = '',
  fillColor = 'fill-bg',
  strokeColor = 'stroke-border',
  flip = false,
  height = 16,
}) => {
  return (
    <div 
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className} ${flip ? 'rotate-180' : ''}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full min-w-[600px] preserve-3d"
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 C150,18 350,24 600,12 C850,0 1050,18 1200,6 L1200,24 L0,24 Z"
          className={`${fillColor} transition-colors`}
        />
        <path
          d="M0,0 C150,18 350,24 600,12 C850,0 1050,18 1200,6"
          fill="none"
          strokeWidth="1.5"
          className={`${strokeColor} transition-colors`}
        />
      </svg>
    </div>
  );
};

export default WavyDivider;
