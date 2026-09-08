import React from 'react';

interface PointerProps {
  isSpinning?: boolean;
}

export const Pointer: React.FC<PointerProps> = ({ isSpinning }) => {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 pointer-events-none flex flex-col items-center">
      <div className="w-7 h-7 rounded-full bg-[#1a1f2c] border border-white/15 flex items-center justify-center shadow-lg">
        <div className="w-2 h-2 rounded-full bg-slate-100" />
      </div>

      <div
        className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-slate-100 -mt-1 drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)] ${
          isSpinning ? 'animate-pulse' : ''
        }`}
      />
    </div>
  );
};
