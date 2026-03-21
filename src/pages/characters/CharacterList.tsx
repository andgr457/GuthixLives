import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCallback, useRef, useState } from 'react';
import type { Character, CharacterGEItem, CharacterGEItemHistory, CharacterGEOrder, CharacterGEOrderItem, CharacterGPTransaction } from '../../types/Characters';
import '../../styles/Characters.css'
import { CharacterStorageKeys } from './CharactersConstants';
import InfoSection from '../core/InfoSection';
import { DateTime } from 'luxon';
import AppErrorSection from '../core/AppErrorSection';
import { useKeyPress } from '../../hooks/useKeyPress';
import useScrollReveal from '../../hooks/useScrollReveal';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../context/ConfirmProvider';

export default function CharacterList(){
  const showConfirm = useConfirm();
  const navigate = useNavigate()
  useScrollReveal()
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [characters, setCharacters] = useLocalStorage<Character[]>(
    CharacterStorageKeys.Characters,
    []
  );
  const [transactions, setTransactions] = useLocalStorage<CharacterGPTransaction[]>(
    CharacterStorageKeys.CharactersGPTransactions,
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

  const [newCharacterName, setNewCharacterName] = useState<string | undefined>('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showDanger, setShowDanger] = useState(false)

  const handleEnterPress = () => {
    handleAddCharacterClicked()
  };

  useKeyPress('Enter', handleEnterPress);
  const exportData = () => {
    const dataStr = JSON.stringify({
      characters, 
      geItems, 
      geItemHistory,
      geOrders,
      geOrderItems,
      transactions
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = DateTime.now().toFormat('dd-MM-yyyy')
    const timestamp = DateTime.now().toMillis().toString()
    const a = document.createElement("a");
    a.href = url;
    a.download = `ge-tracker_${date}_${timestamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setCharacters(parsed.characters)
        setGEItems(parsed.geItemHistory)
        setGEItemHistory(parsed.geItemHistory)
        setGEOrderItems(parsed.geOrderItems)
        setGEOrders(parsed.geOrders)
        setTransactions(parsed.transactions)
      } catch {
        alert("Failed to parse JSON.");
      }
    };

    reader.readAsText(file);
  };

  const handleAddCharacterClicked = useCallback(() => {
    setError('')
    if(!newCharacterName || !newCharacterName.trim()) {
      setError('Character name cannot be empty.')
      setNewCharacterName('')
      return
    }
    const characterName = newCharacterName.trim()
    const exists = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase())
    if(exists){
      setError('A saved character already exists with that name.')
      return
    }

    const newCharacter: Character = {
      id: `${newCharacterName}__${DateTime.now().toMillis()}`,
      name: characterName,
      showItemHistory: false,
      showItemHistoryItemId: undefined,
      showItemItemId: undefined,
      showItems: false,
      showListDetail: false
    }
    const newCharacters: Character[] = []
    newCharacters.push(newCharacter)
    for(const character of characters){
      newCharacters.push(character)
    }
    setNewCharacterName('')
    setCharacters(newCharacters)
  }, [characters, newCharacterName])

  const handleDeleteEverything = useCallback(async () => {
    if(!await showConfirm(
      "Are you sure you want to delete everything?", 
      'Delete Everything!'
    )) return

    setGEOrderItems([])
    setGEOrders([])
    setGEItems([])
    setGEItemHistory([])
    setTransactions([])
    setCharacters([])
  }, [])

  const handleDeleteDataByCharacterId = useCallback(async (characterId: string) => {
    if(!await showConfirm(
      "Are you sure you want to delete this character?", 
      'Delete Character!'
    )) return
    // if(!confirm(`Are you sure you want to delete this character? This cannot be undone and you should save an export.`)) return
    const relatedItems = geItems?.filter(i => i.characterId === characterId)
    const itemIds = relatedItems?.map(i => i.id)
    const relatedHistory = geItemHistory?.filter(ih => itemIds.includes(ih.itemId))
    const historyIds = relatedHistory?.map(h => h.id)
    const relatedTxns = transactions?.filter(t => t.characterId === characterId)
    const txnIds = relatedTxns?.map(t => t.id)
    
    const newTxns = []
    for(const txn of transactions){
      if(txnIds.includes(txn.id)){
        continue // to not add it to the new array of transactions effectively removing it
      }
      newTxns.push(txn)
    }

    const newHistory = []
    for(const itemHistory of geItemHistory){
      if(historyIds.includes(itemHistory.id)){
        continue
      }
      newHistory.push(itemHistory)
    }

    const newItems = []
    for(const item of geItems){
      if(itemIds.includes(item.id)){
        continue
      }
      newItems.push(item)
    }

    const newCharacters = []
    for(const character of characters){
      if(character.id === characterId){
        continue
      }
      newCharacters.push(character)
    }

    setGEItems(newItems)
    setGEItemHistory(newHistory)
    setTransactions(newTxns)
    setCharacters(newCharacters)
  }, [characters, geItems, geItemHistory, transactions])

  const handleToggleCharacterDetail = useCallback((characterId: string, value: boolean) => {
    const newCharacters = []
    for(const character of characters){
      if(character.id === characterId){
        character.showListDetail = value
      }
      newCharacters.push(character)
    }
    setCharacters(newCharacters)
  }, [characters])
  
  return <div className='characters-app reveal'>
    <div id='top'></div>
    <div>
      <div className='app-title'>
        Characters
      </div>
    </div>

    <div className='app-actions'>
      <div className='flex-wrap-gap'>
        <div>
          <div>
            New Character Name
          </div>
          <input 
            onChange={(e) => {setNewCharacterName(e.target.value)}} 
            type='text'
            placeholder='Enter character name...'
            value={newCharacterName ?? ''}
            maxLength={16}
            style={{width: '33vh'}}
          />
          <br/>
          <button 
            className='button-link action'
            onClick={() => {handleAddCharacterClicked()}}
          >
            Add <strong>{newCharacterName ?? ''}</strong>
          </button>
          <div>
            <AppErrorSection error={error} />
          </div>
        </div>
        <div>
          <div>
            Search Characters
          </div>
          <div>
            <input 
              onChange={(e) => {setSearch(e.target.value)}} 
              type='text'
              placeholder='Enter character name...'
              value={search ?? ''}
              maxLength={16}
              style={{width: '33vh'}}
            />
          </div>
        </div>
      </div>
      <div>
        <div className='flex-wrap-gap'>
          <div>
            <button className='button-link action danger' onClick={() => {setShowDanger(!showDanger)}}>
              {showDanger ? 'Hide' : 'Show'} Danger Zones
            </button>
          </div>
          <div>
            <button className="button-link action" onClick={exportData}>
              Export
            </button>
          </div>
          <div>
            <button
              className="button-link action"
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>

            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={importData}
            />
          </div>
        </div>
        {showDanger && <br/>}
        <div>
            {showDanger && <div className='danger-zone'>
              <button className='button-link action danger' onClick={handleDeleteEverything}>
                Delete All Data
              </button>
            </div>}
          </div>
      </div>
    </div>

    <div style={{padding: '1em'}}>
      {characters?.map((character, index) => {
        let filteredOut = false
        if(search && search.length > 0){
          if(!character?.name?.toLowerCase().includes(search?.toLowerCase())){
            filteredOut = true
          }
        }
        const relatedItems = geItems?.filter(i => i.characterId === character.id)
        const relatedTxns = transactions?.filter(t => t.characterId === character.id)
        const relatedOrders = geOrders?.filter(o => o.characterId === character.id)
        let totalLoss = 0
        let totalGain = 0
        let totalGP = 0
        for(const txn of relatedTxns){
          if(txn.amount > 0){
            totalGain += txn.amount
          } else if(txn.amount < 0){
            totalLoss += txn.amount
          }
          totalGP += txn.amount
        }
        return <div key={`${character.id}_${index}`} className={`list-item-slow-hide ${filteredOut ? 'hide' : ''}`}>
          <div className='list-item-title flex-wrap-gap' style={{gap: '1.5em'}} onClick={() => {}}>
            <div>
              <button className='button-link collapse' onClick={() => {handleToggleCharacterDetail(
                character.id, 
                typeof character.showListDetail === 'undefined' ? true : !character.showListDetail
              )}}>
                {typeof character.showListDetail !== 'undefined' && character.showListDetail === true ? ' - ' : ' + '} {character.name}

              </button>
            </div>
            <div>
              <button onClick={() => {navigate(`/characters/${character.id}/ge-items`)}} className='button-link'>
                Items
              </button>
            </div>
            <div>
              <button onClick={() => {navigate(`/characters/${character.id}/ge-orders`)}} className='button-link'>
                Orders
              </button>
            </div>
          </div>

          {character.showListDetail === true && <div className='list-item-body'> 
            <div className='flex-wrap-gap'>
              <InfoSection sectionTitle='GP'
                // linkUrl={`/characters/${character.id}/gp`}
                // linkText={`Teleport`}
                items={[
                  {
                    title: 'Total GP',
                    value: `${totalGP?.toLocaleString() ?? 0}`,
                    valueHint: 'Aggregate of all character transactions.'
                  },
                  {
                    title: 'Gain GP',
                    value: `${totalGain?.toLocaleString() ?? 0}`,
                    valueHint: 'Total of positive amount transactions.'
                  },
                  {
                    title: 'Loss GP',
                    value: `${totalLoss?.toLocaleString() ?? 0}`,
                    valueHint: 'Total of negative amount transactions.'
                  },
                ]}
              />
              <InfoSection sectionTitle='GE Items' 
                items={[
                {
                  title: 'Items',
                  value: `${relatedItems?.length ?? 0}`,
                  valueHint: 'Number of saved GE tracking items.'
                },
                
              ]} />
              <InfoSection sectionTitle='GE Orders' 
                items={[
                {
                  title: 'Orders',
                  value: `${relatedOrders?.length ?? 0}`,
                  valueHint: 'Number of saved GE orders.'
                },
              ]} />
                          
              <div className='danger-zone' hidden={!showDanger}>              
                <button 
                  key={`btnDeleteCharacter_${character.id}`} 
                  className='button-link action danger' 
                  onClick={() => {handleDeleteDataByCharacterId(character.id)}}
                  title={`Delete ${character?.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>}
          
        </div>
      })}
    </div>
  </div>
}