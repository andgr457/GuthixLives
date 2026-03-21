import Modal from './Modal'

interface ConfirmModalProps {
  showConfirmModal: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmModal(props: ConfirmModalProps) {
  return <Modal
    isOpen={props.showConfirmModal}
    backdropHides={true}
    onClose={props.onClose}
    title={props.title}
  >
    <div className='basic-div'>
      {props.message}
    </div>
    <div>
      <button 
        className='button-link'
        onClick={props.onConfirm}
        style={{width: '45%', textAlign: 'center'}}
      >
        Yes
      </button>
      <button 
        className='button-link destructive'
        onClick={props.onClose}
        style={{width: '45%', textAlign: 'center'}}
      >
        No
      </button>
    </div>
  </Modal>
}