export interface ReverbParams {
  roomSize?: number;
  damping?: number;
  wet?: number;
}

export interface DelayParams {
  time?: number;
  feedback?: number;
  wet?: number;
}

export interface DistortionParams {
  gain?: number;
  wet?: number;
}

export interface BitcrusherParams {
  bits?: number;
  wet?: number;
}
