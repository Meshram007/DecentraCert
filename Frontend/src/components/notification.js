import React, { useState, useEffect } from "react";
import "./notification.css";

const Notification = ({ message, onClose, type }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return isVisible ? (
    <div className={`notification-container ${type}`}>
      <div className="notification-content">
        <p>{message}</p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  ) : null;
};

export default Notification;
