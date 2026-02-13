class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.initialized = false;
        this.volume = 0.3; // Default volume
        this.muted = false;
    }

    init() {
        if (!this.initialized) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
                this.initialized = true;
            }
        }
        // Resume context if suspended (browser policy)
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setMuted(mute) {
        this.muted = mute;
    }

    playTone(freq, type = 'sine', duration = 0.1, startTime = 0, vol = 1) {
        if (!this.initialized || this.muted) return;

        // Ensure context is running
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

        // Envelope to avoid clicking
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * vol, this.audioCtx.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + startTime);
        osc.stop(this.audioCtx.currentTime + startTime + duration);
    }

    playClick() {
        // High-tech blip
        this.playTone(800, 'sine', 0.05, 0, 0.8);
        this.playTone(1200, 'sine', 0.03, 0.02, 0.4);
    }

    playHover() {
        // Very subtle tick
        this.playTone(400, 'triangle', 0.02, 0, 0.2);
    }

    playSuccess() {
        // Ascending major triad (C E G)
        // const now = this.audioCtx ? this.audioCtx.currentTime : 0;
        this.playTone(523.25, 'sine', 0.2, 0, 0.6); // C5
        this.playTone(659.25, 'sine', 0.2, 0.1, 0.6); // E5
        this.playTone(783.99, 'sine', 0.4, 0.2, 0.6); // G5
    }

    playError() {
        // Low descending buzz
        this.playTone(150, 'sawtooth', 0.3, 0, 0.5);
        this.playTone(100, 'sawtooth', 0.3, 0.1, 0.5);
    }

    playWelcome() {
        // Nice startup chord
        this.playTone(440, 'sine', 1.5, 0, 0.5); // A4
        this.playTone(554.37, 'sine', 1.5, 0.1, 0.5); // C#5
        this.playTone(659.25, 'sine', 1.5, 0.2, 0.5); // E5
    }
}

const soundManager = new SoundManager();
export default soundManager;
