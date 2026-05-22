export interface CarStats {
  top: number;
  speed: number;
  handling: number;
  accel: number;
  launch: number;
  brake: number;
}

export interface Car {
  id: string;
  name: string;
  maker: string;
  class: string;
  year: number;
  tagline: string;
  bio: string;
  accent: string;
  accent2: string;
  bg: string;
  sceneLabel: string;
  stats: CarStats;
  powertrain: string;
  drivetrain: string;
  weight: string;
  zero: string;
  glbPath?: string;
  model3d?: boolean;
}
