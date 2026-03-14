import { useCallback, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useNavigate, useParams } from 'react-router-dom'
import type { Character, CharacterGEItem, CharacterGEItemHistory, GEItemGameVersion } from '../../types/Characters'
import { CharacterStorageKeys } from './CharactersStorageKeys'
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

    const itemName = newItemName.trim()
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
        gameVersion: newItemGameVersion as GEItemGameVersion
      }
  
      const geResponse = await fetchGEItem(newItem?.name as string, newItem.gameVersion)
      newItem.price = geResponse.price
      newItem.volume = geResponse.volume
      newItems.push(newItem)
  
      const newHistoryItems = []
      const historyItem: CharacterGEItemHistory = {
        id: `H_${newItem.id}_${characterId}`,
        itemId: newItem.id as string,
        geTimestamp: DateTime.utc().toISO(),
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
    }catch(error){
      setError(`${JSON.stringify(error)}`)
    }
  }, [newItemName, geItems])

  return <div className='characters-app'>
    <div id='top'></div>
    <div className='app-title'>
      Grand Exchange Item Tracker
    </div>
    <div className='app-title smaller'>
      {character?.name}
    </div>
    <br/>
    <div style={{textAlign: 'center'}}>
      <button className='button-link' onClick={() => {navigate('/characters')}}>Back to Characters</button>
    </div>
    <br/>
    <div className='input-row-item' style={{width: '20em'}}>
      <div>
        New Item Name
      </div>
      <input 
        onChange={(e) => {setNewItemName(e.target.value)}} 
        type='text'
        placeholder='Enter item name...'
        value={newItemName ?? ''}
      />
      <div title='Determines what API to get data from.'>
        Game Version
      </div>
      <select
        className="rs-select"
        style={{width: '25em'}}
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
      <button 
        style={{padding: '5px', width: '188px'}}
        className='primary'
        onClick={() => {handleAddItemClicked()}}
      >
        Add <strong>{newItemName ?? ''}</strong>
      </button>
    </div>
    <div>
      <AppErrorSection error={error} />
    </div>
    <div className='input-row-item'>
      <input 
        onChange={(e) => {setSearch(e.target.value)}} 
        type='text'
        placeholder='Enter character name...'
        value={search ?? ''}
        maxLength={16}
      />
    </div>
    
    <div className='list'>
      {geItems?.map((item, index) => {
        let filteredOut = false
        if(search && search.length > 0){
          if(!item?.name?.toLowerCase().includes(search?.toLowerCase())){
            filteredOut = true
          }
        }
        return <div className={`list-item-slow-hide ${filteredOut ? 'hide' : ''}`} key={`${item.id}__${index}`}>
          <div className='app-title smaller'>
            {item.name}
          </div>
          <InfoSection sectionTitle='GE' 
            linkUrl={`/characters/${characterId}/ge/${item.id}`}
            linkText={`Item Planner`}
            items={[
            {
              title: 'Price',
              value: `${item.price ? item.price.toLocaleString() : 0}`,
            },
            {
              title: 'Volume',
              value: `${item.price ? item.price.toLocaleString() : 0}`,
            } 
          ]} />
        </div>
      })}
    </div>
  </div>
}