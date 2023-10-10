import React, { useState } from "react";
import "./isuance.css";
import { Link } from "react-router-dom";

function VerifyForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setErrorMessage("");
    } else {
      setSelectedFile(null);
      setErrorMessage("Please select a valid PDF file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please select a valid PDF file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("pdfFile", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/verify", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Display the server's message in a popup
        console.log("Certificate is valid");
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(errorData.message); // Display the server's error message in a popup
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error("Error uploading file:", error.message);
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
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

export default VerifyForm;
