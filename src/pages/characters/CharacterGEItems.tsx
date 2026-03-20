import { useCallback, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useParams } from 'react-router-dom'
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGEOrder, CharacterGEOrderItem, GEItemGameVersion } from '../../types/Characters'
import { CharacterStorageKeys, getGameNameByVersion } from './CharactersConstants'
import { fetchGEItem } from '../../services/ge/GE.service'
import { DateTime } from 'luxon'
import InfoSection from '../core/InfoSection'
import useScrollReveal from '../../hooks/useScrollReveal'
import GEHistoryModal from './modals/GEHistoryModal'
import NewGEItemModal from './modals/NewGEItemModal'
import CharacterLinks from './CharacterLinks'

export default function CharacterGEItems() {
  useScrollReveal()

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
  const [geOrders] = useLocalStorage<CharacterGEOrder[]>(
    CharacterStorageKeys.CharactersGEOrders,
    []
  )
  const [geOrderItems] = useLocalStorage<CharacterGEOrderItem[]>(
    CharacterStorageKeys.CharactersGEOrderItems,
    []
  );

  const [character] = useState<Character | undefined>(characters?.find(c => c.id === characterId))
  const [newItemName, setNewItemName] = useState('')
  const [newItemGameVersion, setNewItemGameVersion] = useState('rs')
  const [search, setSearch] = useState('')
  const [searchGame, setSearchGame] = useState('both')
  const [showDanger, setShowDanger] = useState(false)
  const [sortOrder, setSortOrder] = useState<'' | 'asc' | 'desc'>('')
  const [sortField, setSortField] = useState('')
  
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyModalItems, setHistoryModalItems] = useState<CharacterGEItemHistory[]>([])
  const [historyModalItemName, setHistoryModalItemName] = useState('')

  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [newItemModalError, setNewItemModalError] = useState('')

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

  const handleItemRefresh = useCallback(async (itemId: string) => {
    const item = geItems?.find(i => i.id === itemId)
    if(!item) return

    const geResponse = await fetchGEItem(item?.name as string, item?.gameVersion)
    console.log(geResponse, item)
    const priceSame = geResponse.price === item.price
    
    const updatedItem: CharacterGEItem = {
      ...item,
      price: geResponse.price,
      volume: geResponse.volume,
      geTimestamp: DateTime.now().toISO()
    }
    const historyItem: CharacterGEItemHistory = {
      ...updatedItem,
      id: `H_${updatedItem.id}_${characterId}__${DateTime.now().toMillis()}`,
      itemId: item.id as string
    }
    
    const newItems = []
    for(const item of geItems){
      if(item.id === itemId){
        newItems.push(updatedItem)
      } else {
        newItems.push(item)
      }
    }
    
    if(!priceSame){
      const newHistoryItems = []
      newHistoryItems.push(historyItem)
      for(const history of geItemHistory){
        newHistoryItems.push(history)
      }
      setGEItemHistory(newHistoryItems)
    }

    setGEItems(newItems)
  }, [geItems, geItemHistory])

  const handleDeleteItemById = useCallback((itemId: string) => {
    if(!itemId) return
    if(!confirm('Are you sure you want to entirely remove the item (along with all of its history)?')) return

    const relatedItem = geItems.find(i => i.id === itemId && i.characterId === characterId)
    const relatedHistoryItems = geItemHistory.filter(h => h.itemId === itemId && relatedItem?.characterId === characterId)
    const historyIds = relatedHistoryItems.map(h => h.id)

    if(relatedHistoryItems?.length > 0){
      const newHistory = []
      for(const historyItem of geItemHistory){
        if(!historyIds.includes(historyItem.id)){
          newHistory.push(historyItem)
        }
      }
      setGEItemHistory(newHistory)
    }
    const newItems = []
    for(const item of geItems){
      if(item.id !== relatedItem?.id){
        newItems.push(item)
      }
    }
    setGEItems(newItems)
  }, [geItems, geItemHistory])

  
  const handleClearItemHistoryByItemId = useCallback((itemId: string) => {
    if(!itemId) return
    if(!confirm('Are you sure you want to reset the history for this item?')) return
    
    const relatedItem = geItems.find(i => i.id === itemId && i.characterId === characterId)
    const relatedHistoryItems = geItemHistory.filter(h => h.itemId === itemId && relatedItem?.characterId === characterId)
    const historyIds = relatedHistoryItems.map(h => h.id)

    if(relatedHistoryItems?.length > 0){
      const newHistory = []
      for(const historyItem of geItemHistory){
        if(!historyIds.includes(historyItem.id)){
          newHistory.push(historyItem)
        }
      }
      setGEItemHistory(newHistory)
    }
  }, [geItems, geItemHistory])

  return <div className='characters-app'>
    <div id='top'></div>
    <GEHistoryModal 
      showHistoryModal={showHistoryModal}
      historyModalItemName={historyModalItemName}
      historyModalItems={historyModalItems}
      onClose={() => {
        setShowHistoryModal(false);
        setHistoryModalItems([])
      }}
      onConfirm={() => {}}
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
        Grand Exchange Items
      </div>
      <div className='app-title smaller' style={{fontSize: 'x-large'}}>
        {character?.name}
      </div>
      <CharacterLinks page='items' characterId={characterId as string} />
    </div>
    
    <div className='flex-wrap-gap' style={{gap: '10px', padding: '1em'}}>
      
      <div>
        <div>
          Search Items
        </div>
        <div style={{width: '33vh', paddingBottom: '5px'}}>
          <input 
            onChange={(e) => {setSearch(e.target.value)}} 
            type='text'
            placeholder='Search item name...'
            value={search ?? ''}
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
          Filter Version
        </div>
        <button 
          onClick={() => {setSearchGame('both')}} 
          className={searchGame === 'both' ? 'primary selected' : 'primary'}
        >
          Both
        </button>
        <button 
          onClick={() => {setSearchGame('rs')}} 
          className={searchGame === 'rs' ? 'primary selected' : 'primary'}
        >
          RuneScape 3
        </button>
        <button 
          onClick={() => {setSearchGame('osrs')}} 
          className={searchGame === 'osrs' ? 'primary selected' : 'primary'}
        >
          OSRS
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
          <button 
            onClick={() => {setSortField(sortField === 'price' ? '' : 'price')}} 
            className={sortField === 'price' ? 'primary selected' : 'primary'}
          >
            Price
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
      {geItems?.filter(i => i.characterId === characterId).length === 0 && <div 
        style={{textAlign: 'center'}}
      >There seems to be nothing here. Click "New Item".
      </div>}
      {geItems?.filter(i => i.characterId === characterId).sort((a, b) => {
          if (sortOrder === "asc") {
            if (sortField === "name") {
              return (a.name ?? "").localeCompare(b.name ?? "");
            }

            if (sortField === "price") {
              return (a.price ?? 0) - (b.price ?? 0);
            }
          }

          if (sortOrder === "desc") {
            if (sortField === "name") {
              return (b.name ?? "").localeCompare(a.name ?? "");
            }

            if (sortField === "price") {
              return (b.price ?? 0) - (a.price ?? 0);
            }
          }

          return 0;
      }).map((item, index) => {
        const historyItems = geItemHistory.filter(ih => ih.characterId === characterId && ih.itemId === item.id)
        const relatedOrders = geOrders.filter(o => o.characterId === characterId)
        const orderIds = relatedOrders.map(o => o.id)
        const relatedOrderItems = geOrderItems.filter(oi => orderIds.includes(oi.orderId as string))

        let filteredOut = false
        if(search && search.length > 0){
          if(!item?.name?.toLowerCase().includes(search?.toLowerCase())){
            filteredOut = true
          }
        }
        if(searchGame !== 'both'){
          if(searchGame === 'osrs' && item.gameVersion !== 'osrs'){
            filteredOut = true
          } else if(searchGame === 'rs' && item.gameVersion !== 'rs'){
            filteredOut = true
          }
        }
        return <div className={`${filteredOut ? 'reveal' : ''} list-item-slow-hide ${filteredOut ? 'hide' : ''}  `} key={`${item.id}__${index}`}>
          <div className='list-item-title flex-wrap-gap' style={{gap: '15px'}}>
            <div>
              {item.name}
            </div>
            <div>
              <button onClick={() => {handleItemRefresh(item.id as string)}} className='button-link' >
                Refresh
              </button>
            </div>
            <div>
              <button onClick={() => {
                  setHistoryModalItems(historyItems);
                  setShowHistoryModal(true)
                  setHistoryModalItemName(item.name as string)
                }} className='button-link' >
                History
              </button>
            </div>
          </div>

          <div className='list-item-body'>
            <div style={{textAlign: 'center'}}>
                {getGameNameByVersion(item.gameVersion as GEItemGameVersion)}
            </div>

            <div className='flex-wrap-gap'>
              <InfoSection sectionTitle='GE' 
                // button={{
                //   className: 'primary',
                //   onClick: () => {handleItemRefresh(item.id as string)},
                //   text: 'Refresh'
                // }}
                items={[
                {
                  title: 'Price',
                  value: `${item.price ? item.price.toLocaleString() : 0} GP`,
                },
                {
                  title: 'Volume',
                  value: `${item.price ? item.price.toLocaleString() : 0}`,
                },
                {
                  title: 'Last Refresh',
                  value: `${DateTime.fromISO(item.geTimestamp as string).toLocal().toFormat('dd-MM-yy t')}`
                }
              ]} />
              <InfoSection sectionTitle='History' 
                items={[
                {
                  title: 'Total',
                  value: `${historyItems?.length?.toLocaleString() ?? 0}`
                },
              ]} />
              <InfoSection sectionTitle='Orders' 
                items={[
                {
                  title: 'In Orders',
                  value: `${orderIds?.length?.toLocaleString() ?? 0}`
                },
                {
                  title: 'Order Lines',
                  value: `${relatedOrderItems.length?.toLocaleString() ?? 0}`
                }
              ]} />
            </div>
            {showDanger && <div className='danger-zone'>
              <button onClick={() => {handleDeleteItemById(item.id as string)}} className='danger'>
                <strong>DELETE</strong> {item.name}
              </button>
              <button onClick={() => {handleClearItemHistoryByItemId(item.id as string)}} className='danger'>
                <strong>RESET</strong> History
              </button>
            </div>}
          </div>

        </div>
      })}
    </div>
  </div>
}