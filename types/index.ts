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
}

export interface SongBlockProps {
  song: GettedSong;
  block: Block;
  setSong: (song: GettedSong) => void;
  index: number;
}

export interface Song {
  title: string;
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

export interface SongLinkProps {
  route: string;
  type: string;
  id?: string;
}
