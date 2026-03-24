import Modal from '../../core/Modal'
import AppErrorSection from '../../core/AppErrorSection'
import { useKeyPress } from '../../../hooks/useKeyPress'
import { useEffect, useRef } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (showHistoryModal) {
      inputRef.current?.focus();
    }
  }, [showHistoryModal]);

  return <Modal
    isOpen={showHistoryModal}
    onClose={props.onCancel}
    backdropHides={true}
    title={`New GE Item to Track`}
  >
    <div className='flex-wrap-gap' style={{gap: '1em'}}>
      <div>
        <div>
          New Item Name
        </div>
        <div>
          <input 
            ref={inputRef}
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewItemName(e.target.value)}} 
            type='text'
            placeholder='Enter item name...'
            value={newItemName ?? ''}
          />
        </div>
      </div>
      <div>
        <div title='Determine what API endpoint to look at when refreshing data.'>
          Game Version &#9432;
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
        className='button-link'
        onClick={props.onConfirm}
      >
        Add Item
      </button>
      <button 
        className='button-link destructive'
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </div>
    <div>
      <AppErrorSection error={error} />
    </div>
  </Modal>
}