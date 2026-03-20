import { DateTime } from 'luxon';
import Modal from '../../core/Modal';
import type { CharacterGEItemHistory } from '../../../types/Characters';

interface GEHistoryModalProps {
  showHistoryModal: boolean
  historyModalItemName: string
  historyModalItems: CharacterGEItemHistory[]
  onClose: () => void
  onConfirm: () => void
}

export default function GEHistoryModal(props: GEHistoryModalProps) {
  const {
    showHistoryModal,
    historyModalItemName,
    historyModalItems,
  } = props

  return <Modal
    isOpen={showHistoryModal}
    backdropHides={true}
    onClose={props.onClose}
    title={`${historyModalItemName} History`}
  >
    {historyModalItems && historyModalItems.map(history => {
      const itemDate = DateTime.fromISO(history.geTimestamp as string).toLocal()
      const dateFormatted = itemDate.toFormat('dd-MM-yy t')
      
      return <div className='list-item flex-wrap-gap'>
        <div style={{textWrap: 'wrap', width: '33%', fontSize: 'smaller'}}>
          {dateFormatted}
        </div>
        <div style={{color: '#FFD700'}}>
          {history.price?.toLocaleString()} GP
        </div>
        <div>
          {history.volume?.toLocaleString()}
        </div>
      </div>
    })}
  </Modal>
}