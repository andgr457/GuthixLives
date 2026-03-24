import { useCallback, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useParams } from 'react-router-dom'
import { CharacterStorageKeys } from './CharactersConstants'
import { fetchGEItem } from '../../services/ge/GE.service'
import { DateTime } from 'luxon'
import useScrollReveal from '../../hooks/useScrollReveal'
import NewGEItemModal from './modals/NewGEItemModal'
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGEOrder, CharacterGEOrderItem, CharacterGEOrderStatus, CharacterGEItemGameVersion, QuickOrderItem } from '../../types/Characters'
import CharacterLinks from './CharacterLinks'
import NewGEOrderModal from './modals/NewGEOrderModal'
import '../../styles/Parchment.css'
import { useConfirm } from '../../context/ConfirmProvider'
import CharacterGEOrderView from './CharacterGEOrderView'
import { timeout } from '../../services/common/Timing.service'

export default function CharacterGEOrderPlanner() {
  useScrollReveal()
  const showConfirm = useConfirm()

  const {characterId} = useParams<{ characterId: string }>();

  const [characters] = useLocalStorage<Character[]>(
    CharacterStorageKeys.Characters,
    []
  );
  const [geItems, setGEItems] = useLocalStorage<CharacterGEItem[]>(
    CharacterStorageKeys.CharactersGEItems,
    []
  )
  const [geItemHistory, setGEItemHistory] = useLocalStorage<CharacterGEItemHistory[]>(
    CharacterStorageKeys.CharactersGEItemsHistory,
    []
  );
  const [geOrders, setGEOrders] = useLocalStorage<CharacterGEOrder[]>(
    CharacterStorageKeys.CharactersGEOrders,
    []
  )
  const [geOrderItems, setGEOrderItems] = useLocalStorage<CharacterGEOrderItem[]>(
    CharacterStorageKeys.CharactersGEOrderItems,
    []
  );

  const [character] = useState<Character | undefined>(characters?.find(c => c.id === characterId))
  
  const [newItemName, setNewItemName] = useState('')
  const [newItemGameVersion, setNewItemGameVersion] = useState('rs')

  const [newOrderTitle, setNewOrderTitle] = useState('')
  const [newOrderNotes, setNewOrderNotes] = useState('')
  const [newOrderOrderItems, setNewOrderOrderItems] = useState<CharacterGEOrderItem[]>([])

  const [newOrderModalError, setNewOrderModalError] = useState('')
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)

  const [searchOrders, setSearchOrders] = useState('')
  const [searchOrderItems, setSearchOrderItems] = useState('')

  const [showDanger, setShowDanger] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  
  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [newItemModalError, setNewItemModalError] = useState('')

  const [selectedQuickOrderItem, setSelectedQuickOrderItem] = useState<QuickOrderItem>({} as any)

  const handleAddOrderQuickOrderItem = useCallback(async () => {
    if(!selectedQuickOrderItem?.itemId){
      return
    }

    const foundItem = geItems
    .find(i => 
      i.characterId === characterId 
      && i.id === selectedQuickOrderItem.itemId
    )

    if(!foundItem){
      return
    }
    
    const newOrderItems: CharacterGEOrderItem[] = []
    for(const orderItem of geOrderItems){
      newOrderItems.push(orderItem)
    }
    
    newOrderItems.push({
      id: `oi_${foundItem.name}_${DateTime.utc().toMillis()}`,
      itemId: foundItem.id as string,
      orderId: selectedQuickOrderItem.orderId, //set later
      taxed: true,
      boughtAmount: 0,
      boughtPrice: 0,
      sellAmount: 0,
      sellPrice: 0,
      showListDetail: true,
      status: 'Pending'
    })
    setGEOrderItems(newOrderItems)
  }, [geItems, geOrderItems, selectedQuickOrderItem])

  const handleAddOrderClicked = useCallback(async () => {
    if(newOrderModalError){
      setNewOrderModalError('')
      await timeout(1000)
    }
    const title = newOrderTitle?.trim()
    if(!title){
      setNewOrderModalError('Order title is required.')
      return
    }
    if(!newOrderOrderItems || newOrderOrderItems.length === 0){
      if(!await showConfirm('Add the order without any order items? These can be added later.')){
        return
      }
    }

    const orderId = `o__${title}__${characterId}__${DateTime.utc().toMillis()}`
    const newOrder: CharacterGEOrder = {
      id: orderId,
      characterId: characterId as string,
      title,
      createdDate: DateTime.utc().toISO(),
      status: 'Pending',
      notes: newOrderNotes ? newOrderNotes.trim() : undefined,
      showListDetail: true,
      showListOrderItems: false,
      editNotes: false,
      showNotes: !newOrderNotes ? false : true
    }

    if(newOrderOrderItems && newOrderOrderItems.length > 0){
      const newOrderItems = []
      for(const item of newOrderOrderItems){
        item.orderId = orderId
        item.showListDetail = false
        newOrderItems.push(item)
      }
      for(const orderItem of geOrderItems){
        orderItem.showListDetail = false
        newOrderItems.push(orderItem)
      }
      setGEOrderItems(newOrderItems)
    }

    const newOrders = []
    newOrders.push(newOrder)
    for(const order of geOrders){
      order.showListDetail = false
      newOrders.push(order)
    }    
    setGEOrders(newOrders)

    setNewOrderTitle('')
    setNewOrderModalError('')
    setNewOrderNotes('')
    setNewOrderOrderItems([])
    setShowNewOrderModal(false)
  }, [
    newOrderTitle,
    newOrderNotes,
    newItemName,
    geOrders,
    geOrderItems,
    newOrderTitle,
    newOrderNotes,
    newOrderOrderItems,
    newOrderModalError
  ])

  const handleAddItemClicked = useCallback(async () => {
    if(!newItemName || !newItemName?.trim()) {
      setNewItemModalError('Item name cannot be empty.')
      setNewItemName('')
      return
    }

    const trimmed = newItemName.trim()
    const itemName = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
    const exists = geItems?.find(
      i => i.characterId === characterId 
      && i.name?.toLowerCase() === itemName.toLowerCase()
      && i.gameVersion === newItemGameVersion
    )
    if(exists){
      setNewItemModalError('An item already exists with that name and version combination.')
      return
    }
    try {
      const newItems = []
      const newItem: CharacterGEItem = {
        id: itemName,
        name: itemName,
        characterId: characterId as string,
        geTimestamp: DateTime.utc().toISO(),
        gameVersion: newItemGameVersion as CharacterGEItemGameVersion,
        showItemDetail: false
      }
  
      const geResponse = await fetchGEItem(newItem?.name as string, newItem.gameVersion)
      if(!geResponse?.price){
        setNewItemModalError('Failed to find an item with this name.')
        return
      }
      newItem.price = geResponse.price
      newItem.volume = geResponse.volume
      newItems.push(newItem)
  
      const newHistoryItems = []
      const historyItem: CharacterGEItemHistory = {
        id: `H_${newItem.id}__${characterId}__${DateTime.now().toMillis()}`,
        itemId: newItem.id as string,
        geTimestamp: newItem.geTimestamp,
        characterId: newItem.characterId,
        gameVersion: newItem.gameVersion,
        price: newItem.price,
        volume: newItem.volume,
        showItemDetail: newItem.showItemDetail
      }
      newHistoryItems.push(historyItem)

      for(const item of geItems){
        newItems.push(item)
      }
      for(const historyItem of geItemHistory){
        newHistoryItems.push(historyItem)
      }

      setGEItems(newItems)
      setGEItemHistory(newHistoryItems)
      setNewItemName('')
      setShowNewItemModal(false)
      setNewItemModalError('')
    }catch(error){
      setNewItemModalError(`${JSON.stringify(error)}`)
    }
  }, [newItemName, newItemGameVersion, geItems])

  const handleClearNewOrder = useCallback(() => {
    setNewOrderModalError('')
    setNewOrderNotes('')
    setNewOrderOrderItems([])
    setNewOrderTitle('')
  }, [])

  const handleDeleteOrderById = useCallback(async (orderId: string) => {
    if(!await showConfirm(
      'Are you sure you want to delete this order and its order items?',
      'Delete Order & Order Items!'
    )){
      return
    }
    
    const newOrders = []
    for(const order of geOrders){
      if(order.id !== orderId){
        newOrders.push(order)
      }
    }  
    const newOrderItems = []
    for(const orderItem of geOrderItems){
      if(orderItem.orderId !== orderId){
        newOrderItems.push(orderItem)
      }
    }
    setGEOrders(newOrders)
    setGEOrderItems(newOrderItems)
  }, [geOrders, geOrderItems])

  const handleDeleteOrderItemById = useCallback(async (orderItemId: string, orderId: string) => {
    const ok = await showConfirm(
      'Are you sure you want to delete this order item?',
      'Delete Order Item!'
    )
    if(!ok) return

    let orderOrderItemCount = 0
    for(const orderItem of geOrderItems){
      if(orderItem.orderId === orderId){
        orderOrderItemCount += 1
      }
    }

    const newOrderItems = []
    for(const orderItem of geOrderItems){
      if(orderItem.id !== orderItemId){
        newOrderItems.push(orderItem)
      }
    }
    setGEOrderItems(newOrderItems)

    if(orderOrderItemCount === 1){
      if(!await showConfirm(
        'There are no more order items for this order. Delete the order too?',
        'Delete Order & Order Items!'
      )) {
        return
      }
    }
    const newOrders = []
    for(const order of geOrders){
      if(order.id !== orderId){
        newOrders.push(order)
      }
    }
    setGEOrders(newOrders)
  }, [geOrderItems, geOrders])

  const handleSetOrderNotes = useCallback((orderId: string, value: string) => {
    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.notes = value
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  const handleToggleOrderEditNotes = useCallback((orderId: string, value: boolean) => {
    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.editNotes = value
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  const handleToggleShowOrderNotes = useCallback((orderId: string, value: boolean) => {
    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.showNotes = value
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  const handleToggleShowOrderListOrderItems = useCallback((orderId: string, value: boolean) => {
    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.showListOrderItems = value
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  const handleToggleShowOrderListDetail = useCallback((orderId: string, value: boolean) => {
    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.showListDetail = value
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  const handleToggleShowOrderItemListDetail = useCallback((orderItemId: string, value: boolean) =>{
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.showListDetail = value
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderItemBoughtPrice = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.boughtPrice = valueNumber
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderItemBoughtAmount = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.boughtAmount = valueNumber
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderItemSellPrice = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.sellPrice = valueNumber
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderItemSellAmount = useCallback((orderItemId: string, value: string) =>{
    const valueNumber = +value
    if(Number.isNaN(valueNumber)){
      return
    }
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.sellAmount = valueNumber
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderItemIsTaxed = useCallback((orderItemId: string, value: boolean) =>{
    const newOrderItems = []
    for(const item of geOrderItems){
      if(item.id === orderItemId){
        item.taxed = value
      }
      newOrderItems.push(item)
    }
    setGEOrderItems(newOrderItems)
  }, [geOrderItems])

  const handleSetOrderStatus = useCallback(async (orderId: string, status: CharacterGEOrderStatus) => {
    if(status === 'Complete'){
      if(!await showConfirm('Are you sure you want to complete this order?')){
        return
      }
    }

    const newOrders = []
    for(const order of geOrders){
      if(order.id === orderId){
        order.status = status
        if(status === 'Complete'){
          order.completedDate = DateTime.utc().toISO()
        }
      }
      newOrders.push(order)
    }
    setGEOrders(newOrders)
  }, [geOrders])

  return <div className='characters-app'>
    <div id='top'></div>
    <NewGEOrderModal 
      characterGEItems={geItems.filter(i => i.characterId === characterId)}
      newOrderModalError={newOrderModalError}
      newOrderNotes={newOrderNotes}
      newOrderOrderItems={newOrderOrderItems}
      newOrderTitle={newOrderTitle}
      setNewOrderNotes={setNewOrderNotes}
      setNewOrderOrderItems={setNewOrderOrderItems}
      setNewOrderTitle={setNewOrderTitle}
      showNewOrderModal={showNewOrderModal}
      onClear={ () => {
        handleClearNewOrder()
      }}
      onCancel={() => {
        setShowNewOrderModal(false)
      }}
      onConfirm={() => {
        handleAddOrderClicked()
      }}
    />
    <NewGEItemModal 
      error={newItemModalError}
      newItemGameVersion={newItemGameVersion}
      newItemName={newItemName}
      onCancel={() => {
        setNewItemName('')
        setShowNewItemModal(false)
      }}
      onConfirm={() => {
        handleAddItemClicked()
      }}
      setNewItemGameVersion={setNewItemGameVersion}
      setNewItemName={setNewItemName}
      showNewGEItemModal={showNewItemModal}
    />  

    <div className='list-item-header'>
      <div className='app-title'>
        Grand Exchange Orders
      </div>
      <div className='app-title smaller' style={{fontSize: 'x-large'}}>
        {character?.name}
      </div>
      <CharacterLinks page='orders' characterId={characterId as string} />
    
    </div>
    
    <div className='flex-wrap-gap' style={{gap: '10px'}}>
      <div>
        <div>
          Actions
        </div>
        <div className='flex-wrap-gap' style={{gap: '8px'}}>
           <button className='button-link action do' onClick={() => {setShowNewOrderModal(true)}}>
            New Order
          </button>
          <button className='button-link action do' onClick={() => {setShowNewItemModal(true)}}>
            New Item
          </button>
          <button className='button-link action' onClick={() => {setShowComplete(!showComplete)}}>
            {showComplete === true ? 'Hide' : 'Show'} Complete
          </button>
          <button className='button-link action danger' onClick={() => {setShowDanger(!showDanger)}}>
            {showDanger ? 'Hide' : 'Show'} Danger Zones
          </button>
        </div>
      </div>
      <div>
        <div>
          Search Orders
        </div>
        <div style={{width: '33vh', paddingBottom: '5px'}}>
          <input 
            onChange={(e) => {
              setSearchOrderItems('')
              setSearchOrders(e.target.value)
            }} 
            type='text'
            placeholder='Search orders...'
            value={searchOrders ?? ''}
            maxLength={16}
            style={{width: '33vh'}}
          />
        </div>
      </div>
      <div>
        <div>
          Search Order Items
        </div>
        <div style={{width: '33vh', paddingBottom: '5px'}}>
          <input 
            onChange={(e) => {
              setSearchOrders('')
              setSearchOrderItems(e.target.value)
            }} 
            type='text'
            placeholder='Search order items...'
            value={searchOrderItems ?? ''}
            maxLength={16}
            style={{width: '33vh'}}
          />
        </div>
      </div>
      
    </div>

    <div style={{padding: '1em'}}>
      {geOrders?.filter(o => o.characterId === characterId).length === 0 && <div 
        style={{textAlign: 'center'}}
      >There seems to be nothing here. Click "New Order". 
      </div>}
      {geOrders?.filter(o => o.characterId === characterId).map((order, index) => {
        const relatedOrderItems = geOrderItems.filter(oi => oi.orderId === order.id)
        const relatedGEItems = geItems.filter(i => i.characterId === characterId)
        
        let filteredOut = false
        let found = false
        if(searchOrders){
          for(const property of Object.getOwnPropertyNames(order)){
            //@ts-ignore
            if(`${order[property]}`.toLowerCase().includes(searchOrders)){
              found = true
              break
            }
          }
        }
        if(searchOrderItems){
          for(const oi of relatedOrderItems){
            const relatedGEItem = relatedGEItems.find(i => i.id === oi.itemId)
            if(relatedGEItem?.name?.toLowerCase().includes(searchOrderItems.toLowerCase())){
              found = true
              break
            }

            for(const property of Object.getOwnPropertyNames(oi)){
              //@ts-ignore
              if(`${oi[property]}`.toLowerCase().includes(searchOrderItems.toLowerCase())){
                found = true
                break
              }
            }
          }
        }

        if(!searchOrders && !searchOrderItems){
          filteredOut = false
          found = true
        } else if (searchOrders || searchOrderItems){
          if(found === true){
            filteredOut = false
          } else {
            filteredOut = true
          }
        }

        if(order.status === 'Complete' && showComplete === false){
          filteredOut = true
        }

        const createdDate = DateTime.fromISO(order.createdDate).toLocal().toFormat('dd-MM-yy')
        let completedDate 
        if(order.completedDate){
          completedDate = DateTime.fromISO(order.completedDate).toLocal().toFormat('dd-MM-yy')
        }

        let totalBought = 0
        let totalSell = 0
        let totalGains = 0
        let totalTax = 0

        relatedOrderItems.forEach((oi) => {
          let sellPrice = oi.sellPrice * oi.sellAmount
          if(oi.taxed === true){
            const taxAmount = sellPrice * .02
            sellPrice = sellPrice - taxAmount
            totalTax += taxAmount
          }
          totalBought += oi.boughtPrice * oi.boughtAmount
          totalSell += sellPrice
          totalGains += sellPrice - (oi.boughtPrice * oi.boughtAmount)
        })

        return <CharacterGEOrderView 
          handleSetOrderStatus={handleSetOrderStatus}
          handleAddOrderQuickOrderItem={handleAddOrderQuickOrderItem}
          handleDeleteOrderById={handleDeleteOrderById}
          handleDeleteOrderItemById={handleDeleteOrderItemById}
          handleSetOrderItemBoughtPrice={handleSetOrderItemBoughtPrice}
          handleSetOrderItemBoughtAmount={handleSetOrderItemBoughtAmount}  
          handleSetOrderItemIsTaxed={handleSetOrderItemIsTaxed}
          handleSetOrderItemSellAmount={handleSetOrderItemSellAmount}
          handleSetOrderItemSellPrice={handleSetOrderItemSellPrice}
          handleSetOrderNotes={handleSetOrderNotes}
          handleToggleOrderEditNotes={handleToggleOrderEditNotes}
          handleToggleShowOrderItemListDetail={handleToggleShowOrderItemListDetail}
          handleToggleShowOrderListDetail={handleToggleShowOrderListDetail}
          handleToggleShowOrderListOrderItems={handleToggleShowOrderListOrderItems}
          handleToggleShowOrderNotes={handleToggleShowOrderNotes}
          setSelectedQuickOrderItem={setSelectedQuickOrderItem}
          totalBought={totalBought}
          totalGains={totalGains}
          totalSell={totalSell}
          totalTax={totalTax}
          index={`${index}`}
          completedDate={completedDate as string}
          createdDate={createdDate}
          filteredOut={filteredOut}
          order={order}
          relatedGEItems={relatedGEItems}
          relatedOrderItems={relatedOrderItems}
          showDanger={showDanger}

        />
      })}
    </div>
  </div>
}