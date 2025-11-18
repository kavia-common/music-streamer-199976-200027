import { useEffect, useState } from 'react';
import { audioController } from '../lib/audioController';

/**
 * PUBLIC_INTERFACE
 * useAudio: Subscribe to audio element state (position, duration, paused, volume, muted).
 */
export function useAudio() {
  const [snap, setSnap] = useState(() => audioController.getState());

  useEffect(() => {
    const unsub = audioController.subscribe(() => {
      setSnap(audioController.getState());
    });
    return unsub;
  }, []);

  return snap;
}
