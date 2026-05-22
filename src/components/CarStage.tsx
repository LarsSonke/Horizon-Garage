import type { ReactNode } from 'react';
import type { Car } from '../types';
import CarViewer from '../lib/CarViewer';

interface CarStageProps {
  car: Car;
  slotId: string;
  label?: string;
  children?: ReactNode;
}

export default function CarStage({ car, slotId, label, children }: CarStageProps) {
  return (
    <div
      className="car-stage vignette"
      style={{
        '--accent': car.accent,
        '--accent2': car.accent2,
        '--stage-bg': car.bg,
      }}
    >
      {/* HUD corners */}
      <div className="hud-corner tl border-run" style={{ borderColor: car.accent, '--accent': car.accent }} />
      <div className="hud-corner tr" style={{ borderColor: car.accent }} />
      <div className="hud-corner bl" style={{ borderColor: car.accent }} />
      <div className="hud-corner br" style={{ borderColor: car.accent }} />

      {/* Scene label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase z-10">
        {label || car.sceneLabel}
      </div>

      {/* Sweeping scan line */}
      <div className="scan-line-v" style={{ '--accent': car.accent }} />

      {/* Speed lines */}
      <div className="speed-lines is-moving" style={{ '--accent': car.accent }} />

      {/* Tire smoke */}
      <div className="smoke smoke-accent s2" style={{ left: '8%', bottom: '6%', '--accent': car.accent }} />
      <div className="smoke smoke-white s3 r" style={{ right: '10%', bottom: '4%' }} />

      {/* Holographic shimmer */}
      <div className="holo-shimmer" />

      {/* Car slot */}
      <div className="car-slot">
        {car.model3d ? (
          <CarViewer
            glbPath={car.glbPath}
            accent={car.accent}
            accent2={car.accent2}
            label={`${car.name} · 3D`}
          />
        ) : (
          <ImageSlotPlaceholder name={car.name} />
        )}
      </div>

      {/* Bottom HUD strip */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[10px] tracking-[0.24em] text-white/70 uppercase z-10">
        <div className="space-y-1">
          <div className="text-white/40">UNIT · {car.id.toUpperCase()}-{car.year}</div>
          <div style={{ color: car.accent }}>{car.class}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-white/40">TOP SPEED</div>
          <div className="text-white text-base font-display tracking-widest">
            {car.stats.top} <span className="text-white/40 text-xs">MPH</span>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

function ImageSlotPlaceholder({ name }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-2">Render Slot</div>
        <div className="font-display text-2xl">{name}</div>
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase mt-2 text-white/25">drop image here</div>
      </div>
    </div>
  );
}
