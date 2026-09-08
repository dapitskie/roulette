// Web Audio API Procedural Sound Synthesizer

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Crisp mechanical roulette tick sound (flapper hitting pegs)
   */
  public playTick(pitchMultiplier: number = 1.0) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. High frequency click burst
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Pitch between 600Hz and 1200Hz based on speed
      osc.frequency.setValueAtTime(750 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.028);

      // 2. Add subtle wooden pop
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(320, now);
      popOsc.frequency.exponentialRampToValueAtTime(80, now + 0.015);

      popGain.gain.setValueAtTime(0.2, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);

      popOsc.start(now);
      popOsc.stop(now + 0.018);
    } catch {
      // Audio autoplay restrictions safety
    }
  }

  /**
   * Grand celebratory victory chord (C major: C5 - E5 - G5 - C6)
   */
  public playWin() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const chordDelays = [0, 0.08, 0.16, 0.24];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + chordDelays[idx];
        const duration = 1.2;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    } catch {
      // Silently catch
    }
  }
}

export const soundManager = new SoundManager();
