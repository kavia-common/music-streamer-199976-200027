import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { storage } from '../utils/storage';
import { audioController } from '../lib/audioController';

// Persisted keys
const PLAYER_PERSIST_KEY = 'player.state.v1';

// Types and helpers
function clamp01(x) { return Math.min(1, Math.max(0, Number(x) || 0)); }
function pick(arr, idx) { return idx >= 0 && idx < arr.length ? arr[idx] : undefined; }
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// State shape
const initial = {
  queue: [], // [{ id, title, artist, duration, albumArt, audioUrl }]
  currentIndex: -1,
  playing: false,
  // settings
  volume: 0.7,
  muted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'one' | 'all'
  // progress
  position: 0,
  duration: 0,
};

function loadPersisted() {
  const p = storage.getJson(PLAYER_PERSIST_KEY, null);
  if (!p) return {};
  return {
    volume: typeof p.volume === 'number' ? clamp01(p.volume) : undefined,
    muted: !!p.muted,
    shuffle: !!p.shuffle,
    repeat: ['off', 'one', 'all'].includes(p.repeat) ? p.repeat : undefined,
  };
}
function savePersisted(state) {
  storage.setJson(PLAYER_PERSIST_KEY, {
    volume: state.volume,
    muted: state.muted,
    shuffle: state.shuffle,
    repeat: state.repeat,
  });
}

// Actions
const A = {
  SET_QUEUE: 'SET_QUEUE',
  SET_INDEX: 'SET_INDEX',
  SET_PLAYING: 'SET_PLAYING',
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
};

function reducer(state, action) {
  switch (action.type) {
    case A.SET_QUEUE:
      return {
        ...state,
        queue: action.queue || [],
        currentIndex: action.startIndex ?? (action.queue?.length ? 0 : -1),
        playing: !!action.autoplay && (action.queue?.length ? true : false),
      };
    case A.SET_INDEX:
      return { ...state, currentIndex: action.index, playing: action.autoplay ?? state.playing };
    case A.SET_PLAYING:
      return { ...state, playing: !!action.playing };
    case A.SET_SETTINGS: {
      const next = { ...state, ...action.patch };
      savePersisted(next);
      return next;
    }
    case A.UPDATE_PROGRESS:
      return { ...state, position: action.position ?? state.position, duration: action.duration ?? state.duration };
    default:
      return state;
  }
}

const PlayerContext = createContext(undefined);

/**
 * PUBLIC_INTERFACE
 * PlayerProvider: Provides global player state and actions across the app.
 */
export function PlayerProvider({ children }) {
  const persisted = useMemo(loadPersisted, []);
  const [state, dispatch] = useReducer(reducer, { ...initial, ...persisted });
  const autoAdvanceRef = useRef(false);
  // Also hydrate with app settings defaultVolume on first mount
  useEffect(() => {
    try {
      const s = JSON.parse(window.localStorage.getItem('app.settings.v1') || 'null');
      const vol = typeof s?.defaultVolume === 'number' ? Math.min(1, Math.max(0, s.defaultVolume / 100)) : undefined;
      if (typeof vol === 'number') {
        dispatch({ type: A.SET_SETTINGS, patch: { volume: vol } });
      }
    } catch {
      // ignore
    }
    // run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync audio element with settings
  useEffect(() => {
    audioController.setVolume(state.muted ? 0 : clamp01(state.volume));
    audioController.setMuted(state.muted);
  }, [state.volume, state.muted]);

  // Subscribe to audio time and lifecycle events
  useEffect(() => {
    const unsub = audioController.subscribe((ev) => {
      if (ev.type === 'timeupdate' || ev.type === 'loadedmetadata' || ev.type === 'durationchange') {
        dispatch({ type: A.UPDATE_PROGRESS, position: ev.currentTime || 0, duration: ev.duration || 0 });
      }
      if (ev.type === 'playing') {
        dispatch({ type: A.SET_PLAYING, playing: true });
      }
      if (ev.type === 'pause') {
        dispatch({ type: A.SET_PLAYING, playing: false });
      }
      if (ev.type === 'ended') {
        // trigger auto next
        autoAdvanceRef.current = true;
        next();
        setTimeout(() => { autoAdvanceRef.current = false; }, 0);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load and play track when currentIndex changes
  useEffect(() => {
    const track = pick(state.queue, state.currentIndex);
    if (!track) return;
    const url = track.audioUrl || track.streamUrl || track.url || track.src || '';
    (async () => {
      await audioController.load(url, state.playing);
      if (state.playing) {
        try { await audioController.play(); } catch (_) { /* may be blocked */ }
      }
    })();
  }, [state.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
  const setVolume = useCallback((v) => {
    dispatch({ type: A.SET_SETTINGS, patch: { volume: clamp01(v), muted: v <= 0 ? state.muted : state.muted } });
    audioController.setVolume(v);
  }, [state.muted]);

  const setMuted = useCallback((m) => {
    dispatch({ type: A.SET_SETTINGS, patch: { muted: !!m } });
    audioController.setMuted(m);
  }, []);

  const togglePlay = useCallback(async () => {
    const track = pick(state.queue, state.currentIndex);
    if (!track) return;
    await audioController.toggle();
  }, [state.queue, state.currentIndex]);

  const play = useCallback(async () => {
    const track = pick(state.queue, state.currentIndex);
    if (!track) return;
    try { await audioController.play(); } catch (_) { /* ignore */ }
  }, [state.queue, state.currentIndex]);

  const pause = useCallback(() => audioController.pause(), []);

  const seek = useCallback((pos) => audioController.seek(pos), []);

  const setRepeat = useCallback((mode) => {
    const next = ['off', 'one', 'all'].includes(mode) ? mode : 'off';
    dispatch({ type: A.SET_SETTINGS, patch: { repeat: next } });
  }, []);

  const setShuffle = useCallback((enabled) => {
    dispatch({ type: A.SET_SETTINGS, patch: { shuffle: !!enabled } });
    // No immediate reshuffle of queue; shuffle logic applied on next/previous navigation
  }, []);

  const setQueue = useCallback(({ list, startIndex = 0, autoplay = true }) => {
    const normalized = Array.isArray(list) ? list.filter(Boolean) : [];
    dispatch({ type: A.SET_QUEUE, queue: normalized, startIndex, autoplay });
  }, []);

  const playTrack = useCallback((track, { replaceQueue = false } = {}) => {
    if (!track) return;
    if (replaceQueue) {
      setQueue({ list: [track], startIndex: 0, autoplay: true });
    } else {
      const list = [...state.queue];
      let index = list.findIndex((t) => t?.id === track.id);
      if (index === -1) {
        list.push(track);
        index = list.length - 1;
      }
      dispatch({ type: A.SET_QUEUE, queue: list, startIndex: index, autoplay: true });
    }
  }, [setQueue, state.queue]);

  const playPlaylist = useCallback((tracks) => {
    const list = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
    if (state.shuffle) {
      const shuffled = shuffleArray(list);
      setQueue({ list: shuffled, startIndex: 0, autoplay: true });
    } else {
      setQueue({ list, startIndex: 0, autoplay: true });
    }
  }, [setQueue, state.shuffle]);

  const previous = useCallback(() => {
    const has = state.queue.length > 0;
    if (!has) return;
    const repeatOne = state.repeat === 'one';
    if (repeatOne) {
      audioController.seek(0);
      audioController.play();
      return;
    }
    let nextIndex = state.currentIndex - 1;
    if (state.shuffle) {
      // pick a random previous different index if possible
      nextIndex = Math.floor(Math.random() * state.queue.length);
    }
    if (nextIndex < 0) {
      nextIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
    }
    dispatch({ type: A.SET_INDEX, index: nextIndex, autoplay: true });
  }, [state.queue.length, state.currentIndex, state.repeat, state.shuffle]);

  const next = useCallback(() => {
    const has = state.queue.length > 0;
    if (!has) return;
    const repeatOne = state.repeat === 'one';
    if (repeatOne) {
      audioController.seek(0);
      audioController.play();
      return;
    }
    let nextIndex = state.currentIndex + 1;
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    }
    if (nextIndex >= state.queue.length) {
      if (state.repeat === 'all') {
        nextIndex = 0;
      } else {
        // stop at end
        dispatch({ type: A.SET_PLAYING, playing: false });
        return;
      }
    }
    dispatch({ type: A.SET_INDEX, index: nextIndex, autoplay: true });
  }, [state.queue.length, state.currentIndex, state.repeat, state.shuffle]);

  const value = useMemo(() => {
    const current = pick(state.queue, state.currentIndex);
    return {
      state: {
        ...state,
        current,
      },
      // Controls
      play, pause, togglePlay, seek, previous, next,
      setVolume, setMuted, setRepeat, setShuffle,
      // Queue ops
      setQueue, playTrack, playPlaylist,
    };
  }, [
    state,
    play, pause, togglePlay, seek, previous, next,
    setVolume, setMuted, setRepeat, setShuffle,
    setQueue, playTrack, playPlaylist,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * usePlayer: Hook to access player store.
 */
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within <PlayerProvider>');
  return ctx;
}
