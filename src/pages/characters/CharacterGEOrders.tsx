import { useCallback, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useNavigate, useParams } from 'react-router-dom'
import { CharacterStorageKeys } from './CharactersConstants'
import { fetchGEItem } from '../../services/ge/GE.service'
import { DateTime } from 'luxon'
// import InfoSection from '../core/InfoSection'
import useScrollReveal from '../../hooks/useScrollReveal'
import NewGEItemModal from './modals/NewGEItemModal'
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGEOrder, CharacterGEOrderItem, GEItemGameVersion } from '../../types/Characters'
import CharacterLinks from './CharacterLinks'
import NewGEOrderModal from './modals/NewGEOrderModal'
import CharacterGEOrderOrderItem from './CharacterGEOrderOrderItem'
import InfoSection from '../core/InfoSection'

export default function CharacterGEOrderPlanner() {
  useScrollReveal()
  const navigate = useNavigate()

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

  const [filterStatus, setFiltertatus] = useState('both')
  const [showDanger, setShowDanger] = useState(false)
  const [sortOrder, setSortOrder] = useState<'' | 'asc' | 'desc'>('')
  const [sortField, setSortField] = useState('')
  
  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [newItemModalError, setNewItemModalError] = useState('')

  const handleAddOrderClicked = useCallback(() => {
    if(!newOrderOrderItems || newOrderOrderItems.length === 0){
      setNewOrderModalError('At least 1 order item is required.')
      return
    }
    if(!newOrderTitle || !newOrderTitle?.trim()){
      setNewOrderModalError('Order title is required.')
      return
    }

    const title = newOrderTitle.trim()
    const orderId = `o__${title}__${characterId}__${DateTime.utc().toMillis()}`
    const newOrder: CharacterGEOrder = {
      id: orderId,
      characterId: characterId as string,
      title,
      createdDate: DateTime.utc().toISO(),
      status: 'Pending',
      notes: newOrderNotes ? newOrderNotes.trim() : undefined,
      showListDetail: true
    }

    const newOrderItems = []
    for(const item of newOrderOrderItems){
      item.orderId = orderId
      item.showListDetail = false
      newOrderItems.push(item)
    }
    
    const newOrders = []
    newOrders.push(newOrder)
    for(const order of geOrders){
      order.showListDetail = false
      newOrders.push(order)
    }

    for(const orderItem of geOrderItems){
      orderItem.showListDetail = false
      newOrderItems.push(orderItem)
    }
    
    setGEOrders(newOrders)
    setGEOrderItems(newOrderItems)

    setNewItemName('')

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
  ])

  const handleAddItemClicked = useCallback(async () => {
    if(!newItemName || !newItemName?.trim()) {
      setNewItemModalError('Item name cannot be empty.')
      setNewItemName('')
      return
    }

    const trimmed = newItemName.trim()
    const itemName = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
    const exists = geItems?.find(i => i.characterId === characterId && i.name?.toLowerCase() === itemName.toLowerCase())
    if(exists){
      setNewItemModalError('An item already exists with that name.')
      return
    }
    try {
      const newItems = []
      const newItem: CharacterGEItem = {
        id: itemName,
        name: itemName,
        characterId: characterId as string,
        geTimestamp: DateTime.utc().toISO(),
        gameVersion: newItemGameVersion as GEItemGameVersion
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
        volume: newItem.volume
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

  const handleClearNewOrder = () => {
    setNewOrderModalError('')
    setNewOrderNotes('')
    setNewOrderOrderItems([])
    setNewOrderTitle('')
  }

  const handleDeleteOrderById = useCallback((orderId: string) => {
    if(!confirm('Are you sure you want to delete this order and its order items?')) return

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

  const handleDeleteOrderItemById = useCallback((orderItemId: string, orderId: string) => {
    let orderOrderItemCount = 0
    for(const orderItem of geOrderItems){
      if(orderItem.orderId === orderId){
        orderOrderItemCount += 1
      }
    }
    let deleteOrderToo = false
    if(orderOrderItemCount === 1){
      if(!confirm('Are you sure you want to delete this order item?')) return
      if(confirm('There will be no more order items for this order. Delete the order too?')){
        deleteOrderToo = true
      }
    } else {
      if(!confirm('Are you sure you want to delete this order item?')) return
    }

    const newOrderItems = []
    for(const orderItem of geOrderItems){
      if(orderItem.id !== orderItemId){
        newOrderItems.push(orderItem)
      }
    }
    setGEOrderItems(newOrderItems)

    if(deleteOrderToo === true){
      const newOrders = []
      for(const order of geOrders){
        if(order.id !== orderId){
          newOrders.push(order)
        }
      }
      setGEOrders(newOrders)
    }
  }, [geOrderItems, geOrders])

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
      onClear={() => {
        handleClearNewOrder()
      }}
      onCancel={() => {
        handleClearNewOrder()
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
      <div>
        <div>
          Actions
        </div>
        <div className='flex-wrap-gap' style={{gap: '8px'}}>
           <button className='primary' onClick={() => {setShowNewOrderModal(true)}}>
            New Order
          </button>
          <button className='primary' onClick={() => {setShowNewItemModal(true)}}>
            New Item
          </button>
          <button className='danger' onClick={() => {setShowDanger(!showDanger)}}>
            {showDanger ? 'Hide' : 'Show'} Danger Zones
          </button>
        </div>
      </div>

      <div>
        
        <div>
          Filter Status
        </div>
        <button 
          onClick={() => {setFiltertatus('both')}} 
          className={filterStatus === 'both' ? 'primary selected' : 'primary'}
        >
          Both
        </button>
        <button 
          onClick={() => {setFiltertatus('pending')}} 
          className={filterStatus === 'pending' ? 'primary selected' : 'primary'}
        >
          Pending
        </button>
        <button 
          onClick={() => {setFiltertatus('complete')}} 
          className={filterStatus === 'complete' ? 'primary selected' : 'primary'}
        >
          Complete
        </button>
      </div>
      <div>
        <div>
          Sort by
        </div>
        <div>
          <button 
            onClick={() => {setSortField(sortField === 'name' ? '' : 'name')}} 
            className={sortField === 'name' ? 'primary selected' : 'primary'}
          >
            Name
          </button>
           - 
          <button 
            onClick={() => {setSortOrder(sortOrder === 'asc' ? '' : 'asc')}} 
            className={sortOrder === 'asc' ? 'primary selected' : 'primary'}
          >
            ASC
          </button>
          <button 
            onClick={() => {setSortOrder(sortOrder === 'desc' ? '' : 'desc')}} 
            className={sortOrder === 'desc' ? 'primary selected' : 'primary'}
          >
            DESC
          </button>
        </div>
      </div>
    </div>

    <div style={{padding: '1em'}}>
      {geOrders?.filter(o => o.characterId === characterId).length === 0 && <div 
        style={{textAlign: 'center'}}
      >There seems to be nothing here. Click "New Order". 
      </div>}
      {geOrders?.filter(o => o.characterId === characterId).sort((a, b) => {
        if (sortOrder === "asc") {
          if (sortField === "name") {
            return (a.title ?? "").localeCompare(b.title ?? "");
          }
        }

        if (sortOrder === "desc") {
          if (sortField === "title") {
            return (b.title ?? "").localeCompare(a.title ?? "");
          }
        }

        return 0;
      }).map((order, index) => {
        const relatedOrderItems = geOrderItems.filter(oi => oi.orderId === order.id)
        const relatedOrderItemItemIds = relatedOrderItems.map(roi => roi.itemId)
        const relatedGEItems = geItems.filter(i => i.characterId === characterId && relatedOrderItemItemIds.includes(i.id as string))
        
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
          const relatedOrderItems = geOrderItems.filter(oi => oi.orderId === order.id)
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
        
        if(filterStatus !== 'both'){
          if(filterStatus === 'pending' && order.status !== 'Pending'){
            filteredOut = true
          } else if(filterStatus === 'complete' && order.status !== 'Complete'){
            filteredOut = true
          }
        }
        const createdDate = DateTime.fromISO(order.createdDate).toLocal().toFormat('dd-MM-yy t')
        let completedDate 
        if(order.completedDate){
          completedDate = DateTime.fromISO(order.completedDate).toLocal().toFormat('dd-MM-yy t')
        }

        let totalBought = 0
        let totalSell = 0
        let totalGains = 0
        let totalTax = 0

        relatedOrderItems.forEach((oi) => {
          let sellPrice = oi.sellPrice * oi.sellAmount
          if(oi.taxed === true){
            const taxAmount = sellPrice * .02
            sellPrice = oi.sellPrice - taxAmount
            totalTax += taxAmount
          }
          totalBought += oi.boughtPrice * oi.boughtAmount
          totalSell += sellPrice
          totalGains += sellPrice - oi.boughtPrice
        })

        return <div className={`${filteredOut ? 'reveal' : ''} list-item-slow-hide ${filteredOut ? 'hide' : ''}  `} key={`${order.id}__${index}`}>
          <div className='list-item-title flex-wrap-gap' style={{gap: '15px'}}>
            <div>
              <button onClick={() => {handleToggleShowOrderListDetail(order.id, !order.showListDetail)}} className='button-link'>
                {order.showListDetail === true ? '-' : '+'} {order.title}
              </button>
            </div>
            <div className='list-item-title-sub flex-wrap-gap' style={{gap: '8px'}}>
              <div className='list-item-title-status'>
                {order.status}
              </div>
              <div>
                {createdDate}
              </div>
              <div>
                <button  onClick={() => {navigate(`characters/${characterId}/ge-orders/${order.id}`)}} className='button-link'>
                  View
                </button>
              </div>
            </div>
          </div>
          {order.showListDetail === true && <div className='list-item-body'>
            <div className='flex-wrap-gap'>
              <InfoSection 
                sectionTitle='Details'
                items={[
                  {
                    title: 'Status',
                    value: order.status
                  },
                  {
                    title: 'Created',
                    value: createdDate
                  },
                  {
                    title: 'Completed',
                    value: completedDate ?? 'N/A'
                  }
                ]}
              />
              <InfoSection 
                sectionTitle='Totals'
                items={[
                  {
                    title: 'Bought',
                    value: `${totalBought.toLocaleString()} GP`
                  },
                  {
                    title: 'Sell',
                    value: `${totalSell.toLocaleString()} GP ( ${totalTax.toLocaleString()} GP Tax )`
                  },
                  {
                    title: 'Gains',
                    value: `${totalGains.toLocaleString()} GP`
                  }
                ]}
              />
            </div>
            <div>
              <div>
                Notes
              </div>
              <input
                type='text'
                style={{width: '100%'}}
                value={order.notes ?? ''}
                placeholder='Enter notes...'
                
              />
            </div>
            <div>
              {showDanger && <div className='danger-zone'>
                  <button onClick={() => {handleDeleteOrderById(order.id as string)}} className='danger'>
                    <strong>DELETE ORDER</strong>
                  </button>
                </div>}
            </div>
            <hr/>
            {order.showListDetail && <div className='list-item-body'>
              {relatedOrderItems.map(orderItem => {
                const relatedItem = relatedGEItems.find(i => i.id === orderItem.itemId) as CharacterGEItem
                return <div style={{fontSize: '16px', marginLeft: '1em', marginRight: '1em'}}>
                  <CharacterGEOrderOrderItem 
                    orderItem={orderItem}
                    relatedGEItem={relatedItem as CharacterGEItem}
                    setOrderItemBoughtAmount={handleSetOrderItemBoughtAmount}
                    setOrderItemBoughtPrice={handleSetOrderItemBoughtPrice}
                    setOrderItemIsTaxed={handleSetOrderItemIsTaxed}
                    setOrderItemSellAmount={handleSetOrderItemSellAmount}
                    setOrderItemSellPrice={handleSetOrderItemSellPrice}
                    setOrderItemShowListDetail={handleToggleShowOrderItemListDetail}
                  >
                    {showDanger && <div className='danger-zone'>
                      <button onClick={() => {handleDeleteOrderItemById(orderItem.id as string, order.id as string)}} className='danger'>
                        <strong>DELETE ORDER ITEM</strong>
                      </button>
                    </div>}
                  </CharacterGEOrderOrderItem>
                </div>
              })}
            </div>}
          </div>}
        </div>
      })}
    </div>
  </div>
}