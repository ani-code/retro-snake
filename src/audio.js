// Retro Sound Effects Generator using Web Audio API

const AudioContext = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
const audioCtx = AudioContext ? new AudioContext() : null;

export const playSound = (type) => {
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
        case 'eat':
            // Short high blip
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;

        case 'shrink':
            // Descending trill
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.3);

            // Add a little wobble via gain
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;

        case 'die':
            // low descending crunch
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.4);

            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            oscillator.start(now);
            oscillator.stop(now + 0.4);
            break;

        case 'combo':
            // Rising arpeggio
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.setValueAtTime(600, now + 0.05);
            oscillator.frequency.setValueAtTime(800, now + 0.1);

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;

        case 'celebrate':
            // Fanfare
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
            oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.4);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

            oscillator.start(now);
            oscillator.stop(now + 0.6);
            break;

        case 'select':
            // UI click
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);

            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            oscillator.start(now);
            oscillator.stop(now + 0.05);
            break;

        default:
            break;
    }
};
