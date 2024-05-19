import { Chord } from "tonal";

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

export function replaceBadTonals(array: string[]) {
  const replacements = {
    "C#": "Db",
    "D#": "Eb",
    "G#": "Ab",
    "A#": "Bb",
    "A#m": "Bbm",
    Gb: "F#",
    Abm: "G#m",
    Gbm: "F#m",
    Ebm: "D#m",
    Dbm: "C#m",
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

// export function insertDoubledTonals(array: string[]) {
//   const resultArray: string[] = [];
//   const insertAfterMap: Record<string, string> = {
//     "C#": "Db",
//     "C#m": "Dbm",
//     "D#": "Eb",
//     "D#m": "Ebm",
//     "F#": "Gb",
//     "F#m": "Gbm",
//     "G#": "Ab",
//     "G#m": "Abm",
//     "A#": "Bb",
//     "A#m": "Bbm",
//   };
//   const insertBeforeMap: Record<string, string> = {
//     Db: "C#",
//     Dbm: "C#m",
//     Eb: "D#",
//     Ebm: "D#m",
//     Gb: "F#",
//     Gbm: "F#m",
//     Ab: "G#",
//     Abm: "G#m",
//     Bb: "A#",
//     Bbm: "A#m",
//   };
//   array.forEach((str) => {
//     // Якщо поточний рядок є в об'єкті insertBeforeMap, додаємо відповідний рядок перед ним
//     if (insertBeforeMap.hasOwnProperty(str)) {
//       resultArray.push(insertBeforeMap[str]);
//     }

//     // Додаємо поточний рядок до результатного масиву
//     resultArray.push(str);

//     // Якщо поточний рядок є в об'єкті insertAfterMap, додаємо відповідний рядок після нього
//     if (insertAfterMap.hasOwnProperty(str)) {
//       resultArray.push(insertAfterMap[str]);
//     }
//   });

//   return resultArray;
// }

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

const chordsBem = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
  "C#m": "Dbm",
  "D#m": "Ebm",
  "F#m": "Gbm",
  "G#m": "Abm",
  "A#m": "Bbm",
};

const chordsDies = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Dbm: "C#m",
  Ebm: "D#m",
  Gbm: "F#m",
  Abm: "G#m",
  Bbm: "A#m",
};

export function changeChordsByTonal(mode: string, array: string[]) {
  const replacements: Record<string, Record<string, string>> = {
    G: chordsDies,
    Em: chordsDies,
    D: chordsDies,
    Bm: chordsDies,
    A: chordsDies,
    "F#m": chordsDies,
    E: chordsDies,
    "C#m": chordsDies,
    B: chordsDies,
    "G#m": chordsDies,
    "F#": chordsDies,
    "D#m": chordsDies,
    F: chordsBem,
    Dm: chordsBem,
    Bb: chordsBem,
    Gm: chordsBem,
    Eb: chordsBem,
    Cm: chordsBem,
    Ab: chordsBem,
    Fm: chordsBem,
    Db: chordsBem,
    Bbm: chordsBem,
    Gb: chordsBem,
    Ebm: chordsBem,
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
