import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import './ErrorState.css';

function ErrorState({
  title = 'Something went wrong',
  message,
  retryText = 'Retry',
  onRetry,
  icon: Icon = FiAlertTriangle,
}) {
  return (
    <div className="error-state-container">
      <div className="error-state-icon">
        <Icon size={48} />
      </div>
      {title && <h3 className="error-state-title">{title}</h3>}
      {message && <p className="error-state-message">{message}</p>}
      {onRetry && (
        <button type="button" className="error-state-retry-btn" onClick={onRetry}>
          <FiRefreshCw size={14} className="error-state-btn-icon" /> {retryText}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
