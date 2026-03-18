import { useCallback } from 'react'
import type { CharacterGEItem, CharacterGEOrderItem } from '../../../types/Characters'
import Modal from '../../core/Modal'
import { DateTime } from 'luxon'

interface NewGEOrderModalProps {
  showNewOrderModal: boolean
  newOrderModalError: string
  geItems: CharacterGEItem[]
  newOrderTitle: string
  setNewOrderTitle: (title: string) => void
  newOrderNotes: string
  setNewOrderNotes: (notes: string) => void
  newOrderOrderItems: CharacterGEOrderItem[]
  setNewOrderOrderItems: (orderItems: CharacterGEOrderItem[]) => void
  onCancel: () => void
  onConfirm: () => void
  
}

export default function NewGEOrderModal(props: NewGEOrderModalProps) {

  const handleAddOrderItem = useCallback((itemId: string) => {
    const foundItem = props.geItems.find(i => i.id === itemId)
    if(!foundItem) return
    const newOrderItems: CharacterGEOrderItem[] = []
    newOrderItems.push({
      id: `oi_${foundItem.name}_${DateTime.utc().toMillis()}`,
      itemId: foundItem.id as string,
      boughtPrice: 0,
      orderId: undefined, //set later
      sellPrice: 0,
      taxed: true
    })
    for(const item of props.newOrderOrderItems){
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.geItems, props.newOrderOrderItems])

  return <Modal
    isOpen={props.showNewOrderModal}
    onClose={props.onCancel}
    title={`New GE Order`}
  >
    <div className='flex-wrap-gap' style={{gap: '1em'}}>
      <div>
        <div>
          Order Title
        </div>
        <div>
          <input 
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewOrderTitle(e.target.value)}} 
            type='text'
            placeholder='Enter item name...'
            value={props.newOrderTitle ?? ''}
          />
        </div>
      </div>
      <div>
        <div>
          Notes (optional)
        </div>
        <div>
          <input 
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewOrderTitle(e.target.value)}} 
            type='text'
            placeholder='Enter notes...'
            value={props.newOrderTitle ?? ''}
          />
        </div>
      </div>
      <div>
        <div>
          Add Order Item
        </div>
        <div>
          <select
            className="rs-select"
            style={{width: '33vh'}}
            onChange={(e) =>
              props.setNewItemGameVersion(e.currentTarget.value)
            }
          >
            <option disabled>Select Item</option>

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