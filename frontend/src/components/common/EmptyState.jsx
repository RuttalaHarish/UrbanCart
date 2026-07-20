import React from 'react';
import './EmptyState.css';

function EmptyState({ title, message, actionText, onAction, icon: Icon }) {
  return (
    <div className="empty-state-container">
      {Icon && <div className="empty-state-icon"><Icon size={48} /></div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {message && <p className="empty-state-message">{message}</p>}
      {actionText && onAction && (
        <button type="button" className="empty-state-action-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
