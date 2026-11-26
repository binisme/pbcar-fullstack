let audioCtx: AudioContext | null = null;
let iosSpeechUnlocked = false;
let cachedViVoice: SpeechSynthesisVoice | null = null;
let ttsAudio: HTMLAudioElement | null = null;
let isTtsPlaying = false;

export function unlockAudio(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
  } catch {
    // ignore
  }

  if (!iosSpeechUnlocked && 'speechSynthesis' in window) {
    try {
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
      iosSpeechUnlocked = true;
    } catch {
      // ignore
    }
  }
}

function findVietnameseVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  return (
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === 'vi-vn') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('vi')) ||
    voices.find((v) => /vietnam|tiếng việt|linh|hoaimy|namminh/i.test(v.name)) ||
    null
  );
}

export function initVoiceLoader(): void {
  if ('speechSynthesis' in window) {
    cachedViVoice = findVietnameseVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedViVoice = findVietnameseVoice();
    };
  }
}

function normalizeVehicleSpeechName(name: string): string {
  const match = name.trim().match(/^xe\s*0*(\d+)$/i);
  if (match) return `xe ${parseInt(match[1], 10)}`;
  return name.replace(/^xe/i, 'xe ');
}

export function playBeepChime(): void {
  try {
    unlockAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const notes = [
      { freq: 980, start: 0.0, dur: 0.16 },
      { freq: 1320, start: 0.2, dur: 0.16 },
      { freq: 980, start: 0.4, dur: 0.22 },
    ];

    for (const n of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.exponentialRampToValueAtTime(0.45, now + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  } catch {
    // ignore
  }
}

export function speakExpiredVehicles(vehicleNames: string[]): void {
  if (!vehicleNames.length || isTtsPlaying) return;
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) return;

  const text = `${vehicleNames.map(normalizeVehicleSpeechName).join(', ')} đã hết giờ`;
  const viVoice = cachedViVoice || findVietnameseVoice();
  if (viVoice) cachedViVoice = viVoice;

  const speakNative = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.95;
    if (viVoice) u.voice = viVoice;
    window.speechSynthesis.speak(u);
  };

  if (viVoice) {
    speakNative();
  } else {
    try {
      if (ttsAudio) ttsAudio.pause();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;
      ttsAudio = new Audio(url);
      isTtsPlaying = true;
      ttsAudio.onended = () => { isTtsPlaying = false; };
      ttsAudio.onerror = () => { isTtsPlaying = false; speakNative(); };
      ttsAudio.play().catch(() => { isTtsPlaying = false; speakNative(); });
    } catch {
      isTtsPlaying = false;
      speakNative();
    }
  }
}

export function stopAllVoice(): void {
  if (ttsAudio) {
    ttsAudio.pause();
    ttsAudio.currentTime = 0;
    isTtsPlaying = false;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
