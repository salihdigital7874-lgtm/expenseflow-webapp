// Web Audio API Sound Synthesizer for Health Notifications

export const playHealthNotificationSound = (type: 'sleep' | 'drink' | 'medicine' | 'food' | 'test') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq: number, startTime: number, duration: number, gainValue: number = 0.15) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    if (type === 'drink') {
      // Water droplet chime (E5 -> A5)
      playTone(659.25, now, 0.2, 0.2); // E5
      playTone(880.00, now + 0.12, 0.3, 0.25); // A5
    } else if (type === 'medicine') {
      // Medical alert double chime (G5 -> C6)
      playTone(783.99, now, 0.15, 0.2);
      playTone(1046.50, now + 0.15, 0.35, 0.25);
    } else if (type === 'food') {
      // Warm meal bell (C5 -> E5 -> G5)
      playTone(523.25, now, 0.15, 0.18);
      playTone(659.25, now + 0.12, 0.15, 0.2);
      playTone(783.99, now + 0.24, 0.35, 0.22);
    } else if (type === 'sleep') {
      // Gentle bedtime lullaby chime (A4 -> F4 -> C4)
      playTone(440.00, now, 0.3, 0.18);
      playTone(349.23, now + 0.25, 0.4, 0.18);
      playTone(261.63, now + 0.55, 0.6, 0.15);
    } else {
      // Default test chime
      playTone(523.25, now, 0.2, 0.2);
      playTone(659.25, now + 0.15, 0.3, 0.2);
    }
  } catch (e) {
    console.warn('Web Audio API not supported or blocked', e);
  }
};
