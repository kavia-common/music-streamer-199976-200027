import React, { useMemo, useState } from 'react';
import { usePlayer } from '../state/playerStore';
import Queue from './player/Queue';

/**
 * PUBLIC_INTERFACE
 * PlayerBar: Sticky bottom bar with playback controls, progress and volume.
 */
export default function PlayerBar() {
  const { state, togglePlay, previous, next, seek, setVolume, setMuted, setShuffle, setRepeat } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  const progressPct = useMemo(() => {
    if (!state.duration || state.duration <= 0) return 0;
    return Math.min(100, Math.max(0, (state.position / state.duration) * 100));
  }, [state.position, state.duration]);

  const volumePct = Math.round((state.muted ? 0 : state.volume) * 100);

  const onProgressClick = (e) => {
    const trackEl = e.currentTarget;
    const rect = trackEl.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(pct * (state.duration || 0));
  };

  const onVolumeClick = (e) => {
    const trackEl = e.currentTarget;
    const rect = trackEl.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
    if (pct > 0 && state.muted) setMuted(false);
  };

  const cycleRepeat = () => {
    const nextMode = state.repeat === 'off' ? 'one' : state.repeat === 'one' ? 'all' : 'off';
    setRepeat(nextMode);
  };

  return (
    <div className="playerbar" role="region" aria-label="Player controls">
      <div className="player-section track-info">
        <div className="cover" aria-hidden="true">{state.current ? '♪' : '♪'}</div>
        <div className="meta">
          <div className="title">{state.current?.title || 'Nothing Playing'}</div>
          <div className="artist">{state.current?.artist || 'Select a track to start listening'}</div>
        </div>
      </div>

      <div className="player-section controls">
        <button className="control-btn" aria-label="Shuffle" onClick={() => setShuffle(!state.shuffle)} title="Shuffle">
          {state.shuffle ? '🔀' : '↦'}
        </button>
        <button className="control-btn" aria-label="Previous" onClick={previous}>⏮</button>
        <button className="control-btn primary" aria-label="Play/Pause" onClick={togglePlay}>
          {state.playing ? '⏸' : '▶️'}
        </button>
        <button className="control-btn" aria-label="Next" onClick={next}>⏭</button>
        <button className="control-btn" aria-label="Repeat" onClick={cycleRepeat} title={`Repeat: ${state.repeat}`}>
          {state.repeat === 'one' ? '🔂' : state.repeat === 'all' ? '🔁' : '↻'}
        </button>
      </div>

      <div className="player-section extra">
        <div className="progress" aria-label="Playback progress">
          <div className="progress-track" onClick={onProgressClick} role="progressbar" aria-valuemin={0} aria-valuemax={state.duration || 0} aria-valuenow={state.position || 0}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <button className="control-btn" onClick={() => setShowQueue((v) => !v)} aria-expanded={showQueue} aria-controls="player-queue">☰</button>
        </div>
        <div className="volume">
          <button className="control-btn" aria-label={state.muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(!state.muted)}>
            {state.muted || volumePct === 0 ? '🔇' : volumePct < 50 ? '🔉' : '🔊'}
          </button>
          <div className="volume-track" onClick={onVolumeClick} role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={volumePct}>
            <div className="volume-fill" style={{ width: `${volumePct}%` }} />
          </div>
        </div>
      </div>

      {showQueue && (
        <div id="player-queue" style={{ gridColumn: '1 / -1' }}>
          <Queue />
        </div>
      )}
    </div>
  );
}
