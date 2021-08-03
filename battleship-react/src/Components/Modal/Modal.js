import { useContext } from 'react';

import { ModalContext } from '../../Contexts/ModalContext';

import './Modal.css';

const Modal = () => {
  const modalData = useContext(ModalContext);

  const closeHandler = () => {
    modalData.updateIsShown(false);
  }

  const modalContent = (
    <div className="modal-wrapper">
      <div className="close-handler" onClick={ closeHandler } />
      <div className="modal-window">
        { modalData.content }
      </div>
    </div>
  );

  return modalData.isShown ? modalContent : null;
}

export default Modal;