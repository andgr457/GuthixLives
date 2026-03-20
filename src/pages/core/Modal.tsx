import React from "react";
import "../../styles/Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  backdropHides: boolean
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, backdropHides }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => {
      if(backdropHides === true){
        onClose()
      }
    }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && <h3>{title}</h3>}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;