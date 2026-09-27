import { Vibration, Platform } from 'react-native';

class AudioHapticsService {
  private isMuted: boolean = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  playSupermarketBeep() {
    if (this.isMuted) return;

    try {
      // In web or hybrid environment
      if (typeof window !== 'undefined') {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1760, ctx.currentTime); // 1760 Hz POS beep

          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        }
      }
    } catch (e) {
      // Audio playback notice
    }
  }

  triggerHaptic() {
    try {
      if (Platform.OS === 'android') {
        // Double pulse pattern
        Vibration.vibrate([40, 30, 80]);
      } else if (Platform.OS === 'ios') {
        Vibration.vibrate();
      }
    } catch (e) {
      // Haptic vibration notice
    }
  }

  triggerSuccessFeedback() {
    this.playSupermarketBeep();
    this.triggerHaptic();
  }
}

export const audioHaptics = new AudioHapticsService();
