import { FormEvent } from "react";

export interface MinistryCardProps {
  title: string;
  verse: string;
  descr: string;
  url: string;
  img: string;
}

export interface TableCardProps {
  title: string;
  time: string;
  day: string;
}

export interface FormProps {
  type: string;
  song: GettedSong;
  setSong: (song: GettedSong) => void;
  submitting: boolean;
  handleSubmit: (e: FormEvent) => void;
  question: string;
  descr: string;
}

export interface SongBlockProps {
  song: GettedSong;
  block: Block;
  setSong: (song: GettedSong) => void;
  index: number;
}

export interface OurEvent {
  _id: number;
  title: string;
  live: string;
  playList?: string;
  songs: Array<EventSong>;
  date?: Date;
}

export interface EventSong {
  song: string;
  comment: string;
  ind: string;
  title: string;
}

export interface EventFormBlockProps {
  songs: Array<GettedSong>;
  event: OurEvent;
  setEvent: (event: OurEvent) => void;
  song?: EventSong;
  index: number;
}

export interface AddSongToEventBlockProps {
  songs: Array<GettedSong>;
  event: OurEvent;
  setEvent: (event: OurEvent) => void;
  selectedSong: GettedSong | null;
  setSelectedSong: (song: GettedSong | null) => void;
}

export interface SearchTitleForEventProps {
  songs: Array<GettedSong>;
  setEvent: (event: OurEvent) => void;
  index: number;
  event: OurEvent;
  existedSong?: EventSong;
}

export interface SearchTitleForNewSongInEventProps {
  songs: Array<GettedSong>;
  event: OurEvent;
  setEvent: (event: OurEvent) => void;
  selectedSong: GettedSong | null;
  setSelectedSong: (song: GettedSong | null) => void;
}

export interface Song {
  title: string;
  rythm: string;
  comment: string;
  key: string;
  mode: string;
  origin: string;
  video: string;
  ourVideo: string;
  blocks: Array<Block>;
}

export interface Block {
  name: string;
  version: string;
  lines: string;
  ind: string;
}

export interface GettedSong {
  _id: number;
  title: string;
  rythm: string;
  tags: string;
  comment: string;
  key: string;
  mode: string;
  origin: string;
  video: string;
  ourVideo: string;
  blocks: Array<Block>;
}

export interface CardListProps {
  songs: Array<GettedSong>;
}

export interface AlphCardProps {
  letter: string;
  songs: Array<GettedSong>;
}
export interface TagCardProps {
  tag: string | null;
  songs: Array<GettedSong>;
}

export interface SongLinkProps {
  route: string;
  type: string;
  id?: string;
}

export interface EditTonalModalProps {
  type: string;
  question: string;
  descr: string;
  submitting: boolean;
  progression: string[] | undefined;
  changeTonal: (interval: string, tonal: string, type?: string) => void;
  currentTonal: string | undefined;
}

export interface AgreeModalProps {
  type: string;
  question: string;
  descr: string;
  submitting: boolean;
  handleSubmit: (e: FormEvent) => void;
}

interface FooterLink {
  title: string;
  links: Array<{ title: string; url: string }>;
}

export interface FooterLinkSection {
  footerLinks: Array<FooterLink>;
}

export interface NavLinksProps {
  handleClick?: () => void;
}

export interface YearAccordionProps {
  events: Array<OurEvent>;
}
