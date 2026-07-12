/**
 * Generative ambient audio engine — no audio files. Each world gets its own
 * synth pad: a chord of detuned oscillators through a breathing lowpass
 * filter. Scene changes glide the chord and filter to the next world's
 * palette instead of cutting.
 */

interface SceneSound {
  /** Chord frequencies in Hz, one per oscillator voice */
  chord: number[];
  /** Lowpass cutoff for this world's mood */
  cutoff: number;
  /** Oscillator waveform */
  wave: OscillatorType;
}

const SCENE_SOUNDS: SceneSound[] = [
  // I  Constellation — airy A minor add9
  { chord: [110.0, 164.81, 220.0, 246.94], cutoff: 1400, wave: 'triangle' },
  // II  Reflection — brighter C# shimmer
  { chord: [138.59, 207.65, 277.18, 311.13], cutoff: 2000, wave: 'triangle' },
  // III  Magnetism — dark F drone
  { chord: [87.31, 130.81, 174.61, 196.0], cutoff: 550, wave: 'sawtooth' },
  // IV  Signal — lush E
  { chord: [82.41, 123.47, 164.81, 246.94], cutoff: 1000, wave: 'triangle' },
  // V  Refraction — glassy G
  { chord: [98.0, 146.83, 196.0, 293.66], cutoff: 1700, wave: 'sine' },
];

const MASTER_LEVEL = 0.13;

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private currentScene = 0;

  private init() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = SCENE_SOUNDS[this.currentScene].cutoff;
    this.filter.Q.value = 0.8;
    this.filter.connect(this.master);

    // Slow LFO makes the filter breathe
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 220;
    lfo.connect(lfoDepth);
    lfoDepth.connect(this.filter.frequency);
    lfo.start();

    const sound = SCENE_SOUNDS[this.currentScene];
    sound.chord.forEach((freq, i) => {
      // Two detuned oscillators per note, panned apart for width
      [-6, 6].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = sound.wave;
        osc.frequency.value = freq;
        osc.detune.value = cents;

        const gain = ctx.createGain();
        gain.gain.value = 0.11 / (i + 1); // higher notes quieter

        const pan = ctx.createStereoPanner();
        pan.pan.value = cents > 0 ? 0.4 : -0.4;

        osc.connect(gain);
        gain.connect(pan);
        pan.connect(this.filter!);
        osc.start();
        this.oscillators.push(osc);
      });
    });
  }

  /** Must be called from a user gesture (the sound toggle click). */
  enable() {
    if (!this.ctx) this.init();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') void ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(MASTER_LEVEL, ctx.currentTime, 1.2);
  }

  disable() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }

  /** Glide the pad to the given world's chord and filter cutoff. */
  setScene(scene: number) {
    this.currentScene = scene;
    if (!this.ctx || !this.filter) return;

    const t = this.ctx.currentTime;
    const sound = SCENE_SOUNDS[scene];
    this.filter.frequency.setTargetAtTime(sound.cutoff, t, 1.5);

    this.oscillators.forEach((osc, idx) => {
      const note = Math.floor(idx / 2) % sound.chord.length;
      osc.type = sound.wave;
      osc.frequency.setTargetAtTime(sound.chord[note], t, 1.8);
    });
  }

  /** Short synth blip for click feedback. */
  blip() {
    if (!this.ctx || !this.master) return;
    if (this.master.gain.value < 0.01) return;

    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

export const ambientAudio = new AmbientAudioEngine();
