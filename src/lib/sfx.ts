"use client";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.08) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export const sfx = {
  click(): void {
    tone(880, 0, 0.06, "square", 0.04);
  },
  buy(): void {
    tone(660, 0, 0.07, "square", 0.05);
    tone(990, 0.07, 0.09, "square", 0.05);
  },
  sell(): void {
    tone(990, 0, 0.07, "square", 0.05);
    tone(660, 0.07, 0.09, "square", 0.05);
  },
  mixStart(): void {
    tone(440, 0, 0.1, "sawtooth", 0.05);
    tone(554, 0.1, 0.1, "sawtooth", 0.05);
    tone(659, 0.2, 0.14, "sawtooth", 0.05);
  },
  collect(): void {
    tone(523, 0, 0.08, "square", 0.06);
    tone(659, 0.08, 0.08, "square", 0.06);
    tone(784, 0.16, 0.14, "square", 0.06);
  },
  discover(): void {
    tone(523, 0, 0.1, "triangle", 0.08);
    tone(659, 0.1, 0.1, "triangle", 0.08);
    tone(784, 0.2, 0.1, "triangle", 0.08);
    tone(1047, 0.3, 0.26, "triangle", 0.09);
  },
  levelUp(): void {
    tone(392, 0, 0.12, "square", 0.07);
    tone(523, 0.12, 0.12, "square", 0.07);
    tone(659, 0.24, 0.12, "square", 0.07);
    tone(784, 0.36, 0.18, "square", 0.07);
    tone(1047, 0.54, 0.3, "square", 0.08);
  },
  error(): void {
    tone(200, 0, 0.15, "sawtooth", 0.06);
    tone(150, 0.12, 0.2, "sawtooth", 0.06);
  },
};
