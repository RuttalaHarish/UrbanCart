import React from 'react';
import './Loading.css';

function Loading({ message = 'Loading...', fullScreen = false }) {
  const containerClass = fullScreen ? 'loading-container loading-fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-spinner"></div>
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
}

export default Loading;
