import React, { useState } from "react";
import "./isuance.css";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import Loader from "./loader";
import Notification from "./notification";

function CertificateForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

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

    console.log(event.target.Expiration_Date.value);
    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      console.log(response.status, response.headers);

      if (response.ok) {
        console.log("File uploaded successfully!");
        saveCertificate(response); // You can still use the original response here
      } else if (response.status === 400) {
        console.log("Certificate Already Issued");
        existCertificate(response); // You can still use the original response here
      } else {
        // Handle error response
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error("Error uploading file:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCertificate = async (response) => {
    try {
      const pdfBlob = await response.blob();
      saveAs(pdfBlob, "certificate.pdf");

      const message = `Certificate Downloaded Successfully!`;

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
            {isLoading ? <Loader /> : "Submit"}{" "}
            {/* Display loader when isLoading is true */}
          </button>
        </form>
      </div>
      {isNotificationVisible && (
        <Notification
          message={responseMessage}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
}

export default CertificateForm;
