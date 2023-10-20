import React, { useState } from "react";
import "./isuance.css";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import Loader from "./loader";
import Notification from "./notification";

import ModernPopup from "./ModernPopup1";

function CertificateForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChoice, setModalChoice] = useState(null);
  const [certificateResponse, setCertificateResponse] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCloseNotification = () => {
    setIsNotificationVisible(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("pdfFile", selectedFile);
    formData.append(
      "Certificate_Number",
      event.target.Certificate_Number.value
    );
    formData.append("name", event.target.name.value);
    formData.append("courseName", event.target.courseName.value);
    formData.append("Grant_Date", event.target.Grant_Date.value);
    formData.append("Expiration_Date", event.target.Expiration_Date.value);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response1 = await fetch("http://localhost:8000/polygonlink", {
        method: "GET",
      });

      if (response.ok) {
        setCertificateResponse(response);
        setModalChoice("Download Certificate");

        const data = await response1.json();
        const linkUrl = data.linkUrl;
        setLinkUrl(linkUrl);
        setModalChoice("View On Blockchain");
        setIsModalOpen(true);
      } else if (response.status === 400) {
        existCertificate(response);
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCertificate = async () => {
    try {
      const pdfBlob = await certificateResponse.blob();
      saveAs(pdfBlob, "certificate.pdf");

      const message = "Certificate Downloaded Successfully!";
      setResponseMessage(message);
      setIsNotificationVisible(true);
    } catch (error) {
      console.error("Error processing response:", error.message);
    }
  };

  const existCertificate = async (response) => {
    try {
      const message = "Certificate already issued";
      setResponseMessage(message);
      setIsNotificationVisible(true);
    } catch (error) {
      console.error("Error processing response:", error.message);
    }
  };

  const handleModalChoice = (choice) => {
    setModalChoice(choice);

    if (choice === "Download Certificate") {
      saveCertificate();
    } else if (choice === "View On Blockchain") {
      if (linkUrl) {
        window.open(linkUrl, "_blank");
      }
    }
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
        <h1>NetCom Certificates Issuer</h1>
        <form onSubmit={handleSubmit}>
          <h3>Upload File:</h3>
          <input
            type="file"
            accept="application/pdf"
            name="image"
            onChange={handleFileChange}
          />
          <h3>Text Inputs:</h3>
          <div className="form-row">
            <div>
              <label htmlFor="Certificate_Number">Certificate Number:</label>
              <input
                type="number"
                name="Certificate_Number"
                placeholder="Certificate Number"
                required
              />
            </div>
            <div>
              <label htmlFor="name">Name of Student:</label>
              <input
                type="text"
                name="name"
                placeholder="Name of Student"
                required
              />
            </div>
            <div>
              <label htmlFor="courseName">Course Name:</label>
              <input
                type="text"
                name="courseName"
                placeholder="Course Name"
                required
              />
            </div>
            <div>
              <label htmlFor="Grant_Date">Grant Date:</label>
              <input
                type="text"
                name="Grant_Date"
                placeholder="Grant Date"
                required
              />
            </div>
            <div>
              <label htmlFor="Expiration_Date">Expiration Date:</label>
              <input
                type="text"
                name="Expiration_Date"
                placeholder="Expiration Date"
                required
              />
            </div>
          </div>
          <br />
          <br />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <Loader /> : "Submit"}
          </button>
        </form>
      </div>
      {isNotificationVisible && (
        <Notification
          message={responseMessage}
          onClose={handleCloseNotification}
        />
      )}

      {/* ModernPopup */}
      <ModernPopup
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        handleModalChoice={handleModalChoice}
      />
    </>
  );
}

export default CertificateForm;
