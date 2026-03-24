import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharacterGEItem, CharacterGEOrderItem, CharacterGEItemGameVersion } from '../../../types/Characters'
import Modal from '../../core/Modal'
import { DateTime } from 'luxon'
import AppErrorSection from '../../core/AppErrorSection'
import CharacterGEOrderOrderItem from '../CharacterGEOrderOrderItem'
import { useKeyPress } from '../../../hooks/useKeyPress'
import { getShortGameNameByVersion } from '../CharactersConstants'

interface NewGEOrderModalProps {
  showNewOrderModal: boolean
  newOrderModalError: string
  characterGEItems: CharacterGEItem[]
  newOrderTitle: string
  setNewOrderTitle: (title: string) => void
  newOrderNotes: string
  setNewOrderNotes: (notes: string) => void
  newOrderOrderItems: CharacterGEOrderItem[]
  setNewOrderOrderItems: (orderItems: CharacterGEOrderItem[]) => void
  onCancel: () => void
  onConfirm: () => void
  onClear: () => void
  
}

export default function NewGEOrderModal(props: NewGEOrderModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState('')
  const [selectedItemFilter, setSelectedItemFilter] = useState<'both' | CharacterGEItemGameVersion>('both')
  useEffect(() => {
    if (props.showNewOrderModal) {
      inputRef.current?.focus();
    }
  }, [props.showNewOrderModal]);

  const handleEnterPress = () => {
    props.onConfirm()
  };

  useKeyPress('Enter', handleEnterPress);

  const handleAddOrderItem = useCallback(() => {
    if(!selectedItemId) return
    const foundItem = props.characterGEItems.find(i => i.id === selectedItemId)
    if(!foundItem) return
    const newOrderItems: CharacterGEOrderItem[] = []
    newOrderItems.push({
      id: `oi_${foundItem.name}_${DateTime.utc().toMillis()}`,
      itemId: foundItem.id as string,
      orderId: undefined, //set later
      taxed: true,
      boughtAmount: 0,
      boughtPrice: 0,
      sellAmount: 0,
      sellPrice: 0,
      showListDetail: true,
      status: 'Pending'
    })
    for(const item of props.newOrderOrderItems){
      item.showListDetail = false
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.characterGEItems, props.newOrderOrderItems, selectedItemId])

  const handleRemoveOrderItem = useCallback((orderItemId: string) => {
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id !== orderItemId){
        newOrderItems.push(item)
      }
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleToggleShowOrderItemListDetail = useCallback((orderItemId: string, value: boolean) =>{
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.showListDetail = value
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleSetOrderItemBoughtPrice = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.boughtPrice = valueNumber
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleSetOrderItemBoughtAmount = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.boughtAmount = valueNumber
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleSetOrderItemSellPrice = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.sellPrice = valueNumber
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleSetOrderItemSellAmount = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.sellAmount = valueNumber
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const handleSetOrderItemIsTaxed = useCallback((orderItemId: string, value: boolean) =>{
    const newOrderItems = []
    for(const item of props.newOrderOrderItems){
      if(item.id === orderItemId){
        item.taxed = value
      }
      newOrderItems.push(item)
    }
    props.setNewOrderOrderItems(newOrderItems)
  }, [props.newOrderOrderItems])

  const availableItems = props.characterGEItems.filter((geItem => {
    if(selectedItemFilter === 'both'){
      return true
    }
    if(selectedItemFilter === geItem.gameVersion){
      return true
    } else {
      return false
    }
  }))

  return <Modal
    isOpen={props.showNewOrderModal}
    onClose={props.onCancel}
    backdropHides={true}
    title={`New GE Order`}
  >
    <div className='flex-wrap-gap' style={{gap: '1em'}}>
      <div>
        <div>
          Order Title
        </div>
        <div>
          <input 
            ref={inputRef}
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewOrderTitle(e.target.value)}} 
            type='text'
            placeholder='Enter title...'
            value={props.newOrderTitle ?? ''}
          />
        </div>
      </div>
      <div>
        <div>
          Notes <span style={{fontSize: '0.7em'}}>optional</span>
        </div>
        <div>
          <input 
            style={{width: '33vh'}}
            onChange={(e) => {props.setNewOrderNotes(e.target.value)}} 
            type='text'
            placeholder='Enter notes...'
            value={props.newOrderNotes ?? ''}
          />
        </div>
      </div>
      <div>
        <div>
          {availableItems.length} Available Items
        </div>
        <div>
          <select
            className="rs-select"
            style={{width: '33vh'}}
            onChange={(e) => {
              setSelectedItemId(e.currentTarget.value)
            }}
          >
            <option>Select Item</option>
            {availableItems.map((geItem) => {
              return <option value={geItem.id}>
                {geItem.name} - {getShortGameNameByVersion(geItem.gameVersion as CharacterGEItemGameVersion)}
              </option>
            })}
          </select>
          <button 
            className='button-link action' 
            onClick={handleAddOrderItem}
          >
            Add
          </button>
          |
          <button 
            className={`button-link action ${selectedItemFilter === 'both' ? 'selected' : ''}`} 
            onClick={() => {setSelectedItemFilter('both')}}
          >
            ALL
          </button>
          <button 
            className={`button-link action ${selectedItemFilter === 'osrs' ? 'selected' : ''}`}  
            onClick={() => {setSelectedItemFilter('osrs')}}
          >
            OSRS
          </button>
          <button 
            className={`button-link action ${selectedItemFilter === 'rs' ? 'selected' : ''}`} 
            onClick={() => {setSelectedItemFilter('rs')}}
          >
            RS3
          </button>
        </div>
      </div>
      
    </div>
    <div >
      {props.newOrderOrderItems?.length === 0 && <div style={{textAlign: 'center'}}>
        
      </div>}
      {props.newOrderOrderItems?.map((orderItem) => {
        const filteredOut = false
        const relatedItem = props.characterGEItems.find(i => i.id === orderItem.itemId)
        return <div className={`list-item-slow-hide ${filteredOut ? 'hide' : ''}`}>
          <CharacterGEOrderOrderItem
            orderItem={orderItem}
            handleDeleteOrderItemById={() => {}}
            showDanger={false}
            setOrderItemShowListDetail={handleToggleShowOrderItemListDetail}
            relatedGEItem={relatedItem as CharacterGEItem}
            setOrderItemBoughtAmount={handleSetOrderItemBoughtAmount}
            setOrderItemBoughtPrice={handleSetOrderItemBoughtPrice}
            setOrderItemIsTaxed={handleSetOrderItemIsTaxed}
            setOrderItemSellAmount={handleSetOrderItemSellAmount}
            setOrderItemSellPrice={handleSetOrderItemSellPrice}
          >
            <div>
              <button className='button-link destructive' onClick={() => {handleRemoveOrderItem(orderItem.id)}}>
                Remove
              </button>
            </div>
          </CharacterGEOrderOrderItem>
        </div>
      })}
    </div>
    <div>
      <button 
        className='button-link'
        onClick={props.onConfirm}

      >
        Add Order
      </button>
      <button onClick={props.onClear} className='button-link collapse'>
        Clear Order
      </button>
      <button 
        
        className='button-link destructive'
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </div>
    <div>
      <AppErrorSection error={props.newOrderModalError} />
    </div>
    <div>
      
    </div>
  </Modal>
}