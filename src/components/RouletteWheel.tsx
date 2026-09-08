import React, { useEffect, useRef } from 'react';
import type { RouletteConfig, RouletteEntry } from '../types/roulette';
import { getSegmentColor } from '../utils/colors';
import { normalizeAngle } from '../utils/rouletteMath';
import { soundManager } from '../utils/audio';
import { Pointer } from './Pointer';

interface RouletteWheelProps {
  entries: RouletteEntry[];
  config: RouletteConfig;
  rotation: number;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  entries,
  config,
  rotation,
  isSpinning,
  onSpinComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelContainerRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastSliceIndexRef = useRef<number>(-1);

  const entriesCount = entries.length;
  const CANVAS_SIZE = 920; // Internal canvas resolution (besar agar tajam saat diperbesar)

  // Draw the wheel onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const center = CANVAS_SIZE / 2;
    const radius = center - 16; // Margin for border

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (entriesCount === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e2230';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tambahkan peserta...', center, center);
      return;
    }

    const sliceAngle = (2 * Math.PI) / entriesCount;

    // 1. Draw each slice
    for (let i = 0; i < entriesCount; i++) {
      // Start from 12 o'clock (-PI / 2) and go clockwise
      const startAngle = -Math.PI / 2 + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Base slice color
      const color = entries[i].color || getSegmentColor(i, config.theme);
      ctx.fillStyle = color;
      ctx.fill();

      // Subtle edge highlight
      ctx.lineWidth = entriesCount > 30 ? 1 : 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      // 2. Draw Entry Label Text
      ctx.save();
      ctx.translate(center, center);
      // Center of this slice
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);

      // Adjust text position and font size based on number of entries
      let fontSize = 20;
      let maxTextWidth = radius * 0.58;

      if (entriesCount <= 6) {
        fontSize = 24;
      } else if (entriesCount <= 12) {
        fontSize = 20;
      } else if (entriesCount <= 24) {
        fontSize = 17;
      } else if (entriesCount <= 40) {
        fontSize = 14;
        maxTextWidth = radius * 0.48;
      } else {
        fontSize = 12;
        maxTextWidth = radius * 0.42;
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${fontSize}px Outfit, Inter, sans-serif`;

      // Text stroke for high contrast on light or dark slices
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.strokeText(truncateText(ctx, entries[i].label, maxTextWidth), radius - 48, 0);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(truncateText(ctx, entries[i].label, maxTextWidth), radius - 48, 0);

      ctx.restore();
    }

    // 3. Outer border ring & pegs
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#181b24';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Metallic pegs around circumference
    const pegCount = Math.max(entriesCount, 16);
    for (let p = 0; p < pegCount; p++) {
      const pegAngle = (2 * Math.PI * p) / pegCount;
      const pegX = center + (radius - 8) * Math.cos(pegAngle);
      const pegY = center + (radius - 8) * Math.sin(pegAngle);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.stroke();
    }

    // 4. Center hub
    const hubRadius = Math.max(30, radius * 0.13);

    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#171b25';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.stroke();

    // Inner core
    ctx.beginPath();
    ctx.arc(center, center, hubRadius * 0.42, 0, 2 * Math.PI);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
  }, [entries, config.theme, entriesCount]);

  // Audio tick synchronization during CSS spin transition
  useEffect(() => {
    if (!isSpinning) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const checkRotationTick = () => {
      if (!wheelContainerRef.current || entriesCount <= 0) return;

      const style = window.getComputedStyle(wheelContainerRef.current);
      const transform = style.transform || style.webkitTransform;

      if (transform && transform !== 'none') {
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        let angleDeg = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        angleDeg = (angleDeg + 360) % 360;

        const sliceDeg = 360 / entriesCount;
        const wheelAngleAtTop = normalizeAngle(360 - angleDeg);
        const currentSliceIndex = Math.floor(wheelAngleAtTop / sliceDeg) % entriesCount;

        if (currentSliceIndex !== lastSliceIndexRef.current && lastSliceIndexRef.current !== -1) {
          soundManager.playTick(1.0);
        }
        lastSliceIndexRef.current = currentSliceIndex;
      }

      rafIdRef.current = requestAnimationFrame(checkRotationTick);
    };

    rafIdRef.current = requestAnimationFrame(checkRotationTick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isSpinning, entriesCount]);

  // Helper to truncate text with ellipsis if too long
  function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-1">
      {/* Wheel Wrapper */}
      <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] lg:w-[640px] lg:h-[640px] xl:w-[820px] xl:h-[820px] 2xl:w-[940px] 2xl:h-[940px] max-w-[92vw] max-h-[92vw]">
        {/* Top Pointer at 12 o'clock */}
        <Pointer isSpinning={isSpinning} />

        {/* Rotating Wheel Container */}
        <div
          ref={wheelContainerRef}
          className="w-full h-full rounded-full wheel-bezel transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? `${config.speedDuration}s` : '0s',
            transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.15, 1)',
            willChange: 'transform',
          }}
          onTransitionEnd={() => {
            if (isSpinning) {
              onSpinComplete();
            }
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-full select-none"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
