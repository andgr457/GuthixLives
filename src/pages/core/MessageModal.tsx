import Modal from './Modal'

interface MessageModalProps {
  showMessageModal: boolean
  title: string
  message: string
  onClose: () => void
}

export default function MessageModal(props: MessageModalProps) {
  return <Modal
    isOpen={props.showMessageModal}
    backdropHides={true}
    onClose={props.onClose}
    title={props.title}
  >
    <div className='parchment'>
      {props.message}
    </div>
  </Modal>
}