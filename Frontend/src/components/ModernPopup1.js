import React from "react";
import Modal from "react-modal";
import "./ModernPopup.css";

Modal.setAppElement("#root");

const ModernPopup = ({ isOpen, closeModal, handleModalChoice }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={null}
      contentLabel="Modern Popup"
      className="modern-popup"
      overlayClassName="modern-popup-overlay"
    >
      <button className="close" onClick={closeModal}>
        &times;
      </button>
      <div className="header">Certificate</div>
      <div className="content">
        <p>Choose an option:</p>
        <button onClick={() => handleModalChoice("Download Certificate")}>
          Download Certificate
        </button>
        <button onClick={() => handleModalChoice("View On Blockchain")}>
          View on Blockchain
        </button>
      </div>
    </Modal>
  );
};

export default ModernPopup;
