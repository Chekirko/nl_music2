export const alphabet = [
  "а",
  "б",
  "в",
  "г",
  "д",
  "е",
  "є",
  "ж",
  "з",
  "і",
  "ї",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ю",
  "я",
];

// All available musical keys (major and minor)
export const AVAILABLE_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"
] as const;

export type MusicalKey = typeof AVAILABLE_KEYS[number];

// Block display versions: 1 = text+chords, 2 = text only, 3 = chords only
export const BLOCK_VERSIONS = ["1", "2", "3"] as const;
export type BlockVersion = typeof BLOCK_VERSIONS[number];

export const defaultEvent = {
  _id: "1",
  title: "",
  live: "",
  playList: "",
  date: new Date("2023-01-01"),
  songs: [
    {
      song: "1",
      comment: "",
      ind: "1",
      title: "",
    },
    {
      song: "2",
      comment: "",
      ind: "2",
      title: "",
    },
    {
      song: "3",
      comment: "",
      ind: "3",
      title: "",
    },
    // {
    //   song: "4",
    //   comment: "",
    //   ind: "4",
    //   title: "",
    // },
    // {
    //   song: "5",
    //   comment: "",
    //   ind: "5",
    //   title: "",
    // },
    // {
    //   song: "6",
    //   comment: "",
    //   ind: "6",
    //   title: "",
    // },
    // {
    //   song: "7",
    //   comment: "",
    //   ind: "7",
    //   title: "",
    // },
    // {
    //   song: "8",
    //   comment: "",
    //   ind: "8",
    //   title: "",
    // },
    // {
    //   song: "9",
    //   comment: "",
    //   ind: "9",
    //   title: "",
    // },
    // {
    //   song: "10",
    //   comment: "",
    //   ind: "10",
    //   title: "",
    // },
    // {
    //   song: "11",
    //   comment: "",
    //   ind: "11",
    //   title: "",
    // },
    // {
    //   song: "12",
    //   comment: "",
    //   ind: "12",
    //   title: "",
    // },
    // {
    //   song: "13",
    //   comment: "",
    //   ind: "13",
    //   title: "",
    // },
    // {
    //   song: "14",
    //   comment: "",
    //   ind: "14",
    //   title: "",
    // },
    // {
    //   song: "15",
    //   comment: "",
    //   ind: "15",
    //   title: "",
    // },
    // {
    //   song: "16",
    //   comment: "",
    //   ind: "16",
    //   title: "",
    // },
    // {
    //   song: "17",
    //   comment: "",
    //   ind: "17",
    //   title: "",
    // },
    // {
    //   song: "18",
    //   comment: "",
    //   ind: "18",
    //   title: "",
    // },
    // {
    //   song: "19",
    //   comment: "",
    //   ind: "19",
    //   title: "",
    // },
    // {
    //   song: "20",
    //   comment: "",
    //   ind: "20",
    //   title: "",
    // },
    // {
    //   song: "21",
    //   comment: "",
    //   ind: "21",
    //   title: "",
    // },
  ],
};

export const defaultSong = {
  _id: "1",
  title: "",
  rythm: "",
  tags: "",
  comment: "",
  key: "",
  mode: "",
  origin: "",
  video: "",
  ourVideo: "",
  blocks: [
    {
      name: "",
      version: "1",
      lines: "",
      ind: "1",
    },
    {
      name: "",
      version: "1",
      lines: "",
      ind: "2",
    },
    {
      name: "",
      version: "1",
      lines: "",
      ind: "3",
    },
    {
      name: "",
      version: "1",
      lines: "",
      ind: "4",
    },
    {
      name: "",
      version: "1",
      lines: "",
      ind: "5",
    },
  ],
};

export const team = [
  {
    id: "1",
    name: "Уляна Вороняк",
    position: "Лідер / Клавіші",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Уляна1.jpg",
    fb: "",
    inst: "",
  },
  {
    id: "2",
    name: "Ілля Метела",
    position: "Ударні",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Ілля2.jpg",
    fb: "",
    inst: "",
  },
  {
    id: "3",
    name: "Альона Савчук",
    position: "Вокал",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Альона2.jpg",
    fb: "",
    inst: "",
  },
  {
    id: "4",
    name: "Ярослав Гавецький",
    position: "Вокал",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Славік.jpg",
    fb: "",
    inst: "",
  },
  {
    id: "5",
    name: "Віта Фалендаш",
    position: "Вокал",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Віта1.jpg",
    fb: "",
    inst: "",
  },
  {
    id: "6",
    name: "Віктор Чекірко",
    position: "Гітара",
    bio: "Декілька слів про учасника гурту можна написати тут",
    image: "/Вітя.jpg",
    fb: "",
    inst: "",
  },
];

export const footerLinks = [
  {
    title: "About",
    links: [
      { title: "How it works", url: "/" },
      { title: "Featured", url: "/" },
      { title: "Partnership", url: "/" },
      { title: "Bussiness Relation", url: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "Events", url: "/" },
      { title: "Blog", url: "/" },
      { title: "Podcast", url: "/" },
      { title: "Invite a friend", url: "/" },
    ],
  },
  {
    title: "Socials",
    links: [
      { title: "Discord", url: "/" },
      { title: "Instagram", url: "/" },
      { title: "Twitter", url: "/" },
      { title: "Facebook", url: "/" },
    ],
  },
];
