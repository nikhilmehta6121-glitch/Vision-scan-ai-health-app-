import { SupportedLanguage } from "@/types";
import { SUPPORTED_LANGUAGES } from "./languages";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  language: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from Markdown artifacts for smooth audio
  const cleanedText = text
    .replace(/[#*_`~>-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) return false;

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const targetSpeechCode = langConfig?.speechCode || "en-US";

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = targetSpeechCode;
  utterance.rate = 0.95; // Slightly measured rate for medical clarity
  utterance.pitch = 1.0;

  // Try to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetSpeechCode.slice(0, 2).toLowerCase()));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error("SpeechSynthesis error:", e);
    currentUtterance = null;
    onError?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
