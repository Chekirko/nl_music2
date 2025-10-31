import { pureTranspose, replaceBadChords, insertDoubledTonals } from "@/lib/chords";

export function createProgression(mode: string) {
  const progression = [
    pureTranspose(mode, "m6"),
    pureTranspose(mode, "M6"),
    pureTranspose(mode, "m7"),
    pureTranspose(mode, "M7"),
    mode,
    pureTranspose(mode, "m2"),
    pureTranspose(mode, "M2"),
    pureTranspose(mode, "m3"),
    pureTranspose(mode, "M3"),
    pureTranspose(mode, "P4"),
    pureTranspose(mode, "A4"),
    pureTranspose(mode, "P5"),
  ];
  const clearTonals = replaceBadChords(progression);
  const correctTonals = insertDoubledTonals(clearTonals);
  return correctTonals;
}

