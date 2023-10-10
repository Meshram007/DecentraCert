import React from 'react';
import {  BrowserRouter as Router, Routes , Route } from 'react-router-dom';

import CertificateForm from './components/isuance.js'; // Import the CertificateForm component
import VerifyForm from './components/verify.js';
function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route path="/" element={<CertificateForm />}/>
            <Route path="/verify" element={<VerifyForm/>}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;
