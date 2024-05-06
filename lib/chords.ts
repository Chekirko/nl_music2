import { Chord } from "tonal";

// export const createProgression = (mode: string) => {
//   if (mode.includes("b")) {
//     const changedMode = Chord.transpose(mode, "M2");
//     const transposedMode = Chord.transpose(changedMode, "m7");
//     const progression = [
//       Chord.transpose(transposedMode, "m6"),
//       Chord.transpose(transposedMode, "M6"),
//       Chord.transpose(transposedMode, "m7"),
//       Chord.transpose(transposedMode, "M7"),
//       transposedMode,
//       Chord.transpose(transposedMode, "m2"),
//       Chord.transpose(transposedMode, "M2"),
//       Chord.transpose(transposedMode, "m3"),
//       Chord.transpose(transposedMode, "M3"),
//       Chord.transpose(transposedMode, "P4"),
//       Chord.transpose(transposedMode, "P5"),
//     ];
//     return progression;
//   } else {
//     const progression = [
//       Chord.transpose(mode, "m6"),
//       Chord.transpose(mode, "M6"),
//       Chord.transpose(mode, "m7"),
//       Chord.transpose(mode, "M7"),
//       mode,
//       Chord.transpose(mode, "m2"),
//       Chord.transpose(mode, "M2"),
//       Chord.transpose(mode, "m3"),
//       Chord.transpose(mode, "M3"),
//       Chord.transpose(mode, "P4"),
//       Chord.transpose(mode, "P5"),
//     ];
//     return progression;
//   }
// };
export function replaceBadChords(array: string[]) {
  const replacements = {
    Cb: "B",
    Cbb: "Bb",
    Cbm: "Bm",
    Cbbm: "Bbm",
    Dbm: "C#m",
    Dbb: "C",
    Dbbm: "Cm",
    Ebb: "D",
    Ebbm: "Dm",
    Fb: "E",
    Fbb: "Eb",
    Fbm: "Em",
    Fbbm: "Ebm",
    Gbb: "F",
    Gbm: "F#m",
    Gbbm: "Fm",
    Abb: "G",
    Abbm: "Gm",
    Abm: "G#m",
    Bbb: "A",
    Bbbm: "Am",
    "C##": "D",
    "C##m": "Dm",
    "C#": "Db",
    "D#": "Eb",
    "D##": "E",
    "D##m": "Em",
    "E#": "F",
    "E##": "F#",
    "E#m": "Fm",
    "E##m": "F#m",
    "F##": "G",
    "F##m": "Gm",
    "G##": "A",
    "G##m": "Am",
    "G#": "Ab",
    "A#": "Bb",
    "A##": "B",
    "A#m": "Bbm",
    "A##m": "Bm",
    "B#": "C",
    "B##": "Db",
    "B#m": "Cm",
    "B##m": "C#m",
  };
  // Пройдемося по кожному рядку у масиві
  const modifiedArray = array.map((string: string) => {
    // Пройдемося по кожній парі ключ-значення в об'єкті replacements
    for (const [target, replacement] of Object.entries(replacements)) {
      // Перевіримо, чи містить рядок потрібну послідовність букв
      if (string.includes(target)) {
        // Якщо так, замінимо її на відповідне значення
        string = string.replace(
          new RegExp(target.replace("#", "\\#"), "g"),
          replacement
        );
      }
    }
    return string;
  });

  return modifiedArray;
}

export const pureTranspose = (chord: string, int: string) => {
  if (chord.includes("b")) {
    const a = Chord.transpose(chord, "M2");
    const c = Chord.transpose(a, int);
    const transposedChord = Chord.transpose(c, "m7");

    return transposedChord;
  } else {
    const transposedChord = Chord.transpose(chord, int);
    return transposedChord;
  }
};

export function changeChordsByTonal(mode: string, array: string[]) {
  const replacements: Record<string, Record<string, string>> = {
    G: {
      Gbm: "F#m",
    },
    Em: {
      Gbm: "F#m",
    },
    D: {
      Gbm: "F#m",
      Dbm: "C#m",
    },
    Bm: {
      Gbm: "F#m",
      Dbm: "C#m",
    },
    A: {
      Gbm: "F#m",
      Dbm: "C#m",
      Abm: "G#m",
    },
    "F#m": {
      Gbm: "F#m",
      Dbm: "C#m",
      Abm: "G#m",
    },
    E: {
      Gbm: "F#m",
      Dbm: "C#m",
      Abm: "G#m",
      Ebm: "D#m",
    },
    "C#m": {
      Gbm: "F#m",
      Dbm: "C#m",
      Abm: "G#m",
      Ebm: "D#m",
    },
    B: {
      Dbm: "C#m",
      Abm: "G#m",
      Ebm: "D#m",
      Bbm: "A#m",
      Gb: "F#",
    },
    "G#m": {
      Dbm: "C#m",
      Abm: "G#m",
      Ebm: "D#m",
      Bbm: "A#m",
      Gb: "F#",
    },
    "F#": {
      Abm: "G#m",
      Ebm: "D#m",
      Bbm: "A#m",
      Gb: "F#",
      Db: "C#",
    },
    "D#m": {
      Abm: "G#m",
      Ebm: "D#m",
      Bbm: "A#m",
      Gb: "F#",
      Db: "C#",
    },
    F: {
      "A#": "Bb",
    },
    Dm: {
      "A#": "Bb",
    },
    Bb: {
      "A#": "Bb",
      "D#": "Eb",
    },
    Gm: {
      "A#": "Bb",
      "D#": "Eb",
    },
    Eb: {
      "A#": "Bb",
      "D#": "Eb",
      "G#": "Ab",
    },
    Cm: {
      "A#": "Bb",
      "D#": "Eb",
      "G#": "Ab",
    },
    Ab: {
      "D#": "Eb",
      "G#": "Ab",
      "C#": "Db",
      "A#m": "Bbm",
    },
    Fm: {
      "D#": "Eb",
      "G#": "Ab",
      "C#": "Db",
      "A#m": "Bbm",
    },
    Db: {
      "G#": "Ab",
      "C#": "Db",
      "A#m": "Bbm",
      "D#m": "Ebm",
      "F#": "Gb",
    },
    Bbm: {
      "G#": "Ab",
      "C#": "Db",
      "A#m": "Bbm",
      "D#m": "Ebm",
      "F#": "Gb",
    },
    Gb: {
      "C#": "Db",
      "A#m": "Bbm",
      "D#m": "Ebm",
      "F#": "Gb",
      "G#m": "Abm",
    },
    Ebm: {
      "C#": "Db",
      "A#m": "Bbm",
      "D#m": "Ebm",
      "F#": "Gb",
      "G#m": "Abm",
    },
  };

  const modifiedArray = array.map((string: string) => {
    let targetMode: Record<string, string> = {};
    // Замінюємо послідовність букв у відповідності з обраним модом
    switch (mode) {
      case "G":
        targetMode = replacements["G"];
        break;
      case "D":
        targetMode = replacements["D"];
        break;
      case "A":
        targetMode = replacements["A"];
        break;
      case "E":
        targetMode = replacements["E"];
        break;
      case "B":
        targetMode = replacements["B"];
        break;
      case "F#":
        targetMode = replacements["F#"];
        break;
      case "F":
        targetMode = replacements["F"];
        break;
      case "Bb":
        targetMode = replacements["Bb"];
        break;
      case "Eb":
        targetMode = replacements["Eb"];
        break;
      case "Ab":
        targetMode = replacements["Ab"];
        break;
      case "Db":
        targetMode = replacements["Db"];
        break;
      case "Gb":
        targetMode = replacements["Gb"];
        break;
      case "Em":
        targetMode = replacements["Em"];
        break;
      case "Bm":
        targetMode = replacements["Bm"];
        break;
      case "F#m":
        targetMode = replacements["F#m"];
        break;
      case "C#m":
        targetMode = replacements["C#m"];
        break;
      case "G#m":
        targetMode = replacements["G#m"];
        break;
      case "D#m":
        targetMode = replacements["D#m"];
        break;
      case "Dm":
        targetMode = replacements["Dm"];
        break;
      case "Gm":
        targetMode = replacements["Gm"];
        break;
      case "Cm":
        targetMode = replacements["Cm"];
        break;
      case "Fm":
        targetMode = replacements["Fm"];
        break;
      case "Bbm":
        targetMode = replacements["Bbm"];
        break;
      case "Ebm":
        targetMode = replacements["Ebm"];
        break;
      // Додайте інші можливі варіанти моду тут, якщо потрібно
      default:
        break;
    }

    // Проходимось по кожній парі ключ-значення в об'єкті replacements для обраного моду
    for (const [target, replacement] of Object.entries(targetMode)) {
      // Перевіряємо, чи містить рядок потрібну послідовність букв
      if (string.includes(target)) {
        // Якщо так, замінюємо її на відповідне значення
        string = string.replace(
          new RegExp(target.replace("#", "\\#"), "g"),
          replacement
        );
      }
    }
    return string;
  });

  return modifiedArray;
}
