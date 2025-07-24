import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => {
        onRemove(toast.id);
      }, 300); // Match animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.id, onRemove]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast ${toast.type} ${isRemoving ? 'removing' : ''}`}>
      <button className="toast-close" onClick={handleRemove}>
        ×
      </button>
      <div className="toast-header">
        <span className="toast-icon">{getIcon()}</span>
        <h4 className="toast-title">{toast.title}</h4>
      </div>
      <p className="toast-message">{toast.message}</p>
    </div>
  );
};

export default Toast;
