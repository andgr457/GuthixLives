import { useCallback, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useNavigate, useParams } from 'react-router-dom'
import type { Character, CharacterGEItem, CharacterGEItemHistory, GEItemGameVersion } from '../../types/Characters'
import { CharacterStorageKeys, getGameNameByVersion } from './CharactersConstants'
import { useKeyPress } from '../../hooks/useKeyPress'
import AppErrorSection from '../core/AppErrorSection'
import { fetchGEItem } from '../../services/ge/GE.service'
import { DateTime } from 'luxon'
import InfoSection from '../core/InfoSection'

export default function CharacterGEItems() {
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
  const [character] = useState<Character | undefined>(characters?.find(c => c.id === characterId))
  const [newItemName, setNewItemName] = useState('')
  const [newItemGameVersion, setNewItemGameVersion] = useState('rs')
  const [search, setSearch] = useState('')
  const [searchGame, setSearchGame] = useState('both')
  const [error, setError] = useState('')

  const handleEnterPress = () => {
    handleAddItemClicked()
  };

  useKeyPress('Enter', handleEnterPress);

  const handleAddItemClicked = useCallback(async () => {
    if(!newItemName || !newItemName?.trim()) {
      setError('Item name cannot be empty.')
      setNewItemName('')
      return
    }

    const trimmed = newItemName.trim()
    const itemName = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
    const exists = geItems?.find(i => i.characterId === characterId && i.name?.toLowerCase() === itemName.toLowerCase())
    if(exists){
      setError('An item already exists with that name.')
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
    }catch(error){
      setError(`${JSON.stringify(error)}`)
    }
  }, [newItemName, geItems])

  const handleItemRefresh = useCallback(async (itemId: string) => {
    console.log(itemId)
    const item = geItems?.find(i => i.id === itemId)
    console.log(item)
    if(!item) return

    const geResponse = await fetchGEItem(item?.name as string, item?.gameVersion)
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
    const newHistoryItems = []
    for(const item of geItems){
      if(item.id === itemId){
        newItems.push(updatedItem)
      } else {
        newItems.push(item)
      }
    }
    newHistoryItems.push(historyItem)
    for(const history of geItemHistory){
      newHistoryItems.push(history)
    }

    setGEItems(newItems)
    setGEItemHistory(newHistoryItems)
  }, [])

  return <div className='characters-app'>
    <div id='top'></div>
    <div className='list-item-header'>
      <div className='app-title'>
        Grand Exchange Item Tracker
      </div>
      <div className='app-title smaller' style={{fontSize: 'x-large'}}>
        {character?.name}
      </div>

    </div>
    <div style={{textAlign: 'center'}}>
      Characters&nbsp;
      <button className='button-link' onClick={() => {navigate('/characters')}}>
         Teleport
      </button>
    </div>
    <div className='flex-wrap-gap'>
      <div>
        <div>
          New Item Name
        </div>
        <div>
          <input 
            style={{width: '33vh'}}
            onChange={(e) => {setNewItemName(e.target.value)}} 
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
              setNewItemGameVersion(e.currentTarget.value)
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
      <div >
      <button 
        style={{ width: '33vh', height: '46px'}}
        className='primary'
        onClick={() => {handleAddItemClicked()}}
      >
        Add <strong>{newItemName ?? ''}</strong>
      </button>
      </div>
      <div>
        <AppErrorSection error={error} />
      </div>
    </div>
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

    <div style={{textAlign: 'center'}}>
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
        RuneScape3
      </button>
      <button 
        onClick={() => {setSearchGame('osrs')}} 
        className={searchGame === 'osrs' ? 'primary selected' : 'primary'}
      >
        OSRS
      </button>
    </div>
    
    <div className='list'>
      {geItems?.map((item, index) => {
        const historyItems = geItemHistory.filter(ih => ih.characterId === characterId && ih.itemId === item.id)

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
        return <div className={`list-item-slow-hide ${filteredOut ? 'hide' : ''}`} key={`${item.id}__${index}`}>
          <div className='list-item-header'>
            <div className='app-title'>
              {item.name}
            </div>
            <div className='app-title smaller'>
              {getGameNameByVersion(item.gameVersion as GEItemGameVersion)}
            </div>
          </div>
          <InfoSection sectionTitle='GE' 
            linkUrl={`/characters/${characterId}/ge/planner/${item.id}`}
            linkText={`Item Planner`}
            button={{
              className: 'primary',
              onClick: () => {handleItemRefresh(item.id as string)},
              text: 'Refresh'
            }}
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
            linkUrl={`/characters/${characterId}/ge/history/${item.id}`}
            linkText={`Teleport`}
            items={[
            {
              title: 'Total',
              value: `${historyItems?.length?.toLocaleString() ?? 0}`
            }
          ]} />
        </div>
      })}
    </div>
  </div>
}