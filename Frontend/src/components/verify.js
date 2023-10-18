import React, { useState } from 'react';
import './isuance.css';
import { Link } from 'react-router-dom';
import Loader from './loader';
import Notification from './notification';

function VerifyForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
    } else {
      setSelectedFile(null);
      setErrorMessage('Please select a valid PDF file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!selectedFile) {
      setErrorMessage('Please select a valid PDF file before submitting.');
      showNotification('Certificate is not valid');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/verify', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showNotification('Certificate is valid');
        console.log('Certificate is valid');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message);
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      showNotification('Error uploading file: ' + error.message);
      console.error('Error uploading file:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setIsNotificationVisible(true);
  };

  const handleCloseNotification = () => {
    setIsNotificationVisible(false);
  };

  return (
    <>
      <nav className="nav-links">
        <Link className="nav-link" to="/">
          Issue
        </Link>
        <Link className="nav-link" to="/verify">
          Verify
        </Link>
      </nav>
      <div className="issuer-container">
        <h1>Verify Certificate</h1>
        <form onSubmit={handleSubmit}>
          <h3>Upload File: To verify</h3>
          <input
            type="file"
            accept="application/pdf"
            name="image"
            onChange={handleFileChange}
          />
          <br />
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <br />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <Loader /> : 'Submit'}
          </button>
        </form>
      </div>
      {isNotificationVisible && (
        <Notification message={notificationMessage} onClose={handleCloseNotification} />
      )}
    </>
  );
}

export default VerifyForm;
