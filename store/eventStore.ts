import { create } from "zustand";
import { GettedSong, OurEvent } from "@/types";

interface EventStore {
  event: Omit<OurEvent, "_id"> & { _id?: string };
  songs: GettedSong[];
  setEvent: (event: Omit<OurEvent, "_id"> & { _id?: string }) => void;
  setSongs: (songs: GettedSong[]) => void;
  updateSong: (index: number, songId: string, title: string) => void;
  clearSong: (index: number) => void;
  addSongSlot: () => void;
  removeSongSlot: (index: number) => void;
  reset: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  event: {
    title: "",
    live: "",
    playList: "",
    date: new Date(),
    songs: [
      { song: "0", comment: "", ind: "0", title: "" },
      { song: "1", comment: "", ind: "1", title: "" },
      { song: "2", comment: "", ind: "2", title: "" },
    ],
  },
  songs: [],

  setEvent: (event) => set({ event }),

  setSongs: (songs) => set({ songs }),

  updateSong: (index, songId, title) =>
    set((state) => {
      const updatedSongs = [...state.event.songs];
      updatedSongs[index] = {
        ...updatedSongs[index],
        song: songId,
        title: title,
      };
      return { event: { ...state.event, songs: updatedSongs } };
    }),

  clearSong: (index) =>
    set((state) => {
      const updatedSongs = [...state.event.songs];
      updatedSongs[index] = {
        ...updatedSongs[index],
        song: `${index}`,
        title: "",
      };
      return { event: { ...state.event, songs: updatedSongs } };
    }),

  addSongSlot: () =>
    set((state) => {
      const newIndex = state.event.songs.length;
      const newSong = {
        song: `${newIndex}`,
        comment: "",
        ind: `${newIndex}`,
        title: "",
      };
      return {
        event: {
          ...state.event,
          songs: [...state.event.songs, newSong],
        },
      };
    }),

  removeSongSlot: (index) =>
    set((state) => {
      const updatedSongs = state.event.songs.filter((_, i) => i !== index);
      return { event: { ...state.event, songs: updatedSongs } };
    }),
  reset: () =>
    set({
      event: {
        title: "",
        live: "",
        playList: "",
        date: new Date(),
        songs: [
          { song: "1", comment: "", ind: "1", title: "" },
          { song: "2", comment: "", ind: "2", title: "" },
          { song: "3", comment: "", ind: "3", title: "" },
        ],
      },
      songs: [],
    }),
}));
