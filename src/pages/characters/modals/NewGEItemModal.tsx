import Modal from '../../core/Modal'
import AppErrorSection from '../../core/AppErrorSection'
import { useKeyPress } from '../../../hooks/useKeyPress'

interface NewGEItemModalProps {
  showNewGEItemModal: boolean
  error: string
  newItemName: string
  newItemGameVersion: string
  setNewItemName: (name: string) => void
  setNewItemGameVersion: (version: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export default function NewGEItemModal(props: NewGEItemModalProps){
  const {
    error,
    newItemName,
    newItemGameVersion,
  } = props

  const {
    showNewGEItemModal: showHistoryModal,
  } = props

  const handleEnterPress = () => {
    props.onConfirm()
  };

  useKeyPress('Enter', handleEnterPress);


  return <Modal
    isOpen={showHistoryModal}
    onClose={props.onCancel}
    title={`New GE Item to Track`}
  >
    <div className='flex-wrap-gap' style={{gap: '1em'}}>
      <div>
        <div>
          New Item Name
        </div>
        <div>
          <input 
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewItemName(e.target.value)}} 
            type='text'
            placeholder='Enter item name...'
            value={newItemName ?? ''}
          />
        </div>
      </div>
      <div>
        <div>
          Game Version
        </div>
        <div>
          <select
            className="rs-select"
            style={{width: '33vh'}}
            value={newItemGameVersion}
            onChange={(e) =>
              props.setNewItemGameVersion(e.currentTarget.value)
            }
          >
            <option className='rs-select-item' value='rs'>
              RuneScape 3
            </option>
            <option value='osrs'>
              Old School RuneScape
            </option>
          </select>
        </div>
      </div>
      
    </div>
    <hr/>
    <div>
      <button 
        className='primary'
        onClick={props.onConfirm}
        style={{width: '50%'}}

      >
        Add Item
      </button>
      <button 
        style={{float: 'right'}}
        className='danger'
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </div>
    <div>
      <AppErrorSection error={error} />
    </div>
    <div>
      
    </div>
  </Modal>
}