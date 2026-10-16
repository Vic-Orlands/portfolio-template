import {
  defineSound,
  ensureReady,
  setMasterVolume,
  type SoundDefinition,
} from "@web-kits/audio";

function sample(name: string, gain: number): SoundDefinition {
  return {
    source: {
      type: "sample",
      url: `/sounds/shwn/${name}.mp3`,
    },
    gain,
  };
}

const click = sample("pulse", 0.34);
const soundEnabled = sample("ready", 0.34);
const dropdownOpen = sample("bloom", 0.3);
const dropdownClose = sample("tick", 0.28);
const navigate = sample("page", 0.3);
const themeToggle = sample("toggle", 0.28);
const contact = sample("arrival", 0.3);
const hover = sample("chime", 0.24);
const boundary = sample("droplet", 0.24);
const success = sample("success", 0.32);
const error = sample("error", 0.28);

const pin: SoundDefinition = {
  source: { type: "sample", url: "/sounds/pin-click.mp3" },
  gain: 0.9,
};

const drop: SoundDefinition = {
  source: { type: "sample", url: "/sounds/card-drop.mp3" },
  gain: 0.9,
};

const tunerScroll: SoundDefinition = {
  layers: [
    {
      source: { type: "triangle", frequency: { start: 145, end: 92 } },
      envelope: { attack: 0, decay: 0.022, sustain: 0, release: 0.008 },
      gain: 0.055,
    },
    {
      source: { type: "noise", color: "white" },
      filter: { type: "highpass", frequency: 2400, resonance: 0.7 },
      envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
      gain: 0.018,
    },
  ],
};

const sounds = {
  click: defineSound(click),
  soundEnabled: defineSound(soundEnabled),
  dropdownOpen: defineSound(dropdownOpen),
  dropdownClose: defineSound(dropdownClose),
  navigate: defineSound(navigate),
  themeToggle: defineSound(themeToggle),
  contact: defineSound(contact),
  hover: defineSound(hover),
  boundary: defineSound(boundary),
  success: defineSound(success),
  error: defineSound(error),
  pin: defineSound(pin),
  drop: defineSound(drop),
  tunerScroll: defineSound(tunerScroll),
};

let enabled = true;
let lastTunerSoundAt = 0;
let lastHoverSoundAt = 0;
let preloadedAudio: HTMLAudioElement[] | null = null;

const shwnSoundFiles = [
  "arrival",
  "bloom",
  "chime",
  "droplet",
  "error",
  "page",
  "pulse",
  "ready",
  "success",
  "tick",
  "toggle",
] as const;

async function play(sound: () => unknown) {
  if (!enabled) return;
  try {
    await ensureReady();
    if (enabled) sound();
  } catch {}
}

function playImmediate(sound: () => unknown) {
  if (!enabled) return;
  try {
    void ensureReady({ latencyHint: "interactive" }).catch(() => undefined);
    sound();
  } catch {}
}

export function setUiSoundEnabled(nextEnabled: boolean) {
  enabled = nextEnabled;
  setMasterVolume(nextEnabled ? 1 : 0);
}

export function preloadUiSounds() {
  if (typeof window === "undefined" || preloadedAudio) return;
  preloadedAudio = shwnSoundFiles.map((name) => {
    const audio = new Audio(`/sounds/shwn/${name}.mp3`);
    audio.preload = "auto";
    audio.load();
    return audio;
  });
}

export function playClickSound() {
  void play(sounds.click);
}

export function playSoundEnabledSound() {
  void play(sounds.soundEnabled);
}

export function playScribbleOpenSound() {
  playImmediate(sounds.dropdownOpen);
}

export function playScribbleCloseSound() {
  playImmediate(sounds.dropdownClose);
}

export function playScribbleNavigateSound() {
  playImmediate(sounds.navigate);
}

export function playThemeSound(_theme: "light" | "dark" | "system") {
  playImmediate(sounds.themeToggle);
}

export function playContactSound() {
  void play(sounds.contact);
}

export function playNavigateSound() {
  playImmediate(sounds.navigate);
}

export function playArrivalSound() {
  playImmediate(sounds.contact);
}

export function playBoundarySound() {
  playImmediate(sounds.boundary);
}

export function playHoverSound() {
  if (
    typeof window === "undefined" ||
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    return;
  }
  const now = performance.now();
  if (now - lastHoverSoundAt < 150) return;
  lastHoverSoundAt = now;
  playImmediate(sounds.hover);
}

export function playSuccessSound() {
  void play(sounds.success);
}

export function playErrorSound() {
  void play(sounds.error);
}

export function playPinSound() {
  void play(sounds.pin);
}

export function playDropSound() {
  void play(sounds.drop);
}

export function playTunerScrollSound() {
  const now = performance.now();
  if (now - lastTunerSoundAt < 38) return;
  lastTunerSoundAt = now;
  playImmediate(sounds.tunerScroll);
}
