import React, { useState } from 'react';
import './isuance.css';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

function CertificateForm() {
  const [selectedFile, setSelectedFile] = useState(null);
 

  const handleFileChange = async (event) => {
     setSelectedFile( await event.target.files[0]);
   
  };

  const handleSubmit = async (event) => {
  
    event.preventDefault();
    console.log(selectedFile);
    const formData =  new FormData();
    
    formData.append('pdfFile', selectedFile);
    formData.append('Certificate_Number', event.target.Certificate_Number.value);
    formData.append('name', event.target.name.value);
    formData.append('courseName', event.target.courseName.value);
    formData.append('Grant_Date', event.target.Grant_Date.value);
    formData.append('Expiration_Date', event.target.Expiration_Date.value);
    
    console.log(event.target.Expiration_Date.value);
    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });
      console.log(response.status, response.headers);
      if (response.ok) {
     
      
      // const pdfBlob = await response.blob();
      response.arrayBuffer().then(buffer => {
        console.log(buffer);
        const uint8Array = new Uint8Array(buffer);
        console.log(uint8Array);
        const pdfBlob =  new Blob([uint8Array], {type: 'application/pdf'});
        console.log(pdfBlob.size);
        saveAs(pdfBlob, 'certificate.pdf') ;
        // Process uint8array
      })
    
      
      
     
      
       
 
        console.log('File uploaded successfully!');
      } else {
        // Handle error response
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error('Error uploading file:', error.message);
    }
  };

  return (
    <>
      <nav className="nav-links">
      <Link className="nav-link" to="/">Issue</Link>
      <Link className="nav-link" to="/verify">Verify</Link> 
    </nav>
    <div className="issuer-container">

      <h1>NetCom Certificates Issuer</h1>
      <form onSubmit={handleSubmit}>
        <h3>Upload File:</h3>
        <input type="file" accept="application/pdf" name="image" onChange={handleFileChange}  />
        <h3>Text Inputs:</h3>
        <div className="form-row">
          <div>
        <label htmlFor="Certificate_Number">Certificate Number:</label>
        <input
          type="number"
          name="Certificate_Number"
          placeholder="Certificate Number"
          required
        /></div>
        <div>
        <label htmlFor="name">Name of Student:</label>
        <input type="text" name="name" placeholder="Name of Student" required />
        </div>
        <div>
        <label htmlFor="courseName">Course Name:</label>
        <input type="text" name="courseName" placeholder="Course Name" required />
        </div>
        <div>
        <label htmlFor="Grant_Date">Grant Date:</label>
        <input type="text" name="Grant_Date" placeholder="Grant Date" required />
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
        <br />
        <br />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    </>
  );
}

export default CertificateForm;
