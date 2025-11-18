import React from 'react';

/**
 * PUBLIC_INTERFACE
 * PlayerBar: Sticky bottom bar with basic playback controls placeholder.
 */
export default function PlayerBar() {
  return (
    <div className="playerbar" role="region" aria-label="Player controls">
      <div className="player-section track-info">
        <div className="cover" aria-hidden="true">♪</div>
        <div className="meta">
          <div className="title">Nothing Playing</div>
          <div className="artist">Select a track to start listening</div>
        </div>
      </div>

      <div className="player-section controls">
        <button className="control-btn" aria-label="Previous">⏮</button>
        <button className="control-btn primary" aria-label="Play/Pause">⏯</button>
        <button className="control-btn" aria-label="Next">⏭</button>
      </div>

      <div className="player-section extra">
        <div className="progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
        </div>
        <div className="volume">
          <span aria-hidden="true">🔊</span>
          <div className="volume-track">
            <div className="volume-fill" style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
